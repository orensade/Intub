export function LoadingSpinner() {
  return (
    <div className="loading-container">
      <div className="loading-spinner">
        <svg width="120" height="120" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fill="none" className="logo-spinner">
          {/* Background */}
          <rect width="512" height="512" rx="96" fill="white"/>
          
          {/* Laryngoscope arc - appears first */}
          <path 
            d="M120 260 C120 170 200 100 300 100 L360 100" 
            stroke="#2563EB" 
            strokeWidth="28" 
            strokeLinecap="round"
            className="logo-part logo-part-1"
          />
          
          {/* Airway outer circle - appears second */}
          <circle 
            cx="240" 
            cy="300" 
            r="80" 
            stroke="#2563EB" 
            strokeWidth="24" 
            fill="none"
            className="logo-part logo-part-2"
          />
          
          {/* Inner airway opening - appears third */}
          <circle 
            cx="240" 
            cy="300" 
            r="34" 
            fill="#2563EB"
            className="logo-part logo-part-3"
          />
        </svg>
      </div>
      <p className="loading-text">Analyzing images...</p>
      <p className="loading-subtext">This may take a moment</p>
    </div>
  );
}
