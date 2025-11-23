import { useState, useRef, useEffect } from "react";

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<"top" | "bottom">("top");
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceAbove = rect.top;

      // Show below if not enough space above (tooltip needs ~150px)
      setPosition(spaceAbove < 150 ? "bottom" : "top");
    }
  }, [isVisible]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVisible(!isVisible);
  };

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isVisible]);

  return (
    <span className="tooltip-wrapper">
      <button
        ref={triggerRef}
        className="tooltip-trigger"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={handleClick}
        aria-label="More information"
        type="button"
      >
        {children || (
          <svg viewBox="0 0 24 24" fill="currentColor" className="tooltip-icon">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
            <text x="12" y="16" textAnchor="middle" fontSize="12" fontWeight="600">i</text>
          </svg>
        )}
      </button>
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`tooltip-content tooltip-${position}`}
          role="tooltip"
        >
          <div className="tooltip-arrow" />
          {content}
        </div>
      )}
    </span>
  );
}

// Mapping of concern keywords to educational explanations
export const CONCERN_EXPLANATIONS: Record<string, string> = {
  "jaw mobility": "Limited ability to open mouth or move jaw forward, making laryngoscope insertion difficult",
  "restricted jaw": "Limited ability to open mouth or move jaw forward, making laryngoscope insertion difficult",
  "mallampati": "Higher Mallampati classification (III-IV) indicates limited visibility of pharyngeal structures, suggesting difficult intubation",
  "incisors": "Large or protruding front teeth can obstruct laryngoscope placement and visualization",
  "prominent upper": "Large or protruding front teeth can obstruct laryngoscope placement and visualization",
  "receding mandible": "Small or set-back lower jaw reduces space for airway manipulation",
  "mandible": "Small or set-back lower jaw reduces space for airway manipulation",
  "neck extension": "Reduced ability to tilt head back limits optimal positioning for intubation",
  "limited neck": "Reduced ability to tilt head back limits optimal positioning for intubation",
  "thyromental": "Short distance between chin and neck indicates less space for airway access",
  "body habitus": "Physical characteristics suggesting difficult airway access (e.g., obesity, short neck)",
  "anatomical": "Unusual structural features that may complicate standard intubation techniques",
  "facial trauma": "Injury to face or jaw may obstruct airway access and require alternative techniques",
  "airway swelling": "Swollen tissue can rapidly obstruct the airway and complicate visualization",
  "cervical spine": "Limited or dangerous neck movement requires special positioning and equipment",
  "beard": "Facial hair can prevent proper mask seal for bag-mask ventilation backup",
};

// Function to find the best matching explanation for a concern
export function getExplanation(concern: string): string | null {
  const lowerConcern = concern.toLowerCase();

  for (const [keyword, explanation] of Object.entries(CONCERN_EXPLANATIONS)) {
    if (lowerConcern.includes(keyword.toLowerCase())) {
      return explanation;
    }
  }

  // Default explanation for unrecognized concerns
  return "This finding may affect airway management. Consult clinical guidelines for specific recommendations.";
}
