import { NextResponse } from 'next/server';
import { ENDPOINTS } from '@/lib/api-config';
import axios from 'axios';

// Config for Edge runtime for optimal performance
export const runtime = 'edge';

/**
 * POST handler for text generation requests
 * Acts as a proxy to the backend generation API
 */
export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.prompt) {
      return NextResponse.json({ 
        error: "Prompt is required" 
      }, { status: 400 });
    }

    try {
      // Forward the request to the backend generation API
      const response = await axios.post(ENDPOINTS.GENERATE.TEXT, body, {
        timeout: 30000 // 30 second timeout for AI generation
      });
      
      return NextResponse.json(response.data);
    } catch (axiosError: any) {
      // Handle specific axios errors
      if (axiosError.response) {
        // The request was made and the server responded with a status code outside 2xx range
        console.error(`Backend generation API error: ${axiosError.response.status}`, axiosError.response.data);
        return NextResponse.json(
          { 
            error: axiosError.response.data?.error || 'Error from generation service',
            details: process.env.NODE_ENV === 'development' ? axiosError.response.data : undefined
          }, 
          { status: axiosError.response.status || 500 }
        );
      } else if (axiosError.request) {
        // The request was made but no response was received
        console.error('Backend generation API timeout or no response:', axiosError.message);
        return NextResponse.json(
          { error: 'Generation service unavailable. Please try again later.' },
          { status: 503 }
        );
      } else {
        // Something happened in setting up the request
        console.error('Error setting up backend generation API request:', axiosError.message);
        throw axiosError; // Let the outer catch handle this
      }
    }
  } catch (error) {
    console.error('Error in /api/generate/text handler:', error);
    
    // Handle axios errors with more specific messages
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        // Timeout error
        return NextResponse.json(
          { error: 'Request to generation service timed out. Please try again later.' },
          { status: 504 }
        );
      } else if (error.code === 'ERR_NETWORK') {
        // Network error
        return NextResponse.json(
          { error: 'Unable to connect to generation service. Please ensure backend is running.' },
          { status: 503 }
        );
      } else if (error.code === 'ERR_BAD_REQUEST') {
        // Bad request error
        return NextResponse.json(
          { error: 'Generation service rejected the request. Please check your query format.' },
          { status: 400 }
        );
      }
    }
    
    // Return a generic error response for other types of errors
    return NextResponse.json({ 
      error: 'An error occurred while processing your generation request.',
      details: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.message : String(error)) : undefined
    }, { status: 500 });
  }
}
