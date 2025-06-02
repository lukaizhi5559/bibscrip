// BibScrip API - Enhanced AI Ask Endpoint
// Implements caching, advanced rate limiting, and analytics
import { NextResponse } from 'next/server';
import { getAIResponse } from '@/utils/ai';
import { getBibleVerse, BibleVerse } from '@/utils/bible';
import { extractVerseReferences } from '@/utils/verse-parser';
import { makeRequest } from '@/utils/request-manager';
import { cacheManager, createCacheKey } from '@/utils/cache-manager';
import { analytics } from '@/utils/analytics';

// Common Bible translation abbreviations
const TRANSLATIONS = ['NIV', 'ESV', 'KJV', 'NKJV', 'NLT', 'NASB', 'NRSV', 'MSG', 'AMP', 'CSB', 'WEB'];

/**
 * Extract translation preference from a question string
 * @param question The user's question
 * @returns The translation code if found, or undefined if not specified
 */
function extractTranslationPreference(question: string): string | undefined {
  // Check for explicit mentions of translations
  const translationRegex = new RegExp(`\\b(${TRANSLATIONS.join('|')})\\b`, 'i');
  const match = question.match(translationRegex);
  
  if (match) {
    return match[1].toUpperCase();
  }
  
  // Check for phrases like "in the NIV translation" or "using NIV"
  const phraseRegex = /\b(?:in|using|from|with)\s+(?:the\s+)?([A-Z]+)(?:\s+(?:translation|version|bible))?\b/i;
  const phraseMatch = question.match(phraseRegex);
  
  if (phraseMatch && TRANSLATIONS.includes(phraseMatch[1].toUpperCase())) {
    return phraseMatch[1].toUpperCase();
  }
  
  return undefined;
}

// Enhanced rate limiting with IP-based request tracking
// This is in addition to the per-provider rate limiting in request-manager.ts
const IP_RATE_LIMIT = {
  windowMs: 60000, // 1 minute
  maxRequests: 15, // 15 requests per minute per IP
  maxBurst: 5 // Allow up to 5 additional requests in burst mode
};

// Track per-IP request timestamps
const ipRequestTimestamps = new Map<string, number[]>();

// Keep a map of active requests per IP to prevent duplicate submissions
const activeRequests = new Map<string, Set<string>>();

/**
 * Check if an IP is rate limited
 * @param ip The IP address to check
 * @returns Whether the IP is rate limited and the remaining quota
 */
function checkRateLimit(ip: string | null): { 
  limited: boolean; 
  remaining: number;
  resetMs: number;
} {
  if (!ip) {
    return { limited: false, remaining: IP_RATE_LIMIT.maxRequests, resetMs: 0 };
  }

  const now = Date.now();
  const timestamps = ipRequestTimestamps.get(ip) || [];
  
  // Filter out timestamps older than the window
  const recentTimestamps = timestamps.filter(ts => now - ts < IP_RATE_LIMIT.windowMs);
  
  // Calculate time until oldest timestamp expires
  const oldestTimestamp = recentTimestamps[0] || now;
  const resetMs = Math.max(0, (oldestTimestamp + IP_RATE_LIMIT.windowMs) - now);
  
  // Check if over the limit
  const isLimited = recentTimestamps.length >= (IP_RATE_LIMIT.maxRequests + IP_RATE_LIMIT.maxBurst);
  const remaining = Math.max(0, (IP_RATE_LIMIT.maxRequests + IP_RATE_LIMIT.maxBurst) - recentTimestamps.length);
  
  // Record this request timestamp if not limited
  if (!isLimited) {
    recentTimestamps.push(now);
    ipRequestTimestamps.set(ip, recentTimestamps);
  }
  
  return { 
    limited: isLimited, 
    remaining,
    resetMs
  };
}

/**
 * Check if a request is a duplicate from the same IP
 * @param ip The IP address
 * @param cacheKey The normalized request cache key
 * @returns Whether this is a duplicate in-flight request
 */
function isDuplicateRequest(ip: string | null, cacheKey: string): boolean {
  if (!ip) return false;
  
  const ipActiveRequests = activeRequests.get(ip) || new Set<string>();
  
  if (ipActiveRequests.has(cacheKey)) {
    return true;
  }
  
  // Register this request
  ipActiveRequests.add(cacheKey);
  activeRequests.set(ip, ipActiveRequests);
  
  return false;
}

/**
 * Mark a request as completed to allow future duplicate requests
 */
function completeRequest(ip: string | null, cacheKey: string): void {
  if (!ip) return;
  
  const ipActiveRequests = activeRequests.get(ip);
  if (ipActiveRequests) {
    ipActiveRequests.delete(cacheKey);
    if (ipActiveRequests.size === 0) {
      activeRequests.delete(ip);
    } else {
      activeRequests.set(ip, ipActiveRequests);
    }
  }
}

// Config for Edge runtime for optimal performance
export const runtime = 'edge';

/**
 * Enhanced POST handler with caching, advanced rate limiting, and analytics
 */
export async function POST(request: Request) {
  const requestStartTime = performance.now();
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('remote-addr');
  let cacheKey = '';
  
  try {
    // Check IP rate limits first
    const rateLimitStatus = checkRateLimit(ip);
    if (rateLimitStatus.limited) {
      // Track rate limit event
      analytics.trackRateLimit({
        provider: 'ip',
        limitType: 'requests_per_minute',
        currentCount: IP_RATE_LIMIT.maxRequests + IP_RATE_LIMIT.maxBurst,
        limit: IP_RATE_LIMIT.maxRequests
      });
      
      return NextResponse.json({ 
        error: 'Too many requests. Please try again later.',
        resetIn: Math.ceil(rateLimitStatus.resetMs / 1000)
      }, { 
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(rateLimitStatus.resetMs / 1000)),
          'X-RateLimit-Limit': String(IP_RATE_LIMIT.maxRequests),
          'X-RateLimit-Remaining': String(rateLimitStatus.remaining),
          'X-RateLimit-Reset': String(Math.ceil(Date.now() + rateLimitStatus.resetMs))
        }
      });
    }

    const body = await request.json();
    const { question, useFallback, timeoutEnabled, forceRefresh, testMode } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Question is required and must be a string.' }, { status: 400 });
    }

    // Extract translation preference from the question
    const preferredTranslation = extractTranslationPreference(question);
    
    // Create a cache key for this question + translation
    cacheKey = createCacheKey(question, { translation: preferredTranslation });
    
    // Check for duplicate in-flight requests
    if (isDuplicateRequest(ip, cacheKey)) {
      return NextResponse.json({ 
        error: 'A similar request is already in progress. Please wait.',
        status: 'duplicate'
      }, { status: 429 });
    }
    
    try {
      // Test mode for development - return fake data to avoid API costs
      if (testMode) {
        const testResponse = {
          ai: `[TEST MODE] This is a simulated AI response to your question: "${question}"`,
          verses: [{
            ref: 'John 3:16',
            text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
            translation: preferredTranslation || 'WEB',
            link: 'https://www.biblegateway.com/passage/?search=John+3%3A16&version=NIV',
            source: 'test'
          }],
          provider: 'test',
          fromCache: false,
          latencyMs: 123
        };
        
        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Complete the request to allow duplicates again
        completeRequest(ip, cacheKey);
        
        // Track this as a test request in analytics
        analytics.trackAIRequest({
          provider: 'test',
          fromCache: false,
          latencyMs: 500,
          status: 'success',
          query: question
        });
        
        return NextResponse.json(testResponse);
      }
      
      // Setup provider order based on user preference
      // Following the user's preference: OpenAI → Mistral → Claude → Gemini
      let providers: Array<'openai' | 'mistral' | 'claude' | 'gemini'> = ['openai', 'mistral', 'claude', 'gemini'];
      
      // If fallback is requested, start with Mistral
      if (useFallback) {
        providers = ['mistral', 'claude', 'gemini', 'openai'];
      }
      
      // Setup timeout for API requests
      const timeout = timeoutEnabled ? 18000 : 30000; // 18 or 30 seconds
      
      // Make the AI request with our enhanced request manager
      const aiResult = await makeRequest(
        // This is the request function that will be called with the provider
        async (provider, signal) => {
          return await getAIResponse(question, { 
            startProvider: provider as any, 
            timeoutMs: timeout,
            signal
          });
        },
        // The original query
        question,
        // Request options
        {
          providers,
          timeout,
          cacheKey,
          forceRefresh,
          translation: preferredTranslation,
          caching: {
            enabled: true,
            ttl: 30 * 24 * 60 * 60 * 1000 // 30 days
          },
          retry: {
            maxAttempts: 2,
            initialDelayMs: 500,
            backoffFactor: 1.5,
            maxDelayMs: 5000
          }
        }
      );
      
      // Extract verse references from both question and response
      const questionVerses = extractVerseReferences(question);
      const aiResponseVerses = extractVerseReferences(aiResult.data);
      const verseRefsToFetch = Array.from(new Set([...questionVerses, ...aiResponseVerses]));
      
      // Fetch Bible verses with caching
      const fetchedVerses: BibleVerse[] = [];
      if (verseRefsToFetch.length > 0) {
        // Create individual promises for each verse
        const versePromises = verseRefsToFetch.map(async (ref) => {
          // Create a verse-specific cache key
          const verseCacheKey = `verse:${ref}:${preferredTranslation || 'default'}`;
          
          // Check cache first
          const cachedVerse = await cacheManager.get<BibleVerse>(verseCacheKey);
          if (cachedVerse && !forceRefresh) {
            analytics.trackCacheOperation({
              operation: 'hit',
              key: verseCacheKey
            });
            return cachedVerse.data;
          }
          
          // Cache miss, fetch from API
          analytics.trackCacheOperation({
            operation: 'miss',
            key: verseCacheKey
          });
          
          const verse = await getBibleVerse(ref, preferredTranslation);
          
          // Cache the result if found
          if (verse) {
            await cacheManager.set(verseCacheKey, verse, {
              ttl: 365 * 24 * 60 * 60 * 1000 // Bible verses can be cached for a year
            });
          }
          
          return verse;
        });
        
        // Execute all verse fetches in parallel
        const results = await Promise.allSettled(versePromises);
        
        results.forEach(result => {
          if (result.status === 'fulfilled' && result.value) {
            fetchedVerses.push(result.value);
          }
        });
      }
      
      // Track AI request in analytics
      analytics.trackAIRequest({
        provider: aiResult.provider || 'unknown',
        fromCache: aiResult.fromCache,
        tokenUsage: aiResult.tokenUsage,
        latencyMs: aiResult.latencyMs,
        status: 'success',
        query: question,
        cacheKey,
        cacheAge: aiResult.cacheAge
      });
      
      // Complete the request to allow duplicates again
      completeRequest(ip, cacheKey);
      
      // Return the complete response
      return NextResponse.json({
        ai: aiResult.data,
        verses: fetchedVerses,
        provider: aiResult.provider,
        fromCache: aiResult.fromCache,
        latencyMs: Math.round(performance.now() - requestStartTime)
      });
    } finally {
      // Ensure we clean up the request tracking even if there's an error
      completeRequest(ip, cacheKey);
    }
  } catch (error) {
    // Log the error
    console.error('Error in /api/ask handler:', error);
    
    // Track the error in analytics
    analytics.trackAIRequest({
      provider: 'unknown',
      fromCache: false,
      latencyMs: performance.now() - requestStartTime,
      status: 'error',
      errorType: error instanceof Error ? error.name : 'Unknown',
      query: cacheKey
    });
    
    // Clean up request tracking
    completeRequest(ip, cacheKey);
    
    // Return an error response
    return NextResponse.json({ 
      error: 'An error occurred while processing your request. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    }, { status: 500 });
  }
}