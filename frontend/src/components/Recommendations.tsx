interface RecommendationsProps {
  concerns: string[];
  riskCategory: "Easy" | "Moderate" | "Difficult";
}

export interface Recommendation {
  title: string;
  actions: string[];
  priority: "high" | "medium" | "low";
}

export const concernToRecommendations: Record<string, Recommendation> = {
  "Limited mouth opening": {
    title: "Prepare for Limited Oral Access",
    actions: [
      "Consider using a video laryngoscope with a narrow blade profile",
      "Have smaller endotracheal tubes readily available",
      "Prepare fiberoptic intubation equipment as backup",
      "Position patient optimally to maximize mouth opening"
    ],
    priority: "high"
  },
  "Restricted neck mobility": {
    title: "Address Neck Movement Limitations",
    actions: [
      "Avoid excessive head extension maneuvers",
      "Use video laryngoscopy to reduce need for neck manipulation",
      "Consider awake fiberoptic intubation if severely restricted",
      "Have rigid stylet available for tube guidance"
    ],
    priority: "high"
  },
  "High Mallampati score": {
    title: "Manage Limited Pharyngeal Visualization",
    actions: [
      "Use video laryngoscopy as first-line technique",
      "Ensure adequate patient positioning (sniffing position)",
      "Have experienced personnel available",
      "Prepare supraglottic airway device as backup"
    ],
    priority: "medium"
  },
  "Short thyromental distance": {
    title: "Anticipate Difficult Laryngeal Exposure",
    actions: [
      "Use video laryngoscope with enhanced visualization",
      "Consider ramped positioning for better alignment",
      "Have bougie or stylet readily available",
      "Prepare for potential need of supraglottic device"
    ],
    priority: "medium"
  },
  "Prominent teeth": {
    title: "Protect Dentition and Ensure Clear View",
    actions: [
      "Use tooth guards or dampened gauze for protection",
      "Exercise extreme caution during laryngoscope insertion",
      "Consider video laryngoscopy to reduce force needed",
      "Document dental condition before procedure"
    ],
    priority: "medium"
  },
  "Receding mandible": {
    title: "Overcome Anatomical Airway Obstruction",
    actions: [
      "Use video laryngoscope for improved view",
      "Optimize head and neck positioning",
      "Have bougie or introducer ready for tube guidance",
      "Prepare fiberoptic equipment as alternative approach"
    ],
    priority: "high"
  },
  "Facial trauma": {
    title: "Manage Traumatic Airway Challenges",
    actions: [
      "Assess for possible cervical spine injury - maintain stabilization",
      "Anticipate blood and secretions - have suction ready",
      "Consider awake intubation if airway anatomy distorted",
      "Have surgical airway equipment immediately available"
    ],
    priority: "high"
  },
  "Obesity": {
    title: "Address Obesity-Related Airway Challenges",
    actions: [
      "Use ramped positioning to align airway axes",
      "Ensure adequate preoxygenation (reduced oxygen reserve)",
      "Have video laryngoscope and shorter handle available",
      "Prepare for rapid oxygen desaturation - work efficiently"
    ],
    priority: "medium"
  },
  "Beard": {
    title: "Optimize Mask Seal and Airway Access",
    actions: [
      "Apply water-soluble lubricant to improve mask seal",
      "Use two-person bag-mask ventilation technique if needed",
      "Have supraglottic airway device available as backup",
      "Consider trimming beard if patient condition permits"
    ],
    priority: "low"
  }
};

export const getGeneralRecommendations = (riskCategory: "Easy" | "Moderate" | "Difficult"): Recommendation => {
  if (riskCategory === "Difficult") {
    return {
      title: "High-Risk Airway Protocol",
      actions: [
        "Summon most experienced airway provider available",
        "Assemble complete difficult airway cart",
        "Prepare surgical airway equipment and personnel",
        "Consider awake fiberoptic intubation",
        "Have team brief on backup plans before starting"
      ],
      priority: "high"
    };
  } else if (riskCategory === "Moderate") {
    return {
      title: "Enhanced Airway Preparation",
      actions: [
        "Have experienced provider present or immediately available",
        "Prepare video laryngoscope and adjunct equipment",
        "Ensure supraglottic airway device at bedside",
        "Discuss backup plan with team before induction"
      ],
      priority: "medium"
    };
  } else {
    return {
      title: "Standard Airway Management",
      actions: [
        "Follow standard intubation protocols",
        "Ensure backup equipment is readily available",
        "Maintain vigilance for unexpected difficulties"
      ],
      priority: "low"
    };
  }
};

export const getAllRecommendations = (concerns: string[], riskCategory: "Easy" | "Moderate" | "Difficult"): Recommendation[] => {
  const recommendations: Recommendation[] = [];

  // Add general recommendation based on risk category
  recommendations.push(getGeneralRecommendations(riskCategory));

  // Add specific recommendations for each concern
  concerns.forEach(concern => {
    const recommendation = concernToRecommendations[concern];
    if (recommendation) {
      recommendations.push(recommendation);
    }
  });

  return recommendations;
};

export function Recommendations({ concerns, riskCategory }: RecommendationsProps) {
  const recommendations = getAllRecommendations(concerns, riskCategory);

  const getPriorityClass = (priority: string) => {
    return `recommendation-card priority-${priority}`;
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === "high") {
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="priority-icon">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" stroke="white" strokeWidth="2" />
          <line x1="12" y1="16" x2="12.01" y2="16" stroke="white" strokeWidth="2" />
        </svg>
      );
    }
    return null;
  };

  return (
    <div className="recommendations-section">
      <div className="recommendations-header">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="recommendations-icon">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
          <path d="M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
          <line x1="9" y1="12" x2="15" y2="12" />
          <line x1="9" y1="16" x2="15" y2="16" />
        </svg>
        <h3>Clinical Recommendations</h3>
      </div>
      
      <p className="recommendations-disclaimer">
        Based on the identified concerns, consider the following evidence-based recommendations:
      </p>

      <div className="recommendations-grid">
        {recommendations.map((rec, index) => (
          <div key={index} className={getPriorityClass(rec.priority)}>
            <div className="recommendation-card-header">
              <h4>{rec.title}</h4>
              {getPriorityIcon(rec.priority)}
            </div>
            <ul className="recommendation-actions">
              {rec.actions.map((action, actionIndex) => (
                <li key={actionIndex}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="action-icon">
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

