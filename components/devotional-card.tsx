import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Bookmark, Share2, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { ReferenceLinks } from '@/components/reference-links';
import { ExpandableText } from '@/components/expandable-text';

interface DevotionalVerse {
  reference: string;
  text: string;
  translation: string;
}

interface DevotionalCardProps {
  title: string;
  date: string;
  content: string;
  mainVerse: DevotionalVerse;
  additionalVerses?: DevotionalVerse[];
  categories?: string[];
  author?: string;
  isPersonalized?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  onSave?: () => void;
  onShare?: () => void;
}

/**
 * Component that displays a daily devotional with Bible verses and reflection
 */
export function DevotionalCard({
  title,
  date,
  content,
  mainVerse,
  additionalVerses = [],
  categories = [],
  author = 'BibScrip',
  isPersonalized = false,
  onPrevious,
  onNext,
  onSave,
  onShare,
}: DevotionalCardProps) {
  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{date}</span>
              {isPersonalized && (
                <Badge variant="secondary" className="ml-2">
                  <Heart className="h-3 w-3 mr-1 fill-current" />
                  Personalized
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription className="mt-1">
              Daily devotional by {author}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onSave}>
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {categories.map(category => (
              <Badge key={category} variant="outline">
                {category}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Main Verse */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="font-medium flex items-center justify-between">
            <span>{mainVerse.reference}</span>
            <Badge variant="outline">{mainVerse.translation}</Badge>
          </h3>
          <div className="mt-2">
            <ExpandableText
              text={mainVerse.text}
              maxLength={150}
              textClassName="pl-4 border-l-2 border-muted-foreground/30 italic text-muted-foreground"
              expandButtonClassName="text-xs mt-1"
            />
          </div>
          <div className="mt-2">
            <ReferenceLinks 
              passage={mainVerse.reference} 
              translations={[mainVerse.translation || 'ESV']} 
            />
          </div>
        </div>
        
        {/* Devotional Content */}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ExpandableText
            text={content}
            maxLength={250}
            textClassName="text-base"
            expandButtonClassName="text-sm mt-2"
          />
        </div>
        
        {/* Additional Verses */}
        {additionalVerses.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-3">Additional Scripture References</h3>
            <div className="space-y-3">
              {additionalVerses.map(verse => (
                <div key={verse.reference} className="border border-muted rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{verse.reference}</h4>
                    <Badge variant="outline">{verse.translation}</Badge>
                  </div>
                  <div className="mt-2">
                    <ExpandableText
                      text={verse.text}
                      maxLength={120}
                      textClassName="pl-4 border-l-2 border-muted-foreground/30 italic text-muted-foreground"
                      expandButtonClassName="text-xs mt-1"
                    />
                  </div>
                  <div className="mt-2">
                    <ReferenceLinks 
                      passage={verse.reference} 
                      translations={[verse.translation || 'ESV']} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Prayer Prompt */}
        <div className="bg-primary/10 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Prayer Prompt</h3>
          <p className="text-sm">
            Take a moment to reflect on today's devotional. How might God be speaking to you through this passage?
            Consider journaling your thoughts or praying about how this applies to your life today.
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="flex items-center justify-between border-t border-muted pt-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onPrevious}
          disabled={!onPrevious}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <Button variant="secondary" size="sm">
          <span className="sr-only sm:not-sr-only sm:inline-block">Start Your Own Devotional</span>
          <span className="sm:sr-only">Devotional</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onNext}
          disabled={!onNext}
          className="flex items-center gap-1"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
