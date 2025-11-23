import { useState } from "react";

interface RiskCategoryInfoProps {
  currentCategory: "Easy" | "Moderate" | "Difficult";
}

export function RiskCategoryInfo({ currentCategory }: RiskCategoryInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="risk-category-info-inline">
      <button
        className="risk-info-link"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="info-icon-small">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        Learn more
      </button>

      {isExpanded && (
        <>
          <div className="risk-info-overlay" onClick={() => setIsExpanded(false)} />
          <div className="risk-info-popup">
            <div className="risk-info-popup-header">
              <span>Risk Categories</span>
              <button className="risk-info-close" onClick={() => setIsExpanded(false)} aria-label="Close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="risk-info-popup-content">
              {/* Easy Category */}
              <div className={`risk-info-card-mini risk-info-easy ${currentCategory === "Easy" ? "current" : ""}`}>
                <div className="risk-info-card-mini-header">
                  <span className="category-name">Easy</span>
                  <span className="score-range">1-33</span>
                </div>
                <p>Standard direct laryngoscopy typically sufficient. Expected success rate &gt;95%.</p>
              </div>

              {/* Moderate Category */}
              <div className={`risk-info-card-mini risk-info-moderate ${currentCategory === "Moderate" ? "current" : ""}`}>
                <div className="risk-info-card-mini-header">
                  <span className="category-name">Moderate</span>
                  <span className="score-range">34-66</span>
                </div>
                <p>May require alternative techniques. Expected success rate 85-95%.</p>
              </div>

              {/* Difficult Category */}
              <div className={`risk-info-card-mini risk-info-difficult ${currentCategory === "Difficult" ? "current" : ""}`}>
                <div className="risk-info-card-mini-header">
                  <span className="category-name">Difficult</span>
                  <span className="score-range">67-100</span>
                </div>
                <p>Consider video laryngoscopy or fiberoptic intubation. Expected success rate &lt;85%.</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
