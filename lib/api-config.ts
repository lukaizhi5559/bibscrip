/**
 * API configuration for BibScrip backend services
 * Provides endpoint URLs for all backend operations
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const ENDPOINTS = {
  VECTOR: {
    STORE: `${API_BASE_URL}/vector/store`,
    SEARCH: `${API_BASE_URL}/vector/search`,
    BATCH: `${API_BASE_URL}/vector/batch`,
    DELETE: `${API_BASE_URL}/vector`,
    STATUS: `${API_BASE_URL}/vector/status`,
    EMBED: `${API_BASE_URL}/vector/embed`,
    UPSERT: `${API_BASE_URL}/vector/upsert`,
  },
  BIBLE: {
    VERSE: `${API_BASE_URL}/bible/verse`,
    PASSAGE: `${API_BASE_URL}/bible/passage`,
    CHAPTER: `${API_BASE_URL}/bible/chapter`,
    CHAPTERS: `${API_BASE_URL}/bible/chapters`,
    TRANSLATIONS: `${API_BASE_URL}/bible/translations`,
    TRANSLATION_ABBREVIATIONS: `${API_BASE_URL}/bible/translations/abbreviations`,
    CACHE_STATS: `${API_BASE_URL}/bible/cache/stats`,
    CLEAR_CACHE: `${API_BASE_URL}/bible/cache/clear`
  },
  CACHE: {
    GET: (key: string) => `${API_BASE_URL}/cache/${key}`,
    SET: (key: string) => `${API_BASE_URL}/cache/${key}`,
    DELETE: (key: string) => `${API_BASE_URL}/cache/${key}`,
    STATS: `${API_BASE_URL}/cache/stats`
  },
  GENERATE: {
    TEXT: `${API_BASE_URL}/generate/text`,
    EMBEDDING: `${API_BASE_URL}/generate/embedding`
  },
  ASK: `${API_BASE_URL}/ask`,
  YOUTUBE: {
    VIDEO: (videoId: string) => `${API_BASE_URL}/youtube/video/${videoId}`,
    CHANNEL: (channelId: string) => `${API_BASE_URL}/youtube/channel/${channelId}`,
    SEARCH: `${API_BASE_URL}/youtube/search`
  }
};
