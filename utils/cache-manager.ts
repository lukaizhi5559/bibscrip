// BibScrip Cache Manager
// Provides a unified interface for caching AI responses and Bible verses
// Implements a two-tier caching strategy (browser + server)

export interface CachedResponse<T> {
  data: T;
  timestamp: number;
  provider?: string;
  tokenUsage?: {
    input: number;
    output: number;
    total: number;
  };
  ttl?: number; // Time-to-live in milliseconds
}

export interface CacheConfig {
  ttl: number; // Default time-to-live in milliseconds
  namespace: string;
  useServerCache?: boolean;
  useLocalCache?: boolean;
  allowStale?: boolean; // Whether to return stale cache entries while fetching fresh data
}

export interface CacheStats {
  hits: number;
  misses: number;
  latency: number; // Average in ms
  size: number; // Number of entries
}

// Default configuration
const DEFAULT_CONFIG: CacheConfig = {
  ttl: 30 * 24 * 60 * 60 * 1000, // 30 days
  namespace: 'bibscrip',
  useServerCache: true,
  useLocalCache: true,
  allowStale: true
};

/**
 * Creates a normalized cache key from the input string
 * This helps match semantically similar questions
 */
export function createCacheKey(input: string, options?: { 
  translation?: string,
  sanitize?: boolean
}): string {
  // Default options
  const { translation = 'default', sanitize = true } = options || {};

  // Clean and normalize the input
  let normalized = input.trim().toLowerCase();
  
  // Optionally sanitize to remove personal information
  if (sanitize) {
    // Remove potential email addresses
    normalized = normalized.replace(/\S+@\S+\.\S+/g, '[EMAIL]');
    // Remove potential phone numbers
    normalized = normalized.replace(/(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g, '[PHONE]');
    // Remove URLs
    normalized = normalized.replace(/https?:\/\/\S+/g, '[URL]');
  }
  
  // Create a hash of the normalized input + translation
  return `${normalized}:${translation}`;
}

export class CacheManager {
  private config: CacheConfig;
  private stats: CacheStats = { hits: 0, misses: 0, latency: 0, size: 0 };
  private isBrowser: boolean;

  constructor(config?: Partial<CacheConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.isBrowser = typeof window !== 'undefined';
  }

  /**
   * Gets a cached value if it exists and is not expired
   */
  async get<T>(key: string): Promise<CachedResponse<T> | null> {
    const startTime = performance.now();
    
    let result: CachedResponse<T> | null = null;
    
    // Try browser cache first if available and configured
    if (this.isBrowser && this.config.useLocalCache) {
      result = await this.getFromBrowserCache<T>(key);
    }
    
    // If not found in browser cache and server cache is enabled, try server
    if (!result && this.config.useServerCache) {
      result = await this.getFromServerCache<T>(key);
    }
    
    // Update stats
    const latency = performance.now() - startTime;
    if (result) {
      this.stats.hits++;
      this.stats.latency = (this.stats.latency * (this.stats.hits - 1) + latency) / this.stats.hits;
    } else {
      this.stats.misses++;
    }
    
    return result;
  }

  /**
   * Stores a value in the cache
   */
  async set<T>(key: string, data: T, metadata?: { 
    provider?: string,
    tokenUsage?: { input: number, output: number, total: number },
    ttl?: number
  }): Promise<void> {
    const { provider, tokenUsage, ttl } = metadata || {};
    
    const cachedResponse: CachedResponse<T> = {
      data,
      timestamp: Date.now(),
      provider,
      tokenUsage,
      ttl: ttl || this.config.ttl
    };
    
    // Store in browser cache if available and configured
    if (this.isBrowser && this.config.useLocalCache) {
      await this.setInBrowserCache<T>(key, cachedResponse);
    }
    
    // Store in server cache if configured
    if (this.config.useServerCache) {
      await this.setInServerCache<T>(key, cachedResponse);
    }
    
    // Update stats
    this.stats.size++;
  }

  /**
   * Retrieves current cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Clears all cached data
   */
  async clear(): Promise<void> {
    if (this.isBrowser && this.config.useLocalCache) {
      await this.clearBrowserCache();
    }
    
    if (this.config.useServerCache) {
      await this.clearServerCache();
    }
    
    this.stats = { hits: 0, misses: 0, latency: 0, size: 0 };
  }

  // PRIVATE METHODS

  /**
   * Gets a value from the browser cache (IndexedDB or localStorage)
   */
  private async getFromBrowserCache<T>(key: string): Promise<CachedResponse<T> | null> {
    try {
      // Try to use IndexedDB first
      if (window.indexedDB) {
        return await this.getFromIndexedDB<T>(key);
      }
      
      // Fall back to localStorage if IndexedDB is not available
      const fullKey = `${this.config.namespace}:${key}`;
      const storedValue = localStorage.getItem(fullKey);
      
      if (storedValue) {
        const cached = JSON.parse(storedValue) as CachedResponse<T>;
        
        // Check if expired
        if (Date.now() - cached.timestamp > (cached.ttl || this.config.ttl)) {
          // Remove expired item
          localStorage.removeItem(fullKey);
          return null;
        }
        
        return cached;
      }
    } catch (error) {
      console.error('Error accessing browser cache:', error);
    }
    
    return null;
  }

  /**
   * Gets a value from IndexedDB
   */
  private async getFromIndexedDB<T>(key: string): Promise<CachedResponse<T> | null> {
    return new Promise((resolve) => {
      try {
        const request = window.indexedDB.open(`${this.config.namespace}-cache`, 1);
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains('cache')) {
            db.createObjectStore('cache', { keyPath: 'key' });
          }
        };
        
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction('cache', 'readonly');
          const store = transaction.objectStore('cache');
          
          const getRequest = store.get(`${this.config.namespace}:${key}`);
          
          getRequest.onsuccess = () => {
            if (!getRequest.result) {
              resolve(null);
              return;
            }
            
            const cached = getRequest.result.value as CachedResponse<T>;
            
            // Check if expired
            if (Date.now() - cached.timestamp > (cached.ttl || this.config.ttl)) {
              // We don't remove it here to avoid write transaction complexity
              // It will be overwritten on next set or cleared during maintenance
              resolve(null);
              return;
            }
            
            resolve(cached);
          };
          
          getRequest.onerror = () => {
            console.error('Error reading from IndexedDB');
            resolve(null);
          };
        };
        
        request.onerror = () => {
          console.error('Error opening IndexedDB');
          resolve(null);
        };
      } catch (error) {
        console.error('Error in IndexedDB operation:', error);
        resolve(null);
      }
    });
  }

  /**
   * Sets a value in the browser cache (IndexedDB or localStorage)
   */
  private async setInBrowserCache<T>(key: string, value: CachedResponse<T>): Promise<void> {
    try {
      // Try to use IndexedDB first
      if (window.indexedDB) {
        return await this.setInIndexedDB<T>(key, value);
      }
      
      // Fall back to localStorage
      const fullKey = `${this.config.namespace}:${key}`;
      localStorage.setItem(fullKey, JSON.stringify(value));
    } catch (error) {
      console.error('Error setting browser cache:', error);
    }
  }

  /**
   * Sets a value in IndexedDB
   */
  private async setInIndexedDB<T>(key: string, value: CachedResponse<T>): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const request = window.indexedDB.open(`${this.config.namespace}-cache`, 1);
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains('cache')) {
            db.createObjectStore('cache', { keyPath: 'key' });
          }
        };
        
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction('cache', 'readwrite');
          const store = transaction.objectStore('cache');
          
          const putRequest = store.put({
            key: `${this.config.namespace}:${key}`,
            value
          });
          
          putRequest.onsuccess = () => {
            resolve();
          };
          
          putRequest.onerror = () => {
            console.error('Error writing to IndexedDB');
            reject();
          };
        };
        
        request.onerror = () => {
          console.error('Error opening IndexedDB');
          reject();
        };
      } catch (error) {
        console.error('Error in IndexedDB operation:', error);
        reject(error);
      }
    });
  }

  /**
   * Clears all browser cache data
   */
  private async clearBrowserCache(): Promise<void> {
    try {
      // Clear IndexedDB if available
      if (window.indexedDB) {
        await this.clearIndexedDB();
      }
      
      // Clear from localStorage
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${this.config.namespace}:`)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Error clearing browser cache:', error);
    }
  }

  /**
   * Clears IndexedDB cache
   */
  private async clearIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const request = window.indexedDB.deleteDatabase(`${this.config.namespace}-cache`);
        
        request.onsuccess = () => {
          resolve();
        };
        
        request.onerror = () => {
          console.error('Error deleting IndexedDB database');
          reject();
        };
      } catch (error) {
        console.error('Error in IndexedDB deletion:', error);
        reject(error);
      }
    });
  }

  /**
   * Gets a value from the server cache (Edge KV or Redis)
   * Implementation will be adjusted based on the deployment environment
   */
  private async getFromServerCache<T>(key: string): Promise<CachedResponse<T> | null> {
    // This implementation will need to be customized for your Vercel setup
    // For now, we'll implement a stub that will be expanded with real KV/Redis integration
    try {
      const response = await fetch(`/api/cache?key=${encodeURIComponent(`${this.config.namespace}:${key}`)}`);
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      return data as CachedResponse<T>;
    } catch (error) {
      console.error('Error accessing server cache:', error);
      return null;
    }
  }

  /**
   * Sets a value in the server cache (Edge KV or Redis)
   */
  private async setInServerCache<T>(key: string, value: CachedResponse<T>): Promise<void> {
    // This implementation will need to be customized for your Vercel setup
    try {
      await fetch('/api/cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key: `${this.config.namespace}:${key}`,
          value,
          ttl: value.ttl || this.config.ttl
        })
      });
    } catch (error) {
      console.error('Error setting server cache:', error);
    }
  }

  /**
   * Clears the server cache
   */
  private async clearServerCache(): Promise<void> {
    try {
      await fetch('/api/cache', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          namespace: this.config.namespace
        })
      });
    } catch (error) {
      console.error('Error clearing server cache:', error);
    }
  }
}

// Export a singleton instance
export const cacheManager = new CacheManager();
