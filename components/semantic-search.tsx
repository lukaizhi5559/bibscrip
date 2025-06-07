"use client";

import React, { useState } from 'react';
import { vectorService, SearchResult } from '../utils/vector-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const SemanticSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError('');
    try {
      const searchResults = await vectorService.searchSimilar(query);
      setResults(searchResults);
      if (searchResults.length === 0) {
        setError('No matching verses found. Try a different query.');
      }
    } catch (err) {
      setError('Failed to search. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="semantic-search w-full">
      <h2 className="text-2xl font-bold mb-4">Semantic Bible Search</h2>
      
      <div className="flex gap-2 mb-4">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask a question about the Bible..."
          className="flex-grow"
        />
        <Button
          onClick={handleSearch}
          disabled={loading}
          variant="default"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Searching...
            </>
          ) : 'Search'}
        </Button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="search-results mt-4 space-y-3">
        {results.map((result) => (
          <Card key={result.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="font-semibold text-primary">
                {result.metadata.reference || 'Unknown reference'}
                {result.metadata.translation && ` (${result.metadata.translation})`}
              </div>
              <div className="mt-2">{result.text}</div>
              <div className="text-sm text-muted-foreground mt-2">
                Relevance: {Math.round(result.score * 100)}%
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SemanticSearch;
