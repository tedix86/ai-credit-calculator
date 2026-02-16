import { useState, useEffect, useRef } from 'react';

function InfoTooltip({ text, sections }) {
  const [isVisible, setIsVisible] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const tooltipRef = useRef(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setIsVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible]);

  const toggleSection = (sectionTitle) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  const toggleTooltip = () => {
    setIsVisible(prev => !prev);
  };

  // If sections are provided, render structured tooltip with collapsible sections
  // Otherwise, render simple text tooltip
  const renderContent = () => {
    if (sections) {
      return (
        <div className="info-tooltip-structured">
          {sections.summary && (
            <div className="tooltip-summary">{sections.summary}</div>
          )}
          {sections.details && sections.details.map((detail, index) => (
            <div key={index} className="tooltip-section">
              <button
                className="tooltip-section-header"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSection(detail.title);
                }}
                type="button"
              >
                <span className={`tooltip-arrow ${expandedSections[detail.title] ? 'expanded' : ''}`}>▶</span>
                {detail.title}
              </button>
              {expandedSections[detail.title] && (
                <div className="tooltip-section-content">
                  {detail.content}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }
    return <div className="info-tooltip-text">{text}</div>;
  };

  return (
    <div className="info-tooltip-wrapper" ref={tooltipRef}>
      <button
        className="info-tooltip-trigger"
        onClick={toggleTooltip}
        type="button"
        aria-label="More information"
      >
        ⓘ
      </button>
      {isVisible && (
        <div className="info-tooltip-content">
          {renderContent()}
        </div>
      )}
    </div>
  );
}

export default InfoTooltip;
