import { NextResponse } from 'next/server';

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

    // Get the backend URL from environment variables or use default
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const endpoint = `${backendUrl}/api/generate`;
    
    // Create a fetch request with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
        signal: controller.signal
      });
      
      // Always clear the timeout
      clearTimeout(timeoutId);
      
      // Handle error responses from the backend
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`Backend error: ${response.status}`, errorData);
        
        return NextResponse.json(
          { 
            error: 'Backend service error',
            status: response.status,
            details: process.env.NODE_ENV === 'development' ? errorData : undefined
          },
          { status: response.status }
        );
      }
      
      // Parse and return the successful response
      const data = await response.json();
      
      return NextResponse.json({
        ...data,
        latencyMs: Math.round(performance.now() - requestStartTime)
      });
    } catch (fetchError) {
      // Clear the timeout if we're handling an error
      clearTimeout(timeoutId);
      
      // Handle fetch errors (network issues, timeouts, etc.)
      console.error('Fetch error:', fetchError);
      
      // Determine if this was a timeout
      const isTimeout = fetchError instanceof Error && 
        fetchError.name === 'AbortError';
      
      return NextResponse.json(
        { 
          error: isTimeout ? 'Request timed out' : 'Network error connecting to backend',
          details: process.env.NODE_ENV === 'development' ? String(fetchError) : undefined
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
