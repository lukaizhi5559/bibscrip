import { NextResponse } from 'next/server';
import { ENDPOINTS, API_BASE_URL } from '@/lib/api-config';
import axios from 'axios';

// Config for Edge runtime for optimal performance
export const runtime = 'edge';

/**
 * POST handler for Ask API
 * Acts as a proxy to the backend ask service
 */
export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate required fields - accept either question or query
    const questionText = body.question || body.query;
    
    if (!questionText || typeof questionText !== 'string') {
      return NextResponse.json({ 
        error: "Invalid request: question is required and must be a string" 
      }, { status: 400 });
    }

    try {
      // Forward the request to the backend ask API with proper format
      const response = await axios.post(`${API_BASE_URL}/ask`, {
        query: questionText, // Use our normalized questionText variable
        options: body.options || {}
      }, {
        timeout: 30000, // 30 second timeout for AI generation
      });
      
      return NextResponse.json(response.data);
    } catch (axiosError: any) {
      // Handle specific axios errors
      if (axiosError.response) {
        // The request was made and the server responded with a status code outside 2xx range
        console.error(`Backend ask API error: ${axiosError.response.status}`, axiosError.response.data);
        return NextResponse.json(
          { 
            error: axiosError.response.data?.error || 'Error from ask service',
            details: process.env.NODE_ENV === 'development' ? axiosError.response.data : undefined
          }, 
          { status: axiosError.response.status || 500 }
        );
      } else if (axiosError.request) {
        // The request was made but no response was received
        console.error('Backend ask API timeout or no response:', axiosError.message);
        return NextResponse.json(
          { error: 'Ask service unavailable. Please try again later.' },
          { status: 503 }
        );
      } else {
        // Something happened in setting up the request
        console.error('Error setting up backend ask API request:', axiosError.message);
        throw axiosError; // Let the outer catch handle this
      }
    }
  } catch (error) {
    console.error('Error in /api/generate/ask handler:', error);
    
    // Handle axios errors with more specific messages
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        // Timeout error
        return NextResponse.json(
          { error: 'Request to ask service timed out. Please try again later.' },
          { status: 504 }
        );
      } else if (error.code === 'ERR_NETWORK') {
        // Network error
        return NextResponse.json(
          { error: 'Unable to connect to ask service. Please ensure backend is running.' },
          { status: 503 }
        );
      } else if (error.code === 'ERR_BAD_REQUEST') {
        // Bad request error
        return NextResponse.json(
          { error: 'Ask service rejected the request. Please check your query format.' },
          { status: 400 }
        );
      }
    }
    
    // Return a generic error response for other types of errors
    return NextResponse.json({ 
      error: 'An error occurred while processing your ask request.',
      details: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.message : String(error)) : undefined
    }, { status: 500 });
  }
}
