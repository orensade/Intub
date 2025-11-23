# Intubation Difficulty Assessment

A web application for doctors and paramedics to assess patient intubation difficulty by uploading images of the patient's airway, mouth, and neck area.

## Features

- **Image Upload**: Upload multiple images (JPEG, PNG, HEIC) with drag-and-drop support
- **Visual Previews**: Preview thumbnails with ability to remove individual images
- **Difficulty Score**: Get a score from 1-100 with visual gauge indicator
- **Risk Categorization**: Easy (green), Moderate (yellow), Difficult (red)
- **Identified Concerns**: List of specific airway concerns detected
- **Responsive Design**: Optimized for tablets and desktop use in clinical settings

## Project Structure

```
Intub/
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── ImageUpload.tsx
│   │   │   ├── ResultsDisplay.tsx
│   │   │   ├── ScoreGauge.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── ErrorMessage.tsx
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── index.css
│   └── package.json
├── backend/           # Python + Flask
│   ├── app.py
│   └── pyproject.toml
└── README.md
```

## Prerequisites

- Node.js 18+ (for frontend)
- Python 3.10+ (for backend)
- [uv](https://github.com/astral-sh/uv) (Python package manager)

## Quick Start

### 1. Start the Backend

```bash
cd backend
uv run app.py
```

The backend will start at `http://localhost:5000`

### 2. Start the Frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will start at `http://localhost:5173`

### 3. Open the Application

Navigate to `http://localhost:5173` in your browser.

## Configuration

### Backend API URL

By default, the frontend connects to `http://localhost:5000`. To change this:

1. Create a `.env` file in the `frontend` directory:
   ```
   VITE_API_URL=http://your-backend-url:port
   ```

2. Restart the frontend development server.

## API Reference

### POST /analyze

Analyze uploaded airway images and return difficulty assessment.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `images` - Array of image files (JPEG, PNG, HEIC)

**Response:**
```json
{
  "score": 68,
  "risk_category": "Difficult",
  "concerns": [
    "Limited neck extension observed",
    "Mallampati score appears elevated",
    "Reduced thyromental distance"
  ],
  "images_analyzed": 3
}
```

**Risk Categories:**
- `Easy`: Score 1-33
- `Moderate`: Score 34-66
- `Difficult`: Score 67-100

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy"
}
```

## Development

### Frontend

```bash
cd frontend
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Backend

```bash
cd backend
uv run app.py    # Start Flask server in debug mode
```

## Adding Real Scoring Logic

The backend currently returns mock data. To implement actual image analysis:

1. Edit `backend/app.py`
2. Modify the `analyze_images()` function
3. Add your ML model or image processing logic
4. Update `pyproject.toml` with any new dependencies

```python
def analyze_images(images: list) -> dict:
    # TODO: Replace with actual implementation
    # Example: Load images, run ML model, return predictions
    pass
```

## Medical Disclaimer

**This tool is intended for use as a clinical decision support system only.** It does not replace clinical judgment, physical examination, or established airway assessment protocols. All intubation decisions should be made by qualified healthcare professionals based on comprehensive patient evaluation.

## License

MIT
