import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/api-config';
import axios from 'axios';

// Config for Edge runtime
export const runtime = 'edge';

/**
 * POST handler for recording analytics events
 * Proxies events to the backend analytics service
 */
export async function POST(request: NextRequest) {
  try {
    const events = await request.json();
    
    // Validate that we received an array of events
    if (!Array.isArray(events)) {
      return NextResponse.json({ error: 'Invalid events format, array expected' }, { status: 400 });
    }
    
    // In development mode, log the events to the console
    if (process.env.NODE_ENV === 'development') {
      console.log(`Forwarding ${events.length} analytics events to backend`);
    }
    
    try {
      // Forward events to backend analytics service
      // The endpoint for analytics event collection should be available in the API config
      // If not explicitly defined, we can construct it from the API_BASE_URL
      const analyticsEndpoint = `${API_BASE_URL}/analytics/events`;
      
      const response = await axios.post(analyticsEndpoint, { events }, {
        timeout: 5000 // 5 second timeout, since analytics shouldn't block the UI
      });
      
      return NextResponse.json({ 
        success: true, 
        eventsReceived: events.length,
        backendResponse: response.data
      });
    } catch (error) {
      // Log error but don't fail the request - analytics errors shouldn't affect user experience
      console.error('Error forwarding analytics to backend:', error);
      
      // Still return success to the client to avoid disrupting the application
      return NextResponse.json({ 
        success: true,
        eventsReceived: events.length,
        backendError: process.env.NODE_ENV === 'development' ? String(error) : 'Analytics service unavailable'
      });
    }
  } catch (error) {
    console.error('Analytics POST parsing error:', error);
    return NextResponse.json({ error: 'Analytics processing error' }, { status: 500 });
  }
}

/**
 * GET handler to retrieve analytics summary
 * Proxies to backend analytics service for data retrieval
 */
export async function GET(request: NextRequest) {
  try {
    // Pass through query parameters to the backend
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'summary';
    const timeframe = searchParams.get('timeframe') || '7d'; // default to 7 days
    
    try {
      // Forward to backend analytics service
      // The endpoint for analytics data retrieval
      const analyticsEndpoint = `${API_BASE_URL}/analytics/data`;
      
      const response = await axios.get(analyticsEndpoint, {
        params: {
          format,
          timeframe
        },
        timeout: 10000 // 10 second timeout
      });
      
      // Forward the backend response directly
      return NextResponse.json(response.data);
    } catch (error: any) {
      // Handle errors from the backend
      if (error.response) {
        // The backend service returned an error response
        return NextResponse.json(
          { 
            error: error.response.data.error || 'Analytics service error',
            details: process.env.NODE_ENV === 'development' ? error.response.data : undefined
          },
          { status: error.response.status || 500 }
        );
      }
      
      // Network error, timeout, etc
      console.error('Analytics GET error:', error);
      return NextResponse.json(
        { error: 'Failed to connect to analytics service' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Analytics GET error:', error);
    return NextResponse.json({ error: 'Analytics retrieval error' }, { status: 500 });
  }
}
