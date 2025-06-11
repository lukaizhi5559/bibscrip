import { NextResponse } from 'next/server';
import { ENDPOINTS } from '@/lib/api-config';
import axios from 'axios';

// Config for Edge runtime
export const runtime = 'edge';

/**
 * GET handler for retrieving vector database status
 * Acts as a proxy to the backend vector service
 */
export async function GET() {
  try {
    const response = await axios.get(ENDPOINTS.VECTOR.STATUS, {
      timeout: 5000 // 5 second timeout
    });
    
    // Return the response data directly
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error checking vector database status:', error);
    
    // In case of error, return a fallback status that tells the frontend the service is unavailable
    return NextResponse.json({
      data: {
        available: false,
        mode: 'unavailable'
      },
      message: 'Failed to connect to vector database'
    });
  }
}
