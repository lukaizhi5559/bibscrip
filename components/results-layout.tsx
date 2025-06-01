import React, { useState, useEffect } from 'react';
import VerseResourceTabs from './verse-resource-tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Book, Video, BookOpen, Share2, Bookmark, ChevronDown, ChevronUp, FileDown } from 'lucide-react';
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
}

/**
 * Main component for displaying BibScrip search results with AI answers, 
 * Bible verses, videos, and additional resources
 */
export function ResultsLayout({
  question,
  aiResponse,
  verses,
  loading = false,
  onSave,
  onShare,
  detectedContentType = 'general',
  chatResponse
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
    <div className="w-full max-w-4xl py-6">
      {/* Main question display with truncation for long questions */}
      <h1 className="text-2xl font-bold mb-4" title={question}>{truncateText(question, 100)}</h1>
      
      {/* Tabs for different content sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="answer" data-value="answer" className="flex-1">
            <MessageSquare className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Your Answer</span>
            <span className="sm:hidden">Answer</span>
          </TabsTrigger>
          <TabsTrigger id="bible-verses-tab" value="verses" data-value="verses" className="flex-1">
            <Book className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Bible Verses</span>
            <span className="sm:hidden">Verses</span>
            {verses.length > 0 && (
              <Badge variant="secondary" className="ml-1">{verses.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="videos" data-value="videos" className="flex-1">
            <Video className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Videos</span>
            <span className="sm:hidden">Videos</span>
          </TabsTrigger>
          <TabsTrigger value="resources" data-value="resources" className="flex-1">
            <BookOpen className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Resources</span>
            <span className="sm:hidden">More</span>
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
