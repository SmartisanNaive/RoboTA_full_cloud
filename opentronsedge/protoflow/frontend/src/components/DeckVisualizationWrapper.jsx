import React, { useEffect, useRef } from 'react';

/**
 * A wrapper component that fixes the mirroring issue in SVG visualizations
 * by applying CSS transformations to the foreignObject elements.
 */
const DeckVisualizationWrapper = ({ children }) => {
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!wrapperRef.current) return;

    // Find all foreignObject elements with the problematic transformation
    const foreignObjects = wrapperRef.current.querySelectorAll('foreignObject');
    
    foreignObjects.forEach(foreignObj => {
      // Find the div with the scale transformation
      const transformDivs = foreignObj.querySelectorAll('div[css*="transform: scale(1, -1)"]');
      
      transformDivs.forEach(div => {
        // Override the transformation to fix the mirroring issue
        div.style.transform = 'scale(1, 1)';
        
        // Find the child div that needs to be flipped back for text readability
        const childDivs = div.querySelectorAll('div');
        childDivs.forEach(childDiv => {
          childDiv.style.transform = 'scale(1, -1)';
        });
      });
    });
  }, [children]); // Re-run when children change

  return (
    <div ref={wrapperRef} className="deck-visualization-wrapper">
      {children}
    </div>
  );
};

export default DeckVisualizationWrapper; 