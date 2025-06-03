import React, { useState, useEffect, useRef } from 'react';
import VerseResourceTabs from './verse-resource-tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AdSlot from '@/components/AdSlot';
import ResponsiveAdSlot from '@/components/ResponsiveAdSlot';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Book, Video, BookOpen, Share2, Bookmark, ChevronDown, ChevronUp, FileDown, ArrowUp } from 'lucide-react';
import { DocumentExport } from './document-export';
import { ChatResponseData } from './chat-response-card';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ReferenceLinks } from './reference-links';
import { VideoResults } from './video-results';
import { CommentaryToggle } from './commentary-toggle';
import { TopicCard } from './topic-card';
import { CharacterCard } from './character-card';
import { DevotionalCard } from './devotional-card';
import { ExpandableText } from './expandable-text';
// Import the parsing functions
import { parsePassage, getBookCode, formatPassageForUrl } from '@/utils/biblical-helpers';
// Import string helpers
import { truncateText } from '@/utils/string-helpers';

interface BibleVerse {
  ref: string;
  text: string;
  translation: string;
  link: string;
  source?: string;
}

interface VideoResult {
  id: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  publishedAt: string;
  viewCount?: string;
  duration?: string;
  url: string;
}

interface TopicInfo {
  name: string;
  description: string;
  relatedVerses: string[];
}

interface CharacterInfo {
  name: string;
  description: string;
  keyVerses: string[];
}

interface DevotionalData {
  title: string;
  content: string;
  mainVerse: {
    reference: string;
    text: string;
    translation: string;
  };
  additionalVerses?: {
    reference: string;
    text: string;
    translation: string;
  }[];
}

interface ResultsLayoutProps {
  question: string;
  aiResponse: string;
  verses: BibleVerse[];
  loading?: boolean;
  onSave?: () => void;
  onShare?: () => void;
  detectedContentType?: 'topic' | 'character' | 'verse' | 'general';
  chatResponse?: ChatResponseData | null;
  showAds?: boolean;
}

/**
 * Main component for displaying BibScrip search results with AI answers, 
 * Bible verses, videos, and additional resources
 */
// Scroll to top button component
// ScrollToTopButton using scrollIntoView approach - only visible when scrolled down
const ScrollToTopButton = ({ showAds }: { showAds?: boolean }) => {
  const topRef = useRef<HTMLDivElement>(null);
  // State to track if button should be visible
  const [isVisible, setIsVisible] = useState(false);
  
  // Create a scroll target and set up scroll listeners
  useEffect(() => {
    // Add a hidden marker element at the top of our component
    const existingMarker = document.getElementById('results-top-marker');
    if (!existingMarker) {
      const marker = document.createElement('div');
      marker.id = 'results-top-marker';
      marker.style.position = 'absolute';
      marker.style.top = '0';
      marker.style.height = '1px';
      
      // Find the results container and insert our marker at the top
      const resultsContainer = document.querySelector('.results-layout');
      if (resultsContainer && resultsContainer.firstChild) {
        resultsContainer.insertBefore(marker, resultsContainer.firstChild);
      } else if (topRef.current && topRef.current.parentNode) {
        topRef.current.parentNode.insertBefore(marker, topRef.current);
      }
    }
    
    // Set up scroll listener to show/hide button
    const checkScrollPosition = () => {
      // Find the results panel
      const resultsPanel = document.querySelector('.results-layout');
      if (resultsPanel && resultsPanel instanceof HTMLElement) {
        // Button should be visible if scrolled down more than 300px
        const shouldBeVisible = resultsPanel.scrollTop > 300;
        if (shouldBeVisible !== isVisible) {
          setIsVisible(shouldBeVisible);
        }
      } else {
        // Fallback to window scroll
        const scrollPosition = window.scrollY || document.documentElement.scrollTop;
        const shouldBeVisible = scrollPosition > 300;
        if (shouldBeVisible !== isVisible) {
          setIsVisible(shouldBeVisible);
        }
      }
    };
    
    // Find the scrollable container and attach event listener
    const resultsPanel = document.querySelector('.results-layout');
    if (resultsPanel) {
      resultsPanel.addEventListener('scroll', checkScrollPosition);
    }
    
    // Also listen to window scroll as a fallback
    window.addEventListener('scroll', checkScrollPosition);
    
    // Check position on initial mount
    checkScrollPosition();
    
    // Cleanup
    return () => {
      if (resultsPanel) {
        resultsPanel.removeEventListener('scroll', checkScrollPosition);
      }
      window.removeEventListener('scroll', checkScrollPosition);
    };
  }, [isVisible]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Try multiple approaches to scroll to the top
    const scrollToTop = () => {
      // First try using our marker
      const marker = document.getElementById('results-top-marker');
      if (marker) {
        marker.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return true;
      }
      
      // Next try using the h1 question title which should be at the top
      const title = document.querySelector('#results-title');
      if (title) {
        title.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return true;
      }
      
      // Try finding the parent component itself
      const resultsLayout = document.querySelector('.results-layout');
      if (resultsLayout) {
        resultsLayout.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return true;
      }
      
      // If all else fails, try the first element in the results panel
      const resultsPanel = document.querySelector('.overflow-y-auto');
      if (resultsPanel && resultsPanel.firstElementChild) {
        resultsPanel.firstElementChild.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return true;
      }
      
      // Last resort - just scroll the window
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    };
    
    // Execute scroll
    scrollToTop();
  };

  return (
    <>
      {/* Hidden top reference element */}
      <div ref={topRef} id="results-top-ref" />
      
      {/* Scroll button with conditional visibility */}
      <button 
        onClick={handleClick}
        className={`fixed bottom-32 right-8 z-[9999] cursor-pointer bg-primary hover:bg-primary/90 text-white 
        rounded-full w-14 h-14 flex items-center justify-center shadow-md hover:scale-105 
        active:scale-95 transition-all duration-200 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-label="Scroll to top"
        type="button"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 19V5M5 12L12 5L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </>
  );
}

export function ResultsLayout({
  question,
  aiResponse,
  verses,
  loading = false,
  onSave,
  onShare,
  detectedContentType = 'general',
  chatResponse,
  showAds = false
}: ResultsLayoutProps) {
  const [activeTab, setActiveTab] = useState('answer');
  const [showAllVerses, setShowAllVerses] = useState(false);
  
  // State to track active main tab (answer, verses, videos, resources)
  // The nested verse resource tabs are now handled by individual VerseResourceTabs components
  
  // Effect to handle navigation from external components
  useEffect(() => {    
    // Check if we need to show a specific verse and resource from sessionStorage
    const activeVerseRef = window.sessionStorage.getItem('activeVerseRef');
    const activeResourceTab = window.sessionStorage.getItem('activeResourceTab');
    
    if (activeVerseRef && activeResourceTab) {
      // Just ensure we're on the verses tab
      // The actual resource tab will be passed as defaultTab to the VerseResourceTabs component
      setActiveTab('verses');
      
      // Clear the sessionStorage so it doesn't persist across refreshes
      window.sessionStorage.removeItem('activeVerseRef');
      window.sessionStorage.removeItem('activeResourceTab');
    }
  }, [verses]);
  
  // Effect to set up data attributes for each verse container for navigation
  useEffect(() => {
    // Only run when verses tab is active
    if (activeTab !== 'verses') return;
    
    // Add data attributes to verse containers for targeting via DOM
    setTimeout(() => {
      const verseContainers = document.querySelectorAll('.verse-container');
      verseContainers.forEach((container, index) => {
        if (verses[index]) {
          container.setAttribute('data-verse-ref', verses[index].ref);
        }
      });
    }, 100); // Small delay to ensure DOM is updated
  }, [verses, activeTab]);
  
  // Ensure all verses have proper reference values
  const processedVerses = verses.map(verse => ({
    ...verse,
    ref: verse.ref || 'Unknown Reference',
    translation: verse.translation || 'NIV',
    link: verse.link || ''
  }));
  
  // Display only the first 3 verses by default
  const visibleVerses = showAllVerses ? processedVerses : processedVerses.slice(0, 3);
  const hasMoreVerses = processedVerses.length > 3;
  
  // Get unique translations for the verses
  const uniqueTranslations = Array.from(
    new Set(verses.map(verse => {
      // Safe check to avoid splitting undefined
      if (!verse || !verse.translation) return 'NIV';
      return verse.translation.split(' ')[0];
    }))
  );
  
  // Determine if we should show a specialized card based on the question content
  const showTopicCard = detectedContentType === 'topic' && question.toLowerCase().includes('what does the bible say about');
  const showCharacterCard = detectedContentType === 'character' && !question.toLowerCase().includes('verse');
  
  return (
    <div className="w-full max-w-4xl py-6 relative h-full overflow-y-auto results-layout">
      <ScrollToTopButton showAds={showAds} />
      {/* Main question display with truncation for long questions */}
      <h1 className="text-2xl font-bold mb-4 pl-10" title={question} id="results-title">{truncateText(question, 100)}</h1>
      {showAds && (
        // Import the new ResponsiveAdSlot component
        <div className="my-4">
          {/* Using the verified ad slot ID */}
          <ResponsiveAdSlot 
            slotId="4298132768"
            style={{ minHeight: '100px' }}
          />
        </div>
      )}
      
      {/* Tabs for content navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="answer" data-value="answer" className="flex-1">
            <MessageSquare className="h-4 w-4 mr-0 sm:mr-2" />
            <span className="sr-only sm:not-sr-only sm:inline-block">Your Answer</span>
          </TabsTrigger>
          <TabsTrigger id="bible-verses-tab" value="verses" data-value="verses" className="flex-1">
            <Book className="h-4 w-4 mr-0 sm:mr-2" />
            <span className="sr-only sm:not-sr-only sm:inline-block">Bible Verses</span>
            {verses.length > 0 && (
              <Badge variant="secondary" className="ml-1">{verses.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="videos" data-value="videos" className="flex-1">
            <Video className="h-4 w-4 mr-0 sm:mr-2" />
            <span className="sr-only sm:not-sr-only sm:inline-block">Videos</span>
          </TabsTrigger>
          <TabsTrigger value="resources" data-value="resources" className="flex-1">
            <BookOpen className="h-4 w-4 mr-0 sm:mr-2" />
            <span className="sr-only sm:not-sr-only sm:inline-block">Resources</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Answer tab content */}
        <TabsContent value="answer" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  BibScrip Answer
                </CardTitle>
                
                <div className="flex items-center gap-2">
                  {chatResponse && (
                    <DocumentExport 
                      question={question} 
                      chatResponse={chatResponse} 
                      className="mr-1"
                    />
                  )}
                  {onSave && (
                    <Button variant="ghost" size="sm" onClick={onSave}>
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  )}
                  {onShare && (
                    <Button variant="ghost" size="sm" onClick={onShare}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <CardDescription>
                Powered by AI with Biblical context
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {/* AI Response */}
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {aiResponse ? (
                  <ExpandableText
                    text={aiResponse}
                    maxLength={500}
                    className="markdown-content whitespace-pre-wrap leading-relaxed"
                    renderContent={(displayText) => {
                      // Apply simple preprocessing to make numbered lists more markdown-like
                      let enhancedResponse = displayText;
                      
                      // Convert numeric patterns followed by asterisks to headings
                      enhancedResponse = enhancedResponse.replace(/^(\d+)\. \*\*(.*?)\*\*:/gm, '### $1. $2');
                      
                      // Add extra line breaks before numeric list items for better spacing
                      enhancedResponse = enhancedResponse.replace(/\n(\d+)\. /g, '\n\n$1. ');
                      
                      return (
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-8 mb-4 text-primary border-b pb-2" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-6 mb-3 text-primary" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-5 mb-2 text-primary" {...props} />,
                            p: ({node, ...props}) => <p className="mb-4 text-base leading-relaxed" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc pl-8 mb-5 space-y-2" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal pl-8 mb-5 space-y-2" {...props} />,
                            li: ({node, ...props}) => <li className="mb-2" {...props} />,
                            em: ({node, ...props}) => <em className="text-muted-foreground italic" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                            blockquote: ({node, ...props}) => (
                              <blockquote className="border-l-4 border-primary/30 pl-4 italic my-5 text-muted-foreground bg-muted/50 py-2 pr-2 rounded-sm" {...props} />
                            ),
                            a: ({node, ...props}) => (
                              <a className="text-blue-500 hover:underline font-medium" target="_blank" rel="noopener noreferrer" {...props} />
                            ),
                            hr: ({node, ...props}) => <hr className="my-6 border-muted" {...props} />,
                            code: (props) => {
                              const { className, children } = props;
                              const isInlineCode = !className || !className.includes('language-');
                              
                              return (
                                <code
                                  className={isInlineCode ? 
                                    "bg-muted px-1.5 py-0.5 rounded-md text-sm font-mono text-primary" : 
                                    "block bg-muted p-3 rounded-md text-sm font-mono overflow-x-auto my-5 border border-border"}
                                >
                                  {children}
                                </code>
                              );
                            }
                          }}
                        >
                          {enhancedResponse}
                        </ReactMarkdown>
                      );
                    }}
                  />
                ) : (
                  <p>No AI response available. Please try your question again.</p>
                )}
              </div>
              
              {/* Display referenced verses inline with the answer */}
              {processedVerses.length > 0 && (
                <div className="mt-6 pt-4 border-t border-muted">
                  <h3 className="text-lg font-medium mb-3">Referenced Verses</h3>
                  {visibleVerses.map((verse, index) => (
                    <div key={`answer-verse-${index}-${verse.ref}`} className="mb-4 pb-4 border-b border-muted last:border-0">
                      <div className="flex flex-row items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-lg bg-muted px-3 py-1 rounded-md">
                            {verse && typeof verse.ref === 'string' ? verse.ref : 'Unknown Reference'}
                          </h4>
                        </div>
                        <Badge variant="outline">{verse.translation}</Badge>
                      </div>
                      <ExpandableText
                        text={verse.text.trim()}
                        maxLength={200}
                        textClassName="pl-4 border-l-2 border-muted-foreground/30 italic text-muted-foreground"
                        expandButtonClassName="text-xs"
                      />
                      <div className="mt-2">
                        <ReferenceLinks 
                          passage={verse.ref} 
                          translations={[verse.translation || 'NIV']}
                          bibleGatewayLink={verse.link}
                        />
                      </div>
                    </div>
                  ))}
                  
                  {/* Show more/less verses button */}
                  {hasMoreVerses && (
                    <Button 
                      variant="ghost" 
                      onClick={() => setShowAllVerses(!showAllVerses)}
                      className="mt-2 flex items-center gap-2"
                    >
                      {showAllVerses ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          Show Fewer Verses
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          Show All {verses.length} Verses
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
              
              {/* Show specialized cards based on content type */}
              {showTopicCard && (
                <TopicCard 
                  topic={question.replace(/what does the bible say about /i, '').replace(/\?$/, '')}
                  summary={(aiResponse || '').split('\n\n')[0] || ''}
                  keyVerses={verses.map(v => ({
                    reference: v.ref,
                    text: v.text.trim(),
                    translation: v.translation
                  }))}
                  categories={['Faith', 'Christian Living']}
                  relatedTopics={['Prayer', 'Forgiveness', 'Hope']}
                />
              )}
              
              {showCharacterCard && (
                <CharacterCard 
                  name={question.replace(/tell me about /i, '').replace(/\?$/, '')}
                  description={(aiResponse || '').split('\n\n')[0] || ''}
                  timeline="Biblical Era"
                  bookAppearances={['Genesis', 'Exodus']}
                  keyTraits={['Faith', 'Leadership', 'Obedience']}
                  relationships={[
                    { name: 'God', relationship: 'Servant' },
                    { name: 'Sarah', relationship: 'Spouse' }
                  ]}
                  keyVerses={verses.map(v => ({
                    reference: v.ref,
                    text: v.text.trim(),
                    context: 'Key moment in life'
                  }))}
                />
              )}
            </CardContent>

            {/* Ad placement after Bible verses and before tabs */}
            {showAds && (
              <div className="px-6 py-2 border-t">
                <AdSlot 
                  slotId="4298132768"
                  className="py-2"
                />
              </div>
            )}

          </Card>
          
          {/* Show video results on the answer tab too */}
          <VideoResults query={question} autoFetch={false} />
        </TabsContent>
        
        {/* Verses tab content */}
        <TabsContent value="verses">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Book className="h-5 w-5" />
                Bible Verses
              </CardTitle>
              <CardDescription>
                Referenced verses with multiple translations
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {verses.length === 0 ? (
                <p className="text-muted-foreground">No Bible verses were referenced in this query.</p>
              ) : (
                <div className="space-y-6">
                  {verses.map((verse, index) => {
                    // No need to get current tab or generate URLs as the VerseResourceTabs component handles this
                    
                    return (
                      <div key={`verses-tab-${index}-${verse.ref}`} className="pb-6 border-b border-muted last:border-0 verse-container" data-verse-ref={verse.ref}>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <h3 className="text-lg font-medium">{verse.ref}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{verse.translation}</Badge>
                            <Badge variant="secondary">{verse.source || 'Bible API'}</Badge>
                          </div>
                        </div>
                        
                        {/* Use the isolated VerseResourceTabs component */}
                        <VerseResourceTabs 
                          verse={verse} 
                          defaultTab={window.sessionStorage.getItem('activeVerseRef') === verse.ref ? 
                            (window.sessionStorage.getItem('activeResourceTab') as any) : undefined} 
                        />
                        
                        {/* Compare translations button */}
                        <div className="mt-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(
                              `https://www.biblegateway.com/passage/?search=${encodeURIComponent(verse.ref)}&version=NIV%2CESV%2CKJV%2CNLT`, 
                              '_blank'
                            )}
                            className="flex items-center gap-2"
                          >
                            Compare in Multiple Translations
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
            
            {/* Ad placement inside Bible tab */}
            {showAds && (
              <div className="px-6 py-2 border-t">
                <AdSlot 
                  slotId="4298132768"
                  className="py-2"
                />
              </div>
            )}
          </Card>
        </TabsContent>
        
        {/* Videos tab content */}
        <TabsContent value="videos">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Video className="h-5 w-5" />
                Teaching Videos
              </CardTitle>
              <CardDescription>
                Relevant sermons and teachings about this topic
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <VideoResults query={question} autoFetch={true} maxResults={6} />
            </CardContent>
            
            {/* Ad placement inside Videos tab */}
            {showAds && (
              <div className="px-6 py-2 border-t">
                <AdSlot 
                  slotId="4298132768"
                  className="py-2"
                />
              </div>
            )}
          </Card>
        </TabsContent>
        
        {/* Resources tab content */}
        <TabsContent value="resources">
          <div className="space-y-4">
            {/* Commentary section */}
            <CommentaryToggle 
              passage={verses[0]?.ref}
              onCommentaryChange={(commentaries) => {
                console.log('Selected commentaries:', commentaries);
                // Here you would trigger fetching the selected commentaries
              }}
            />
            
            {/* Devotional section */}
            <DevotionalCard
              title="Finding Peace in God's Promises"
              date={new Date().toLocaleDateString()}
              content="Today's devotional focuses on how we can find peace through trusting in God's promises. When we face challenges, it's essential to remember that God has given us assurances throughout Scripture that He will never leave us nor forsake us."
              mainVerse={{
                reference: verses[0]?.ref || "Philippians 4:6-7",
                text: verses[0]?.text || "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.",
                translation: verses[0]?.translation ? verses[0].translation : "NIV"
              }}
              additionalVerses={[
                {
                  reference: "Isaiah 26:3",
                  text: "You will keep in perfect peace those whose minds are steadfast, because they trust in you.",
                  translation: "NIV"
                }
              ]}
              categories={["Peace", "Trust", "Prayer"]}
              isPersonalized={true}
            />
            
            {/* Reading Plan Suggestion */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Suggested Reading Plan</CardTitle>
                <CardDescription>
                  Continue exploring this topic with a structured reading plan
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <p>Based on your interest in this topic, you might enjoy this 7-day reading plan:</p>
                  
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Peace in Every Circumstance</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      A week-long journey through Scripture's promises of peace
                    </p>
                    <Button>Start Reading Plan</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
