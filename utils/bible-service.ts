/**
 * Bible Service
 * Provides methods for interacting with the Bible API endpoints
 */

import axios from 'axios';
import { ENDPOINTS } from '../lib/api-config';
import { BibleVerse } from './bible';

// Interface for Bible translation 
export interface BibleTranslation {
  id: string;              // ID (could be UUID or abbreviation)
  abbreviation?: string;   // Short abbreviation like 'ESV'
  name: string;            // Full name like 'English Standard Version'
  description?: string;    // Alternative name or description
  language: string;        // e.g. 'English'
  year?: number;           // Publication year
}

// Interface for Bible chapter data
export interface BibleChapter {
  book: string;
  chapter: number;
  translation: string;
  verses?: BibleVerse[];
  text?: string;      // Full chapter text from API
  reference?: string; // Full reference like "John 3"
}

// Interface for Bible passage (multiple verses)
export interface BiblePassage {
  verses: BibleVerse[];
  translation?: string;
  reference?: string; // Reference like John 3:16-18
}

/**
 * Service class for Bible-related API operations
 */
class BibleService {
  /**
   * Fetch a single Bible verse
   * @param reference The Bible reference (e.g. "John 3:16")
   * @param translation The translation abbreviation (e.g. "NIV")
   */
  async getVerse(reference: string, translation: string = 'ESV'): Promise<BibleVerse> {
    try {
      // Use the local API proxy route instead of direct backend call
      const response = await axios.get('/api/bible/verse', {
        params: { reference, translation }
      });
      
      console.log('Bible service getVerse response:', response.data);
      
      // Handle different possible API response structures
      if (response.data && response.data.data) {
        // If the response is nested in a data property
        return response.data.data;
      } else if (response.data && response.data.text) {
        // If the response is directly in the response.data
        return {
          ref: response.data.reference || reference,
          text: response.data.text || '',
          translation: response.data.translation || translation,
          link: '',
          source: 'api'
        };
      } else {
        // No identifiable verse data
        console.error(`Invalid verse data format for: ${reference}`);
        throw new Error('Invalid verse data format');
      }
    } catch (error) {
      console.error(`Error fetching Bible verse: ${reference}`, error);
      throw error;
    }
  }

  /**
   * Fetch a Bible passage (multiple verses)
   * @param reference The passage reference (e.g. "John 3:16-18")
   * @param translation The translation abbreviation
   */
  async getPassage(reference: string, translation: string = 'ESV'): Promise<BiblePassage> {
    try {
      // Use the local API proxy route instead of direct backend call
      const response = await axios.get('/api/bible/passage', {
        params: { reference, translation }
      });
      
      console.log('Bible service getPassage response:', response.data);
      
      // Handle different possible API response structures
      if (response.data && response.data.data) {
        // If the response is nested in a data property
        return response.data.data;
      } else if (response.data && Array.isArray(response.data.verses)) {
        // If the verses array is directly in the response.data
        return response.data;
      } else if (response.data && typeof response.data === 'object') {
        // If we got some kind of object response but not in expected format
        console.log('Unexpected passage format, attempting to normalize');
        // Try to construct a passage object from what we received
        return {
          reference: response.data.reference || reference,
          translation: response.data.translation || translation,
          verses: Array.isArray(response.data) ? response.data : []
        };
      } else {
        // No identifiable passage data
        console.error(`Invalid passage data format for: ${reference}`);
        throw new Error('Invalid passage data format');
      }
    } catch (error) {
      console.error(`Error fetching Bible passage: ${reference}`, error);
      throw error;
    }
  }

  /**
   * Fetch a chapter from the Bible
   * @param book The book name
   * @param chapter The chapter number
   * @param translation The translation abbreviation
   */
  async getChapter(book: string, chapter: number, translation: string = 'ESV'): Promise<BibleChapter> {
    try {
      // Use the local API proxy route instead of direct backend call
      const response = await axios.get('/api/bible/chapter', {
        params: { book, chapter, translation }
      });
      
      console.log('Bible service getChapter response:', response.data);
      
      // Handle different possible API response structures
      if (response.data && response.data.data) {
        // If the response is nested in a data property
        return response.data.data;
      } 
      // Direct text response format (common from chapter endpoint)
      else if (response.data && typeof response.data.text === 'string') {
        // Return the chapter with the full text content
        return {
          book: response.data.book || book,
          chapter: response.data.chapter || chapter,
          translation: response.data.translation || translation,
          reference: response.data.reference || `${book} ${chapter}`,
          text: response.data.text
        };
      }
      // Array of verses format
      else if (response.data && Array.isArray(response.data.verses)) {
        // If the verses array is directly in the response.data
        return {
          book,
          chapter,
          verses: response.data.verses,
          translation: response.data.translation || translation,
          reference: response.data.reference || `${book} ${chapter}`
        };
      } 
      // Generic object response - try our best to normalize
      else if (response.data && typeof response.data === 'object') {
        console.log('Unexpected chapter format, attempting to normalize');
        // Try to construct a chapter object from what we received
        return {
          book: response.data.book || book,
          chapter: response.data.chapter || chapter,
          translation: response.data.translation || translation,
          reference: response.data.reference || `${book} ${chapter}`,
          text: response.data.text || '',
          verses: response.data.verses || []
        };
      } else {
        // No identifiable chapter data
        console.error(`Invalid chapter data format for: ${book} ${chapter}`);
        throw new Error('Invalid chapter data format');
      }
    } catch (error) {
      console.error(`Error fetching Bible chapter: ${book} ${chapter}`, error);
      throw error;
    }
  }

  /**
   * Fetch multiple Bible chapters
   * @param book The book name (e.g. "John")
   * @param startChapter The starting chapter number
   * @param endChapter The ending chapter number
   * @param translation The translation abbreviation
   */
  async getChapters(
    book: string, 
    startChapter: number, 
    endChapter: number, 
    translation: string = 'ESV'
  ): Promise<BibleChapter[]> {
    try {
      // Use the local API proxy route instead of direct backend call
      const response = await axios.get('/api/bible/chapters', {
        params: { book, startChapter, endChapter, translation }
      });
      
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching Bible chapters: ${book} ${startChapter}-${endChapter}`, error);
      throw error;
    }
  }

  /**
   * Get information about available Bible translations
   */
  async getTranslations(): Promise<BibleTranslation[]> {
    try {
      // Use the local API proxy route instead of direct backend call
      const response = await axios.get('/api/bible/translations');
      
      // Log the full response for debugging
      console.log('Translations API response:', response.data);
      
      // Check for different possible response formats
      // Format 1: { data: [...] } - From our API layer
      if (response.data && response.data.data) {
        if (Array.isArray(response.data.data)) {
          return response.data.data;
        } else if (response.data.data.translations && Array.isArray(response.data.data.translations)) {
          // Format: { data: { count: number, translations: [...] } }
          return response.data.data.translations;
        }
      }
      
      // Format 2: { count: number, translations: [...] } - Direct from backend
      if (response.data && response.data.translations && Array.isArray(response.data.translations)) {
        console.log('Found translations array in response.data.translations');
        return response.data.translations;
      }
      
      // Format 3: Direct array - [...]
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      console.error('Could not find translations array in response:', response.data);
      return [];
    } catch (error) {
      console.error('Error fetching Bible translations', error);
      return []; // Return empty array instead of throwing
    }
  }

  /**
   * Get a simplified list of Bible translation abbreviations
   */
  async getTranslationAbbreviations(): Promise<string[]> {
    try {
      // Use the local API proxy route instead of direct backend call
      const response = await axios.get('/api/bible/translations/abbreviations');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching Bible translation abbreviations', error);
      throw error;
    }
  }

  /**
   * Get cache statistics for the Bible API
   */
  async getCacheStats(): Promise<any> {
    try {
      // Use the local API proxy route instead of direct backend call
      const response = await axios.get('/api/bible/cache/stats');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching Bible cache stats', error);
      throw error;
    }
  }

  /**
   * Clear the Bible API cache
   * Note: This is an admin operation that should be restricted
   */
  async clearCache(): Promise<any> {
    try {
      // Use the local API proxy route instead of direct backend call
      const response = await axios.post('/api/bible/cache/clear');
      return response.data.data;
    } catch (error) {
      console.error('Error clearing Bible cache', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const bibleService = new BibleService();
