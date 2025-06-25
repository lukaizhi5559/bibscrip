"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface VerseData {
  number: string;
  text: string;
}

interface VerseHighlighterProps {
  text: string;
  activeVerseNumber?: string;
  onVerseClick?: (verse: VerseData) => void;
  allowMultiSelect?: boolean;
}

/**
 * Component that parses Bible text with verse numbers in brackets [1], [2], etc.
 * and allows for verse selection/highlighting
 */
export function VerseHighlighter({
  text,
  activeVerseNumber,
  onVerseClick,
  allowMultiSelect = false,
}: VerseHighlighterProps) {
  const [verses, setVerses] = useState<VerseData[]>([]);
  const [selectedVerses, setSelectedVerses] = useState<string[]>(
    activeVerseNumber ? [activeVerseNumber] : []
  );

  // Parse the text to extract verse numbers and content
  useEffect(() => {
    if (!text) {
      setVerses([]);
      return;
    }
    
    console.log('Processing text for highlighting:', text);
    
    const parsedVerses: VerseData[] = [];
    
    // If the text doesn't contain any verse markers, treat it as a single verse
    if (!text.match(/\[\d+\]/)) {
      console.log('No verse numbers found, treating as single verse');
      parsedVerses.push({
        number: "1",
        text: text.trim()
      });
    } else {
      // Extract verses with numbers using an improved regex that properly captures the text
      // This fixes the issue with single verses not being captured
      try {
        // First, try the simpler approach - match the first number and everything after it
        // Using multiline approach instead of 's' flag for broader compatibility
        const singleVerseMatch = text.match(/\[(\d+)\]\s*([\s\S]*)/);
        if (singleVerseMatch && text.match(/\[\d+\]/g)?.length === 1) {
          // We have just one verse number, so capture everything after it
          console.log('Found single verse with number:', singleVerseMatch[1]);
          parsedVerses.push({
            number: singleVerseMatch[1],
            text: singleVerseMatch[2].trim()
          });
        } else {
          // Multiple verses - use regex to extract each verse
          const verseRegex = /\[(\d+)\](.*?)(?=\[\d+\]|$)/g;
          let match;
          while ((match = verseRegex.exec(text)) !== null) {
            console.log('Matched verse:', match[1], 'with text:', match[2].trim());
            parsedVerses.push({
              number: match[1],
              text: match[2].trim()
            });
          }
        }
      } catch (e) {
        console.error('Error parsing verses:', e);
        // Fallback to treating as single verse
        parsedVerses.push({
          number: "1",
          text: text.trim()
        });
      }
    }

    console.log('Final parsed verses:', parsedVerses);
    
    setVerses(parsedVerses);
  }, [text]);

  const handleVerseClick = (verse: VerseData) => {
    if (onVerseClick) {
      onVerseClick(verse);
    }

    if (allowMultiSelect) {
      setSelectedVerses(prev => {
        // Toggle selection
        if (prev.includes(verse.number)) {
          return prev.filter(v => v !== verse.number);
        } else {
          return [...prev, verse.number];
        }
      });
    } else {
      // Single select mode
      setSelectedVerses([verse.number]);
    }
  };

  // Get combined text of selected verses
  const getSelectedText = (): string => {
    if (selectedVerses.length === 0) return '';
    
    return verses
      .filter(v => selectedVerses.includes(v.number))
      .map(v => v.text)
      .join(' ');
  };

  return (
    <div className="space-y-2">
      {verses.map((verse) => (
        <div
          key={verse.number}
          onClick={() => handleVerseClick(verse)}
          className={cn(
            "verse-wrapper py-1 pl-1 -ml-1 rounded cursor-pointer group transition-colors",
            selectedVerses.includes(verse.number)
              ? "bg-primary/10 hover:bg-primary/20"
              : "hover:bg-muted"
          )}
        >
          <span className="verse-number text-xs font-bold text-primary mr-1">
            [{verse.number}]
          </span>
          <span className="verse-text">{verse.text}</span>
        </div>
      ))}
      
      {allowMultiSelect && selectedVerses.length > 0 && (
        <div className="mt-4 p-3 bg-secondary/10 rounded-md">
          <h4 className="text-sm font-medium mb-1">Selected Verses:</h4>
          <p className="text-sm">{getSelectedText()}</p>
        </div>
      )}
    </div>
  );
}
