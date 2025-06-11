import { NextRequest, NextResponse } from 'next/server';
import { ENDPOINTS } from '@/lib/api-config';
import axios from 'axios';

// Config for Edge runtime
export const runtime = 'edge';

/**
 * GET handler for Bible chapter retrieval
 * Acts as a proxy to the backend Bible API
 */
export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const book = searchParams.get('book');
    const chapter = searchParams.get('chapter');
    const translation = searchParams.get('translation') || 'NIV';
    
    if (!book || !chapter) {
      return NextResponse.json({ 
        error: 'Missing required parameters: book and chapter' 
      }, { status: 400 });
    }
    
    // Forward the request to the backend Bible API
    try {
      const response = await axios.get(
        `${ENDPOINTS.BIBLE.CHAPTER}/${encodeURIComponent(book)}/${chapter}`,
        {
          params: { translation },
          timeout: 10000 // 10 second timeout
        }
      );
      
      return NextResponse.json(response.data);
    } catch (error: any) {
      // Handle backend errors with appropriate status codes
      if (error.response) {
        return NextResponse.json(
          { 
            error: error.response.data.error || 'Bible API error',
            details: process.env.NODE_ENV === 'development' ? error.response.data : undefined
          },
          { status: error.response.status || 500 }
        );
      }
      
      // Network or timeout error
      console.error('Error accessing Bible API:', error);
      return NextResponse.json(
        { error: 'Failed to connect to Bible service' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Bible chapter API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
