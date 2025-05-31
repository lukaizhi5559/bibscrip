import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface ReferenceLinksProps {
  passage: string;
  translations?: string[];
  showBibleGateway?: boolean;
  showBibleHub?: boolean;
  showBlueLetterBible?: boolean;
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
}: ReferenceLinksProps) {
  // Parse the passage to handle the various URL formats
  const formattedPassage = formatPassageForUrl(passage);
  const primaryTranslation = translations[0]?.toLowerCase() || 'niv';
  
  // Extract book, chapter, and verse for BibleHub and BlueLetterBible
  const { book, chapter, verse } = parsePassage(passage);
  
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {showBibleGateway && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.open(
            `https://www.biblegateway.com/passage/?search=${formattedPassage}&version=${primaryTranslation}`, 
            '_blank'
          )}
          className="flex items-center gap-1 text-sm"
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
            `https://www.blueletterbible.org/${primaryTranslation}/${getBookCode(book)}/${chapter}/${verse || '1'}/s_${getBLBCode(book, chapter, verse)}`,
            '_blank'
          )}
          className="flex items-center gap-1 text-sm"
        >
          <span className="mr-1">🧠</span> BlueLetterBible
          <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      )}
      
      {/* Multi-translation comparison button - only show if multiple translations */}
      {translations.length > 1 && showBibleGateway && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.open(
            `https://www.biblegateway.com/passage/?search=${formattedPassage}&version=${translations.map(t => t.toLowerCase()).join('%2C')}`, 
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
function parsePassage(passage: string): { book: string; chapter: string; verse?: string } {
  // Handle basic format like "John 3:16" or "Romans 8:28-30"
  const parts = passage.trim().split(' ');
  let book = parts[0];
  
  // Handle books with spaces like "1 Corinthians"
  if (parts.length > 2 && /^[123]$/.test(parts[0])) {
    book = `${parts[0]} ${parts[1]}`;
    parts.splice(0, 2, book);
  }
  
  if (parts.length < 2) {
    return { book, chapter: '1' };
  }
  
  // Parse chapter and verse
  const chapterVerse = parts[1].split(':');
  const chapter = chapterVerse[0];
  const verse = chapterVerse.length > 1 ? chapterVerse[1].split('-')[0].split(',')[0] : undefined;
  
  return { book, chapter, verse };
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
