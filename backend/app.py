"""
Intubation Difficulty Assessment API

A Flask backend that accepts airway images and returns difficulty assessments
using a trained ConvNeXt-based model.
"""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image

app = Flask(__name__)
CORS(app)

# Try to import model - will fail gracefully if dependencies missing
MODEL_AVAILABLE = False
try:
    from model import predict_difficulty, get_model, MODEL_PATH
    MODEL_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Model dependencies not available: {e}")
    print("Running in mock mode. Install torch and torchvision for actual inference.")

# Check if model file exists
MODEL_FILE_EXISTS = MODEL_AVAILABLE and os.path.exists(MODEL_PATH)

# Concerns mapping based on difficulty
DIFFICULTY_CONCERNS = {
    "Easy": [
        "Normal airway anatomy observed",
        "Good neck mobility",
        "Adequate mouth opening",
    ],
    "Moderate": [
        "Some anatomical variations noted",
        "Consider backup airway equipment",
        "Mallampati score may be elevated",
        "Monitor for potential difficulties",
    ],
    "Difficult": [
        "Limited neck extension observed",
        "Mallampati score appears elevated",
        "Reduced thyromental distance",
        "Limited mouth opening",
        "Consider video laryngoscope",
        "Have difficult airway cart ready",
        "Consider awake intubation approach",
    ]
}


def analyze_with_model(images: list) -> dict:
    """
    Analyze images using the ML model.

    The model expects exactly 3 images: front, open mouth, and lateral views.
    Images are matched by filename: front.png, open.png, lat.png
    If fewer images are provided, we duplicate/reuse images.
    """
    # Load images as PIL and match by filename
    image_dict = {}
    for img_file in images:
        img_file.seek(0)  # Reset file pointer
        filename = img_file.filename.lower()
        pil_img = Image.open(img_file)

        # Match filename to image type
        if "front" in filename:
            image_dict["front"] = pil_img
        elif "open" in filename:
            image_dict["open"] = pil_img
        elif "lat" in filename:
            image_dict["lateral"] = pil_img

    # If we couldn't match by name, fall back to order
    if len(image_dict) < 3:
        unmatched_images = []
        for img_file in images:
            img_file.seek(0)
            unmatched_images.append(Image.open(img_file))

        # Fill missing slots
        if "front" not in image_dict:
            image_dict["front"] = unmatched_images[0] if unmatched_images else None
        if "open" not in image_dict:
            image_dict["open"] = unmatched_images[1] if len(unmatched_images) > 1 else image_dict["front"]
        if "lateral" not in image_dict:
            image_dict["lateral"] = unmatched_images[2] if len(unmatched_images) > 2 else image_dict["front"]

    front_image = image_dict.get("front")
    open_image = image_dict.get("open")
    lateral_image = image_dict.get("lateral")

    # Fallback: duplicate if any is missing
    if front_image is None:
        front_image = open_image or lateral_image
    if open_image is None:
        open_image = front_image
    if lateral_image is None:
        lateral_image = front_image

    # Run model inference
    result = predict_difficulty(
        front_image=front_image,
        open_image=open_image,
        lateral_image=lateral_image
    )

    # Convert probability to score (0-100)
    difficulty_prob = result["difficulty_probability"]
    score = int(difficulty_prob * 100)

    # Determine risk category based on score
    if score <= 33:
        risk_category = "Easy"
    elif score <= 66:
        risk_category = "Moderate"
    else:
        risk_category = "Difficult"

    # Get relevant concerns based on risk category
    concerns = DIFFICULTY_CONCERNS[risk_category]

    return {
        "score": score,
        "risk_category": risk_category,
        "concerns": concerns,
        "images_analyzed": len(images),
    }


def analyze_mock(images: list) -> dict:
    """
    Mock analysis when model is not available.
    Returns placeholder data indicating model is not loaded.
    """
    return {
        "score": 50,
        "risk_category": "Moderate",
        "concerns": [
            "Model not available - showing placeholder results",
            "Please ensure model.pt is present in backend directory",
            "Install torch and torchvision dependencies",
        ],
        "images_analyzed": len(images),
    }


def validate_images(request):
    """Validate uploaded images and return valid ones or error response."""
    if "images" not in request.files:
        return None, (jsonify({"error": "No images provided"}), 400)

    images = request.files.getlist("images")

    if not images or all(img.filename == "" for img in images):
        return None, (jsonify({"error": "No images selected"}), 400)

    # Filter out empty file inputs
    valid_images = [img for img in images if img.filename != ""]

    if not valid_images:
        return None, (jsonify({"error": "No valid images provided"}), 400)

    # Validate file types
    allowed_extensions = {"jpg", "jpeg", "png", "heic", "heif"}
    for img in valid_images:
        ext = img.filename.rsplit(".", 1)[-1].lower() if "." in img.filename else ""
        if ext not in allowed_extensions:
            return None, (jsonify({
                "error": f"Invalid file type: {img.filename}. Allowed types: JPEG, PNG, HEIC"
            }), 400)

    return valid_images, None


@app.route("/analyze", methods=["POST"])
def analyze():
    """
    Endpoint to analyze airway images using the AI model.

    Accepts multipart form data with multiple images.
    For best results, provide 3 images: front view, open mouth, and lateral view.
    Returns JSON with difficulty score, risk category, and concerns.
    """
    valid_images, error_response = validate_images(request)
    if error_response:
        return error_response

    try:
        if MODEL_AVAILABLE and MODEL_FILE_EXISTS:
            result = analyze_with_model(valid_images)
        else:
            result = analyze_mock(valid_images)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "error": f"Analysis failed: {str(e)}"
        }), 500


@app.route("/analyze/mock", methods=["POST"])
def analyze_mock_endpoint():
    """
    Endpoint for demo/mock analysis (random results).

    Useful for testing the UI without requiring the ML model.
    """
    import random

    valid_images, error_response = validate_images(request)
    if error_response:
        return error_response

    # Generate random mock data
    score = random.randint(25, 85)

    if score <= 33:
        risk_category = "Easy"
    elif score <= 66:
        risk_category = "Moderate"
    else:
        risk_category = "Difficult"

    concerns = DIFFICULTY_CONCERNS[risk_category]

    return jsonify({
        "score": score,
        "risk_category": risk_category,
        "concerns": concerns,
        "images_analyzed": len(valid_images),
    })


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint with model status."""
    return jsonify({
        "status": "healthy",
        "model_available": MODEL_AVAILABLE,
        "model_file_exists": MODEL_FILE_EXISTS
    })


# Preload model on startup if available
if MODEL_AVAILABLE and MODEL_FILE_EXISTS:
    try:
        print("Preloading model...")
        get_model()
        print("Model preloaded successfully")
    except Exception as e:
        print(f"Failed to preload model: {e}")


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)
