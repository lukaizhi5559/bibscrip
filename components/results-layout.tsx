import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Book, Video, BookOpen, Share2, Bookmark, ChevronDown, ChevronUp } from 'lucide-react';
import { ReferenceLinks } from './reference-links';
import { VideoResults } from './video-results';
import { CommentaryToggle } from './commentary-toggle';
import { TopicCard } from './topic-card';
import { CharacterCard } from './character-card';
import { DevotionalCard } from './devotional-card';

interface BibleVerse {
  ref: string;
  text: string;
  translation: string;
  link: string;
  source?: string;
}

interface ResultsLayoutProps {
  question: string;
  aiResponse: string;
  verses: BibleVerse[];
  loading?: boolean;
  onSave?: () => void;
  onShare?: () => void;
  detectedContentType?: 'topic' | 'character' | 'verse' | 'general';
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
  detectedContentType = 'general'
}: ResultsLayoutProps) {
  const [activeTab, setActiveTab] = useState('answer');
  const [showAllVerses, setShowAllVerses] = useState(false);
  
  // Display only the first 3 verses by default
  const visibleVerses = showAllVerses ? verses : verses.slice(0, 3);
  const hasMoreVerses = verses.length > 3;
  
  // Get unique translations for the verses
  const uniqueTranslations = Array.from(
    new Set(verses.map(verse => verse.translation.split(' ')[0]))
  );
  
  // Determine if we should show a specialized card based on the question content
  const showTopicCard = detectedContentType === 'topic' && question.toLowerCase().includes('what does the bible say about');
  const showCharacterCard = detectedContentType === 'character' && !question.toLowerCase().includes('verse');
  
  return (
    <div className="container mx-auto max-w-4xl py-6">
      {/* Main question display */}
      <h1 className="text-2xl font-bold mb-4">{question}</h1>
      
      {/* Tabs for different content sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="answer" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Your Answer</span>
            <span className="sm:hidden">Answer</span>
          </TabsTrigger>
          
          <TabsTrigger value="verses" className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            <span className="hidden sm:inline">Bible Verses</span>
            <span className="sm:hidden">Verses</span>
            {verses.length > 0 && (
              <Badge variant="secondary" className="ml-1">{verses.length}</Badge>
            )}
          </TabsTrigger>
          
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            <span className="hidden sm:inline">Videos</span>
            <span className="sm:hidden">Videos</span>
          </TabsTrigger>
          
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
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
                  <Button variant="ghost" size="sm" onClick={onSave}>
                    <Bookmark className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                Powered by AI with Biblical context
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {/* AI Response */}
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {aiResponse.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              
              {/* Display referenced verses inline with the answer */}
              {verses.length > 0 && (
                <div className="mt-6 pt-4 border-t border-muted">
                  <h3 className="text-lg font-medium mb-3">Referenced Verses</h3>
                  {visibleVerses.map((verse) => (
                    <div key={verse.ref} className="mb-4 pb-4 border-b border-muted last:border-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{verse.ref}</h4>
                        <Badge variant="outline">{verse.translation}</Badge>
                      </div>
                      <blockquote className="mt-2 pl-4 border-l-2 border-muted-foreground/30 italic text-muted-foreground">
                        {verse.text.trim()}
                      </blockquote>
                      <div className="mt-2">
                        <ReferenceLinks 
                          passage={verse.ref} 
                          translations={uniqueTranslations}
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
                  summary={aiResponse.split('\n\n')[0] || ''}
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
                  description={aiResponse.split('\n\n')[0] || ''}
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
                  {verses.map((verse) => (
                    <div key={verse.ref} className="pb-6 border-b border-muted last:border-0">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <h3 className="text-lg font-medium">{verse.ref}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{verse.translation}</Badge>
                          <Badge variant="secondary">{verse.source || 'Bible API'}</Badge>
                        </div>
                      </div>
                      
                      <blockquote className="pl-4 border-l-2 border-primary italic">
                        {verse.text.trim()}
                      </blockquote>
                      
                      <div className="mt-3">
                        <ReferenceLinks 
                          passage={verse.ref} 
                          translations={uniqueTranslations}
                          showBibleGateway={true}
                          showBibleHub={true}
                          showBlueLetterBible={true}
                        />
                      </div>
                      
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
                  ))}
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
                translation: verses[0]?.translation || "NIV"
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
