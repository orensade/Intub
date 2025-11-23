import { useState, useMemo } from "react";
import type { AnalysisResult, ImageFile } from "../types";
import { ScoreGauge } from "./ScoreGauge";
import { Tooltip, getExplanation } from "./Tooltip";
import { RiskCategoryInfo } from "./RiskCategoryInfo";
import { Recommendations, getAllRecommendations } from "./Recommendations";

interface ResultsDisplayProps {
  result: AnalysisResult;
  images: ImageFile[];
  onReset: () => void;
  historyTimestamp?: number;
  historyThumbnail?: string;
}

export function ResultsDisplay({ result, images, onReset, historyTimestamp, historyThumbnail }: ResultsDisplayProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  const timestamp = useMemo(() => {
    return historyTimestamp ? new Date(historyTimestamp) : new Date();
  }, [historyTimestamp]);

  const formatTimestamp = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) + " at " + date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getRiskBadgeClass = () => {
    switch (result.risk_category) {
      case "Easy":
        return "risk-badge risk-easy";
      case "Moderate":
        return "risk-badge risk-moderate";
      case "Difficult":
        return "risk-badge risk-difficult";
    }
  };

  const getResultsText = () => {
    const lines = [
      "INTUBATION DIFFICULTY ASSESSMENT",
      `Assessment Date: ${formatTimestamp(timestamp)}`,
      "",
      `Difficulty Score: ${result.score}/100`,
      `Risk Category: ${result.risk_category}`,
      `Images Analyzed: ${result.images_analyzed}`,
    ];

    if (result.concerns.length > 0) {
      lines.push("", "Identified Concerns:");
      result.concerns.forEach((concern) => {
        lines.push(`  - ${concern}`);
      });

      // Add recommendations
      lines.push("", "Clinical Recommendations:");
      const recommendations = getAllRecommendations(result.concerns, result.risk_category);
      recommendations.forEach((rec, index) => {
        if (index > 0) lines.push("");
        lines.push(`${rec.title}:`);
        rec.actions.forEach((action) => {
          lines.push(`  • ${action}`);
        });
      });
    }

    lines.push("", "---", "This assessment is for clinical decision support only.");

    return lines.join("\n");
  };

  const handleCopyResults = async () => {
    try {
      await navigator.clipboard.writeText(getResultsText());
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleExportReport = () => {
    window.print();
  };

  return (
    <div className="results-display">
      <div className="results-header">
        <div className="results-header-left">
          <h2>Assessment Results</h2>
          <span className="timestamp">Assessment completed: {formatTimestamp(timestamp)}</span>
        </div>
        <span className="images-count">
          {result.images_analyzed} image{result.images_analyzed !== 1 ? "s" : ""} analyzed
        </span>
      </div>

      {/* Three-column layout */}
      <div className="results-columns">
        {/* Left: Analyzed Images */}
        <div className="results-column results-column-images">
          {(images.length > 0 || historyThumbnail) && (
            <div className="analyzed-images">
              <h3>Analyzed Images</h3>
              <div className="analyzed-images-grid">
                {images.length > 0 ? (
                  images.map((image) => (
                    <div key={image.id} className="analyzed-image-thumb">
                      <img src={image.preview} alt={image.file.name} />
                    </div>
                  ))
                ) : historyThumbnail ? (
                  <div className="analyzed-image-thumb">
                    <img src={historyThumbnail} alt="Assessment thumbnail" />
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/* Center: Score */}
        <div className="results-column results-column-score">
          <RiskCategoryInfo currentCategory={result.risk_category} />
          <div className="score-section">
            <ScoreGauge score={result.score} riskCategory={result.risk_category} />
            <div className={getRiskBadgeClass()}>{result.risk_category}</div>
          </div>
        </div>

        {/* Right: Concerns */}
        <div className="results-column results-column-concerns">
          {result.concerns.length > 0 && (
            <div className="concerns-section">
              <h3>Identified Concerns</h3>
              <ul className="concerns-list">
                {result.concerns.map((concern, index) => {
                  const explanation = getExplanation(concern);
                  return (
                    <li key={index}>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="concern-icon"
                      >
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      <span className="concern-text">{concern}</span>
                      {explanation && (
                        <Tooltip content={explanation} />
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations Section */}
      {result.concerns.length > 0 && (
        <Recommendations concerns={result.concerns} riskCategory={result.risk_category} />
      )}

      <div className="results-actions">
        <button className="new-assessment-button" onClick={onReset} aria-label="New Assessment">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <div className="icon-actions">
          <button className="icon-button" onClick={handleExportReport} aria-label="Export Report" title="Export Report">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
          <button
            className={`icon-button ${copySuccess ? "success" : ""}`}
            onClick={handleCopyResults}
            aria-label={copySuccess ? "Copied!" : "Copy Results"}
            title={copySuccess ? "Copied!" : "Copy Results"}
          >
            {copySuccess ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
