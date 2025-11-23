import { useState, useEffect, useRef } from "react";
import type { HistoryItem } from "../types";
import { formatRelativeTime } from "../hooks/useAssessmentHistory";

interface HistorySidebarProps {
  history: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearHistory: () => void;
}

export function HistorySidebar({
  history,
  onSelectItem,
  onDeleteItem,
  onClearHistory,
}: HistorySidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Default to expanded on desktop
  useEffect(() => {
    const checkWidth = () => {
      setIsExpanded(window.innerWidth >= 1024);
    };
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isExpanded) return;

      const target = event.target as Node;
      const clickedInsideSidebar = sidebarRef.current?.contains(target);
      const clickedOnToggle = toggleRef.current?.contains(target);

      if (!clickedInsideSidebar && !clickedOnToggle) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpanded]);

  const getRiskBadgeClass = (category: string) => {
    switch (category) {
      case "Easy":
        return "history-badge history-badge-easy";
      case "Moderate":
        return "history-badge history-badge-moderate";
      case "Difficult":
        return "history-badge history-badge-difficult";
      default:
        return "history-badge";
    }
  };

  return (
    <>
      {/* Toggle button - always visible */}
      <button
        ref={toggleRef}
        className={`sidebar-toggle ${isExpanded ? "expanded" : ""}`}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label={isExpanded ? "Collapse history" : "Expand history"}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 8v4l3 3" />
          <circle cx="12" cy="12" r="10" />
        </svg>
        {!isExpanded && <span className="toggle-label">History</span>}
      </button>

      {/* Sidebar overlay for mobile */}
      {isExpanded && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Sidebar content */}
      <aside ref={sidebarRef} className={`history-sidebar ${isExpanded ? "expanded" : ""}`}>
        <div className="sidebar-header">
          <h3>Assessment History</h3>
          <button
            className="sidebar-close"
            onClick={() => setIsExpanded(false)}
            aria-label="Close sidebar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="sidebar-content">
          {history.length === 0 ? (
            <div className="history-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 8v4l3 3" />
                <circle cx="12" cy="12" r="10" />
              </svg>
              <p>No assessments yet</p>
              <span>Your assessment history will appear here</span>
            </div>
          ) : (
            <>
              <ul className="history-list">
                {history.map((item) => (
                  <li key={item.id} className="history-item">
                    <button
                      className="history-item-button"
                      onClick={() => onSelectItem(item)}
                    >
                      {item.thumbnail && (
                        <div className="history-thumbnail">
                          <img src={item.thumbnail} alt="" />
                        </div>
                      )}
                      <div className="history-item-content">
                        <div className="history-item-top">
                          <span className="history-score">{item.score}</span>
                          <span className={getRiskBadgeClass(item.risk_category)}>
                            {item.risk_category}
                          </span>
                        </div>
                        <div className="history-item-meta">
                          <span className="history-time">
                            {formatRelativeTime(item.timestamp)}
                          </span>
                          <span className="history-images">
                            {item.images_analyzed} image{item.images_analyzed !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </button>
                    <button
                      className="history-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteItem(item.id);
                      }}
                      aria-label="Delete assessment"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
              {history.length > 0 && (
                <button className="clear-history" onClick={onClearHistory}>
                  Clear History
                </button>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
}
