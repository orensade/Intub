interface ScoreGaugeProps {
  score: number;
  riskCategory: "Easy" | "Moderate" | "Difficult";
}

export function ScoreGauge({ score, riskCategory }: ScoreGaugeProps) {
  const getColor = () => {
    switch (riskCategory) {
      case "Easy":
        return "#22c55e";
      case "Moderate":
        return "#eab308";
      case "Difficult":
        return "#ef4444";
    }
  };

  const color = getColor();
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="score-gauge">
      <svg viewBox="0 0 100 100" className="gauge-svg">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 50 50)"
          style={{ transition: "stroke-dashoffset 0.5s ease-out" }}
        />
      </svg>
      <div className="gauge-content">
        <span className="gauge-score">{score}</span>
        <span className="gauge-label">/ 100</span>
      </div>
    </div>
  );
}
