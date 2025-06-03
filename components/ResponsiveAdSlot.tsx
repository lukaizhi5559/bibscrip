"use client";

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

// Extend Window interface to include adsbygoogle
declare global {
  interface Window {
    adsbygoogle: any[];
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

type ResponsiveAdSlotProps = {
  slotId?: string;
  className?: string;
  style?: React.CSSProperties;
  onAdLoaded?: () => void;
  onAdFailed?: () => void;
};

export default function ResponsiveAdSlot({
  slotId = "8681564685", // Default slot ID for responsive ad
  className = '',
  style = {},
  onAdLoaded,
  onAdFailed,
}: ResponsiveAdSlotProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const initAttemptedRef = useRef(false);
  const adLoadedRef = useRef(false);
  const pathname = usePathname();
  const [adFailed, setAdFailed] = useState(false);
  
  // Use a ref to track timeouts for cleanup
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Only attempt to initialize once
    if (initAttemptedRef.current) return;
    initAttemptedRef.current = true;
    
    // Add a unique instance ID to this ad slot
    if (adRef.current) {
      const instanceId = `responsive-ad-${Math.random().toString(36).substring(2, 15)}`;
      adRef.current.setAttribute('data-ad-instance-id', instanceId);
    }
    
    // Track ad impression attempt
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'ad_impression_attempt', { 
        ad_slot: slotId,
        page_path: pathname,
        ad_type: 'responsive'
      });
    }
    
    const checkAdsenseLoaded = () => {
      if (typeof window === 'undefined' || typeof window.adsbygoogle === 'undefined') {
        console.log('AdSense not loaded yet for responsive ad, waiting for script to load');
        timeoutRef.current = setTimeout(checkAdsenseLoaded, 1000);
        return false;
      }
      return true;
    };
    
    const initializeAd = () => {
      try {
        if (adLoadedRef.current) return;
        
        if (checkAdsenseLoaded()) {
          console.log('Initializing responsive AdSense ad', { slotId });
          adLoadedRef.current = true;
          
          // Push the ad after a slight delay to ensure DOM is ready
          setTimeout(() => {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            
            // Set a timeout to check if the ad rendered successfully
            timeoutRef.current = setTimeout(() => {
              if (!adRef.current) return;
              
              const adContainer = adRef.current.querySelector('ins');
              if (adContainer) {
                const height = adContainer.clientHeight;
                if (height <= 0) {
                  console.log("Responsive ad didn't render properly (height <= 0)");
                  setAdFailed(true);
                  if (onAdFailed) onAdFailed();
                } else {
                  console.log("Responsive ad rendered successfully with height:", height);
                  if (onAdLoaded) onAdLoaded();
                  
                  // Track successful ad impression
                  if (window.gtag) {
                    window.gtag('event', 'ad_impression', { 
                      ad_slot: slotId,
                      page_path: pathname,
                      ad_type: 'responsive'
                    });
                  }
                }
              } else {
                console.log("Responsive ad container not found");
                setAdFailed(true);
                if (onAdFailed) onAdFailed();
              }
            }, 2000);
          }, 100);
        } else {
          timeoutRef.current = setTimeout(initializeAd, 1000);
        }
      } catch (err) {
        console.error("Error initializing responsive ad:", err);
        setAdFailed(true);
        if (onAdFailed) onAdFailed();
      }
    };
    
    // Start the initialization process
    initializeAd();
    
    // Clean up on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [slotId, pathname, onAdLoaded, onAdFailed]);

  // Fallback UI if ad fails to load
  if (adFailed) {
    return (
      <div 
        className={`responsive-ad-fallback ${className}`}
        style={{
          width: '100%',
          minHeight: '250px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9f9f9',
          borderRadius: '4px',
          padding: '10px',
          ...style
        }}
      >
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Ad content could not be loaded.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Consider disabling your ad blocker to support BibScrip.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={adRef} className={`responsive-ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{
          display: "block",
          width: '100%',
          minHeight: '250px',
          ...style
        }}
        data-ad-client="ca-pub-3920325569173233"
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
