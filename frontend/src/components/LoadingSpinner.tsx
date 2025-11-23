export function LoadingSpinner() {
  return (
    <div className="loading-container">
      <div className="loading-spinner">
        <svg viewBox="0 0 50 50" className="spinner-svg">
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="80, 200"
          />
        </svg>
      </div>
      <p className="loading-text">Analyzing images...</p>
      <p className="loading-subtext">This may take a moment</p>
    </div>
  );
}
