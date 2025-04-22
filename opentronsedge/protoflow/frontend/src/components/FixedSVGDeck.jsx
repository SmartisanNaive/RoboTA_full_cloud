import React, { useEffect, useRef } from 'react';

/**
 * A component that renders the SVG deck visualization with fixed transformations
 * to correct the mirroring issue.
 */
const FixedSVGDeck = ({ svgContent }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Get the SVG element
    const svgElement = svgRef.current;

    // Find all foreignObject elements
    const foreignObjects = svgElement.querySelectorAll('foreignObject');
    
    foreignObjects.forEach(foreignObj => {
      // Get the class name to identify which foreignObject we're dealing with
      const className = foreignObj.getAttribute('class');
      
      // Find the div with the transform scale
      const divs = foreignObj.querySelectorAll('div');
      
      divs.forEach(div => {
        const cssAttr = div.getAttribute('css');
        
        // If this is the div with the scale transformation
        if (cssAttr && cssAttr.includes('transform: scale(1, -1)')) {
          // Fix the transformation
          div.style.transform = 'scale(1, 1)';
          
          // Find child divs that need to be flipped for text readability
          const childDivs = div.querySelectorAll('div');
          childDivs.forEach(childDiv => {
            childDiv.style.transform = 'scale(1, -1)';
          });
        }
      });
    });
  }, [svgContent]);

  // Create a div to hold the SVG content
  return (
    <div 
      ref={svgRef} 
      className="fixed-svg-deck"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};

export default FixedSVGDeck; 