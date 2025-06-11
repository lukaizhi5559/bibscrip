import { NextResponse } from 'next/server';
import { ENDPOINTS } from '@/lib/api-config';
import axios from 'axios';

// Config for Edge runtime
export const runtime = 'edge';

/**
 * GET handler for Bible translations
 * Acts as a proxy to the backend Bible API
 */
export async function GET() {
  try {
    // Forward the request to the backend Bible API
    try {
      console.log('Fetching translations from backend:', ENDPOINTS.BIBLE.TRANSLATIONS);
      const response = await axios.get(ENDPOINTS.BIBLE.TRANSLATIONS, {
        timeout: 10000 // 10 second timeout
      });
      
      console.log('Backend translations response:', response.data);
      
      // Structure the response correctly
      // If the backend returns data wrapped in a data property, use that directly
      // Otherwise wrap the response in a standard format
      if (response.data && typeof response.data === 'object') {
        if (response.data.data && Array.isArray(response.data.data)) {
          // Response already has the expected structure
          return NextResponse.json(response.data);
        } else if (Array.isArray(response.data)) {
          // Response is an array but not wrapped in data property
          return NextResponse.json({ data: response.data });
        }
      }
      
      // Fallback to default structure if we can't determine the format
      // This ensures the frontend receives an array, even if empty
      return NextResponse.json({ data: response.data || [] });
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
      console.error('Error accessing Bible translations API:', error);
      return NextResponse.json(
        { error: 'Failed to connect to Bible service' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Bible translations API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
