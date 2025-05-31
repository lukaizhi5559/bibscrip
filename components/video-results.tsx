import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Play, Eye, Loader2 } from 'lucide-react';

interface VideoResult {
  id: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  url: string;
  description?: string;
  publishedAt: string;
}

interface VideoResultsProps {
  query: string;
  maxResults?: number;
  autoFetch?: boolean;
}

/**
 * Component that fetches and displays relevant YouTube videos for a Bible query
 */
export function VideoResults({ 
  query, 
  maxResults = 3,
  autoFetch = false
}: VideoResultsProps) {
  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  
  // Function to fetch videos from the YouTube API
  async function fetchVideos() {
    if (!query) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // This would be a call to your backend API that handles the YouTube API key
      const response = await fetch(`/api/youtube?q=${encodeURIComponent(query)}&maxResults=${maxResults}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }
      
      const data = await response.json();
      setVideos(data.items || []);
      setExpanded(true);
    } catch (err: any) {
      setError(err.message || 'Error fetching videos');
      console.error('Error fetching YouTube videos:', err);
    } finally {
      setLoading(false);
    }
  }
  
  // Auto-fetch videos if autoFetch is true
  useEffect(() => {
    if (autoFetch && query) {
      fetchVideos();
    }
  }, [query, autoFetch]);
  
  if (!query) return null;
  
  // Show fetch button if not auto-fetching and not expanded
  if (!autoFetch && !expanded && !loading) {
    return (
      <div className="mt-4">
        <Button 
          variant="secondary" 
          onClick={fetchVideos}
          className="flex items-center gap-2"
        >
          <Play className="h-4 w-4" />
          Show Relevant Teaching Videos
        </Button>
      </div>
    );
  }
  
  // Show loading state
  if (loading) {
    return (
      <div className="mt-4 flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading relevant videos...</span>
      </div>
    );
  }
  
  // Show error if any
  if (error) {
    return (
      <div className="mt-4 text-destructive">
        <p>Error loading videos: {error}</p>
        <Button 
          variant="outline" 
          onClick={fetchVideos} 
          className="mt-2"
        >
          Try Again
        </Button>
      </div>
    );
  }
  
  // No videos found
  if (expanded && videos.length === 0) {
    return (
      <div className="mt-4 text-muted-foreground">
        <p>No relevant videos found for "{query}"</p>
        <Button 
          variant="outline" 
          onClick={fetchVideos} 
          className="mt-2"
        >
          Try Again
        </Button>
      </div>
    );
  }
  
  // Show videos
  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Teaching Videos</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setExpanded(false)}
          className="text-muted-foreground text-xs"
        >
          Hide Videos
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <Card key={video.id} className="overflow-hidden">
            <div className="relative aspect-video bg-muted">
              <img 
                src={video.thumbnail} 
                alt={video.title}
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Button 
                  variant="secondary"
                  size="sm"
                  onClick={() => window.open(`https://youtube.com/watch?v=${video.id}`, '_blank')}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" /> Watch
                </Button>
              </div>
            </div>
            
            <CardHeader className="p-3">
              <CardTitle className="text-sm line-clamp-2">{video.title}</CardTitle>
              <CardDescription className="text-xs">{video.channelTitle}</CardDescription>
            </CardHeader>
            
            <CardFooter className="p-3 pt-0 flex justify-between">
              <span className="text-xs text-muted-foreground">
                {new Date(video.publishedAt).toLocaleDateString()}
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.open(`https://youtube.com/watch?v=${video.id}`, '_blank')}
                className="h-7 px-2"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
