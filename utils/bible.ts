export interface BibleVerse {
  ref: string;
  text: string;
  translation: string;
  link: string;
  source?: string; // Which source provided this verse (bible-api, biblegateway, biblehub)
}

// Translation info for popular sources
type TranslationSource = 'bible-api' | 'biblegateway' | 'biblehub';

interface TranslationInfo {
  id: string;         // The ID used by the source (e.g., 'NIV', 'ESV', 'KJV')
  name: string;       // Full name (e.g., 'New International Version')
  source: TranslationSource;
}

// A map of common translations with their IDs for different sources
const TRANSLATION_MAP: Record<string, TranslationInfo> = {
  'ESV': { id: 'esv', name: 'English Standard Version', source: 'biblegateway' },
  'KJV': { id: 'kjv', name: 'King James Version', source: 'bible-api' },
  'NKJV': { id: 'nkjv', name: 'New King James Version', source: 'biblegateway' },
  'NLT': { id: 'nlt', name: 'New Living Translation', source: 'biblegateway' },
  'NASB': { id: 'nasb', name: 'New American Standard Bible', source: 'biblegateway' },
  'NRSV': { id: 'nrsv', name: 'New Revised Standard Version', source: 'biblegateway' },
  'MSG': { id: 'msg', name: 'The Message', source: 'biblegateway' },
  'AMP': { id: 'amp', name: 'Amplified Bible', source: 'biblegateway' },
  'CSB': { id: 'csb', name: 'Christian Standard Bible', source: 'biblegateway' },
  'WEB': { id: 'web', name: 'World English Bible', source: 'bible-api' },
  'ASV': { id: 'asv', name: 'American Standard Version', source: 'bible-api' },
  'DARBY': { id: 'darby', name: 'Darby Translation', source: 'bible-api' },
  'YLT': { id: 'ylt', name: 'Youngs Literal Translation', source: 'bible-api' },
  'NIV': { id: 'niv', name: 'New International Version', source: 'biblegateway' },
};

// Default translation when none is specified
const DEFAULT_TRANSLATION = 'WEB';


/**
 * Fetches a Bible verse or verse range from online sources
 * @param reference The Bible reference to fetch (e.g., "John 3:16" or "Romans 8:1-5")
 * @param translation The Bible translation to use (e.g., "NIV", "ESV", "KJV")
 * @param options Additional options like signal for AbortController
 * @returns A Promise that resolves to the verse text and additional metadata
 */
export async function fetchBibleVerse(
  reference: string, 
  translation: string = 'ESV',
  options?: {
    signal?: AbortSignal
  }
): Promise<BibleVerse> {
  const translationKey = translation.toUpperCase();
  const translationInfo = TRANSLATION_MAP[translationKey] || TRANSLATION_MAP[DEFAULT_TRANSLATION];
  
  const normalizedReference = normalizeBibleReference(reference);
  console.log(`Fetching Bible verse: ${normalizedReference} (${translation})`);
  
  const signal = options?.signal;
  
  // First, try bible-api.com (has more consistent API but limited translations)
  try {
    if (translationInfo.source === 'bible-api') {
      const result = await getBibleVerseFromBibleApi(normalizedReference, translationInfo.id, signal);
      if (result) return result;
    }
    
    // For biblegateway or if bible-api failed
    // For ESV, NIV, NASB, NLT, etc., we have to fall back to a more complex method
    // This could be implemented server-side with proper scraping logic or APIs
    
    // Check if request was aborted
    if (signal?.aborted) {
      throw new DOMException('Bible verse fetch aborted', 'AbortError');
    }
    
    // Fallback: Construct a BibleGateway link and return minimal info
    return constructBibleGatewayFallback(normalizedReference, translation);
  } catch (error) {
    // If it's an abort error, don't try fallback, just propagate the error
    if ((error as any).name === 'AbortError') {
      throw error;
    }
    
    console.error(`Error fetching Bible verse: ${(error as Error).message}`);
    // If the main method fails, fall back to the BibleGateway link method
    return constructBibleGatewayFallback(normalizedReference, translation);
  }
}

/**
 * For backwards compatibility with existing code
 * @deprecated Use fetchBibleVerse instead
 */
export async function getBibleVerse(
  passage: string,
  translation: string = DEFAULT_TRANSLATION,
  options?: {
    signal?: AbortSignal
  }
): Promise<BibleVerse> {
  return fetchBibleVerse(passage, translation, options);
}

/**
 * Constructs a BibleGateway link for a passage and translation
 */
function constructBibleGatewayLink(passage: string, translationId: string): string {
  const gatewayBaseUrl = 'https://www.biblegateway.com/passage/';
  const queryParams = `?search=${encodeURIComponent(passage)}&version=${translationId}`;
  return `${gatewayBaseUrl}${queryParams}`;
}

/**
 * Constructs a BibleGateway fallback result
 */
function constructBibleGatewayFallback(reference: string, translation: string): BibleVerse {
  const gatewayLink = constructBibleGatewayLink(reference, translation);
  
  return {
    ref: reference,
    text: '',
    translation,
    link: gatewayLink,
    source: 'biblegateway'
  };
}

/**
 * Constructs a BibleHub link for a passage and translation
 */
function constructBibleHubLink(passage: string, translationId: string): string {
  // Extract book, chapter, verse
  const parts = passage.split(' ');
  const book = parts[0].toLowerCase();
  
  if (parts.length < 2) return `https://biblehub.com/${book}/1.htm`; // Default to chapter 1
  
  let chapter = parts[1];
  let verse = '';
  
  if (chapter.includes(':')) {
    const chapterVerse = chapter.split(':');
    chapter = chapterVerse[0];
    verse = chapterVerse[1].split('-')[0].split(',')[0]; // Take first verse if range
  }
  
  if (verse) {
    return `https://biblehub.com/${translationId.toLowerCase()}/${book}/${chapter}-${verse}.htm`;
  } else {
    return `https://biblehub.com/${book}/${chapter}.htm`;
  }
}

/**
 * Fetches a Bible verse from bible-api.com.
 * @private Internal function used by getBibleVerse
 */
async function getBibleVerseFromBibleApi(
  passage: string,
  translation: string = 'web',
  signal?: AbortSignal
): Promise<BibleVerse | null> {
  // bible-api.com only supports certain translations
  if (['KJV', 'ASV', 'DARBY', 'WEB', 'YLT'].includes(translation.toUpperCase())) {
    const encodedRef = encodeURIComponent(passage);
    const response = await fetch(
      `https://bible-api.com/${encodedRef}?translation=${translation.toLowerCase()}`,
      { signal }
    );
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.error) {
        console.error(`Bible API error for ${passage} (${translation}): ${data.error}`);
        return null;
      }
      
      // Construct links to popular Bible websites
      const gatewayLink = constructBibleGatewayLink(passage, translation);
      
      return {
        ref: data.reference,
        text: data.text,
        translation: data.translation_name || translation.toUpperCase(),
        link: gatewayLink,
        source: 'bible-api'
      };
    } else {
      console.error(`Bible API error for ${passage} (${translation}): ${response.status} ${response.statusText}`);
      return null;
    }
  } else {
    return null;
  }
}

/**
 * Normalizes a Bible reference (e.g., "John 3:16" or "Romans 8:1-5")
 */
function normalizeBibleReference(reference: string): string {
  // Basic normalization: trim and remove multiple spaces
  return reference.trim().replace(/\s+/g, ' ');
}
