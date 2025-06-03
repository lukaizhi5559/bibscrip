"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoAdProps {
  adTagUrl: string;
  isActive: boolean;
  onClose: () => void;
  position?: "modal" | "bottom-bar";
}

// Define global type for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export default function VideoAd({ 
  adTagUrl, 
  isActive, 
  onClose,
  position = "bottom-bar" 
}: VideoAdProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [closed, setClosed] = useState(false);
  const [useFallbackImage, setUseFallbackImage] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing timeout to prevent memory leaks
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (isActive && !closed) {
      // Auto-close the ad after 15 seconds regardless of state
      // This prevents ads from getting stuck if there are issues
      timeoutRef.current = setTimeout(() => {
        console.log("Auto-closing ad after timeout");
        setClosed(true);
        onClose();
      }, 15000); // 15 seconds max display time
      
      // Try to load and play the video ad
      try {
        const loadVideo = async () => {
          if (videoRef.current) {
            try {
              videoRef.current.src = adTagUrl;
              videoRef.current.muted = true;
              videoRef.current.playsInline = true;
              
              // Add event listener for errors
              const handleError = () => {
                console.log("Video error detected, using fallback");
                setUseFallbackImage(true);
              };
              
              videoRef.current.addEventListener('error', handleError);
              
              // Set a timeout to detect if video doesn't load
              const loadTimeout = setTimeout(() => {
                if (!loaded) {
                  console.log("Video load timeout, using fallback");
                  setUseFallbackImage(true);
                }
              }, 3000); // 3 second timeout for loading
              
              await videoRef.current.load();
              await videoRef.current.play();
              clearTimeout(loadTimeout);
              setLoaded(true);
              
              // Track video ad impression
              if (typeof window !== 'undefined' && window.gtag) {
                window.gtag('event', 'video_ad_impression', { 
                  ad_position: position,
                });
              }
              
              // Auto-close after video ends
              videoRef.current.onended = () => {
                setClosed(true);
                onClose();
              };
              
              return () => {
                if (videoRef.current) {
                  videoRef.current.removeEventListener('error', handleError);
                }
                clearTimeout(loadTimeout);
              };
            } catch (error) {
              console.log("Failed to play video ad, using fallback:", error);
              setUseFallbackImage(true);
            }
          }
        };
        
        loadVideo();
      } catch (error) {
        console.log("Error with video ad, using fallback:", error);
        setUseFallbackImage(true);
      }
    }
    
    // Cleanup function to clear timeout
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isActive, adTagUrl, closed, onClose, position, loaded]);

  // Don't render anything if not active or already closed
  if (!isActive || closed) return null;

  // Modal position styles
  if (position === "modal") {
    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={() => {
          setClosed(true);
          onClose();
        }}
      >
        <div 
          className="bg-background rounded-lg overflow-hidden max-w-2xl w-full shadow-lg"
          onClick={(e) => e.stopPropagation()} // Prevent clicks on the modal from closing it
        >
          <div className="flex justify-between items-center p-4 border-b">
            <h4 className="font-medium">Sponsored Message</h4>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => {
                setClosed(true);
                onClose();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative aspect-video bg-muted">
            {!loaded && !useFallbackImage && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
            
            {useFallbackImage ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-muted/30 text-center">
                <div className="bg-primary/10 p-6 rounded-lg border border-primary/20 w-full max-w-md">
                  <h3 className="text-lg font-medium mb-2">Support BibScrip</h3>
                  <p className="text-sm mb-4">Your use helps us share God's Word with more people.</p>
                  <div className="text-xs text-muted-foreground">
                    Upgrade to Premium for an ad-free experience.
                  </div>
                </div>
              </div>
            ) : (
              <video
                ref={videoRef}
                className="w-full h-full"
                muted
                playsInline
              />
            )}
          </div>
          <div className="p-3 text-xs text-center text-muted-foreground">
            <p>You can upgrade to BibScrip Premium for an ad-free experience</p>
          </div>
        </div>
      </div>
    );
  }

  // Bottom bar position
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-40">
      <div className="container mx-auto flex items-center">
        <div className="flex-1 max-w-[240px] h-[135px] relative my-2 bg-muted/30">
          {!loaded && !useFallbackImage && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          )}
          
          {useFallbackImage ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
              <div className="bg-primary/10 p-2 rounded-lg border border-primary/20 w-full h-full flex flex-col justify-center">
                <h4 className="text-sm font-medium">Support BibScrip</h4>
                <p className="text-xs mt-1">Thank you for your patience!</p>
              </div>
            </div>
          ) : (
            <video
              ref={videoRef}
              className="w-full h-full"
              muted
              playsInline
            />
          )}
        </div>
        <div className="flex-1 px-4">
          <p className="text-sm font-medium">Sponsored Message</p>
          <p className="text-xs text-muted-foreground mt-1">
            Upgrade to BibScrip Premium for an ad-free experience
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => {
            setClosed(true);
            onClose();
          }}
          className="mr-2"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
