"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, BookOpen, X, History, Heart, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BibleVerse as OriginalBibleVerse } from '@/utils/bible';

type BibleVerse = OriginalBibleVerse;

interface VerseExplanation {
  theological: string;
  historical: string;
  application: string;
}

interface VerseExplainerProps {
  verse: BibleVerse;
  onClose: () => void;
}

export function VerseExplainer({ verse, onClose }: VerseExplainerProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<VerseExplanation | null>(null);
  const [activeTab, setActiveTab] = useState<string>('theological');

  useEffect(() => {
    // Fetch the AI explanation when the component mounts
    fetchExplanation();
  }, [verse]); // Re-fetch if verse changes

  const fetchExplanation = async () => {
    setLoading(true);
    setError(null);

    try {
      // Make API call to your AI endpoint
      const response = await fetch('/api/explain-verse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reference: verse.ref,
          text: verse.text,
          translation: verse.translation,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get verse explanation');
      }

      const data = await response.json();
      
      // Set the explanation data
      setExplanation({
        theological: data.theological || 'No theological explanation available.',
        historical: data.historical || 'No historical context available.',
        application: data.application || 'No application insights available.',
      });
    } catch (err) {
      console.error('Error fetching verse explanation:', err);
      setError('Could not load the explanation. Please try again later.');
      
      // For development/demo purposes, set mock data if API fails
      setExplanation({
        theological: `This verse speaks to the core theological concept of God's love and the sacrifice of Jesus Christ. It encapsulates the gospel message—that God loved humanity so deeply that He gave His only Son as a sacrifice, so that through faith in Him, people can receive eternal life rather than facing judgment for their sins.`,
        historical: `Written by the apostle John around 85-95 AD, this verse appears in a conversation between Jesus and Nicodemus, a Pharisee and member of the Jewish ruling council. In the historical context, the concept of a loving God offering salvation to all people, not just the Jewish nation, was revolutionary. The phrase "whoever believes" would have been particularly significant in a society that emphasized religious ritual and ethnic identity as paths to God.`,
        application: `Today, this verse reminds us that God's love is unconditional and available to everyone. It challenges us to respond to this love with faith and to extend similar love to others. When facing difficult decisions or relationships, we can reflect on how God's sacrificial love should guide our own actions. This verse also comforts us with the promise of eternal life, giving us hope beyond current circumstances.`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Verse Explainer
            </CardTitle>
            <CardDescription>
              {verse.ref} ({verse.translation})
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-muted p-3 rounded-md mb-4 italic">
          "{verse.text}"
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Generating explanation...</span>
          </div>
        ) : error ? (
          <div className="text-destructive bg-destructive/10 p-3 rounded">{error}</div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="theological" className={cn("flex items-center gap-1", 
                activeTab === "theological" ? "text-primary" : "")}>
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Theological Meaning</span>
                <span className="sm:hidden">Theology</span>
              </TabsTrigger>
              <TabsTrigger value="historical" className={cn("flex items-center gap-1", 
                activeTab === "historical" ? "text-primary" : "")}>
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">Historical Context</span>
                <span className="sm:hidden">History</span>
              </TabsTrigger>
              <TabsTrigger value="application" className={cn("flex items-center gap-1", 
                activeTab === "application" ? "text-primary" : "")}>
                <ArrowRight className="h-4 w-4" />
                <span className="hidden sm:inline">Modern Application</span>
                <span className="sm:hidden">Apply</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="theological" className="mt-4">
              <div className="prose dark:prose-invert max-w-none">
                <p>{explanation?.theological}</p>
              </div>
            </TabsContent>
            <TabsContent value="historical" className="mt-4">
              <div className="prose dark:prose-invert max-w-none">
                <p>{explanation?.historical}</p>
              </div>
            </TabsContent>
            <TabsContent value="application" className="mt-4">
              <div className="prose dark:prose-invert max-w-none">
                <p>{explanation?.application}</p>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      <CardFooter className="flex justify-end pt-0">
        <Button variant="outline" size="sm" onClick={() => fetchExplanation()}>
          Refresh Explanation
        </Button>
      </CardFooter>
    </Card>
  );
}
