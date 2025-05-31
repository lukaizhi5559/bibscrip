import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { parsePassage, getBookCode, formatPassageForUrl, getBLBCode } from '@/utils/biblical-helpers';
import { setActiveMainTab, navigateToVerseResource } from '@/utils/navigation-helpers';

interface ReferenceLinksProps {
  passage: string;
  translations?: string[];
  showBibleGateway?: boolean;
  showBibleHub?: boolean;
  showBlueLetterBible?: boolean;
  bibleGatewayLink?: string; // Optional direct link to BibleGateway
}

/**
 * Component that renders links to external Bible reference sites
 * for a given passage in various translations
 */
export function ReferenceLinks({
  passage,
  translations = ['NIV'],
  showBibleGateway = true,
  showBibleHub = true,
  showBlueLetterBible = true,
  bibleGatewayLink,
}: ReferenceLinksProps) {
  // Ensure translations is always a valid array with at least one item
  const safeTranslations = (!translations || translations.length === 0) ? ['NIV'] : 
    translations.map(t => t || 'NIV');
    
  // Parse the passage to handle the various URL formats
  const formattedPassage = formatPassageForUrl(passage || 'John 3:16');
  
  // Navigate to the Bible Verses tab and trigger click on the appropriate resource tab
  const navigateToResource = (resourceType: 'biblegateway' | 'biblehub' | 'blueletterbible') => {
    // Use the improved navigation helper function
    navigateToVerseResource(passage, resourceType);
    
    // Optional: analytics tracking
    try {
      console.log(`Resource selected: ${resourceType}, Passage: ${passage}`);
    } catch (error) {
      console.error('Analytics error:', error);
    }
  };
  
  // Function to open external link in new tab
  const openExternalLink = (url: string) => {
    window.open(url, '_blank');
    
    // Optional: analytics tracking
    try {
      console.log(`External link opened: ${url}, Passage: ${passage}`);
    } catch (error) {
      console.error('Analytics error:', error);
    }
  };
  
  
  // Map translation codes to their proper values for different Bible sites
  const getTranslationCode = (translation: string, site: 'biblegateway' | 'biblehub' | 'blueletterbible'): string => {
    const translationMap: Record<string, Record<string, string>> = {
      'web': {
        biblegateway: 'WEB',  // BibleGateway uses WEB for World English Bible
        biblehub: 'web',      // BibleHub uses lowercase
        blueletterbible: 'web' // BlueLetterBible uses web
      },
      'world': {
        biblegateway: 'WEB',  // Correct 'world' to 'WEB'
        biblehub: 'web',
        blueletterbible: 'web'
      },
      'niv': {
        biblegateway: 'NIV',
        biblehub: 'niv',
        blueletterbible: 'NIV'
      },
      'esv': {
        biblegateway: 'ESV',
        biblehub: 'esv',
        blueletterbible: 'ESV'
      },
      'kjv': {
        biblegateway: 'KJV',
        biblehub: 'kjv',
        blueletterbible: 'KJV'
      },
      'nkjv': {
        biblegateway: 'NKJV',
        biblehub: 'nkjv',
        blueletterbible: 'NKJV'
      },
      'nasb': {
        biblegateway: 'NASB',
        biblehub: 'nasb',
        blueletterbible: 'NASB'
      }
    };
    
    // Convert translation to lowercase for consistent lookup
    const normTranslation = translation.toLowerCase();
    if (translationMap[normTranslation] && translationMap[normTranslation][site]) {
      return translationMap[normTranslation][site];
    }
    
    // Default fallbacks per site
    const defaults = {
      biblegateway: 'NIV',
      biblehub: 'niv',
      blueletterbible: 'NKJV'
    };
    
    return defaults[site];
  };
  
  console.log('ReferenceLinks props:', { passage, translations, bibleGatewayLink });
  
  // Parse the bibleGatewayLink if available
  let linkParams: { search: string; version: string } = {
    search: passage || 'John 3:16', // Use the provided passage as default
    version: getTranslationCode(safeTranslations[0], 'biblegateway')
  };
  
  // If a Bible Gateway link is provided, extract parameters from it
  if (bibleGatewayLink) {
    try {
      const url = new URL(bibleGatewayLink);
      const searchParam = url.searchParams.get('search');
      const versionParam = url.searchParams.get('version');
      
      // Only update if values are present in the URL
      if (searchParam) linkParams.search = searchParam;
      if (versionParam) linkParams.version = versionParam;
      
      console.log('Extracted from BibleGateway link:', linkParams);
    } catch (e) {
      console.error('Failed to parse BibleGateway link:', e);
    }
  }
  
  // Ensure we have a valid search parameter
  if (!linkParams.search || linkParams.search === 'undefined') {
    linkParams.search = passage || 'John 3:16';
  }
  
  // Extract book, chapter, and verse for BibleHub and BlueLetterBible
  // Use search parameter from the Bible Gateway link if available
  const passageToUse = linkParams.search || passage || 'John 3:16';
  const { book, chapter, verse } = parsePassage(passageToUse);

  // Generate URLs for resources
  // For Bible Gateway
  const bibleGatewayUrl = bibleGatewayLink || `https://www.biblegateway.com/passage/?search=${linkParams.search}&version=${linkParams.version}`;
  
  // For Bible Hub
  const bibleHubUrl = verse 
    ? `https://biblehub.com/${book.toLowerCase()}/${chapter}-${verse}.htm` 
    : `https://biblehub.com/${book.toLowerCase()}/${chapter}.htm`;
  
  // For Blue Letter Bible
  const blueLetterBibleUrl = `https://www.blueletterbible.org/${getTranslationCode(safeTranslations[0] || 'niv', 'blueletterbible')}/${getBookCode(book)}/${chapter}/${verse || '1'}/s_${getBLBCode(book, chapter, verse)}`;
  
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {/* Navigation buttons that open Bible Verses tab with the appropriate resource selected */}
      {showBibleGateway && (
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs h-7 px-2 py-1"
          title="View in BibleGateway"
          onClick={() => navigateToResource('biblegateway')}
        >
          <span className="mr-1">📘</span> BibleGateway
        </Button>
      )}
      
      {showBibleHub && book && chapter && (
        <Button 
          variant="outline" 
          size="sm"
          className="text-xs h-7 px-2 py-1"
          title="View in BibleHub"
          onClick={() => navigateToResource('biblehub')}
        >
          <span className="mr-1">🔍</span> BibleHub
        </Button>
      )}
      
      {showBlueLetterBible && book && chapter && (
        <Button 
          variant="outline" 
          size="sm"
          className="text-xs h-7 px-2 py-1"
          title="View in BlueLetterBible"
          onClick={() => navigateToResource('blueletterbible')}
        >
          <span className="mr-1">📖</span> BlueLetterBible
        </Button>
      )}
      
      {/* External links to open in new tab */}
      <div className="flex flex-wrap gap-2 mt-2 ml-auto">
        {showBibleGateway && (
          <Button 
            variant="ghost" 
            size="sm"
            className="text-xs h-7 px-2 py-1"
            title="Open in new tab"
            onClick={() => openExternalLink(bibleGatewayUrl)}
          >
            <ExternalLink className="h-3 w-3 mr-1" /> BG
          </Button>
        )}
        
        {showBibleHub && book && chapter && (
          <Button 
            variant="ghost" 
            size="sm"
            className="text-xs h-7 px-2 py-1"
            title="Open in new tab"
            onClick={() => openExternalLink(bibleHubUrl)}
          >
            <ExternalLink className="h-3 w-3 mr-1" /> BH
          </Button>
        )}
        
        {showBlueLetterBible && book && chapter && (
          <Button 
            variant="ghost" 
            size="sm"
            className="text-xs h-7 px-2 py-1"
            title="Open in new tab"
            onClick={() => openExternalLink(blueLetterBibleUrl)}
          >
            <ExternalLink className="h-3 w-3 mr-1" /> BLB
          </Button>
        )}
      </div>
      
      {/* Multi-translation comparison button */}
      {safeTranslations.length > 1 && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => openExternalLink(
            `https://www.biblegateway.com/passage/?search=${linkParams.search}&version=${safeTranslations.map(t => getTranslationCode(t, 'biblegateway')).join('%2C')}`
          )}
          className="flex items-center gap-1 text-xs h-7 px-2 py-1 mt-2"
        >
          <span className="mr-1">📊</span> Compare Translations
          <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      )}
    </div>
  );
}

// All helper functions are now imported from @/utils/biblical-helpers
