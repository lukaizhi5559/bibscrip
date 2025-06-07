"use client";

import React, { useEffect, useState } from 'react';
import { vectorService, SearchResult } from '../utils/vector-service';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatPassageForUrl } from '@/utils/biblical-helpers';

interface SemanticVerseResultsProps {
  query: string;
  maxResults?: number;
  onVerseSelect?: (verse: SearchResult) => void;
}

export function SemanticVerseResults({ 
  query, 
  maxResults = 8,
  onVerseSelect
}: SemanticVerseResultsProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchSemanticResults() {
      if (!query) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const searchResults = await vectorService.searchSimilar(query, 'bible-verses', maxResults);
        setResults(searchResults);
      } catch (err) {
        console.error('Error fetching semantic results:', err);
        setError('Failed to fetch semantic search results');
      } finally {
        setLoading(false);
      }
    }
    
    fetchSemanticResults();
  }, [query, maxResults]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3">Finding semantically similar verses...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="py-4 px-2">
        <div className="bg-destructive/15 text-destructive p-3 rounded-md">
          {error}. Please try again later.
        </div>
      </div>
    );
  }
  
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="text-muted-foreground mb-4">No semantically similar verses found for your query.</div>
        <Button variant="outline" onClick={() => setLoading(true)}>
          Try Again
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {results.map((result) => (
        <Card 
          key={result.id} 
          className="overflow-hidden border-l-4 border-l-primary hover:bg-accent/50 transition-colors"
        >
          <CardContent className="p-4">
            <div className="font-semibold text-primary mb-1 flex items-center justify-between">
              <span>
                {result.metadata.reference || 'Unknown reference'}
                {result.metadata.translation && ` (${result.metadata.translation})`}
              </span>
              {onVerseSelect && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onVerseSelect(result)}
                  className="h-8 px-2"
                >
                  Select
                </Button>
              )}
            </div>
            <div className="mb-2">{result.text}</div>
            <div className="flex justify-between items-center mt-2">
              <div className="text-xs text-muted-foreground">
                Semantic relevance: {Math.round(result.score * 100)}%
              </div>
              {result.metadata.reference && (
                <Link 
                  href={`https://www.biblegateway.com/passage/?search=${formatPassageForUrl(result.metadata.reference)}`} 
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="ghost" size="sm" className="h-6 px-2">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    <span className="text-xs">View</span>
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
