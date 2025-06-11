import { NextRequest, NextResponse } from 'next/server';
import { ENDPOINTS } from '@/lib/api-config';
import axios from 'axios';

// Config for Edge runtime
export const runtime = 'edge';

/**
 * GET handler for multiple Bible chapters retrieval
 * Acts as a proxy to the backend Bible API
 */
export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const book = searchParams.get('book');
    const startChapter = searchParams.get('startChapter');
    const endChapter = searchParams.get('endChapter');
    const translation = searchParams.get('translation') || 'NIV';
    
    if (!book || !startChapter || !endChapter) {
      return NextResponse.json({ 
        error: 'Missing required parameters: book, startChapter, and endChapter' 
      }, { status: 400 });
    }
    
    // Forward the request to the backend Bible API
    try {
      const response = await axios.get(
        `${ENDPOINTS.BIBLE.CHAPTERS}/${encodeURIComponent(book)}/${startChapter}/${endChapter}`,
        {
          params: { translation },
          timeout: 20000 // 20 second timeout for potentially large responses
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
    console.error('Bible chapters API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
