import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

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

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {showBibleGateway && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.open(bibleGatewayLink || `https://www.biblegateway.com/passage/?search=${linkParams.search}&version=${linkParams.version}`, '_blank')}
          className="flex items-center gap-1 text-sm"
          aria-label={`Open ${passage} on Bible Gateway`}
        >
          <span className="mr-1">📘</span> BibleGateway
          <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      )}
      
      {showBibleHub && book && chapter && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.open(
            verse 
              ? `https://biblehub.com/${book.toLowerCase()}/${chapter}-${verse}.htm` 
              : `https://biblehub.com/${book.toLowerCase()}/${chapter}.htm`,
            '_blank'
          )}
          className="flex items-center gap-1 text-sm"
        >
          <span className="mr-1">🔍</span> BibleHub
          <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      )}
      
      {showBlueLetterBible && book && chapter && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.open(
            `https://www.blueletterbible.org/${getTranslationCode(safeTranslations[0] || 'niv', 'blueletterbible')}/${getBookCode(book)}/${chapter}/${verse || '1'}/s_${getBLBCode(book, chapter, verse)}`,
            '_blank'
          )}
          className="flex items-center gap-1 text-sm"
        >
          <span className="mr-1">🧠</span> BlueLetterBible
          <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      )}
      
      {/* Multi-translation comparison button - only show if multiple translations */}
      {safeTranslations.length > 1 && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.open(
            `https://www.biblegateway.com/passage/?search=${linkParams.search}&version=${safeTranslations.map(t => getTranslationCode(t, 'biblegateway')).join('%2C')}`, 
            '_blank'
          )}
          className="flex items-center gap-1 text-sm"
        >
          <span className="mr-1">📊</span> Compare Translations
          <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      )}
    </div>
  );
}

/**
 * Format a passage for use in URLs
 */
function formatPassageForUrl(passage: string): string {
  // Replace spaces with plus signs for URL encoding
  return encodeURIComponent(passage.trim());
}

/**
 * Parse a passage into its components
 */
function parsePassage(passage?: string): { book: string; chapter: string; verse?: string } {
  // Handle undefined or empty passage
  if (!passage) {
    return { book: 'john', chapter: '3', verse: '16' }; // Default to John 3:16
  }

  console.log('Parsing passage:', passage);
  
  // Handle basic format like "John 3:16" or "Romans 8:28-30"
  const parts = passage.trim().split(' ');
  let book = parts[0] || 'john';
  let remainingParts = [...parts];
  
  // Handle books with spaces like "1 Corinthians"
  if (parts.length > 1 && /^[123]$/.test(parts[0])) {
    book = `${parts[0]} ${parts[1]}`;
    remainingParts = parts.slice(2);
  } else {
    remainingParts = parts.slice(1);
  }
  
  // Handle case when there's just a chapter number with no verse (e.g., 'Romans 2')
  if (remainingParts.length === 0) {
    return { book, chapter: '1' };
  }
  
  // Get the first part after the book name
  const chapterPart = remainingParts[0];
  
  // Check if it has a colon (indicating chapter:verse format)
  if (chapterPart.includes(':')) {
    const chapterVerse = chapterPart.split(':');
    const chapter = chapterVerse[0];
    const verse = chapterVerse.length > 1 ? chapterVerse[1].split('-')[0].split(',')[0] : undefined;
    return { book, chapter, verse };
  } else {
    // Just a chapter number with no verse (e.g., 'Romans 2')
    return { book, chapter: chapterPart };
  }
  
  // Default fallback should never be reached with the above conditions
  return { book, chapter: '1' };
}

/**
 * Get the book code for BlueLetterBible
 */
function getBookCode(book: string): string {
  // Simplified version - in a real app, you'd have a full mapping
  const bookMap: Record<string, string> = {
    'genesis': 'gen', 'exodus': 'exo', 'leviticus': 'lev', 'numbers': 'num',
    'deuteronomy': 'deu', 'joshua': 'jos', 'judges': 'jdg', 'ruth': 'rth',
    '1samuel': '1sa', '2samuel': '2sa', '1kings': '1ki', '2kings': '2ki',
    '1chronicles': '1ch', '2chronicles': '2ch', 'ezra': 'ezr', 'nehemiah': 'neh',
    'esther': 'est', 'job': 'job', 'psalms': 'psa', 'psalm': 'psa', 'proverbs': 'pro', 
    'ecclesiastes': 'ecc', 'songofsolomon': 'sng', 'isaiah': 'isa', 'jeremiah': 'jer',
    'lamentations': 'lam', 'ezekiel': 'eze', 'daniel': 'dan', 'hosea': 'hos',
    'joel': 'joe', 'amos': 'amo', 'obadiah': 'oba', 'jonah': 'jon', 'micah': 'mic',
    'nahum': 'nah', 'habakkuk': 'hab', 'zephaniah': 'zep', 'haggai': 'hag',
    'zechariah': 'zec', 'malachi': 'mal', 'matthew': 'mat', 'mark': 'mar',
    'luke': 'luk', 'john': 'jhn', 'acts': 'act', 'romans': 'rom',
    '1corinthians': '1co', '2corinthians': '2co', 'galatians': 'gal', 'ephesians': 'eph',
    'philippians': 'php', 'colossians': 'col', '1thessalonians': '1th', '2thessalonians': '2th',
    '1timothy': '1ti', '2timothy': '2ti', 'titus': 'tit', 'philemon': 'phm',
    'hebrews': 'heb', 'james': 'jas', '1peter': '1pe', '2peter': '2pe',
    '1john': '1jn', '2john': '2jn', '3john': '3jn', 'jude': 'jud',
    'revelation': 'rev'
  };
  
  // Normalize the book name: remove spaces and make lowercase
  const normalizedBook = book.toLowerCase().replace(/\s+/g, '');
  return bookMap[normalizedBook] || normalizedBook.substring(0, 3);
}

/**
 * Get the chapter-verse code for BlueLetterBible URLs
 * This is a simplified version and would need a proper implementation
 */
function getBLBCode(book: string, chapter: string, verse?: string): string {
  // This is a simplified placeholder - real implementation would need to calculate the actual codes
  // BlueLetterBible uses specific codes for each book+chapter combination
  const bookCodes: Record<string, number> = {
    'genesis': 1, 'exodus': 54, 'leviticus': 96, 'numbers': 127,
    'deuteronomy': 170, 'joshua': 211, 'judges': 237, 'ruth': 258,
    'john': 1039, 'romans': 1057
  };
  
  const normalizedBook = book.toLowerCase().replace(/\s+/g, '');
  const bookCode = bookCodes[normalizedBook] || 1000;
  const chapterNum = parseInt(chapter, 10) || 1;
  
  // Simplified calculation - real implementation would use actual BLB codes
  return `${bookCode + chapterNum}${verse || '001'}`;
}
