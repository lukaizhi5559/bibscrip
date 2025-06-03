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

type AdSlotProps = {
  slotId: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  className?: string;
  style?: React.CSSProperties;
  fullWidthResponsive?: boolean;
  onAdLoaded?: () => void;
  onAdFailed?: () => void;
};

export default function AdSlot({
  slotId = "4298132768",
  format = 'auto',
  className = '',
  style = {},
  fullWidthResponsive = true,
  onAdLoaded,
  onAdFailed,
}: AdSlotProps) {
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
      const instanceId = `ad-${Math.random().toString(36).substring(2, 15)}`;
      adRef.current.setAttribute('data-ad-instance-id', instanceId);
    }
    
    // Track ad impression attempt
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'ad_impression_attempt', { 
        ad_slot: slotId,
        page_path: pathname
      });
    }
    
    const checkAdsenseLoaded = () => {
      if (typeof window === 'undefined' || typeof window.adsbygoogle === 'undefined') {
        console.log('AdSense not loaded yet, waiting for script to load');
        timeoutRef.current = setTimeout(checkAdsenseLoaded, 1000);
        return false;
      }
      return true;
    };
    
    const initializeAd = () => {
      try {
        if (adLoadedRef.current) return;
        
        if (checkAdsenseLoaded()) {
          console.log('Initializing AdSense ad', { slotId });
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
                  console.log("Ad didn't render properly (height <= 0)");
                  setAdFailed(true);
                  if (onAdFailed) onAdFailed();
                } else {
                  console.log("Ad rendered successfully with height:", height);
                  if (onAdLoaded) onAdLoaded();
                  
                  // Track successful ad impression
                  if (window.gtag) {
                    window.gtag('event', 'ad_impression', { 
                      ad_slot: slotId,
                      page_path: pathname,
                      ad_type: 'standard'
                    });
                  }
                }
              } else {
                console.log("Ad container not found");
                setAdFailed(true);
                if (onAdFailed) onAdFailed();
              }
            }, 2000);
          }, 100);
        } else {
          timeoutRef.current = setTimeout(initializeAd, 1000);
        }
      } catch (err) {
        console.error("Error initializing ad:", err);
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

  return (
    <div ref={adRef} className={`ad-container ${className}`}>
      {/* bible ads */}
      <ins
        className="adsbygoogle"
        style={{
          display: "block",
          minHeight: "100px",
          ...style
        }}
        data-ad-client="ca-pub-6655505252648648"
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
      />
      {adFailed && (
        <div className="ad-fallback">
          <p className="text-xs text-gray-500 text-center mt-2">
            Support BibScrip by disabling your ad blocker
          </p>
        </div>
      )}
    </div>
  );
}

function FallbackAd({ className, slotId }: { className?: string; slotId: string }) {
  return (
    <div className={`fallback-ad bg-muted/30 rounded-md flex items-center justify-center p-4 ${className}`}>
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Support BibScrip by exploring our resources
        </p>
        <a 
          href="https://bibscrip.com/premium" 
          className="text-xs mt-1 text-primary hover:underline block"
          onClick={() => {
            // Track fallback ad click
            if (typeof window !== 'undefined' && window.gtag) {
              window.gtag('event', 'fallback_ad_click', { 
                ad_slot: slotId
              });
            }
          }}
        >
          Upgrade to Premium
        </a>
      </div>
    </div>
  );
}
