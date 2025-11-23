"""
Intubation Difficulty Assessment API

A Flask backend that accepts airway images and returns difficulty assessments.
Currently returns mock data - scoring logic to be implemented later.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import time

app = Flask(__name__)
CORS(app)

# Mock concerns pool for generating varied responses
MOCK_CONCERNS = [
    "Limited neck extension observed",
    "Mallampati score appears elevated",
    "Reduced thyromental distance",
    "Short neck noted",
    "Prominent upper incisors",
    "Limited mouth opening",
    "Receding mandible observed",
    "Thick neck circumference",
    "Facial hair may interfere with mask seal",
    "High arched palate noted",
    "Large tongue relative to oral cavity",
    "Restricted jaw mobility",
]


def analyze_images(images: list) -> dict:
    """
    Analyze uploaded airway images and return difficulty assessment.

    Currently returns mock data. This function should be replaced with
    actual image analysis logic (e.g., ML model inference) in the future.

    Args:
        images: List of uploaded image files

    Returns:
        dict containing score, risk_category, and concerns
    """
    # TODO: Implement actual image analysis logic here
    # For now, return randomized mock data to simulate varied responses

    score = random.randint(25, 85)

    if score <= 33:
        risk_category = "Easy"
        num_concerns = random.randint(0, 2)
    elif score <= 66:
        risk_category = "Moderate"
        num_concerns = random.randint(2, 4)
    else:
        risk_category = "Difficult"
        num_concerns = random.randint(3, 5)

    concerns = random.sample(MOCK_CONCERNS, min(num_concerns, len(MOCK_CONCERNS)))

    return {
        "score": score,
        "risk_category": risk_category,
        "concerns": concerns,
        "images_analyzed": len(images)
    }


@app.route("/analyze", methods=["POST"])
def analyze():
    """
    Endpoint to analyze airway images for intubation difficulty.

    Accepts multipart form data with multiple images.
    Returns JSON with difficulty score, risk category, and concerns.
    """
    if "images" not in request.files:
        return jsonify({"error": "No images provided"}), 400

    images = request.files.getlist("images")

    if not images or all(img.filename == "" for img in images):
        return jsonify({"error": "No images selected"}), 400

    # Filter out empty file inputs
    valid_images = [img for img in images if img.filename != ""]

    if not valid_images:
        return jsonify({"error": "No valid images provided"}), 400

    # Validate file types
    allowed_extensions = {"jpg", "jpeg", "png", "heic", "heif"}
    for img in valid_images:
        ext = img.filename.rsplit(".", 1)[-1].lower() if "." in img.filename else ""
        if ext not in allowed_extensions:
            return jsonify({
                "error": f"Invalid file type: {img.filename}. Allowed types: JPEG, PNG, HEIC"
            }), 400

    # Simulate processing time for demo
    time.sleep(2)

    result = analyze_images(valid_images)
    return jsonify(result)


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({"status": "healthy"})


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)
