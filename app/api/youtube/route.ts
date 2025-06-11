import { NextResponse } from 'next/server';
import { ENDPOINTS } from '@/lib/api-config';
import axios from 'axios';

// Types for YouTube API responses
interface YouTubeSearchResult {
  kind: string;
  etag: string;
  id: {
    kind: string;
    videoId: string;
  };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
      high: { url: string; width: number; height: number };
    };
    channelTitle: string;
    liveBroadcastContent: string;
    publishTime: string;
  };
}

// Transformed response for our frontend
interface VideoResult {
  id: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  url: string;
  description: string;
  publishedAt: string;
}

// Config for Edge runtime
export const runtime = 'edge';

/**
 * YouTube API search endpoint that proxies to backend YouTube service
 * 
 * @param request The incoming request with search parameters
 * @returns A JSON response with video results
 */
export async function GET(request: Request) {
  // Get the search query and optional parameters from the URL
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const maxResults = parseInt(searchParams.get('maxResults') || '3', 10);
  const channelId = searchParams.get('channelId');
  const videoId = searchParams.get('videoId');
  
  // Validate required parameters for search
  if (!query && !channelId && !videoId) {
    return NextResponse.json(
      { error: 'Missing required parameter: q (search query) or channelId or videoId' },
      { status: 400 }
    );
  }
  
  try {
    let endpoint;
    let params = {};
    
    // Determine which endpoint to use based on provided parameters
    if (videoId) {
      // Get specific video details
      endpoint = ENDPOINTS.YOUTUBE.VIDEO(videoId);
    } else if (channelId) {
      // Get channel videos
      endpoint = ENDPOINTS.YOUTUBE.CHANNEL(channelId);
      params = { maxResults };
    } else {
      // Search for videos
      endpoint = ENDPOINTS.YOUTUBE.SEARCH;
      params = { q: query, maxResults };
    }
    
    // Fetch from backend YouTube service
    const response = await axios.get(endpoint, {
      params,
      timeout: 15000 // 15 second timeout
    });
    
    return NextResponse.json(response.data);
    
  } catch (error: any) {
    console.error('Error accessing YouTube service:', error);
    
    // Check if this is a response error or network error
    if (error.response) {
      // The backend service returned an error response
      return NextResponse.json(
        { 
          error: error.response.data.error || 'YouTube service error',
          details: process.env.NODE_ENV === 'development' ? error.response.data : undefined
        },
        { status: error.response.status || 500 }
      );
    }
    
    // Network error, timeout, etc
    return NextResponse.json(
      { error: 'Failed to connect to YouTube service' },
      { status: 503 }
    );
  }
}
