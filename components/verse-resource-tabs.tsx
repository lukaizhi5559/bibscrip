import React, { useState, useEffect } from 'react';
import { ExpandableText } from './expandable-text';
import { ExternalLink } from 'lucide-react';
import ResponsiveAdSlot from './ResponsiveAdSlot';

interface VerseResourceTabsProps {
  verse: {
    ref: string;
    text: string;
    translation?: string;
  };
  defaultTab?: 'text' | 'biblegateway' | 'biblehub' | 'blueletterbible';
}

/**
 * Isolated verse resource tabs component - one instance per verse
 * This ensures each verse has its own isolated tab state
 */
export default function VerseResourceTabs({ verse, defaultTab = 'text' }: VerseResourceTabsProps) {
  // Local state for this specific verse's tabs
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  
  // Normalize verse references for comparison (e.g., "John 3:16" and "john 3:16" should match)
  const normalizeVerseRef = (ref: string): string => {
    return ref.trim().toLowerCase().replace(/\s+/g, ' ');
  };

  // Check sessionStorage for navigation requests when component mounts or verse changes
  useEffect(() => {
    // Check if there's a navigation request in sessionStorage that matches this verse
    const activeVerseRef = window.sessionStorage.getItem('activeVerseRef');
    const activeResourceTab = window.sessionStorage.getItem('activeResourceTab');
    
    if (activeVerseRef && activeResourceTab) {
      console.log(`Current verse: "${verse.ref}", Active request: "${activeVerseRef}"`);
      
      // Normalize both references for better matching
      const normalizedCurrentRef = normalizeVerseRef(verse.ref);
      const normalizedActiveRef = normalizeVerseRef(activeVerseRef);
      
      // If this verse reference matches the requested one, activate the requested tab
      if (normalizedCurrentRef === normalizedActiveRef) {
        console.log(`✅ MATCH FOUND - Activating ${activeResourceTab} tab for verse: ${verse.ref}`);
        setActiveTab(activeResourceTab);
        
        // Clear storage to prevent unwanted tab changes
        window.sessionStorage.removeItem('activeVerseRef');
        window.sessionStorage.removeItem('activeResourceTab');
      } else {
        console.log(`❌ NO MATCH - "${normalizedCurrentRef}" !== "${normalizedActiveRef}"`);
      }
    }
  }, [verse.ref]); // Re-run when verse.ref changes
  
  // Parse verse reference helper function - moved to the top so it can be used by other functions
  const parsePassage = (ref: string) => {
    const parts = ref.split(/\s+/);
    const book = parts[0];
    const chapterVerse = parts[1] || '';
    const [chapter, verseNum] = chapterVerse.split(':');
    
    return { book, chapter, verse: verseNum };
  };
  
  const getBookCode = (book: string) => {
    // Simplify book name for URL - this is a simple implementation
    return book.toLowerCase().replace(/\s+/g, '');
  };
  
  // Get translation code for Bible resources
  const getTranslationCode = (fullTranslation: string | undefined): string => {
    if (!fullTranslation) return 'NIV';
    
    // If it's already a code (likely 2-5 characters), use it directly
    if (fullTranslation.length <= 5 && fullTranslation === fullTranslation.toUpperCase()) {
      return fullTranslation;
    }
    
    // Map full names to codes - lowercase for comparison
    const lowerTranslation = fullTranslation.toLowerCase();
    if (lowerTranslation.includes('world') || lowerTranslation.includes('web')) {
      return 'WEB'; // World English Bible
    }
    if (lowerTranslation.includes('niv') || lowerTranslation.includes('international')) {
      return 'NIV'; 
    }
    if (lowerTranslation.includes('kjv') || lowerTranslation.includes('king james')) {
      return 'KJV'; 
    }
    if (lowerTranslation.includes('esv') || lowerTranslation.includes('standard')) {
      return 'ESV'; 
    }
    if (lowerTranslation.includes('nasb') || lowerTranslation.includes('american standard')) {
      return 'NASB'; 
    }
    
    // If we can't determine the translation, default to NIV
    console.log('Unknown translation:', fullTranslation, '- defaulting to NIV');
    return 'NIV';
  };
  
  // Use proper translation code for BibleGateway
  const translationCode = getTranslationCode(verse.translation);
  const formattedRef = verse.ref.replace(/\s+/g, '+');
  const bibleGatewayUrl = `https://www.biblegateway.com/passage/?version=${translationCode}&search=${formattedRef}&output=embed`;
  
  const { book, chapter, verse: verseNum } = parsePassage(verse.ref);
  
  // Format book name specifically for BibleHub URL
  const formatBibleHubBook = (bookName: string | undefined): string => {
    if (!bookName) return 'genesis';
    
    // Convert to lowercase
    const lowerBook = bookName.toLowerCase();
    
    // BibleHub URL formatting uses specific naming conventions
    const bibleHubMap: Record<string, string> = {
      // Old Testament
      'genesis': 'genesis',
      'exodus': 'exodus',
      'leviticus': 'leviticus',
      'numbers': 'numbers',
      'deuteronomy': 'deuteronomy',
      'joshua': 'joshua',
      'judges': 'judges',
      'ruth': 'ruth',
      '1 samuel': '1samuel',
      'i samuel': '1samuel',
      '2 samuel': '2samuel',
      'ii samuel': '2samuel',
      '1 kings': '1kings',
      'i kings': '1kings',
      '2 kings': '2kings',
      'ii kings': '2kings',
      '1 chronicles': '1chronicles',
      'i chronicles': '1chronicles',
      '2 chronicles': '2chronicles',
      'ii chronicles': '2chronicles',
      'ezra': 'ezra',
      'nehemiah': 'nehemiah',
      'esther': 'esther',
      'job': 'job',
      'psalm': 'psalms',
      'psalms': 'psalms',
      'proverbs': 'proverbs',
      'ecclesiastes': 'ecclesiastes',
      'song': 'songs', // Song of Solomon
      'song of solomon': 'songs',
      'song of songs': 'songs',
      'isaiah': 'isaiah',
      'jeremiah': 'jeremiah',
      'lamentations': 'lamentations',
      'ezekiel': 'ezekiel',
      'daniel': 'daniel',
      'hosea': 'hosea',
      'joel': 'joel',
      'amos': 'amos',
      'obadiah': 'obadiah',
      'jonah': 'jonah',
      'micah': 'micah',
      'nahum': 'nahum',
      'habakkuk': 'habakkuk',
      'zephaniah': 'zephaniah',
      'haggai': 'haggai',
      'zechariah': 'zechariah',
      'malachi': 'malachi',
      
      // New Testament
      'matthew': 'matthew',
      'mark': 'mark',
      'luke': 'luke',
      'john': 'john',
      'acts': 'acts',
      'romans': 'romans',
      '1 corinthians': '1corinthians',
      'i corinthians': '1corinthians',
      '2 corinthians': '2corinthians',
      'ii corinthians': '2corinthians',
      'galatians': 'galatians',
      'ephesians': 'ephesians',
      'philippians': 'philippians',
      'colossians': 'colossians',
      '1 thessalonians': '1thessalonians',
      'i thessalonians': '1thessalonians',
      '2 thessalonians': '2thessalonians',
      'ii thessalonians': '2thessalonians',
      '1 timothy': '1timothy',
      'i timothy': '1timothy',
      '2 timothy': '2timothy',
      'ii timothy': '2timothy',
      'titus': 'titus',
      'philemon': 'philemon',
      'hebrews': 'hebrews',
      'james': 'james',
      '1 peter': '1peter',
      'i peter': '1peter',
      '2 peter': '2peter',
      'ii peter': '2peter',
      '1 john': '1john',
      'i john': '1john',
      '2 john': '2john',
      'ii john': '2john',
      '3 john': '3john',
      'iii john': '3john',
      'jude': 'jude',
      'revelation': 'revelation',
      'revelations': 'revelation'
    };
    
    // Check map for specific book format
    if (bibleHubMap[lowerBook]) {
      return bibleHubMap[lowerBook];
    }
    
    // Default fallback - remove spaces
    return lowerBook.replace(/\s+/g, '');
  };
  
  // BibleHub URL with proper book name formatting
  const formattedBook = formatBibleHubBook(book);
  
  // Extract first verse number if it's a range (e.g., "5-6" → "5")
  const extractFirstVerseNumber = (verseStr: string | undefined): string | undefined => {
    if (!verseStr) return undefined;
    
    // If it contains a hyphen, take only what's before it
    if (verseStr.includes('-')) {
      return verseStr.split('-')[0];
    }
    
    return verseStr;
  };
  
  const firstVerseNum = extractFirstVerseNumber(verseNum);
  
  const bibleHubUrl = firstVerseNum
    ? `https://biblehub.com/${formattedBook}/${chapter}-${firstVerseNum}.htm`
    : `https://biblehub.com/${formattedBook}/${chapter}.htm`;

  // BlueLetterBible URL with direct translation code
  // BLB typically uses lowercase translation codes
  const blbTranslationCode = translationCode.toLowerCase();
  const blueLetterBibleUrl = `https://www.blueletterbible.org/${blbTranslationCode}/${getBookCode(book || '')}/${chapter}/${verseNum || '1'}`;

  return (
    <div className="w-full mt-2 overflow-hidden">
      {/* Custom tab navigation */}
      <div className="grid grid-cols-4 mb-2 bg-muted rounded-lg p-1">
        <button 
          className={`py-2 px-1 rounded-md text-sm transition-colors ${activeTab === 'text' ? 'bg-background shadow-sm font-medium' : 'hover:bg-muted-foreground/10'}`}
          onClick={() => setActiveTab('text')}
        >
          <span className="hidden sm:inline">Verse Text</span>
          <span className="sm:hidden">Text</span>
        </button>
        <div className="relative">
          <button 
            className={`w-full py-2 px-1 rounded-md text-sm transition-colors ${activeTab === 'biblegateway' ? 'bg-background shadow-sm font-medium' : 'hover:bg-muted-foreground/10'}`}
            onClick={() => setActiveTab('biblegateway')}
          >
            <span className="hidden sm:inline">BibleGateway</span>
            <span className="sm:hidden">BG</span>
          </button>
          <button 
            className="absolute top-1 right-1 p-1 opacity-70 hover:opacity-100 text-muted-foreground hover:text-foreground rounded-full"
            title="Open in new tab"
            onClick={(e) => {
              e.stopPropagation();
              window.open(bibleGatewayUrl, '_blank');
            }}
          >
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
        <div className="relative">
          <button 
            className={`w-full py-2 px-1 rounded-md text-sm transition-colors ${activeTab === 'biblehub' ? 'bg-background shadow-sm font-medium' : 'hover:bg-muted-foreground/10'}`}
            onClick={() => setActiveTab('biblehub')}
          >
            <span className="hidden sm:inline">BibleHub</span>
            <span className="sm:hidden">BH</span>
          </button>
          <button 
            className="absolute top-1 right-1 p-1 opacity-70 hover:opacity-100 text-muted-foreground hover:text-foreground rounded-full"
            title="Open in new tab"
            onClick={(e) => {
              e.stopPropagation();
              window.open(bibleHubUrl, '_blank');
            }}
          >
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
        <div className="relative">
          <button 
            className={`w-full py-2 px-1 rounded-md text-sm transition-colors ${activeTab === 'blueletterbible' ? 'bg-background shadow-sm font-medium' : 'hover:bg-muted-foreground/10'}`}
            onClick={() => setActiveTab('blueletterbible')}
          >
            <span className="hidden sm:inline">BlueLetterBible</span>
            <span className="sm:hidden">BLB</span>
          </button>
          <button 
            className="absolute top-1 right-1 p-1 opacity-70 hover:opacity-100 text-muted-foreground hover:text-foreground rounded-full"
            title="Open in new tab"
            onClick={(e) => {
              e.stopPropagation();
              window.open(blueLetterBibleUrl, '_blank');
            }}
          >
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </div>
      
      {/* Tab content based on active tab */}
      <div>
        {/* Verse text content */}
        {activeTab === 'text' && (
          <ExpandableText
            text={verse.text.trim()}
            maxLength={250}
            textClassName="pl-4 border-l-2 border-muted-foreground/30 italic text-muted-foreground break-words whitespace-normal"
            expandButtonClassName="text-xs mt-1"
          />
        )}
        
        {/* BibleGateway content */}
        {activeTab === 'biblegateway' && (
          <div className="flex flex-col space-y-2">
            {/* Thin ad banner at the top (red line area) */}
            {/* <div className="w-full">
              <ResponsiveAdSlot
                slotId="4298132768"
                style={{ minHeight: '100px' }}
              />
            </div> */}
            <div className="relative min-h-[400px] border rounded-md overflow-hidden">
              <div className="absolute inset-0 overflow-hidden">
                <iframe
                  src={bibleGatewayUrl}
                  className="w-full h-full border-0 overflow-auto"
                  title={`BibleGateway - ${verse.ref}`}
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            {/* <div className="text-center">
              <a 
                href={bibleGatewayUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:underline"
              >
                Open in BibleGateway (if not loading properly)
              </a>
            </div> */}
          </div>
        )}
        
        {/* BibleHub content */}
        {activeTab === 'biblehub' && (
          <div className="flex flex-col space-y-2">
            {/* Thin ad banner at the top (red line area) */}
            {/* <div className="w-full">
              <ResponsiveAdSlot
                slotId="4298132768"
                style={{ minHeight: '100px' }}
              />
            </div> */}
            <div className="relative min-h-[400px] border rounded-md overflow-hidden">
              <div className="absolute inset-0 overflow-hidden">
                <iframe
                  src={bibleHubUrl}
                  className="w-full h-full border-0 overflow-auto"
                  title={`BibleHub - ${verse.ref}`}
                  sandbox="allow-same-origin allow-scripts allow-forms"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        )}
        
        {/* BlueLetterBible content */}
        {activeTab === 'blueletterbible' && (
          <div className="flex flex-col space-y-2">
            {/* Thin ad banner at the top (red line area) */}
            {/* <div className="w-full">
              <ResponsiveAdSlot
                slotId="4298132768"
                style={{ minHeight: '100px' }}
              />
            </div> */}
            <div className="relative min-h-[400px] border rounded-md overflow-hidden">
              <div className="absolute inset-0 overflow-hidden">
                <iframe
                  src={blueLetterBibleUrl}
                  className="w-full h-full border-0 overflow-auto"
                  title={`BlueLetterBible - ${verse.ref}`}
                  sandbox="allow-same-origin allow-scripts allow-forms"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
