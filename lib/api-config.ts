/**
 * API configuration for BibScrip backend services
 * Provides endpoint URLs for vector database operations
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const ENDPOINTS = {
  VECTOR: {
    STORE: `${API_BASE_URL}/vector/store`,
    SEARCH: `${API_BASE_URL}/vector/search`,
    BATCH: `${API_BASE_URL}/vector/batch`,
    DELETE: `${API_BASE_URL}/vector`,
    STATUS: `${API_BASE_URL}/vector/status`
  }
};
