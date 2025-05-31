// /Users/lukaizhi/Desktop/projects/bibscrip-app/utils/verse-parser.ts

// Basic regex for common Bible verse patterns (e.g., John 3:16, 1 Corinthians 13:4-7, Genesis 1:1)
// This regex is a starting point and can be improved for more complex cases or variations.
// It looks for:
// - Optional book number (e.g., 1, 2, 3 in "1 John")
// - Book name (one or more words)
// - Chapter number
// - Optional colon and verse number(s) (e.g., :16, :16-18, :16,18)
const BIBLE_VERSE_REGEX = /(\b(?:[1-3]\s+)?[A-Za-z]+)\s+(\d+)(?::(\d+(?:(?:-\d+)|(?:,\s*\d+))*))?/g;

export interface ParsedVerseReference {
  fullMatch: string; // The entire matched string e.g., "John 3:16"
  book: string;      // e.g., "John" or "1 Corinthians"
  chapter: string;   // e.g., "3"
  verses?: string;   // e.g., "16" or "16-18" or "1,3"
}

/**
 * Extracts Bible verse references from a given text.
 * @param text The text to parse for Bible verse references.
 * @returns An array of unique, normalized Bible verse references found in the text.
 */
export function extractVerseReferences(text: string): string[] {
  const references: ParsedVerseReference[] = [];
  let match;

  // Reset lastIndex for global regex
  BIBLE_VERSE_REGEX.lastIndex = 0;

  while ((match = BIBLE_VERSE_REGEX.exec(text)) !== null) {
    const bookPart = match[1].trim(); // e.g., "John" or "1 Corinthians"
    const chapterPart = match[2];    // e.g., "3"
    const versesPart = match[3] ? match[3].replace(/\s/g, '') : undefined; // e.g., "16" or "16-18" or "1,3"

    let fullReference = `${bookPart} ${chapterPart}`;
    if (versesPart) {
      fullReference += `:${versesPart}`;
    }
    references.push({
        fullMatch: match[0],
        book: bookPart,
        chapter: chapterPart,
        verses: versesPart
    });
  }

  // Normalize and deduplicate: e.g., "john 3:16" and "John 3:16" should be treated as one.
  // For simplicity, we'll just return the full matched strings, deduplicated.
  // More advanced normalization could involve mapping book names to a standard set.
  const uniqueReferences = Array.from(new Set(references.map(r => r.fullMatch)));
  
  console.log("Extracted references:", uniqueReferences);
  return uniqueReferences;
}

/**
 * (Optional) Advanced function to use an LLM to extract/verify verse references.
 * This is a placeholder for a more complex implementation.
 */
export async function extractVerseReferencesWithLLM(text: string, aiProvider: (prompt: string) => Promise<string>): Promise<string[]> {
  const prompt = `
    Extract all specific Bible verse references from the following text.
    List them one per line, in the format "Book Chapter:Verse(s)".
    For example, if the text mentions "Romans chapter 8 verse 28 and John 3 verse 16", you should output:
    Romans 8:28
    John 3:16
    If no specific verses are mentioned, output "NONE".

    Text:
    "${text}"

    References:
  `;
  try {
    const llmResponse = await aiProvider(prompt);
    if (llmResponse.trim().toUpperCase() === "NONE") {
      return [];
    }
    return llmResponse.split('\n').map(ref => ref.trim()).filter(ref => ref.length > 0);
  } catch (error) {
    console.error("Error extracting verses with LLM:", error);
    return []; // Fallback to regex or empty if LLM fails
  }
}