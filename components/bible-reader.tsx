"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getBibleVerse, BibleVerse as OriginalBibleVerse } from '@/utils/bible';
import { VerseExplainer } from './verse-explainer';

const TRANSLATIONS = [
  { id: 'NIV', name: 'New International Version' },
  { id: 'ESV', name: 'English Standard Version' },
  { id: 'KJV', name: 'King James Version' },
  { id: 'NASB', name: 'New American Standard Bible' },
  { id: 'NLT', name: 'New Living Translation' }
];

// Use the original BibleVerse type directly
type BibleVerse = OriginalBibleVerse;

export function BibleReader() {
  const [passageRef, setPassageRef] = useState<string>('John 3:16');
  const [translation, setTranslation] = useState<string>('NIV');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [currentChapter, setCurrentChapter] = useState<string>('');
  const [currentBook, setCurrentBook] = useState<string>('');
  const [showExplainer, setShowExplainer] = useState<boolean>(false);
  const [selectedVerse, setSelectedVerse] = useState<BibleVerse | null>(null);

  // Load the initial verse on component mount
  useEffect(() => {
    fetchBiblePassage(passageRef);
  }, []);

  const fetchBiblePassage = async (passageRef: string) => {
    setLoading(true);
    setError(null);

    try {
      // If the reference contains only a book name or a book and chapter, fetch the entire chapter
      let refToFetch = passageRef;
      
      // Extract book and chapter info to update navigation state
      const parts = passageRef.split(' ');
      let book = parts[0];
      let chapter = '1';
      
      // Handle multi-word book names (e.g., "1 Corinthians")
      if (parts.length > 1 && !parts[1].includes(':')) {
        book = `${parts[0]} ${parts[1]}`;
        if (parts.length > 2 && parts[2].includes(':')) {
          const chapterVerse = parts[2].split(':');
          chapter = chapterVerse[0];
        } else if (parts.length > 2) {
          chapter = parts[2];
        }
      } else if (parts.length > 1) {
        const chapterVerse = parts[1].split(':');
        chapter = chapterVerse[0];
      }
      
      setCurrentBook(book);
      setCurrentChapter(chapter);

      const result = await getBibleVerse(refToFetch, translation);
      if (result) {
        // If we get a single verse, convert it to an array for consistent state
        if (!Array.isArray(result)) {
          setVerses([result]);
        } else {
          setVerses(result);
        }
      } else {
        throw new Error('Unable to find the requested passage');
      }
    } catch (err) {
      console.error('Error fetching Bible passage:', err);
      setError('Could not load the Bible passage. Please try another reference.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchBiblePassage(passageRef);
  };

  const navigateChapter = (direction: 'prev' | 'next') => {
    const currentChapterNum = parseInt(currentChapter);
    if (isNaN(currentChapterNum)) return;
    
    const newChapter = direction === 'prev' 
      ? Math.max(1, currentChapterNum - 1)
      : currentChapterNum + 1;
    
    setPassageRef(`${currentBook} ${newChapter}`);
    fetchBiblePassage(`${currentBook} ${newChapter}`);
  };

  const handleTranslationChange = (value: string) => {
    setTranslation(value);
    fetchBiblePassage(passageRef);
  };

  const handleVerseClick = (verse: BibleVerse) => {
    setSelectedVerse(verse);
    setShowExplainer(true);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Bible Reader
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex items-center gap-3 mb-4">
            <Input
              value={passageRef}
              onChange={(e) => setPassageRef(e.target.value)}
              placeholder="Enter reference (e.g., John 3:16)"
              className="flex-1"
            />
            <Select value={translation} onValueChange={handleTranslationChange}>
              <SelectTrigger className="w-24">
                <SelectValue placeholder="NIV" />
              </SelectTrigger>
              <SelectContent>
                {TRANSLATIONS.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          {loading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}

          {error && <div className="text-destructive bg-destructive/10 p-3 rounded">{error}</div>}

          {!loading && !error && (
            <>
              <div className="flex justify-between items-center mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateChapter('prev')}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <span className="font-medium text-center">
                  {currentBook} {currentChapter}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateChapter('next')}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              <TooltipProvider>
                <div className="space-y-4">
                  {verses.map((verse, index) => (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <div
                          className="bible-verse group relative cursor-pointer bg-card hover:bg-accent p-3 rounded-md"
                          onClick={() => handleVerseClick(verse)}
                        >
                          <div className="font-semibold text-primary mb-1">
                            {verse.ref} ({verse.translation})
                          </div>
                          <div>{verse.text}</div>
                          {verse.text.includes('unavailable') && (
                            <div className="mt-2">
                              <a 
                                href={verse.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline text-sm flex items-center"
                              >
                                View on BibleGateway
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            </div>
                          )}
                          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm">
                              Explain
                            </Button>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Click to get AI explanation</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </TooltipProvider>
            </>
          )}
        </CardContent>
      </Card>

      {showExplainer && selectedVerse && (
        <VerseExplainer 
          verse={selectedVerse} 
          onClose={() => setShowExplainer(false)} 
        />
      )}
    </div>
  );
}
