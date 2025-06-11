import { NextResponse } from 'next/server';
import { ENDPOINTS } from '@/lib/api-config';
import axios from 'axios';

// Set Edge runtime for better performance in serverless environments
export const runtime = 'edge';

/**
 * API proxy route that forwards requests to the backend service
 * Handles the API request for generating AI responses
 */
export async function POST(request: Request) {
  const requestStartTime = performance.now();
  
  try {
    // Get the prompt from the request body
    const body = await request.json();
    const { prompt } = body;
    
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request: prompt is required and must be a string' },
        { status: 400 }
      );
    }

    // Define any additional parameters from the request body
    const { model = 'default', temperature = 0.7, maxTokens = 1000 } = body;
    
    try {
      // Use axios with the centralized endpoint configuration
      const response = await axios.post(ENDPOINTS.GENERATE.TEXT, {
        prompt,
        model,
        temperature,
        maxTokens
      }, {
        timeout: 30000 // 30 second timeout
      });
      
      // Return the response data directly
      const data = response.data;
      
      return NextResponse.json({
        ...data,
        latencyMs: Math.round(performance.now() - requestStartTime)
      });
    } catch (error) {
      // Handle axios errors (network issues, timeouts, etc.)
      console.error('Backend API error:', error);
      
      // Determine if this was a timeout
      const isTimeout = error instanceof Error && 
        error.message.includes('timeout');
      
      return NextResponse.json(
        { 
          error: isTimeout ? 'Request timed out' : 'Network error connecting to backend',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined
        },
        { status: isTimeout ? 504 : 502 }
      );
    }
  } catch (error) {
    // Handle any other errors in the proxy handler itself
    console.error('API proxy error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error in API proxy',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}
