import axios from 'axios';
import { ENDPOINTS } from '../lib/api-config';

export interface VectorDocument {
  text: string;
  metadata?: Record<string, any>;
}

export interface SearchResult {
  id: string;
  score: number; 
  text: string;
  metadata: Record<string, any>;
}

/**
 * Service for interacting with the vector database backend
 * Provides methods for storing, searching, and managing vector embeddings
 */
class VectorService {
  /**
   * Store a document in the vector database
   * @param document The document to store
   * @param namespace The namespace to store the document in
   * @returns The ID of the stored document
   */
  async storeDocument(document: VectorDocument, namespace = 'bible-verses'): Promise<string> {
    try {
      // Use the local API proxy route instead of directly calling the backend
      const response = await axios.post('/api/vector/store', {
        text: document.text,
        metadata: document.metadata,
        namespace
      });
      return response.data.data.id;
    } catch (error) {
      console.error('Failed to store document:', error);
      throw error;
    }
  }

  /**
   * Search for similar documents in the vector database
   * @param query The query text to search for
   * @param namespace The namespace to search in
   * @param topK The number of results to return
   * @returns Array of search results
   */
  async searchSimilar(query: string, namespace = 'bible-verses', topK = 5): Promise<SearchResult[]> {
    try {
      // Use the local API proxy route instead of directly calling the backend
      const response = await axios.post('/api/vector/search', {
        query,
        namespace,
        topK,
        minScore: 0.6
      });
      return response.data.data.results;
    } catch (error) {
      console.error('Failed to search similar documents:', error);
      throw error;
    }
  }

  /**
   * Check the status of the vector database
   * @returns Status object with availability and mode
   */
  async checkStatus(): Promise<{available: boolean, mode: string}> {
    try {
      // Use the local API proxy route instead of directly calling the backend
      const response = await axios.get('/api/vector/status');
      return response.data.data;
    } catch (error) {
      console.error('Failed to check vector database status:', error);
      // Return a fallback status in case of error
      return { available: false, mode: 'error' };
    }
  }

  /**
   * Store multiple documents in a batch
   * @param documents Array of documents to store
   * @param namespace The namespace to store the documents in
   * @returns Array of IDs for the stored documents
   */
  async storeBatch(documents: VectorDocument[], namespace = 'bible-verses'): Promise<string[]> {
    try {
      // Use the local API proxy route instead of directly calling the backend
      const response = await axios.post('/api/vector/batch', {
        documents: documents.map(doc => ({
          text: doc.text,
          metadata: doc.metadata
        })),
        namespace
      });
      return response.data.data.ids;
    } catch (error) {
      console.error('Failed to store document batch:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const vectorService = new VectorService();
