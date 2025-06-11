"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BibleVerse as OriginalBibleVerse } from '@/utils/bible';
import { bibleService } from '@/utils/bible-service';
import { VerseExplainer } from './verse-explainer';

// Translation options will be loaded from API
const DEFAULT_TRANSLATIONS = [
  { id: 'ESV', name: 'English Standard Version', abbreviation: 'ESV' },
  { id: 'KJV', name: 'King James Version', abbreviation: 'KJV' },
  { id: 'NASB', name: 'New American Standard Bible', abbreviation: 'NASB' },
  { id: 'NLT', name: 'New Living Translation', abbreviation: 'NLT' },
  { id: 'NIV', name: 'New International Version', abbreviation: 'NIV' },
];

// Use the original BibleVerse type directly
type BibleVerse = OriginalBibleVerse;

export function BibleReader() {
  const [passageRef, setPassageRef] = useState<string>('John 3:16');
  const [translation, setTranslation] = useState<string>('ESV');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [currentChapter, setCurrentChapter] = useState<string>('');
  const [currentBook, setCurrentBook] = useState<string>('');
  const [showExplainer, setShowExplainer] = useState<boolean>(false);
  const [selectedVerse, setSelectedVerse] = useState<BibleVerse | null>(null);
  const [translations, setTranslations] = useState<{id: string, name: string, abbreviation: string}[]>(DEFAULT_TRANSLATIONS);

  // Load the initial verse and available translations on component mount
  useEffect(() => {
    fetchBiblePassage(passageRef);
    loadTranslations();
  }, []);
  
  // Load available translations from the API
  const loadTranslations = async () => {
    try {
      console.log('Fetching Bible translations...');
      const translationData = await bibleService.getTranslations();
      console.log('Translation API response:', translationData);
      
      if (translationData && Array.isArray(translationData) && translationData.length > 0) {
        console.log('Setting translations from API:', translationData);
        console.log('First translation object sample:', translationData[0]);
        
        // Check if translationData has the expected structure
        // Filter to only include translations with abbreviations
        const standardTranslations = translationData
          .filter(t => {
            // Check if this translation has an abbreviation field or we can extract one
            return t.abbreviation || 
                   (t.id && t.id.length <= 6) || // Short IDs like NIV, ESV, KJV
                   false;
          })
          .map(t => {
            return { 
              id: t.id, 
              name: t.name || t.description || '',
              abbreviation: t.abbreviation || t.id.substring(0, 6)
            };
          });
          
        console.log('Filtered standard translations:', standardTranslations);
        
        // If we found standard translations, use those, otherwise use the raw data
        if (standardTranslations.length > 0) {
          setTranslations(standardTranslations);
        } else {
          // Just use first 10 translations if there are too many
          const limitedTranslations = translationData.slice(0, 10);
          setTranslations(limitedTranslations.map(t => ({
            id: t.id,
            name: t.name || t.description || '',
            abbreviation: t.abbreviation || t.id.substring(0, 6)
          })));
        }
      } else {
        console.warn('Translation data was empty or invalid, using defaults');
        console.log('Translation data received:', translationData);
      }
    } catch (err) {
      console.error('Error loading translations:', err);
      console.log('Falling back to default translations');
      // Fall back to default translations if API fails
    }
  };

  const fetchBiblePassage = async (passageRef: string) => {
    setLoading(true);
    setError(null);

    try {
      // Extract book and chapter info to update navigation state
      const parts = passageRef.split(' ');
      let book = parts[0];
      let chapter = '1';
      let isVerse = false;
      
      // Handle multi-word book names (e.g., "1 Corinthians")
      if (parts.length > 1 && !parts[1].includes(':')) {
        book = `${parts[0]} ${parts[1]}`;
        if (parts.length > 2 && parts[2].includes(':')) {
          const chapterVerse = parts[2].split(':');
          chapter = chapterVerse[0];
          isVerse = true;
        } else if (parts.length > 2) {
          chapter = parts[2];
        }
      } else if (parts.length > 1) {
        const chapterVerse = parts[1].split(':');
        chapter = chapterVerse[0];
        isVerse = parts[1].includes(':');
      }
      
      setCurrentBook(book);
      setCurrentChapter(chapter);
      
      let result;
      
      // Check if we're looking up a specific verse or just a chapter
      if (isVerse) {
        // If it's a specific verse or passage, use getVerse or getPassage
        if (passageRef.includes('-') || passageRef.includes(',')) {
          // Multiple verses (passage)
          const passage = await bibleService.getPassage(passageRef, translation);
          if (passage && passage.verses) {
            setVerses(passage.verses);
          } else {
            throw new Error('No verses found');
          }
        } else {
          // Single verse
          result = await bibleService.getVerse(passageRef, translation);
          setVerses([result]);
        }
      } else {
        // If it's a chapter reference, use getChapter
        const chapterNum = parseInt(chapter);
        if (!isNaN(chapterNum)) {
          const chapterData = await bibleService.getChapter(book, chapterNum, translation);
          if (chapterData && chapterData.verses) {
            setVerses(chapterData.verses);
          } else {
            throw new Error('No verses found in chapter');
          }
        } else {
          throw new Error('Invalid chapter number');
        }
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
                <SelectValue placeholder="ESV" />
              </SelectTrigger>
              <SelectContent>
                {translations.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.abbreviation} - {t.name}
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
                  {verses.filter(verse => verse && verse.ref).map((verse, index) => (
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
