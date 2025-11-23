import { useState, useCallback } from "react";
import { ImageUpload } from "./components/ImageUpload";
import { ResultsDisplay } from "./components/ResultsDisplay";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { ErrorMessage } from "./components/ErrorMessage";
import { HistorySidebar } from "./components/HistorySidebar";
import { useAssessmentHistory, createThumbnail } from "./hooks/useAssessmentHistory";
import type { AnalysisResult, ImageFile, HistoryItem } from "./types";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

function App() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewingHistory, setViewingHistory] = useState<HistoryItem | null>(null);

  const { history, addAssessment, deleteAssessment, clearHistory } = useAssessmentHistory();

  const handleAnalyze = useCallback(async () => {
    if (images.length === 0) {
      setError("Please upload at least one image");
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    images.forEach((img) => {
      formData.append("images", img.file);
    });

    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Analysis failed (${response.status})`);
      }

      const data: AnalysisResult = await response.json();
      setResult(data);

      // Save to history with thumbnail
      if (images.length > 0) {
        try {
          const thumbnail = await createThumbnail(images[0].file);
          addAssessment(data, thumbnail);
        } catch {
          addAssessment(data); // Save without thumbnail if it fails
        }
      }
    } catch (err) {
      if (err instanceof TypeError && err.message.includes("fetch")) {
        setError("Unable to connect to the server. Please ensure the backend is running.");
      } else {
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  }, [images]);

  const handleReset = useCallback(() => {
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setImages([]);
    setResult(null);
    setError(null);
    setViewingHistory(null);
  }, [images]);

  const handleSelectHistoryItem = useCallback((item: HistoryItem) => {
    setViewingHistory(item);
    setResult({
      score: item.score,
      risk_category: item.risk_category,
      concerns: item.concerns,
      images_analyzed: item.images_analyzed,
    });
    setImages([]);
    setError(null);
  }, []);

  return (
    <div className="app">
      <HistorySidebar
        history={history}
        onSelectItem={handleSelectHistoryItem}
        onDeleteItem={deleteAssessment}
        onClearHistory={clearHistory}
      />

      <header className="app-header">
        <div className="header-content" onClick={handleReset} style={{ cursor: 'pointer' }}>
          <svg width="48" height="48" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fill="none" className="app-logo">
            <rect width="512" height="512" rx="96" fill="white"/>
            <path d="M120 260 C120 170 200 100 300 100 L360 100" stroke="#2563EB" strokeWidth="28" strokeLinecap="round"/>
            <circle cx="240" cy="300" r="80" stroke="#2563EB" strokeWidth="24" fill="none"/>
            <circle cx="240" cy="300" r="34" fill="#2563EB"/>
          </svg>
          <div className="header-text">
            <h1>Intubation Difficulty Assessment</h1>
            <p className="subtitle">AI-Assisted Airway Evaluation Tool</p>
          </div>
        </div>
      </header>

      <main className="app-main">
        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        {isLoading ? (
          <LoadingSpinner />
        ) : result ? (
          <ResultsDisplay
            result={result}
            images={images}
            onReset={handleReset}
            historyTimestamp={viewingHistory?.timestamp}
            historyThumbnail={viewingHistory?.thumbnail}
          />
        ) : (
          <div className="upload-section">
            <div className="instructions">
              <h2>Upload Images</h2>
              <p>
                Upload images of the patient's airway, mouth opening, and neck area for
                assessment. Multiple images from different angles improve accuracy.
              </p>
            </div>

            <ImageUpload
              images={images}
              onImagesChange={setImages}
              disabled={isLoading}
            />

            {images.length > 0 && (
              <button
                className="analyze-circle-button"
                onClick={handleAnalyze}
                disabled={isLoading}
                aria-label="Analyze Images"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            )}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <div className="disclaimer">
          <strong>Medical Disclaimer:</strong> This tool is intended for use as a clinical
          decision support system only. It does not replace clinical judgment, physical
          examination, or established airway assessment protocols. All intubation decisions
          should be made by qualified healthcare professionals based on comprehensive patient
          evaluation.
        </div>
      </footer>
    </div>
  );
}

export default App;
