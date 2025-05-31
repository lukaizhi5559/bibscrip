import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Bookmark, Share2 } from 'lucide-react';
import { ReferenceLinks } from '@/components/reference-links';

interface TopicVerse {
  reference: string;
  text: string;
  translation: string;
}

interface TopicCardProps {
  topic: string;
  summary: string;
  keyVerses: TopicVerse[];
  relatedTopics?: string[];
  categories?: string[];
}

/**
 * Component that displays a "What does the Bible say about..." topic card
 * with AI summary and key verses
 */
export function TopicCard({
  topic,
  summary,
  keyVerses,
  relatedTopics = [],
  categories = [],
}: TopicCardProps) {
  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="text-xl">What does the Bible say about {topic}?</CardTitle>
            <CardDescription className="mt-1">
              Summary based on Scripture references
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {categories.map(category => (
              <Badge key={category} variant="secondary">
                {category}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {/* AI Summary */}
        <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
          <p>{summary}</p>
        </div>
        
        {/* Key Scripture References */}
        <div className="space-y-4 mt-6">
          <h3 className="text-lg font-medium">Key Scripture References</h3>
          
          {keyVerses.map(verse => (
            <div key={verse.reference} className="py-3 border-b border-muted last:border-0">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{verse.reference}</h4>
                <Badge variant="outline">{verse.translation}</Badge>
              </div>
              
              <blockquote className="mt-2 pl-4 border-l-2 border-muted-foreground/30 italic text-muted-foreground">
                {verse.text}
              </blockquote>
              
              <ReferenceLinks 
                passage={verse.reference} 
                translations={[verse.translation]}
              />
            </div>
          ))}
        </div>
        
        {/* Related Topics */}
        {relatedTopics.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Related Topics</h3>
            <div className="flex flex-wrap gap-2">
              {relatedTopics.map(relatedTopic => (
                <Button key={relatedTopic} variant="outline" size="sm">
                  {relatedTopic}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        {/* Read more links */}
        <div className="mt-6 pt-4 border-t border-muted flex flex-col sm:flex-row gap-2">
          <Button variant="secondary">
            <Clock className="h-4 w-4 mr-2" />
            Read Daily Devotional
          </Button>
          <Button variant="outline">
            Watch Sermon Videos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
