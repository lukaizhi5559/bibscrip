import React, { useState } from 'react';
import { ExpandableText } from './expandable-text';

interface VerseResourceTabsProps {
  verse: {
    ref: string;
    text: string;
    translation?: string;
  };
  defaultTab?: 'text' | 'biblegateway' | 'biblehub' | 'blueletterbible';
}

/**
 * Isolated verse resource tabs component - one instance per verse
 * This ensures each verse has its own isolated tab state
 */
export default function VerseResourceTabs({ verse, defaultTab = 'text' }: VerseResourceTabsProps) {
  // Local state for this specific verse's tabs
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  
  // Parse verse reference helper function - moved to the top so it can be used by other functions
  const parsePassage = (ref: string) => {
    const parts = ref.split(/\s+/);
    const book = parts[0];
    const chapterVerse = parts[1] || '';
    const [chapter, verseNum] = chapterVerse.split(':');
    
    return { book, chapter, verse: verseNum };
  };
  
  const getBookCode = (book: string) => {
    // Simplify book name for URL - this is a simple implementation
    return book.toLowerCase().replace(/\s+/g, '');
  };
  
  // Format BibleGateway URL properly to ensure verse content is displayed
  // Using a format that's known to work well with direct verse display
  const formattedRef = encodeURIComponent(verse.ref).replace(/%20/g, '+');
  const bibleGatewayUrl = `https://www.biblegateway.com/passage/?search=${formattedRef}&version=${verse.translation || 'NIV'}`;
  
  const { book, chapter, verse: verseNum } = parsePassage(verse.ref);
  const bibleHubUrl = verseNum
    ? `https://biblehub.com/${book?.toLowerCase()}/${chapter}-${verseNum}.htm`
    : `https://biblehub.com/${book?.toLowerCase()}/${chapter}.htm`;
  
  const blueLetterBibleUrl = `https://www.blueletterbible.org/niv/${getBookCode(book || '')}/${chapter}/${verseNum || '1'}`;

  return (
    <div className="w-full mt-2">
      {/* Custom tab navigation */}
      <div className="grid grid-cols-4 mb-2 bg-muted rounded-lg p-1">
        <button 
          className={`py-2 px-1 rounded-md text-sm transition-colors ${activeTab === 'text' ? 'bg-background shadow-sm font-medium' : 'hover:bg-muted-foreground/10'}`}
          onClick={() => setActiveTab('text')}
        >
          Verse Text
        </button>
        <button 
          className={`py-2 px-1 rounded-md text-sm transition-colors ${activeTab === 'biblegateway' ? 'bg-background shadow-sm font-medium' : 'hover:bg-muted-foreground/10'}`}
          onClick={() => setActiveTab('biblegateway')}
        >
          BibleGateway
        </button>
        <button 
          className={`py-2 px-1 rounded-md text-sm transition-colors ${activeTab === 'biblehub' ? 'bg-background shadow-sm font-medium' : 'hover:bg-muted-foreground/10'}`}
          onClick={() => setActiveTab('biblehub')}
        >
          BibleHub
        </button>
        <button 
          className={`py-2 px-1 rounded-md text-sm transition-colors ${activeTab === 'blueletterbible' ? 'bg-background shadow-sm font-medium' : 'hover:bg-muted-foreground/10'}`}
          onClick={() => setActiveTab('blueletterbible')}
        >
          BlueLetterBible
        </button>
      </div>
      
      {/* Tab content based on active tab */}
      <div>
        {/* Verse text content */}
        {activeTab === 'text' && (
          <ExpandableText
            text={verse.text.trim()}
            maxLength={250}
            textClassName="pl-4 border-l-2 border-muted-foreground/30 italic text-muted-foreground"
            expandButtonClassName="text-xs mt-1"
          />
        )}
        
        {/* BibleGateway content */}
        {activeTab === 'biblegateway' && (
          <div className="flex flex-col space-y-4">
            <div className="relative min-h-[400px] border rounded-md">
              <div className="absolute inset-0">
                <iframe
                  src={bibleGatewayUrl}
                  className="w-full h-full border-0"
                  title={`BibleGateway - ${verse.ref}`}
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div className="text-center">
              <a 
                href={bibleGatewayUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:underline"
              >
                Open in BibleGateway (if not loading properly)
              </a>
            </div>
          </div>
        )}
        
        {/* BibleHub content */}
        {activeTab === 'biblehub' && (
          <div className="relative min-h-[400px] border rounded-md">
            <div className="absolute inset-0">
              <iframe
                src={bibleHubUrl}
                className="w-full h-full border-0"
                title={`BibleHub - ${verse.ref}`}
                sandbox="allow-same-origin allow-scripts allow-forms"
                loading="lazy"
              />
            </div>
          </div>
        )}
        
        {/* BlueLetterBible content */}
        {activeTab === 'blueletterbible' && (
          <div className="relative min-h-[400px] border rounded-md">
            <div className="absolute inset-0">
              <iframe
                src={blueLetterBibleUrl}
                className="w-full h-full border-0"
                title={`BlueLetterBible - ${verse.ref}`}
                sandbox="allow-same-origin allow-scripts allow-forms"
                loading="lazy"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
