/**
 * Bible Service
 * Provides methods for interacting with the Bible API endpoints
 */

import axios from 'axios';
import { ENDPOINTS } from '../lib/api-config';
import { BibleVerse } from './bible';

// Interface for Bible translation 
export interface BibleTranslation {
  id: string;        // Abbreviation like 'NIV'
  name: string;      // Full name like 'New International Version'
  language: string;  // e.g. 'English'
  year?: number;     // Publication year
}

// Interface for Bible chapter data
export interface BibleChapter {
  book: string;
  chapter: number;
  translation: string;
  verses: BibleVerse[];
}

// Interface for Bible passage (multiple verses)
export interface BiblePassage {
  ref: string;
  translation: string;
  verses: BibleVerse[];
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
  async getVerse(reference: string, translation: string = 'NIV'): Promise<BibleVerse> {
    try {
      // Use the local API proxy route instead of direct backend call
      const response = await axios.get('/api/bible/verse', {
        params: { reference, translation }
      });
      
      return response.data.data;
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
  async getPassage(reference: string, translation: string = 'NIV'): Promise<BiblePassage> {
    try {
      // Use the local API proxy route instead of direct backend call
      const response = await axios.get('/api/bible/passage', {
        params: { reference, translation }
      });
      
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching Bible passage: ${reference}`, error);
      throw error;
    }
  }

  /**
   * Fetch an entire Bible chapter
   * @param book The book name (e.g. "John")
   * @param chapter The chapter number
   * @param translation The translation abbreviation
   */
  async getChapter(book: string, chapter: number, translation: string = 'NIV'): Promise<BibleChapter> {
    try {
      // Use the local API proxy route instead of direct backend call
      const response = await axios.get('/api/bible/chapter', {
        params: { book, chapter, translation }
      });
      
      return response.data.data;
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
    translation: string = 'NIV'
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
      return response.data.data;
    } catch (error) {
      console.error('Error fetching Bible translations', error);
      throw error;
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
