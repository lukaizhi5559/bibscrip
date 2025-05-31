import React, { useState, useEffect, useCallback } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription,
  SheetClose
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useMediaQuery } from '@/hooks/use-media-query';

export type BibleSource = 'BibleGateway' | 'BibleHub' | 'BlueLetterBible';

export interface ScriptureSourceOverlayProps {
  url: string;
  source: BibleSource;
  passage: string;
  isOpen: boolean;
  onClose: () => void;
  onOpenExternalClick?: () => void;
}

const sourceLogos = {
  BibleGateway: '/images/biblegateway-logo.png',
  BibleHub: '/images/biblehub-logo.png',
  BlueLetterBible: '/images/blueletterbible-logo.png'
};

// Fallback logos if images aren't available
const sourceEmojis = {
  BibleGateway: '📘',
  BibleHub: '🔍',
  BlueLetterBible: '📖'
};

export function ScriptureSourceOverlay({
  url,
  source,
  passage,
  isOpen,
  onClose,
  onOpenExternalClick
}: ScriptureSourceOverlayProps) {
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Handle iframe load event
  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
  }, []);
  
  // Reset loading state when URL changes
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
    }
  }, [url, isOpen]);
  
  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscapeKey);
    return () => {
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);
  
  // Open in external tab handler
  const handleOpenExternal = useCallback(() => {
    window.open(url, '_blank');
    if (onOpenExternalClick) {
      onOpenExternalClick();
    }
  }, [url, onOpenExternalClick]);
  
  const renderContent = () => (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Try to load the logo, fallback to emoji if not available */}
          <div className="w-6 h-6 flex items-center justify-center">
            {sourceEmojis[source]}
          </div>
          <h3 className="font-semibold">{source}</h3>
          <span className="text-muted-foreground">·</span>
          <span className="text-sm text-muted-foreground">{passage}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleOpenExternal}
            title="Open in new tab"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="relative mt-4 border rounded-md overflow-hidden h-[80vh]">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="flex flex-col items-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading {source}...</p>
            </div>
          </div>
        )}
        <iframe
          src={url}
          sandbox="allow-same-origin allow-scripts allow-forms"
          loading="lazy"
          className="w-full h-full border rounded-md"
          onLoad={handleIframeLoad}
          title={`${source} - ${passage}`}
        />
      </div>
    </>
  );
  
  // Render as a bottom sheet on mobile, modal on desktop
  return isMobile ? (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-[90vh] sm:max-w-full">
        <SheetHeader className="mb-2">
          <SheetTitle className="sr-only">{source} - {passage}</SheetTitle>
          <SheetClose asChild>
            <Button className="absolute right-4 top-4" variant="ghost" size="icon">
              <X className="h-4 w-4" />
            </Button>
          </SheetClose>
        </SheetHeader>
        {renderContent()}
      </SheetContent>
    </Sheet>
  ) : (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh]">
        <DialogHeader className="mb-2">
          <DialogTitle className="sr-only">{source} - {passage}</DialogTitle>
          <DialogClose asChild>
            <Button className="absolute right-4 top-4" variant="ghost" size="icon">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
