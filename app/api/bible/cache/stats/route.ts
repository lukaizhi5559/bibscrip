import { NextResponse } from 'next/server';
import { ENDPOINTS } from '@/lib/api-config';
import axios from 'axios';

// Config for Edge runtime
export const runtime = 'edge';

/**
 * GET handler for Bible cache statistics
 * Acts as a proxy to the backend Bible API
 */
export async function GET() {
  try {
    // Forward the request to the backend Bible API
    try {
      const response = await axios.get(ENDPOINTS.BIBLE.CACHE_STATS, {
        timeout: 10000 // 10 second timeout
      });
      
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
      console.error('Error accessing Bible cache stats API:', error);
      return NextResponse.json(
        { error: 'Failed to connect to Bible service' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Bible cache stats API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
