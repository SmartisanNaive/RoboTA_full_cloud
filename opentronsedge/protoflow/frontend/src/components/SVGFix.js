/**
 * SVGFix.js - Utility to fix SVG mirroring issues
 * 
 * This script fixes the mirroring issue in SVG visualizations by
 * applying the correct CSS transformations to the foreignObject elements.
 */

/**
 * Fixes the mirroring issue in SVG visualizations
 */
export function fixSVGMirroring() {
  // Find all SVG elements with the viewBox attribute matching the pattern
  const svgElements = document.querySelectorAll('svg[viewBox*="-204.31 -76.59 854.995 581.74"]');
  
  svgElements.forEach(svg => {
    // Find all foreignObject elements within the SVG
    const foreignObjects = svg.querySelectorAll('foreignObject');
    
    foreignObjects.forEach(foreignObj => {
      // Find the div with the transform scale
      const divs = foreignObj.querySelectorAll('div[css*="transform: scale(1, -1)"]');
      
      divs.forEach(div => {
        // Override the transformation to fix the mirroring issue
        div.style.transform = 'scale(1, 1)';
        
        // Find child divs that need to be flipped for text readability
        const childDivs = div.querySelectorAll('div');
        childDivs.forEach(childDiv => {
          // Only apply to direct children, not all descendants
          if (childDiv.parentNode === div) {
            childDiv.style.transform = 'scale(1, -1)';
          }
        });
      });
    });
  });
}

/**
 * Applies a MutationObserver to continuously fix SVG mirroring issues
 * as new elements are added to the DOM
 */
export function observeSVGChanges() {
  // Create a MutationObserver to watch for changes to the DOM
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Fix SVG mirroring when new nodes are added
        fixSVGMirroring();
      }
    });
  });
  
  // Start observing the document body for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Return the observer so it can be disconnected if needed
  return observer;
}

// Apply the fix immediately when the script is loaded
document.addEventListener('DOMContentLoaded', () => {
  fixSVGMirroring();
  observeSVGChanges();
}); 