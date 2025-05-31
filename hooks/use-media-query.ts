import { useState, useEffect } from 'react';

/**
 * A custom React hook that returns whether a media query matches the current viewport.
 * @param query The media query string to check
 * @returns Boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  // Initialize with the match value, if window is available (client-side)
  const [matches, setMatches] = useState<boolean>(() => {
    // Check if window is defined (we're on the client side)
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    // Default to false on server-side
    return false;
  });

  useEffect(() => {
    // Exit early if not on client-side
    if (typeof window === 'undefined') {
      return;
    }

    // Create a media query list
    const mediaQueryList = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQueryList.matches);

    // Define callback function
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add event listener (using newer style if available)
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQueryList.addListener(handleChange);
    }

    // Cleanup function
    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mediaQueryList.removeListener(handleChange);
      }
    };
  }, [query]); // Re-run if the query changes

  return matches;
}
