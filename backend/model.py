"""
Model definitions and inference functions for intubation difficulty assessment.

Uses a TripleConvNeXt architecture with three separate backbones for analyzing
front, open mouth, and lateral views of the patient's airway.
"""

import os
from typing import Optional

import torch
import torch.nn as nn
import torchvision
from torchvision import transforms
from PIL import Image

import warnings
warnings.filterwarnings('ignore')

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pt")
LABELS = ["easy", "Difficult"]


def get_eval_transform(size: int = 224):
    """Get the evaluation transform (no augmentation)."""
    base_tf = torchvision.models.ConvNeXt_Tiny_Weights.DEFAULT.transforms()
    mean, std = base_tf.mean, base_tf.std
    return transforms.Compose([
        transforms.Resize((size, size)),
        transforms.ToTensor(),
        transforms.Normalize(mean=mean, std=std),
    ])


class TripleConvNeXtThreeBackbonesProj(nn.Module):
    """
    Model architecture with 3 ConvNeXt backbones + projections.

    Uses separate backbones for front, open mouth, and lateral views,
    each with its own projector, combined through a joint MLP classifier.
    """

    def __init__(
        self,
        pretrained: bool = True,
        proj_dim: int = 128,
        joint_hidden: int = 128,
        joint_out: int = 64,
        num_classes: int = 2,
        drop_p_proj: float = 0.5,
        drop_p_joint: float = 0.5,
        use_bn: bool = True
    ):
        super().__init__()
        weights = torchvision.models.ConvNeXt_Tiny_Weights.DEFAULT if pretrained else None

        # 3 separate backbones
        front_net = torchvision.models.convnext_tiny(weights=weights)
        feat_dim = front_net.classifier[2].in_features  # 768 for convnext_tiny
        front_net.classifier = nn.Identity()
        self.backbone_front = front_net

        open_net = torchvision.models.convnext_tiny(weights=weights)
        open_net.classifier = nn.Identity()
        self.backbone_open = open_net

        lat_net = torchvision.models.convnext_tiny(weights=weights)
        lat_net.classifier = nn.Identity()
        self.backbone_lat = lat_net

        self.feat_dim = feat_dim

        # Per-backbone projector
        def make_projector():
            layers = [nn.Linear(feat_dim, proj_dim)]
            if use_bn:
                layers += [nn.BatchNorm1d(proj_dim)]
            layers += [nn.ReLU(inplace=True), nn.Dropout(drop_p_proj)]
            return nn.Sequential(*layers)

        self.proj_front = make_projector()
        self.proj_open = make_projector()
        self.proj_lat = make_projector()

        # Joint MLP
        joint_in = 3 * proj_dim
        joint_layers = [nn.Linear(joint_in, joint_hidden)]
        if use_bn:
            joint_layers += [nn.BatchNorm1d(joint_hidden)]
        joint_layers += [nn.ReLU(inplace=True), nn.Dropout(drop_p_joint)]
        joint_layers += [nn.Linear(joint_hidden, joint_out)]
        if use_bn:
            joint_layers += [nn.BatchNorm1d(joint_out)]
        joint_layers += [nn.ReLU(inplace=True)]
        self.joint_mlp = nn.Sequential(*joint_layers)

        self.classifier = nn.Linear(joint_out, num_classes)

        # Freezing/unfreezing
        for p in self.backbone_front.parameters():
            p.requires_grad = False
        for p in self.backbone_open.parameters():
            p.requires_grad = False
        for p in self.backbone_lat.parameters():
            p.requires_grad = False

        # Unfreeze last two feature blocks
        for p in self.backbone_front.features[6].parameters():
            p.requires_grad = True
        for p in self.backbone_front.features[7].parameters():
            p.requires_grad = True
        for p in self.backbone_open.features[6].parameters():
            p.requires_grad = True
        for p in self.backbone_open.features[7].parameters():
            p.requires_grad = True
        for p in self.backbone_lat.features[6].parameters():
            p.requires_grad = True
        for p in self.backbone_lat.features[7].parameters():
            p.requires_grad = True

    def forward(self, front, open_, lat, features_only: bool = False):
        fF = self.backbone_front(front).flatten(1)
        fO = self.backbone_open(open_).flatten(1)
        fL = self.backbone_lat(lat).flatten(1)

        pF = self.proj_front(fF)
        pO = self.proj_open(fO)
        pL = self.proj_lat(fL)

        cat = torch.cat([pF, pO, pL], dim=1)
        z = self.joint_mlp(cat)

        if features_only:
            return z

        out = self.classifier(z)
        return out


def load_model(model_path: str, device: Optional[str] = None) -> nn.Module:
    """Load the model from a checkpoint file."""
    if device is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"

    ckpt = torch.load(model_path, map_location=device, weights_only=False)

    if isinstance(ckpt, nn.Module):
        model = ckpt.to(device)
        model.eval()
        return model

    if isinstance(ckpt, dict) and "state_dict" in ckpt:
        config = ckpt.get("config", {})
        model = TripleConvNeXtThreeBackbonesProj(**config).to(device)
        model.load_state_dict(ckpt["state_dict"], strict=False)
        model.eval()
        return model

    if isinstance(ckpt, dict):
        model = TripleConvNeXtThreeBackbonesProj().to(device)
        model.load_state_dict(ckpt, strict=False)
        model.eval()
        return model

    raise ValueError("Unrecognized checkpoint format.")


# Global model instance (lazy loaded)
_model = None
_transform = None


def get_model():
    """Get or load the model singleton."""
    global _model, _transform
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Model file not found at {MODEL_PATH}. "
                "Please place the trained model.pt file in the backend directory."
            )
        print(f"Loading model from {MODEL_PATH}...")
        _model = load_model(MODEL_PATH, device=DEVICE)
        _transform = get_eval_transform()
        print(f"Model loaded successfully on {DEVICE}")
    return _model, _transform


@torch.inference_mode()
def predict_difficulty(
    front_image: Image.Image,
    open_image: Image.Image,
    lateral_image: Image.Image,
) -> dict:
    """
    Run inference on three airway images.

    Args:
        front_image: PIL Image of front view
        open_image: PIL Image of open mouth view
        lateral_image: PIL Image of lateral/side view

    Returns:
        dict with difficulty_probability (0-1) and prediction label
    """
    model, transform = get_model()

    # Convert to RGB if needed and apply transforms
    x_front = transform(front_image.convert("RGB")).unsqueeze(0).to(DEVICE)
    x_open = transform(open_image.convert("RGB")).unsqueeze(0).to(DEVICE)
    x_lat = transform(lateral_image.convert("RGB")).unsqueeze(0).to(DEVICE)

    # Run inference
    logits = model(x_front, x_open, x_lat)
    probs = torch.softmax(logits, dim=1)
    difficult_prob = probs[0, 1].item()
    print(f"Difficult probability: {difficult_prob}")
    return {
        "difficulty_probability": float(difficult_prob),
        "prediction": "Difficult" if difficult_prob > 0.5 else "Easy"
    }