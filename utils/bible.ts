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
  'NIV': { id: 'niv', name: 'New International Version', source: 'biblegateway' },
  'ESV': { id: 'esv', name: 'English Standard Version', source: 'biblegateway' },
  'KJV': { id: 'kjv', name: 'King James Version', source: 'biblegateway' },
  'NKJV': { id: 'nkjv', name: 'New King James Version', source: 'biblegateway' },
  'NLT': { id: 'nlt', name: 'New Living Translation', source: 'biblegateway' },
  'NASB': { id: 'nasb', name: 'New American Standard Bible', source: 'biblegateway' },
  'NRSV': { id: 'nrsv', name: 'New Revised Standard Version', source: 'biblegateway' },
  'MSG': { id: 'msg', name: 'The Message', source: 'biblegateway' },
  'AMP': { id: 'amp', name: 'Amplified Bible', source: 'biblegateway' },
  'CSB': { id: 'csb', name: 'Christian Standard Bible', source: 'biblegateway' },
  'WEB': { id: 'web', name: 'World English Bible', source: 'bible-api' },
};

// Default translation when none is specified
const DEFAULT_TRANSLATION = 'WEB';

/**
 * Fetches a Bible verse or passage from multiple sources with fallbacks.
 * @param passage The Bible passage reference (e.g., "John 3:16", "Romans 8:28-30").
 * @param translation The Bible translation code to use (default: 'WEB'). Case insensitive.
 * @returns A Promise resolving to a BibleVerse object or null if not found/error.
 */
export async function getBibleVerse(
  passage: string,
  translation: string = DEFAULT_TRANSLATION
): Promise<BibleVerse | null> {
  const translationKey = translation.toUpperCase();
  const translationInfo = TRANSLATION_MAP[translationKey] || TRANSLATION_MAP[DEFAULT_TRANSLATION];
  
  console.log(`Fetching ${passage} in ${translationInfo.name} from ${translationInfo.source}`);
  
  // Try the appropriate source based on the translation
  if (translationInfo.source === 'bible-api') {
    return getBibleVerseFromBibleApi(passage, translationInfo.id);
  } else if (translationInfo.source === 'biblegateway') {
    // For now, we'll use bible-api as a fallback but construct a proper BibleGateway link
    const bibleApiResult = await getBibleVerseFromBibleApi(passage, 'web');
    if (!bibleApiResult) return null;
    
    const gatewayLink = constructBibleGatewayLink(passage, translationInfo.id);
    
    return {
      ...bibleApiResult,
      translation: translationInfo.name,
      link: gatewayLink,
      source: 'biblegateway'
    };
  }
  
  // Fallback to bible-api with WEB translation if all else fails
  return getBibleVerseFromBibleApi(passage, 'web');
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
  translation: string = 'web'
): Promise<BibleVerse | null> {
  const encodedPassage = encodeURIComponent(passage);
  // Only add translation parameter if not using the default 'web'
  const url = translation !== 'web' 
    ? `https://bible-api.com/${encodedPassage}?translation=${translation}`
    : `https://bible-api.com/${encodedPassage}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Bible API error for ${passage} (${translation}): ${response.status} ${response.statusText}`);
      const errorBody = await response.text();
      console.error('Error body:', errorBody);
      return null;
    }

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
  } catch (error) {
    console.error(`Error fetching verse ${passage} (${translation}):`, error);
    return null;
  }
}
