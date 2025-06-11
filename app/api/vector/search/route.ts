import { NextResponse } from 'next/server';
import { ENDPOINTS } from '@/lib/api-config';
import axios from 'axios';

// Config for Edge runtime
export const runtime = 'edge';

/**
 * POST handler for searching the vector database
 * Acts as a proxy to the backend vector search service
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, namespace = 'bible-verses', topK = 5, minScore = 0.6 } = body;
    
    if (!query) {
      return NextResponse.json(
        { error: 'Missing required parameter: query' },
        { status: 400 }
      );
    }
    
    // Forward to the backend vector search endpoint
    const response = await axios.post(ENDPOINTS.VECTOR.SEARCH, {
      query,
      namespace,
      topK,
      minScore
    }, {
      timeout: 10000 // 10 second timeout
    });
    
    // Return the search results directly
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error searching vector database:', error);
    
    // Handle error response
    return NextResponse.json({ 
      error: 'Failed to search vector database',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 });
  }
}
