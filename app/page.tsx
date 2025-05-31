"use client"

import { useState, type FormEvent, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChatResponseCard, type ChatResponseData, type Verse, type Commentary } from "@/components/chat-response-card"
import { ResultsLayout } from "@/components/results-layout"
import { AiTypingIndicator } from "@/components/ai-typing-indicator"
import { SendHorizonal, AlertCircle, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useSearchParams, useRouter } from "next/navigation"
import { useMediaQuery } from "../hooks/use-media-query"

const mockResponse: ChatResponseData = {
  aiAnswer:
    "Romans 8:28 reminds us that in all things God works for the good of those who love him, who have been called according to his purpose. This doesn't mean that bad things won't happen, but that God can use even difficult situations for an ultimate good in the lives of believers. It's a promise of God's sovereign care and redemptive power in the midst of life's trials.",
  referencedVerses: [
    {
      reference: "Romans 8:28",
      translation: "NIV",
      text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
      link: "#",
    },
    {
      reference: "Genesis 50:20",
      translation: "ESV",
      text: "As for you, you meant evil against me, but God meant it for good, to bring it about that many people should be kept alive, as they are today.",
      link: "#",
    },
  ],
  commentaryExcerpts: [
    {
      source: "Matthew Henry's Commentary",
      text: "Whatever the particular providences of God may be, they are all to work for good to them that love God. This verse is a great comfort in all afflictions and distresses, that God is working all things together for their good.",
    },
    {
      source: "John Gill's Exposition",
      text: "This is a general rule, which holds true of all things that happen in the world, or that ever did, or will befall the saints. All afflictions, of whatever kind, are for their good.",
    },
  ],
}

export default function HomePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [inputValue, setInputValue] = useState("")
  const [chatResponse, setChatResponse] = useState<ChatResponseData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [detectedContentType, setDetectedContentType] = useState<'topic' | 'character' | 'verse' | 'general'>('general')
  const [resultsOpen, setResultsOpen] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [lastQuestion, setLastQuestion] = useState<string | null>(null)
  
  // Check if we're on mobile
  const isMobile = useMediaQuery("(max-width: 768px)")
  
  // Check for query parameter on load
  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setInputValue(q)
      setLastQuestion(q)
      // Auto-submit the query when loaded with a query parameter
      handleSubmit(new Event('submit') as unknown as FormEvent<HTMLFormElement>)
    }
  }, [])
  
  // Always open results panel when loading starts
  useEffect(() => {
    if (isLoading) {
      setResultsOpen(true)
    }
  }, [isLoading])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!inputValue.trim()) return

    // Update the URL with the query parameter
    const params = new URLSearchParams(searchParams.toString())
    params.set('q', inputValue)
    router.push(`/?${params.toString()}`)
    
    setLastQuestion(inputValue)
    setIsLoading(true)
    setChatResponse(null)
    setError(null)
    setDataLoaded(false)
    
    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: inputValue }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get answer')
      }

      const data = await response.json()
      
      // Transform API response to match ChatResponseData format
      const chatResponseData: ChatResponseData = {
        aiAnswer: data.ai, // API returns 'ai' field, not 'aiAnswer'
        referencedVerses: data.verses.map((verse: {ref: string, text: string, translation?: string, link?: string}) => ({
          // Transform 'ref' from API to 'reference' expected by Verse interface
          reference: verse.ref,
          text: verse.text,
          translation: verse.translation,
          link: verse.link
        })),
        commentaryExcerpts: [] // Initialize with empty array
      }
      
      // Debug logging
      console.log('API Response:', data);
      console.log('Transformed Response:', chatResponseData);

      // Detect content type from the question
      if (inputValue.toLowerCase().includes('topic') || inputValue.toLowerCase().includes('theme')) {
        setDetectedContentType('topic')
      } else if (inputValue.toLowerCase().includes('character') || inputValue.toLowerCase().includes('person')) {
        setDetectedContentType('character')
      } else if (/^\s*[a-zA-Z]+\s+\d+:\d+/.test(inputValue)) {
        setDetectedContentType('verse')
      } else {
        setDetectedContentType('general')
      }
      
      // Mark data as loaded
      setDataLoaded(true)

      setChatResponse(chatResponseData)
    } catch (err: any) {
      console.error('Error fetching answer:', err)
      setError(err.message || 'Failed to get answer. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleResults = () => {
    setResultsOpen(prev => !prev)
  }

  return (
    <div className={`flex h-full w-full ${resultsOpen && !isMobile ? 'overflow-hidden' : ''}`}>
      {/* Main content area - always visible but resized on desktop when results are open */}
      <div className={`flex flex-col h-full overflow-y-auto items-center transition-all duration-300 ease-in-out
        ${resultsOpen && !isMobile ? 'w-1/3 min-w-[350px]' : 'w-full'}`}>
        <section className="w-full max-w-2xl text-center py-8 md:py-12 px-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Ask BibScrip Anything</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Explore the Bible with AI-powered insight, scripture, and study tools.
          </p>
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row items-center gap-3">
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="What does Romans 8:28 mean?"
              className="h-12 flex-grow text-base shadow-sm focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-label="Ask a question about the Bible"
            />
            <Button type="submit" size="lg" className="h-12 w-full sm:w-auto shadow-sm" disabled={isLoading}>
              <SendHorizonal className="mr-2 h-4 w-4 sm:hidden md:inline-block" />
              Ask
            </Button>
          </form>
          <div className="mt-3 flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              BibScrip provides responses based on Scripture and trusted commentary.
            </p>
            
            {/* Always visible toggle button */}
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1" 
              onClick={toggleResults}
            >
              {resultsOpen ? 
                <>
                  <ChevronRight className="h-4 w-4" />
                  Hide Panel
                </> : 
                <>
                  <ChevronLeft className="h-4 w-4" />
                  {chatResponse || isLoading ? 
                    `View ${isLoading ? 'Progress' : 'Results'}` : 
                    'Side Panel'}
                </>
              }
            </Button>
          </div>

          {error && !isLoading && (
            <div className="mt-12">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            </div>
          )}
        </section>
      </div>

      {/* Results panel - fixed overlay on mobile, side-by-side on desktop */}
      <div 
        className={`${isMobile ? 'fixed top-0 right-0 z-50' : 'relative'} h-full bg-background border-l border-border overflow-y-auto transition-all duration-300 ease-in-out
          ${resultsOpen 
            ? (isMobile ? 'translate-x-0 w-full' : 'w-2/3 translate-x-0') 
            : (isMobile ? 'translate-x-full' : 'w-0 opacity-0 invisible')}`}
      >
        <div className="relative h-full">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 left-4 z-50" 
            onClick={toggleResults}
            aria-label={resultsOpen ? "Close results" : "Open results"}
          >
            {resultsOpen ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>

          <div className="p-4 h-full overflow-y-auto">
            {/* Show loading spinner inside the panel while data is loading */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <AiTypingIndicator />
                  <p className="text-muted-foreground mt-4">Searching the Bible and analyzing your question...</p>
                </div>
              </div>
            ) : chatResponse ? (
              <ResultsLayout 
                question={lastQuestion || inputValue}
                aiResponse={chatResponse.aiAnswer}
                verses={chatResponse.referencedVerses.map(verse => ({
                  // ResultsLayout expects 'ref' according to its BibleVerse interface
                  ref: verse.reference, // Use the transformed 'reference' property
                  text: verse.text,
                  translation: verse.translation || 'Unknown',
                  link: verse.link || '#',
                  source: 'Bible API'
                }))}
                loading={isLoading}
                detectedContentType={detectedContentType}
                onSave={() => alert('Bookmark feature coming soon!')}
                onShare={() => {
                  const url = `${window.location.origin}?q=${encodeURIComponent(lastQuestion || inputValue)}`
                  navigator.clipboard.writeText(url)
                  alert('Link copied to clipboard!')
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="max-w-md space-y-4">
                  <h3 className="text-xl font-medium">Welcome to BibScrip</h3>
                  <p className="text-muted-foreground">Enter a question about the Bible, scripture, or faith to see AI-powered answers with referenced verses.</p>
                  <div className="p-4 border border-dashed rounded-lg border-muted-foreground/50">
                    <p className="italic text-sm">"Thy word is a lamp unto my feet, and a light unto my path."</p>
                    <p className="text-xs text-muted-foreground mt-2">Psalm 119:105</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
