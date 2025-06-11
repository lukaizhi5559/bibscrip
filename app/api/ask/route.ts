// BibScrip API - Proxy to Backend Ask Service
// Provides simplified rate limiting and analytics
import { NextResponse } from 'next/server';
import { ENDPOINTS } from '@/lib/api-config';
import axios from 'axios';
import { bibleService } from '@/utils/bible-service';
import { extractVerseReferences } from '@/utils/verse-parser';
import type { BibleVerse } from '@/utils/bible';

// Common Bible translation abbreviations for detection in questions
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

// Simple rate limiting with IP-based tracking
const IP_RATE_LIMIT = {
  windowMs: 60000, // 1 minute
  maxRequests: 15, // 15 requests per minute per IP
};

// Track per-IP request timestamps
const ipRequestTimestamps = new Map<string, number[]>();

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
  const isLimited = recentTimestamps.length >= IP_RATE_LIMIT.maxRequests;
  const remaining = Math.max(0, IP_RATE_LIMIT.maxRequests - recentTimestamps.length);
  
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

// Config for Edge runtime for optimal performance
export const runtime = 'edge';

/**
 * POST handler that proxies to backend Ask API
 */
export async function POST(request: Request) {
  const requestStartTime = performance.now();
  
  try {
    // Parse the request body
    let body;
    try {
      body = await request.json();
      console.log('API Route /api/ask received request body:', JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }
    
    // Extract question and options with more validation
    const question = body?.question;
    const options = body?.options || {};
    
    console.log('Extracted question:', question);
    console.log('Extracted options:', options);
    
    // Get client IP for rate limiting
    const ipHeader = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const ip = ipHeader ? ipHeader.split(',')[0].trim() : null;
    
    if (!question || question.trim() === "") {
      return NextResponse.json({ error: "Question cannot be empty" }, { status: 400 });
    }
    
    // Normalize the question
    const normalizedQuestion = question.trim();
    
    // Apply basic rate limiting
    const rateLimit = checkRateLimit(ip);
    if (rateLimit.limited) {
      return NextResponse.json({
        error: "Rate limit exceeded. Please try again later.",
        retryAfterMs: rateLimit.resetMs
      }, {
        status: 429,
        headers: {
          'Retry-After': Math.ceil(rateLimit.resetMs / 1000).toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(rateLimit.resetMs / 1000).toString()
        }
      });
    }
    
    // Extract preferred translation if mentioned in the question
    const preferredTranslation = extractTranslationPreference(normalizedQuestion) || 'NIV';
    
    // Forward the request to the backend
    let backendResponse;
    try {
      console.log('Sending request to backend:', ENDPOINTS.ASK);
      console.log('Request payload:', JSON.stringify({
        query: normalizedQuestion,
        options: {
          ...options,
          preferredTranslation
        }
      }, null, 2));
      
      backendResponse = await axios.post(ENDPOINTS.ASK, {
        question: normalizedQuestion, // Backend expects 'question' not 'query'
        options: {
          ...options,
          preferredTranslation
        }
      }, {
        timeout: 160000, // 120 second timeout for AI processing
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Backend response::', backendResponse);
      console.log('Backend response status:', backendResponse.status);
      console.log('Backend response headers:', backendResponse.headers);
    } catch (axiosError: any) {
      // Handle specific axios errors
      if (axiosError.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error(`Backend API error: ${axiosError.response.status}`, axiosError.response.data);
        console.error('Full error details:', axiosError.message);
        
        // Log additional headers for debugging
        console.error('Response headers:', axiosError.response.headers);
        
        return NextResponse.json({ 
          error: axiosError.response.data?.error || 'Error from AI service',
          details: process.env.NODE_ENV === 'development' ? axiosError.response.data : undefined,
          debugInfo: process.env.NODE_ENV === 'development' ? {
            url: ENDPOINTS.ASK,
            message: axiosError.message,
            code: axiosError.code
          } : undefined
        }, { status: axiosError.response.status || 500 });
      } else if (axiosError.request) {
        // The request was made but no response was received
        console.error('Backend API timeout or no response:', axiosError.message);
        return NextResponse.json({ 
          error: 'AI service unavailable. Please try again later.',
          details: process.env.NODE_ENV === 'development' ? axiosError.message : undefined
        }, { status: 503 });
      } else {
        // Something happened in setting up the request
        console.error('Error setting up backend API request:', axiosError.message);
        throw axiosError; // Let the outer catch handle this
      }
    }
    
    // Get data from the backend response
    console.log('Backend response data structure:', JSON.stringify(backendResponse.data, null, 2));
    
    // Handle different response structures
    let aiResponseText = '';
    if (typeof backendResponse.data === 'string') {
      // If the response is a plain string
      aiResponseText = backendResponse.data;
    } else if (backendResponse.data.data && typeof backendResponse.data.data === 'string') {
      // If the response is structured with a data field containing the answer
      aiResponseText = backendResponse.data.data;
    } else if (backendResponse.data.ai && typeof backendResponse.data.ai === 'string') {
      // If the response already has an ai field
      aiResponseText = backendResponse.data.ai;
    } else {
      console.error('Unexpected response format:', backendResponse.data);
      aiResponseText = 'Error: Unable to process AI response. Please try again.';
    }
    
    // Extract verse references or use provided ones
    const questionVerses = backendResponse.data.sources || [];
    const aiResponseVerses = backendResponse.data.verses || extractVerseReferences(aiResponseText);
    
    // Combine both sets of verses without duplicates
    const verseRefsToFetch = Array.from(new Set([...questionVerses, ...aiResponseVerses]));
    
    // Fetch Bible verses using the Bible service
    const fetchedVerses: BibleVerse[] = [];
    if (verseRefsToFetch.length > 0) {
      const versePromises = verseRefsToFetch.map(async (ref) => {
        try {
          // Use the Bible service to fetch the verse
          return await bibleService.getVerse(ref, preferredTranslation);
        } catch (err) {
          console.error(`Error fetching verse ${ref}:`, err);
          return null;
        }
      });
      
      // Execute all verse fetches in parallel
      const results = await Promise.allSettled(versePromises);
      
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          fetchedVerses.push(result.value);
        }
      });
    }
    
    // Return the response with any fetched verses
    const responseObj = {
      ai: aiResponseText,
      verses: fetchedVerses,
      sources: backendResponse.data.sources || [],
      latencyMs: Math.round(performance.now() - requestStartTime),
      fromCache: backendResponse.data.fromCache || false,
      provider: backendResponse.data.provider || 'default'
    };
    
    console.log('Sending response to frontend:', {
      hasAiText: !!responseObj.ai, 
      textLength: responseObj.ai.length,
      versesCount: responseObj.verses.length
    });
    
    return NextResponse.json(responseObj);
    
  } catch (error) {
    // Log the error
    console.error('Error in /api/ask handler:', error);
    
    // Determine if this is an axios error with more details
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        // Timeout error
        return NextResponse.json({ 
          error: 'Request to AI service timed out. Please try again later.',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 504 });
      } else if (error.code === 'ERR_NETWORK') {
        // Network error
        return NextResponse.json({ 
          error: 'Unable to connect to AI service. Please ensure backend is running.',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 503 });
      } else if (error.code === 'ERR_BAD_REQUEST') {
        // Bad request error
        return NextResponse.json({ 
          error: 'AI service rejected the request. Please check your query format.',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 400 });
      }
    }
    
    // Return a generic error response for other types of errors
    return NextResponse.json({ 
      error: 'An error occurred while processing your request. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    }, { status: 500 });
  }
}
