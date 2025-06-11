import { NextResponse } from 'next/server';
import { ENDPOINTS } from '@/lib/api-config';
import axios from 'axios';

// Config for Edge runtime
export const runtime = 'edge';

/**
 * POST handler for batch storing documents in the vector database
 * Acts as a proxy to the backend vector batch service
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { documents, namespace = 'bible-verses' } = body;
    
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid required parameter: documents' },
        { status: 400 }
      );
    }
    
    // Forward to the backend vector batch endpoint
    const response = await axios.post(ENDPOINTS.VECTOR.BATCH, {
      documents,
      namespace
    }, {
      timeout: 30000 // 30 second timeout for potentially large batches
    });
    
    // Return the response directly
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error batch storing documents in vector database:', error);
    
    // Handle error response
    return NextResponse.json({ 
      error: 'Failed to batch store documents in vector database',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 });
  }
}
