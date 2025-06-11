import { NextRequest, NextResponse } from 'next/server';
import { ENDPOINTS } from '@/lib/api-config';
import axios from 'axios';

// Config for Edge runtime
export const runtime = 'edge';

/**
 * GET handler for retrieving cached items
 * Acts as a proxy to the backend cache service
 */
export async function GET(request: NextRequest) {
  try {
    // Get the key from the query string
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    if (!key) {
      return NextResponse.json({ error: 'No cache key provided' }, { status: 400 });
    }
    
    // Forward to backend cache service
    try {
      const response = await axios.get(ENDPOINTS.CACHE.GET(key), {
        timeout: 10000 // 10 second timeout
      });
      
      // Forward the response directly
      return NextResponse.json(response.data, {
        status: 200,
        headers: {
          'Cache-Control': response.headers['cache-control'] || 'no-store',
          'X-Cache': response.headers['x-cache'] || 'BACKEND'
        }
      });
    } catch (error: any) {
      // Handle axios errors
      if (error.response) {
        // Backend returned an error response
        return NextResponse.json({ 
          error: error.response.data.error || 'Cache miss',
          details: process.env.NODE_ENV === 'development' ? error.response.data : undefined
        }, { 
          status: error.response.status || 404,
          headers: {
            'Cache-Control': 'no-cache',
            'X-Cache': 'MISS'
          }
        });
      } else {
        // Network error, timeout, etc.
        console.error('Cache GET network error:', error);
        return NextResponse.json({ error: 'Cache service unavailable' }, { status: 503 });
      }
    }
  } catch (error) {
    console.error('Cache GET error:', error);
    return NextResponse.json({ error: 'Cache access error' }, { status: 500 });
  }
}

/**
 * POST handler for storing cache items
 * Acts as a proxy to the backend cache service
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value, ttl = 86400000 } = body; // Default TTL: 24 hours
    
    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 });
    }
    
    // Forward to backend cache service
    try {
      const response = await axios.post(ENDPOINTS.CACHE.SET(key), {
        value,
        ttl
      }, {
        timeout: 10000 // 10 second timeout
      });
      
      // Forward the response directly
      return NextResponse.json(response.data, { status: 200 });
    } catch (error: any) {
      // Handle axios errors
      if (error.response) {
        // Backend returned an error response
        return NextResponse.json({ 
          error: error.response.data.error || 'Cache write error',
          details: process.env.NODE_ENV === 'development' ? error.response.data : undefined
        }, { 
          status: error.response.status || 500
        });
      } else {
        // Network error, timeout, etc.
        console.error('Cache POST network error:', error);
        return NextResponse.json({ error: 'Cache service unavailable' }, { status: 503 });
      }
    }
  } catch (error) {
    console.error('Cache POST error:', error);
    return NextResponse.json({ error: 'Cache write error' }, { status: 500 });
  }
}

/**
 * DELETE handler for clearing cache
 * Acts as a proxy to the backend cache service
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { namespace, key } = body;
    
    if (!key && !namespace) {
      // Full cache clear - be careful with this operation
      try {
        const response = await axios.delete(`${ENDPOINTS.CACHE.STATS}`, {
          timeout: 10000 // 10 second timeout
        });
        
        return NextResponse.json(response.data, { status: 200 });
      } catch (error: any) {
        console.error('Cache full clear error:', error);
        return handleDeleteError(error);
      }
    } else if (key) {
      // Delete specific key
      try {
        const response = await axios.delete(ENDPOINTS.CACHE.DELETE(key), {
          timeout: 10000 // 10 second timeout
        });
        
        return NextResponse.json(response.data, { status: 200 });
      } catch (error: any) {
        console.error(`Cache key delete error for ${key}:`, error);
        return handleDeleteError(error);
      }
    } else if (namespace) {
      // Delete namespace - might need custom handling on backend
      try {
        const response = await axios.delete(`${ENDPOINTS.CACHE.DELETE(namespace + ':*')}`, {
          timeout: 10000 // 10 second timeout
        });
        
        return NextResponse.json(response.data, { status: 200 });
      } catch (error: any) {
        console.error(`Cache namespace delete error for ${namespace}:`, error);
        return handleDeleteError(error);
      }
    }
    
    return NextResponse.json({ error: 'Invalid delete request' }, { status: 400 });
  } catch (error) {
    console.error('Cache DELETE parsing error:', error);
    return NextResponse.json({ error: 'Cache delete error' }, { status: 500 });
  }
}

/**
 * Helper function to handle delete errors
 */
function handleDeleteError(error: any): NextResponse {
  if (error.response) {
    // Backend returned an error response
    return NextResponse.json({ 
      error: error.response.data.error || 'Cache delete error',
      details: process.env.NODE_ENV === 'development' ? error.response.data : undefined
    }, { 
      status: error.response.status || 500
    });
  } else {
    // Network error, timeout, etc.
    return NextResponse.json({ error: 'Cache service unavailable' }, { status: 503 });
  }
}
