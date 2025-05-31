import { NextResponse } from 'next/server';

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

interface YouTubeSearchResponse {
  kind: string;
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: YouTubeSearchResult[];
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

/**
 * YouTube API search endpoint that fetches relevant Bible teaching videos
 * 
 * @param request The incoming request with search parameters
 * @returns A JSON response with video results
 */
export async function GET(request: Request) {
  // Get the search query and optional parameters from the URL
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const maxResults = parseInt(searchParams.get('maxResults') || '3', 10);
  
  // Validate required parameters
  if (!query) {
    return NextResponse.json(
      { error: 'Missing required parameter: q (search query)' },
      { status: 400 }
    );
  }
  
  if (!process.env.YOUTUBE_API_KEY) {
    console.error('YOUTUBE_API_KEY environment variable not set');
    return NextResponse.json(
      { error: 'YouTube API is not configured' },
      { status: 500 }
    );
  }
  
  try {
    // Append "Bible" to queries that don't already include it
    // to improve search relevance for biblical content
    let enhancedQuery = query;
    if (!query.toLowerCase().includes('bible') && 
        !query.toLowerCase().includes('scripture') &&
        !query.toLowerCase().includes('verse')) {
      enhancedQuery = `${query} Bible teaching`;
    }
    
    // Fetch videos from YouTube API
    const response = await fetch(
      `https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(enhancedQuery)}&maxResults=${maxResults}&type=video&relevanceLanguage=en&videoDuration=medium&key=${process.env.YOUTUBE_API_KEY}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('YouTube API error:', errorText);
      return NextResponse.json(
        { error: `YouTube API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }
    
    const data: YouTubeSearchResponse = await response.json();
    
    // Transform the YouTube response to our simpler format
    const videos: VideoResult[] = data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.high.url,
      url: `https://youtube.com/watch?v=${item.id.videoId}`,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt,
    }));
    
    return NextResponse.json({ items: videos });
    
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos from YouTube' },
      { status: 500 }
    );
  }
}
