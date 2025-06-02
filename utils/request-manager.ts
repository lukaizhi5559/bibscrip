// BibScrip Request Manager
// Implements sophisticated rate limiting, request deduplication,
// and graceful retries for AI API calls

import { CachedResponse, createCacheKey, cacheManager } from './cache-manager';

export interface AIProvider {
  name: 'openai' | 'mistral' | 'claude' | 'gemini';
  isAvailable: () => boolean;
  rateLimitInfo: {
    maxRequestsPerMinute: number;
    maxRequestsPerHour?: number;
    maxTokensPerMinute?: number;
  };
  defaultTimeoutMs?: number;
}

export interface RequestOptions {
  providers?: Array<'openai' | 'mistral' | 'claude' | 'gemini'>;
  cacheKey?: string;
  caching?: {
    enabled: boolean;
    ttl?: number;
  };
  timeout?: number;
  retry?: {
    maxAttempts: number;
    initialDelayMs: number;
    backoffFactor: number;
    maxDelayMs: number;
  };
  forceRefresh?: boolean;
  priority?: 'high' | 'normal' | 'low';
  analytics?: Record<string, any>;
  allowPartialResponse?: boolean;
  translation?: string;
}

export interface RequestResult<T> {
  data: T;
  provider?: 'openai' | 'mistral' | 'claude' | 'gemini';
  fromCache: boolean;
  cacheAge?: number;
  attempt?: number;
  tokenUsage?: {
    input: number;
    output: number;
    total: number;
  };
  latencyMs: number;
  cost?: number;
}

// Default providers configuration
const DEFAULT_PROVIDERS: Record<string, AIProvider> = {
  openai: {
    name: 'openai',
    isAvailable: () => !!process.env.OPENAI_API_KEY,
    rateLimitInfo: {
      maxRequestsPerMinute: 60,
      maxRequestsPerHour: 3500,
      maxTokensPerMinute: 90000 // GPT-4 Turbo limit
    },
    defaultTimeoutMs: 15000
  },
  mistral: {
    name: 'mistral',
    isAvailable: () => !!process.env.MISTRAL_API_KEY,
    rateLimitInfo: {
      maxRequestsPerMinute: 20
    },
    defaultTimeoutMs: 10000
  },
  claude: {
    name: 'claude',
    isAvailable: () => !!process.env.ANTHROPIC_API_KEY,
    rateLimitInfo: {
      maxRequestsPerMinute: 20
    },
    defaultTimeoutMs: 20000
  },
  gemini: {
    name: 'gemini',
    isAvailable: () => !!process.env.GEMINI_API_KEY,
    rateLimitInfo: {
      maxRequestsPerMinute: 30
    },
    defaultTimeoutMs: 15000
  }
};

// Default request options
const DEFAULT_OPTIONS: RequestOptions = {
  providers: ['openai', 'mistral', 'claude', 'gemini'],
  caching: {
    enabled: true,
    ttl: 30 * 24 * 60 * 60 * 1000 // 30 days
  },
  timeout: 15000,
  retry: {
    maxAttempts: 3,
    initialDelayMs: 500,
    backoffFactor: 1.5,
    maxDelayMs: 15000
  },
  forceRefresh: false,
  priority: 'normal',
  allowPartialResponse: false
};

// Maps to track in-flight requests and rate limits
const inflightRequests = new Map<string, Promise<any>>();
const requestTimestamps: Record<string, number[]> = {
  openai: [],
  mistral: [],
  claude: []
};

// Global flags
let isGlobalPause = false;
let globalDegradationLevel: 0 | 1 | 2 | 3 = 0; // 0=normal, 1=mild, 2=moderate, 3=severe

/**
 * Check if a provider is rate limited
 */
function isRateLimited(provider: string): boolean {
  const now = Date.now();
  const providerConfig = DEFAULT_PROVIDERS[provider];
  
  if (!providerConfig) return true;
  
  const timestamps = requestTimestamps[provider] || [];
  
  // Filter timestamps from last minute
  const lastMinuteTimestamps = timestamps.filter(ts => now - ts < 60000);
  
  // Check rate limit
  if (lastMinuteTimestamps.length >= providerConfig.rateLimitInfo.maxRequestsPerMinute) {
    return true;
  }
  
  // Also check hourly limit if defined
  if (providerConfig.rateLimitInfo.maxRequestsPerHour) {
    const lastHourTimestamps = timestamps.filter(ts => now - ts < 3600000);
    if (lastHourTimestamps.length >= providerConfig.rateLimitInfo.maxRequestsPerHour) {
      return true;
    }
  }
  
  return false;
}

/**
 * Record a request to a provider for rate limiting purposes
 */
function recordRequest(provider: string): void {
  const now = Date.now();
  
  if (!requestTimestamps[provider]) {
    requestTimestamps[provider] = [];
  }
  
  requestTimestamps[provider].push(now);
  
  // Cleanup old timestamps
  const oneHourAgo = now - 3600000;
  requestTimestamps[provider] = requestTimestamps[provider].filter(ts => ts > oneHourAgo);
}

/**
 * Set global pause state (useful during outages)
 */
export function setGlobalPause(paused: boolean): void {
  isGlobalPause = paused;
}

/**
 * Set degradation level for adaptive behavior
 * 0 = Normal operation
 * 1 = Mild degradation (extend cache TTL, more retries)
 * 2 = Moderate degradation (prioritize cached responses, even stale ones)
 * 3 = Severe degradation (only use cache, no new requests)
 */
export function setDegradationLevel(level: 0 | 1 | 2 | 3): void {
  globalDegradationLevel = level;
}

/**
 * Get the current degradation status
 */
export function getDegradationStatus(): {
  isPaused: boolean;
  level: number;
  description: string;
} {
  const descriptions = [
    "Normal operation",
    "Mild degradation - Some responses may be delayed",
    "Moderate degradation - Using cached responses when possible",
    "Severe degradation - Only cached responses available"
  ];

  return {
    isPaused: isGlobalPause,
    level: globalDegradationLevel,
    description: descriptions[globalDegradationLevel]
  };
}

/**
 * Make a request with caching, rate limiting, and fallback logic
 */
export async function makeRequest<T>(
  requestFn: (provider: string, abortSignal?: AbortSignal) => Promise<T>,
  query: string,
  options?: Partial<RequestOptions>
): Promise<RequestResult<T>> {
  const startTime = performance.now();
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const { providers, caching, timeout, retry, forceRefresh, translation } = mergedOptions;
  
  // Create cache key from the query
  const cacheKey = options?.cacheKey || createCacheKey(query, { translation });

  // First, check if there is already an in-flight request for this key
  if (inflightRequests.has(cacheKey) && !forceRefresh) {
    console.log(`Returning existing in-flight request for: ${cacheKey}`);
    try {
      const result = await inflightRequests.get(cacheKey);
      return {
        ...result,
        fromCache: true,
        latencyMs: performance.now() - startTime
      };
    } catch (error) {
      // If the in-flight request failed, proceed with a new request
      console.warn(`In-flight request failed, proceeding with new request: ${error}`);
    }
  }
  
  // Check cache first if enabled
  if (caching?.enabled && !forceRefresh) {
    const cachedResult = await cacheManager.get<T>(cacheKey);
    
    if (cachedResult) {
      const cacheAge = Date.now() - cachedResult.timestamp;
      
      // Default TTL to 1 hour if not specified
      const ttl = cachedResult.ttl ?? 3600000; // 1 hour in milliseconds
      
      // If severe degradation, use cached result regardless of TTL
      if (
        (globalDegradationLevel < 3 && cacheAge < ttl) || 
        globalDegradationLevel >= 2
      ) {
        console.log(`Cache hit for: ${cacheKey}, age: ${cacheAge}ms`);
        return {
          data: cachedResult.data,
          provider: cachedResult.provider as any,
          fromCache: true,
          cacheAge,
          tokenUsage: cachedResult.tokenUsage,
          latencyMs: performance.now() - startTime
        };
      } else {
        console.log(`Stale cache for: ${cacheKey}, age: ${cacheAge}ms > ttl: ${ttl}ms`);
      }
    } else {
      console.log(`Cache miss for: ${cacheKey}`);
    }
  }
  
  // If in severe degradation mode, and no fresh cache, fail fast
  if (globalDegradationLevel >= 3) {
    throw new Error('Service is in severe degradation mode. Only cached responses are available.');
  }
  
  // If global pause is active, fail fast
  if (isGlobalPause) {
    throw new Error('Service is currently paused for maintenance or due to API issues.');
  }
  
  // Create a promise for this request and add it to in-flight requests
  const requestPromise = (async () => {
    // Sort providers by rate limit availability
    const sortedProviders = [...providers!]
      .filter(p => DEFAULT_PROVIDERS[p]?.isAvailable())
      .sort((a, b) => {
        const aLimited = isRateLimited(a);
        const bLimited = isRateLimited(b);
        if (aLimited && !bLimited) return 1;
        if (!aLimited && bLimited) return -1;
        return 0;
      });
    
    if (sortedProviders.length === 0) {
      throw new Error('No available AI providers');
    }
    
    let lastError: Error | null = null;
    let currentAttempt = 0;
    
    // Retry logic
    while (currentAttempt < retry!.maxAttempts) {
      currentAttempt++;
      
      for (const provider of sortedProviders) {
        // Skip rate-limited providers
        if (isRateLimited(provider)) {
          console.log(`Provider ${provider} is rate limited, trying next...`);
          continue;
        }
        
        try {
          // Create abort controller for timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            controller.abort();
          }, timeout);
          
          try {
            console.log(`Attempting request with provider: ${provider}, attempt ${currentAttempt}`);
            recordRequest(provider);
            
            // Make the actual request
            const data = await requestFn(provider, controller.signal);
            
            // Calculate token usage and cost (provider-specific logic would be implemented here)
            const tokenUsage = { input: 0, output: 0, total: 0 }; // Placeholder
            
            // Cache the result if caching is enabled
            if (caching?.enabled) {
              await cacheManager.set(cacheKey, data, {
                provider,
                tokenUsage,
                ttl: caching.ttl
              });
            }
            
            // Return successful result
            return {
              data,
              provider,
              fromCache: false,
              attempt: currentAttempt,
              tokenUsage,
              latencyMs: performance.now() - startTime
            };
          } finally {
            clearTimeout(timeoutId);
          }
        } catch (error) {
          lastError = error as Error;
          console.error(`Provider ${provider} failed on attempt ${currentAttempt}:`, error);
          
          // If the provider failed with a rate limit error, it should be marked as rate limited
          if (error instanceof Error && 
              (error.message.includes('rate limit') || 
               error.message.includes('429'))) {
            // Add many timestamps to effectively rate limit this provider temporarily
            for (let i = 0; i < DEFAULT_PROVIDERS[provider].rateLimitInfo.maxRequestsPerMinute; i++) {
              recordRequest(provider);
            }
          }
        }
      }
      
      // All providers failed, apply backoff before retry
      const delay = Math.min(
        retry!.initialDelayMs * Math.pow(retry!.backoffFactor, currentAttempt - 1),
        retry!.maxDelayMs
      );
      console.log(`All providers failed, retrying in ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    // All retries and providers failed
    throw lastError || new Error('All providers failed and retries exhausted');
  })();
  
  // Add this request to in-flight requests
  inflightRequests.set(cacheKey, requestPromise);
  
  try {
    // Await the actual request
    const result = await requestPromise;
    return result;
  } finally {
    // Clean up in-flight request entry
    inflightRequests.delete(cacheKey);
  }
}
