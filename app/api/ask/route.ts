// /Users/lukaizhi/Desktop/projects/bibscrip-app/app/api/ask/route.ts
import { NextResponse } from 'next/server';
import { getAIResponse } from '@/utils/ai'; // Adjust path if your tsconfig paths are different
import { getBibleVerse, BibleVerse } from '@/utils/bible';
import { extractVerseReferences } from '@/utils/verse-parser';

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

// Basic rate limiting (in-memory, consider Redis or Upstash for production)
const requestTimestamps = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // Max 10 requests per IP per minute

function isRateLimited(ip: string | null): boolean {
  if (!ip) return false; // Cannot rate limit if IP is not available

  const now = Date.now();
  const timestamps = requestTimestamps.get(ip) || [];
  
  // Filter out timestamps older than the window
  const recentTimestamps = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
  
  if (recentTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    requestTimestamps.set(ip, recentTimestamps);
    return true;
  }
  
  recentTimestamps.push(now);
  requestTimestamps.set(ip, recentTimestamps);
  return false;
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('remote-addr');

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { question, useFallback, timeoutEnabled } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Question is required and must be a string.' }, { status: 400 });
    }

    console.log(`Received question from IP ${ip}:`, question);
    console.log(`Request options: useFallback=${useFallback}, timeoutEnabled=${timeoutEnabled}`);

    // Extract translation preference from the question
    const preferredTranslation = extractTranslationPreference(question);
    console.log('Detected translation preference:', preferredTranslation || 'None (using default)');
    
    // 1. Get AI response with possible fallback options
    let startProvider: 'openai' | 'mistral' | 'claude' = 'openai'; // Default start with OpenAI
    
    if (useFallback) {
      // If fallback is requested, start with Mistral (skip OpenAI)
      // This follows the user's preference of OpenAI -> Mistral -> Claude
      console.log('Using fallback chain starting with Mistral');
      startProvider = 'mistral';
    }
    
    // Set a timeout limit for API calls if requested
    // This will be handled inside getAIResponse with AbortController
    const timeoutMs = timeoutEnabled ? 18000 : undefined; // 18 seconds if enabled
    
    const aiExplanation = await getAIResponse(question, { startProvider, timeoutMs });

    // 2. Extract verse references from the original question AND the AI's response
    // This helps catch verses mentioned by the user or cited by the AI.
    let verseRefsToFetch: string[] = [];
    const questionVerses = extractVerseReferences(question);
    const aiResponseVerses = extractVerseReferences(aiExplanation);
    verseRefsToFetch = Array.from(new Set([...questionVerses, ...aiResponseVerses]));
    
    // 3. Fetch Bible verses
    const fetchedVerses: BibleVerse[] = [];
    if (verseRefsToFetch.length > 0) {
      const versePromises = verseRefsToFetch.map(ref => getBibleVerse(ref, preferredTranslation));
      const results = await Promise.allSettled(versePromises);
      
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          fetchedVerses.push(result.value);
        } else if (result.status === 'rejected') {
          console.error('Failed to fetch a verse:', result.reason);
        }
      });
    }
    
    return NextResponse.json({
      ai: aiExplanation,
      verses: fetchedVerses,
      provider: startProvider, // Include which provider was used for debugging
    });

  } catch (error) {
    console.error('Error in /api/ask POST handler:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}