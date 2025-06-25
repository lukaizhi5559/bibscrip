"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, BookOpen, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BibleVerse as OriginalBibleVerse } from '@/utils/bible';
import { bibleService } from '@/utils/bible-service';
import { VerseExplainer } from './verse-explainer';
import { VerseHighlighter } from './verse-highlighter';
import { useToast } from '@/components/ui/use-toast';

// Translation options will be loaded from API
const DEFAULT_TRANSLATIONS = [
  { id: 'ESV', name: 'English Standard Version', abbreviation: 'ESV' },
  { id: 'KJV', name: 'King James Version', abbreviation: 'KJV' },
  { id: 'NASB', name: 'New American Standard Bible', abbreviation: 'NASB' },
  { id: 'NLT', name: 'New Living Translation', abbreviation: 'NLT' },
  { id: 'NIV', name: 'New International Version', abbreviation: 'NIV' },
];

// Define interface for API response structure
interface BibleApiResponse {
  reference?: string;
  translation?: string;
  text?: string;
  content?: string;
  verses?: any[];
  book?: string;
  chapter?: string;
  verse?: string;
  copyright?: string;
  data?: {
    text?: string;
    content?: string;
    reference?: string;
    translation?: string;
  };
  link?: string;
  // Include other fields that might appear in the API response
}

// Helper function to convert API response to BibleVerse format
function mapToBibleVerse(apiVerse: BibleApiResponse | null | undefined, defaultRef: string = '', defaultTranslation: string = 'ESV'): BibleVerse {
  // Debug the API response structure
  console.log('API verse data structure:', JSON.stringify(apiVerse, null, 2));
  
  if (!apiVerse) {
    // Return fallback data if null/undefined
    return {
      ref: defaultRef,
      text: 'Verse text unavailable',
      translation: defaultTranslation,
      link: '',
      source: 'fallback'
    };
  }

  let verseText = '';
  let reference = defaultRef;
  let translationCode = defaultTranslation;

  // Extract verse text from various possible structures
  if (apiVerse.data && typeof apiVerse.data === 'object') {
    const data = apiVerse.data;
    verseText = data.text || data.content || '';
    reference = data.reference || reference;
    translationCode = data.translation || translationCode;
  } else if (apiVerse.text) {
    verseText = apiVerse.text;
    reference = apiVerse.reference || reference;
    translationCode = apiVerse.translation || translationCode;
  } else if (apiVerse.content) {
    verseText = apiVerse.content;
    reference = apiVerse.reference || reference;
    translationCode = apiVerse.translation || translationCode;
  } else if (apiVerse.verses && Array.isArray(apiVerse.verses) && apiVerse.verses.length > 0) {
    verseText = apiVerse.verses
      .map(v => v.text || v.content || '')
      .filter(t => t.trim() !== '')
      .join(' ');
    reference = apiVerse.reference || reference;
    translationCode = apiVerse.translation || translationCode;
  } else if (typeof apiVerse === 'string') {
    // Direct string response
    verseText = apiVerse;
  }

  // Backup check for text property
  if (!verseText && apiVerse.text) {
    verseText = apiVerse.text;
  }
  
  // Extract verse number from the reference
  let verseNumber = '1';
  if (reference.includes(':')) {
    const parts = reference.split(':');
    verseNumber = parts[1].split('-')[0].split(',')[0].trim();
  }
  
  // Check if the verse text already has a bracketed verse number
  const hasVerseNumber = verseText.match(/^\s*\[\d+\]/);
  
  // If it doesn't have a verse number and this is a single verse, add one
  if (!hasVerseNumber && !verseText.match(/\[\d+\]/)) {
    // Add verse number in brackets at the beginning for VerseHighlighter to work
    console.log(`Adding verse number [${verseNumber}] to text for single verse`);
    verseText = `[${verseNumber}] ${verseText}`;
  }
  
  console.log('Final prepared verse text:', verseText);
  
  return {
    ref: reference,
    text: verseText || 'No text available',
    translation: translationCode,
    link: (apiVerse as any).link || '',
    source: 'api'
  };
}

import type { BibleVerse } from '@/utils/bible';

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
  const { toast } = useToast();

  // Load the initial verse and available translations on component mount
  useEffect(() => {
    fetchBiblePassage(passageRef, translation);
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

  const fetchBiblePassage = async (passageRef: string, translation: string = 'ESV') => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Fetching Bible passage:', passageRef, translation);
      
      // Parse the reference to extract book, chapter, and verse information
      let book = '';
      let chapter = '';
      let isVerse = passageRef.includes(':');
      
      // Handle different reference formats (John 3:16, John 3, etc.)
      const parts = passageRef.trim().split(' ');
      
      if (parts.length === 1) {
        // Just a book name provided (e.g., "John")
        book = parts[0];
        chapter = '1'; // Default to chapter 1
      } else if (parts.length === 2) {
        // Basic format like "John 3" or "John 3:16"
        book = parts[0];
        if (parts[1].includes(':')) {
          // It's a verse reference like "John 3:16"
          chapter = parts[1].split(':')[0];
        } else {
          // It's a chapter reference like "John 3"
          chapter = parts[1];
        }
      } else if (parts.length > 2) {
        // Books with multi-word names like "1 Corinthians 3:16"
        book = parts.slice(0, parts.length - 1).join(' ');
        const lastPart = parts[parts.length - 1];
        
        if (lastPart.includes(':')) {
          // It's a verse reference
          chapter = lastPart.split(':')[0];
        } else {
          // It's a chapter reference
          chapter = lastPart;
        }
      }
      
      console.log('Parsed reference - Book:', book, 'Chapter:', chapter, 'IsVerse:', isVerse);
      
      // Update state with current chapter and book
      setCurrentBook(book);
      setCurrentChapter(chapter);
      
      let result;
      
      // Process verse range: John 3:16-18 or John 3:16,18,20
      if (isVerse && (passageRef.includes('-') || passageRef.includes(','))) {
        console.log('Processing verse range:', passageRef, translation);
        
        try {
          // Extract the verse range part (e.g., "16-18" or "16,18,20")
          const verseParts = passageRef.split(':');
          if (verseParts.length < 2) {
            throw new Error('Invalid verse reference format');
          }
          
          const verseRange = verseParts[1].trim();
          let startVerse = 1;
          let endVerse = 999; // Default to a large number
          
          if (verseRange.includes('-')) {
            // Handle hyphen format: "16-18"
            const rangeParts = verseRange.split('-').map(p => parseInt(p.trim()));
            if (rangeParts.length !== 2 || isNaN(rangeParts[0]) || isNaN(rangeParts[1])) {
              throw new Error('Invalid verse range format');
            }
            startVerse = rangeParts[0];
            endVerse = rangeParts[1];
          } else if (verseRange.includes(',')) {
            // Handle comma format: "16,18,20"
            const verseList = verseRange.split(',').map(v => parseInt(v.trim()));
            startVerse = Math.min(...verseList);
            endVerse = Math.max(...verseList);
          } else if (verseRange) {
            // Single verse in the format "John 3:16"
            startVerse = parseInt(verseRange);
            endVerse = startVerse;
          }
          
          console.log(`Verse range parsed: ${startVerse}-${endVerse}`);
          
          // Construct the chapter reference, e.g., "John 3"
          const chapterRef = passageRef.split(':')[0].trim();
          console.log('Fetching full chapter:', chapterRef);
          
          // Extract book and chapter number again to be safe
          const chapterParts = chapterRef.split(' ');
          const chapterNum = parseInt(chapterParts[chapterParts.length - 1]);
          const bookName = chapterParts.slice(0, chapterParts.length - 1).join(' ');
          
          // Fetch the full chapter
          const chapterResult = await bibleService.getChapter(bookName, chapterNum, translation);
          console.log('Chapter API response:', chapterResult);
          
          if (chapterResult && chapterResult.text) {
            console.log('Processing chapter text to extract verses');
            
            // The chapter text contains all verses with bracketed numbers like [1], [2], etc.
            const fullText = chapterResult.text;
            
            // Parse the chapter text to extract individual verses
            // This regex matches verse numbers and their content, considering content runs until next bracket or end
            const verseRegex = /\[(\d+)\]([^\[]*?)(?=\[\d+\]|$)/g;
            let match;
            const parsedVerses: BibleVerse[] = [];
            
            while ((match = verseRegex.exec(fullText)) !== null) {
              const verseNum = parseInt(match[1]);
              const verseText = match[2].trim();
              
              // Check if this verse is in our desired range
              if (verseNum >= startVerse && verseNum <= endVerse) {
                parsedVerses.push({
                  // Keep the original passage reference with range for all verses
                  ref: passageRef,
                  text: `[${verseNum}] ${verseText}`,
                  translation: translation,
                  source: 'api',
                  link: ''
                });
              }
            }
            
            console.log(`Extracted ${parsedVerses.length} verses from chapter text for range ${startVerse}-${endVerse}`);
            
            if (parsedVerses.length > 0) {
              setVerses(parsedVerses);
            } else {
              console.warn(`No verses found in range ${startVerse}-${endVerse}`);
              const fallbackVerse: BibleVerse = {
                ref: passageRef,
                text: `No verses found for the specified range (${startVerse}-${endVerse})`,
                translation: translation,
                link: '',
                source: 'fallback'
              };
              setVerses([fallbackVerse]);
            }
          } else {
            console.warn('No chapter text found in API response');
            const fallbackVerse: BibleVerse = {
              ref: passageRef,
              text: 'Chapter could not be loaded',
              translation: translation,
              link: '',
              source: 'fallback'
            };
            setVerses([fallbackVerse]);
          }
        } catch (err) {
          console.error('Error processing verse range:', err);
          const fallbackVerse: BibleVerse = {
            ref: passageRef,
            text: 'Error loading verse range',
            translation: translation,
            link: '',
            source: 'error'
          };
          setVerses([fallbackVerse]);
        }
      } else if (isVerse) {
        // Single verse
        try {
          console.log('Fetching verse:', passageRef, translation);
          result = await bibleService.getVerse(passageRef, translation);
          console.log('API returned result:', result);
          
          // Add defensive check
          if (!result) {
            console.warn('Bible API returned null or undefined result');
            // Create a fallback verse
            const fallbackVerse: BibleVerse = {
              ref: passageRef,
              text: 'Verse text could not be loaded',
              translation: translation,
              link: '',
              source: 'fallback'
            };
            setVerses([fallbackVerse]);
          } else {
            // Map API response to the expected format using our helper
            const formattedResult = mapToBibleVerse(result as BibleApiResponse, passageRef, translation);
            console.log('Formatted verse result:', formattedResult);
            setVerses([formattedResult]);
          }
        } catch (err) {
          console.error('Error in getVerse:', err);
          // Create a fallback verse on error
          const fallbackVerse: BibleVerse = {
            ref: passageRef,
            text: 'Error loading verse',
            translation: translation,
            link: '',
            source: 'error'
          };
          setVerses([fallbackVerse]);
        }
      } else {
        // If it's a chapter reference, use getChapter
        try {
          const chapterNum = parseInt(chapter);
          if (!isNaN(chapterNum)) {
            console.log(`Fetching chapter: Book="${book}", Chapter=${chapterNum}, Translation=${translation}`);
            
            // Fix: Make sure we're sending the book name only, not book+chapter
            const chapterData = await bibleService.getChapter(book, chapterNum, translation);
            console.log('Chapter API response:', chapterData);
            
            // Debug the raw API data
            if (chapterData) {
              console.log('Chapter data structure:', JSON.stringify(chapterData, null, 2));
            }
            
            // Check if the response has the chapter text directly
            if (chapterData && typeof chapterData.text === 'string' && chapterData.text.trim() !== '') {
              console.log('Found chapter text directly in the response');
                
              // Create a single verse object with the entire chapter text
              const formattedVerse = {
                ref: chapterData.reference || `${book} ${chapterNum}`,
                text: chapterData.text,
                translation: chapterData.translation || translation,
                link: '',
                source: 'api'
              };
                
              console.log('Formatted chapter text:', formattedVerse);
              setVerses([formattedVerse]);
            } 
            // Fallback to array handling if it has verses array
            else if (chapterData && Array.isArray(chapterData.verses) && chapterData.verses.length > 0) {
              // Map API response fields to expected format using our helper
              const formattedVerses = chapterData.verses.map((verse: any, index: number) => {
                // Handle potentially null verse objects
                if (!verse) {
                  return {
                    ref: `${book} ${chapterNum}:${index + 1}`,
                    text: 'Verse text unavailable',
                    translation: translation,
                    link: '',
                    source: 'fallback'
                  };
                }
                
                const verseObj = verse as BibleApiResponse;
                // Create a default reference if one isn't provided
                const defaultRef = `${book} ${chapterNum}:${verseObj.verse || (index + 1)}`;
                return mapToBibleVerse(verseObj, defaultRef, translation);
              });
              console.log('Formatted chapter verses array:', formattedVerses);
              setVerses(formattedVerses);
            } else {
              console.warn('No verses found in chapter or invalid response format');
              // Create a fallback verse
              const fallbackVerse: BibleVerse = {
                ref: `${book} ${chapterNum}`,
                text: 'Chapter verses could not be loaded',
                translation: translation,
                link: '',
                source: 'fallback'
              };
              setVerses([fallbackVerse]);
            }
          } else {
            console.warn('Invalid chapter number:', chapter);
            // Create a fallback verse
            const fallbackVerse: BibleVerse = {
              ref: `${book} ${chapter}`,
              text: 'Invalid chapter number',
              translation: translation,
              link: '',
              source: 'error'
            };
            setVerses([fallbackVerse]);
          }
        } catch (err) {
          console.error('Error fetching chapter:', err);
          // Create a fallback verse on error
          const fallbackVerse: BibleVerse = {
            ref: `${book} ${chapter}`,
            text: 'Error loading chapter',
            translation: translation,
            link: '',
            source: 'error'
          };
          setVerses([fallbackVerse]);
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
    fetchBiblePassage(passageRef, translation);
  };

  const navigateChapter = (direction: 'prev' | 'next') => {
    if (!currentBook || !currentChapter) return;

    const chapterNum = parseInt(currentChapter);
    if (isNaN(chapterNum)) return;

    const newChapterNum = direction === 'prev' ? chapterNum - 1 : chapterNum + 1;
    if (newChapterNum < 1) return; // Can't go below chapter 1

    const newReference = `${currentBook} ${newChapterNum}`;
    setPassageRef(newReference);
    fetchBiblePassage(newReference, translation);
  };

  const handleTranslationChange = (value: string) => {
    setTranslation(value);
    fetchBiblePassage(passageRef);
  };

  const handleVerseClick = (verse: BibleVerse) => {
    setSelectedVerse(verse);
    setShowExplainer(true);
    
    // Inform user about the selection
    toast({
      title: "Verse selected",
      description: `Explaining ${verse.ref} (${verse.translation})`
    });
  };
  
  const handleHighlightedVerseClick = (verseData: {number: string, text: string}) => {
    // Create a verse object from the highlighted verse
    if (verses.length === 1) {
      // If only one passage returned (like a chapter)
      const baseVerse = verses[0];
      const fullRef = `${baseVerse.ref.split(':')[0]}:${verseData.number}`;
      
      const selectedVerse: BibleVerse = {
        ref: fullRef,
        text: verseData.text.trim(),
        translation: baseVerse.translation,
        link: baseVerse.link,
        source: 'selection'
      };
      
      setSelectedVerse(selectedVerse);
      setShowExplainer(true);
      
      // Show a toast to confirm action
      toast({
        title: "Verse selected",
        description: `Explaining ${fullRef} (${baseVerse.translation})`
      });
    }
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
                  {verses.filter(verse => {
                    // Add debug logging here instead of in JSX
                    console.log('Processing verse:', verse);
                    console.log('Verse text:', verse?.text);
                    console.log('Verse has brackets?', verse?.text?.includes('[') ? 'Yes' : 'No');
                    console.log('Verse reference:', verse?.ref);
                    
                    return verse && verse.ref;
                  }).map((verse, index) => {
                    console.log('Map Processing verse:', verse);
                    return (
                      <Card key={index} className="overflow-hidden border">
                        <CardContent className="p-4">
                          <div className="font-semibold text-primary mb-2">
                            {verse.ref} ({verse.translation})
                          </div>
                          
                          {/* Use VerseHighlighter for all verses */}
                          <VerseHighlighter 
                            text={verse.text} 
                            onVerseClick={handleHighlightedVerseClick} 
                          />
                          
                          {/* Show tip button */}
                          <div className="flex justify-end items-center mt-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="flex items-center gap-1 text-xs"
                              onClick={() => {
                                toast({
                                  title: "Tip",
                                  description: "Click on any verse number to select it for explanation",
                                });
                              }}
                            >
                              <Info className="h-3 w-3" />
                              <span>Select a verse</span>
                            </Button>
                          </div>
                          
                          {/* Show fallback link if verse is unavailable */}
                          {verse.text.includes('unavailable') && (
                            <div className="mb-2">
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
                          
                          {/* Explain button */}
                          <div className="flex justify-end">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center gap-1 text-xs"
                                  onClick={() => handleVerseClick(verse)}
                                >
                                  Explain
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="right">
                                <p>Get AI explanation for this verse</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
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
