import { useRef, useState, useEffect } from 'react';

/**
 * Main component for displaying BibScrip search results with AI answers, 
 * Bible verses, videos, and additional resources
 */
// Scroll to top button component
// ScrollToTopButton using scrollIntoView approach - only visible when scrolled down
const ScrollToTopButton = ({ showAds }: { showAds?: boolean }) => {
  const topRef = useRef<HTMLDivElement>(null);
  // State to track if button should be visible
  const [isVisible, setIsVisible] = useState(false);
  
  // Create a scroll target and set up scroll listeners
  useEffect(() => {
    // Add a hidden marker element at the top of our component
    const existingMarker = document.getElementById('results-top-marker');
    if (!existingMarker) {
      const marker = document.createElement('div');
      marker.id = 'results-top-marker';
      marker.style.position = 'absolute';
      marker.style.top = '0';
      marker.style.height = '1px';
      
      // Find the results container and insert our marker at the top
      const resultsContainer = document.querySelector('.results-layout');
      if (resultsContainer && resultsContainer.firstChild) {
        resultsContainer.insertBefore(marker, resultsContainer.firstChild);
      } else if (topRef.current && topRef.current.parentNode) {
        topRef.current.parentNode.insertBefore(marker, topRef.current);
      }
    }
    
    // Set up scroll listener to show/hide button
    const checkScrollPosition = () => {
      // Find the results panel
      const resultsPanel = document.querySelector('.results-layout');
      if (resultsPanel && resultsPanel instanceof HTMLElement) {
        // Button should be visible if scrolled down more than 300px
        const shouldBeVisible = resultsPanel.scrollTop > 300;
        if (shouldBeVisible !== isVisible) {
          setIsVisible(shouldBeVisible);
        }
      } else {
        // Fallback to window scroll
        const scrollPosition = window.scrollY || document.documentElement.scrollTop;
        const shouldBeVisible = scrollPosition > 300;
        if (shouldBeVisible !== isVisible) {
          setIsVisible(shouldBeVisible);
        }
      }
    };
    
    // Find the scrollable container and attach event listener
    const resultsPanel = document.querySelector('.results-layout');
    if (resultsPanel) {
      resultsPanel.addEventListener('scroll', checkScrollPosition);
    }
    
    // Also listen to window scroll as a fallback
    window.addEventListener('scroll', checkScrollPosition);
    
    // Check position on initial mount
    checkScrollPosition();
    
    // Cleanup
    return () => {
      if (resultsPanel) {
        resultsPanel.removeEventListener('scroll', checkScrollPosition);
      }
      window.removeEventListener('scroll', checkScrollPosition);
    };
  }, [isVisible]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Try multiple approaches to scroll to the top
    const scrollToTop = () => {
      // First try using our marker
      const marker = document.getElementById('results-top-marker');
      if (marker) {
        marker.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return true;
      }
      
      // Next try using the h1 question title which should be at the top
      const title = document.querySelector('#results-title');
      if (title) {
        title.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return true;
      }
      
      // Try finding the parent component itself
      const resultsLayout = document.querySelector('.results-layout');
      if (resultsLayout) {
        resultsLayout.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return true;
      }
      
      // If all else fails, try the first element in the results panel
      const resultsPanel = document.querySelector('.overflow-y-auto');
      if (resultsPanel && resultsPanel.firstElementChild) {
        resultsPanel.firstElementChild.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return true;
      }
      
      // Last resort - just scroll the window
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    };
    
    // Execute scroll
    scrollToTop();
  };

  return (
    <>
      {/* Hidden top reference element */}
      <div ref={topRef} id="results-top-ref" />
      
      {/* Scroll button with conditional visibility */}
      <button 
        onClick={handleClick}
        className={`fixed bottom-32 right-8 z-[9999] cursor-pointer bg-primary hover:bg-primary/90 text-white 
        rounded-full w-14 h-14 flex items-center justify-center shadow-md hover:scale-105 
        active:scale-95 transition-all duration-200 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-label="Scroll to top"
        type="button"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 19V5M5 12L12 5L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </>
  );
}

export default ScrollToTopButton;