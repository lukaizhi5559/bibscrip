import { NextResponse } from 'next/server';
import { ENDPOINTS } from '@/lib/api-config';
import axios from 'axios';

// Config for Edge runtime
export const runtime = 'edge';

/**
 * POST handler for storing documents in the vector database
 * Acts as a proxy to the backend vector store service
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, metadata, namespace = 'bible-verses' } = body;
    
    if (!text) {
      return NextResponse.json(
        { error: 'Missing required parameter: text' },
        { status: 400 }
      );
    }
    
    // Forward to the backend vector store endpoint
    const response = await axios.post(ENDPOINTS.VECTOR.STORE, {
      text,
      metadata,
      namespace
    }, {
      timeout: 10000 // 10 second timeout
    });
    
    // Return the response directly
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error storing document in vector database:', error);
    
    // Handle error response
    return NextResponse.json({ 
      error: 'Failed to store document in vector database',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 });
  }
}
