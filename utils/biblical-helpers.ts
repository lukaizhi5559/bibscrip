/**
 * Utility functions for working with Bible references
 */

/**
 * Parse a passage into its components
 */
export function parsePassage(passage?: string): { book: string; chapter: string; verse?: string } {
  // Handle undefined or empty passage
  if (!passage) {
    return { book: 'john', chapter: '3', verse: '16' }; // Default to John 3:16
  }
  
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
}

/**
 * Format a passage for use in URLs
 */
export function formatPassageForUrl(passage: string): string {
  // Replace spaces with plus signs for URL encoding
  return encodeURIComponent(passage.trim());
}

/**
 * Get the book code for BlueLetterBible
 */
export function getBookCode(book: string): string {
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
 */
export function getBLBCode(book: string, chapter: string, verse?: string): string {
  // This is a simplified placeholder - real implementation would need to calculate the actual codes
  const bookCode = getBookCode(book);
  return `${bookCode}/${chapter}/${verse || '1'}`;
}
