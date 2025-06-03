"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/contexts/user-context";
import VideoAd from "./VideoAd";

interface IdleAdsControllerProps {
  idleTimeThreshold?: number; // in seconds
  adTagUrl?: string;
}

export default function IdleAdsController({
  idleTimeThreshold = 90, // Default 90 seconds of inactivity
  adTagUrl = "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=",
}: IdleAdsControllerProps) {
  const [isIdle, setIsIdle] = useState(false);
  const [showVideoAd, setShowVideoAd] = useState(false);
  const { showAds } = useUser();

  useEffect(() => {
    // Only setup idle detection if the user should see ads
    if (!showAds) return;

    let idleTimer: NodeJS.Timeout;
    let idleTimerRunning = false;

    const resetIdleTimer = () => {
      if (idleTimer) clearTimeout(idleTimer);
      
      if (isIdle) {
        setIsIdle(false);
        setShowVideoAd(false);
      }
      
      idleTimer = setTimeout(() => {
        setIsIdle(true);
        setShowVideoAd(true);
      }, idleTimeThreshold * 1000);
      
      idleTimerRunning = true;
    };

    // Event listeners for user activity
    const activityEvents = [
      'mousedown', 'mousemove', 'keypress', 
      'scroll', 'touchstart', 'click', 'keydown'
    ];

    // Add event listeners and start timer
    activityEvents.forEach(event => {
      document.addEventListener(event, resetIdleTimer);
    });

    // Initial timer start
    resetIdleTimer();

    // Cleanup
    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      activityEvents.forEach(event => {
        document.removeEventListener(event, resetIdleTimer);
      });
    };
  }, [idleTimeThreshold, isIdle, showAds]);

  // Don't render anything if user shouldn't see ads
  if (!showAds) return null;
  
  return (
    <>
      {showVideoAd && (
        <VideoAd
          adTagUrl={adTagUrl}
          isActive={true}
          onClose={() => setShowVideoAd(false)}
          position="modal"
        />
      )}
    </>
  );
}
