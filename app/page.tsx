"use client"

import React, { FormEvent, KeyboardEvent, useCallback, useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ChatResponseCard, type ChatResponseData, type Verse, type Commentary } from "@/components/chat-response-card"
import { ResultsLayout } from "@/components/results-layout"
import { AiTypingIndicator } from "@/components/ai-typing-indicator"
import { MessageSquare, SendHorizonal, X, AlertCircle, ChevronLeft, ChevronRight, RefreshCw, ClipboardCheck } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useSearchParams, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useMediaQuery } from "../hooks/use-media-query"
import { truncateText } from "@/utils/string-helpers"
import { useChatHistoryContext } from "@/contexts/chat-history-context"
import { PromptHistory } from "@/components/prompt-history"

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
  const { toast } = useToast()
  
  // Initialize chat history from shared context
  const {
    sessions,
    activeSessionId,
    activeSession,
    createSession,
    addMessage,
    switchSession
  } = useChatHistoryContext()
  
  // Reference to AbortController for cancelling requests
  const abortControllerRef = useRef<AbortController | null>(null)
  
  const [inputValue, setInputValue] = useState<string>("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [chatResponse, setChatResponse] = useState<ChatResponseData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [detectedContentType, setDetectedContentType] = useState<'topic' | 'character' | 'verse' | 'general'>('general')
  const [resultsOpen, setResultsOpen] = useState(false)
  const [lastQuestion, setLastQuestion] = useState<string | null>(null)
  
  // Update document title with truncated question when a search is performed
  useEffect(() => {
    if (lastQuestion) {
      document.title = `${truncateText(lastQuestion, 30)} - BibScrip`
    }
  }, [lastQuestion])
  
  // Effect to respond to activeSessionId changes and ensure results are shown
  useEffect(() => {
    if (activeSessionId && activeSession) {
      // If this session has messages, make sure the results panel is open and content is loaded
      if (activeSession.messages && activeSession.messages.length > 0) {
        // Open the results panel if it's not already open
        if (!resultsOpen) {
          // setResultsOpen(true)
        }
        
        // Load the session's first message as the last question
        const questionText = activeSession.messages[0].question
        setLastQuestion(questionText)
        
        // If we don't already have a chat response, recreate it from the message
        if (!chatResponse && activeSession.messages[0].response) {
          setChatResponse(activeSession.messages[0].response)
        }
      }
    }
  }, [activeSessionId, activeSession, resultsOpen, chatResponse])
  
  // Track the last processed session ID to prevent loops
  const lastProcessedSessionIdRef = useRef<string>('')
  // Track whether we're in the middle of a URL update
  const isUpdatingUrlRef = useRef<boolean>(false)
  // Track the session switching source
  const sessionSwitchSourceRef = useRef<'url' | 'click' | null>(null)
  
  // Check URL for chat session ID and query parameters
  // This effect only runs on mount and when searchParams change
  useEffect(() => {
    // Skip if we're currently updating the URL from state changes
    if (isUpdatingUrlRef.current) {
      console.log('Skipping URL parameter processing - URL update in progress')
      return
    }
    
    // Get chat session ID and query from URL, if available
    const idParam = searchParams.get('id') || ''
    const queryParam = searchParams.get('q') || ''
    
    // Force results panel open when loading via URL with sessionID
    if (idParam) {
      setResultsOpen(true)
    }
    
    // Handle direct URL access with session ID
    if (idParam && idParam !== activeSessionId && idParam !== lastProcessedSessionIdRef.current) {
      console.log('Loading chat session from URL parameter:', idParam)
      lastProcessedSessionIdRef.current = idParam
      sessionSwitchSourceRef.current = 'url'
      
      // FORCE RESULTS PANEL OPEN for URL direct access
      setResultsOpen(true)
      
      // Check if the session ID exists in our sessions list
      const targetSession = sessions.find(session => session.id === idParam)
      
      if (targetSession) {
        // Update UI immediately based on the target session
        if (targetSession.messages.length > 0) {
          const firstMessage = targetSession.messages[0]
          setLastQuestion(firstMessage.question)
          
          // Ensure chat response is properly set with the full object structure
          if (firstMessage.response) {            
            // Deep clone the response data to ensure all properties are preserved
            // This helps prevent reference issues with the original data
            const responseData = {
              aiAnswer: firstMessage.response.aiAnswer || '',
              referencedVerses: Array.isArray(firstMessage.response.referencedVerses) ? 
                firstMessage.response.referencedVerses.map(v => ({...v})) : [],
              commentaryExcerpts: Array.isArray(firstMessage.response.commentaryExcerpts) ? 
                firstMessage.response.commentaryExcerpts.map(c => ({...c})) : []
            }
            
            console.log('Structured response data:', JSON.stringify(responseData).substring(0, 100) + '...')
            setChatResponse(responseData)
          } else {
            console.warn('Session has message but no response data')
            setChatResponse(null)
          }
          
          // setInputValue(firstMessage.question)
        } else {
          // Clear UI for an empty session
          setInputValue('')
          setLastQuestion(null)
          setChatResponse(null)
          setError(null)
        }
        
        // CRITICAL FIX: First update the active session ID directly in the context
        // This ensures the sidebar will highlight the correct session
        console.log('Switching to session from URL parameter:', idParam)
        
        // Force the activeSessionId update to be immediate and explicit
        switchSession(idParam)
        
        // Double check that the active session is correctly set after a brief delay
        setTimeout(() => {
          if (activeSessionId !== idParam) {
            console.log('Session ID mismatch after update, forcing activeSessionId update', { 
              current: activeSessionId, 
              expected: idParam 
            })
            switchSession(idParam)
          } else {
            console.log('Session ID successfully updated to', activeSessionId)
          }
        }, 100)
      } else {
        console.warn('Chat session ID not found:', idParam)
        // Try again in 500ms in case sessions are still loading
        setTimeout(() => {
          const delayedTargetSession = sessions.find(session => session.id === idParam)
          if (delayedTargetSession) {
            console.log('Found session after delay:', idParam)
            sessionSwitchSourceRef.current = 'url'
            switchSession(idParam)
          }
        }, 500)
      }
    } else if (!idParam && queryParam && !activeSessionId) {
      // If only the query parameter exists and no active session, set the input value
      setInputValue(queryParam)
    } else if (!idParam && !activeSessionId && sessions.length > 0) {
      // Fallback: If no URL session ID and no active session, select the first session
      console.log('No session ID in URL and no active session. Selecting first session.')
      sessionSwitchSourceRef.current = 'url' // Mark as URL-initiated to prevent URL update loop
      switchSession(sessions[0].id)
    }
  }, [searchParams, sessions, switchSession, activeSessionId, activeSession])
  
  // Media query hook for responsive behavior
  const isMobile = useMediaQuery("(max-width: 768px)")
  
  // Apply mobile styles after component mount to avoid hydration mismatch
  useEffect(() => {
    const resultsPanel = document.querySelector('[data-mobile-position="true"]')
    if (resultsPanel) {
      if (isMobile) {
        resultsPanel.classList.remove('relative', 'min-h-screen')
        resultsPanel.classList.add('fixed', 'top-0', 'right-0', 'z-50', 'h-full')
        
        // Update transition classes
        if (resultsOpen) {
          resultsPanel.classList.remove('w-2/3')
          resultsPanel.classList.add('w-full')
        } else {
          resultsPanel.classList.remove('w-0', 'opacity-0', 'invisible')
          resultsPanel.classList.add('translate-x-full')
        }
      }
    }
  }, [isMobile, resultsOpen])
  
  // Auto-resize textarea to fit content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set the height to match content
      textarea.style.height = `${Math.max(100, textarea.scrollHeight)}px`;
    }
  }, [inputValue])

  // Handle active session changes
  useEffect(() => {
    if (!activeSession) return;
    
    // Set the session switch source to 'click' if it's not already set
    // This helps ensure URL updates work correctly for all session changes
    if (!sessionSwitchSourceRef.current) {
      sessionSwitchSourceRef.current = 'click';
    }
    
    // Update lastProcessedSessionId to prevent re-processing this session
    lastProcessedSessionIdRef.current = activeSessionId || '';
    
    // Get current URL parameters
    const params = new URLSearchParams(searchParams.toString());
    const currentIdParam = params.get('id') || '';
    
    // ALWAYS update UI regardless of what triggered the change
    // Update UI state based on active session
    if (activeSession.messages.length > 0) {
      const activeMessage = activeSession.messages[0]; // Get the most recent message
      console.log('Loading message:', activeMessage.question);
      // setInputValue(activeMessage.question);
      setLastQuestion(activeMessage.question);
      
      // FORCE RESULTS PANEL OPEN for consistency with URL access
      setResultsOpen(true);
      
      // Ensure chat response is properly set with the full object structure
      if (activeMessage.response) {  
        // Deep clone the response data to ensure all properties are preserved
        const responseData = {
          aiAnswer: activeMessage.response.aiAnswer || '',
          referencedVerses: Array.isArray(activeMessage.response.referencedVerses) ? 
            activeMessage.response.referencedVerses.map(v => ({...v})) : [],
          commentaryExcerpts: Array.isArray(activeMessage.response.commentaryExcerpts) ? 
            activeMessage.response.commentaryExcerpts.map(c => ({...c})) : []
        };
        
        console.log('Structured response data:', JSON.stringify(responseData).substring(0, 100) + '...');
        setChatResponse(responseData);
      } else {
        console.warn('Active session has message but missing response data');
        setChatResponse(null);
      }
      
      setResultsOpen(true);
    } else {
      // Clear UI for a new empty session
      setInputValue('');
      setLastQuestion(null);
      setChatResponse(null);
      setError(null);
    }
    
    // SIMPLIFIED APPROACH: Only update the URL if this was explicitly triggered by a user click
    // and the URL doesn't already match the current session
    if (sessionSwitchSourceRef.current === 'click' && currentIdParam !== activeSessionId) {
      // Set or clear ID parameter based on active session
      if (activeSessionId) {
        params.set('id', activeSessionId);
      } else {
        params.delete('id');
      }
      
      // Only include query param for sessions with messages
      if (activeSession.messages.length > 0) {
        params.set('q', activeSession.messages[0].question);
      } else {
        params.delete('q');
      }
      
      // Block URL-triggered effects during this update
      isUpdatingUrlRef.current = true;
      
      // Push URL update
      router.push(`?${params.toString()}`, { scroll: false });
      
      // Reset flags after URL update is complete (use slightly longer timeout for safety)
      setTimeout(() => {
        isUpdatingUrlRef.current = false;
        // Clear the source to prepare for next change
        if (sessionSwitchSourceRef.current === 'click') {
          sessionSwitchSourceRef.current = null;
        }
      }, 100);
      
      // Reset document title
      document.title = 'BibScrip - AI Bible Study';
    }
  }, [activeSessionId, activeSession, searchParams, router])

  // Check for query parameter on initial load only
  useEffect(() => {
    const q = searchParams.get('q') || ''
    const idParam = searchParams.get('id') || ''
    
    // If we have a session ID in URL, make sure it's active
    if (idParam) {
      console.log('Found session ID in URL:', idParam)
      switchSession(idParam)
    }
    
    // Set the query text from URL if present
    if (q) {
      console.log('Found query in URL:', q)
      setInputValue(q)
      
      // Only auto-submit if we have a query but no session ID
      // If we have both, the session loading logic will handle displaying the content
      if (!idParam) {
        // Use setTimeout to ensure this runs after the component is fully mounted
        setTimeout(() => {
          // Set flag to prevent URL-triggered session creation
          isUpdatingUrlRef.current = true
          
          const formEvent = new Event('submit') as unknown as FormEvent<HTMLFormElement>
          handleSubmit(formEvent)
          
          // Reset the flag after a small delay
          setTimeout(() => {
            isUpdatingUrlRef.current = false
          }, 100)
        }, 200) // Slightly longer delay to ensure all state is initialized
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  // Always open results panel when loading starts
  useEffect(() => {
    if (isLoading) {
      setResultsOpen(true)
    }
  }, [isLoading])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Don't submit if already loading
    if (isLoading) return
    
    // Don't submit empty input
    if (!inputValue.trim()) return
    
    // Save the question text before setting loading state
    const questionText = inputValue.trim() // Store the cleaned input
    setLastQuestion(questionText)
    setInputValue("") // Clear the textarea immediately
    setIsLoading(true)
    setError(null)
    setResultsOpen(true) // Always open results panel on submit
    
    // Only create a new session if there isn't an active one
    // This allows reusing the current session for multiple prompts
    let currentSessionId = activeSessionId
    if (!currentSessionId) {
      currentSessionId = createSession() // Create a new session only when needed
      console.log('Created new session with ID:', currentSessionId)
    } else {
      console.log('Reusing existing session with ID:', currentSessionId)
    }
    
    // Set flag to prevent URL-triggered session creation
    isUpdatingUrlRef.current = true
    
    // Update URL with the search query and session ID for shareable links
    const params = new URLSearchParams(searchParams.toString())
    params.set('q', questionText)
    
    // Include the new session ID in the URL
    params.set('id', currentSessionId)
    
    // Update the URL
    router.push(`?${params.toString()}`)
    
    // Reset the flag after a small delay to ensure the URL update effect doesn't trigger
    setTimeout(() => {
      isUpdatingUrlRef.current = false
    }, 100)
    
    // Create an AbortController for timeout handling and cancellation
    const controller = new AbortController()
    const { signal } = controller
    
    // Store the controller in the ref for cancel button access
    abortControllerRef.current = controller
    
    // Set a timeout to abort the request if it takes too long
    const timeoutId = setTimeout(() => {
      controller.abort()
    }, 20000) // 20 seconds timeout
    
    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question: questionText,
          timeoutEnabled: true // Tell backend we're handling timeouts
        }),
        signal // Attach the abort signal to the fetch request
      })
      
      // Request completed successfully, clear the timeout
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get answer')
      }
      
      const data = await response.json()
      
      // Transform API response to match ChatResponseData format
      const chatResponseData: ChatResponseData = {
        aiAnswer: data.ai, 
        referencedVerses: data.verses.map((verse: {ref: string, text: string, translation?: string, link?: string}) => ({
          reference: verse.ref,
          text: verse.text,
          translation: verse.translation,
          link: verse.link
        })),
        commentaryExcerpts: [] // Initialize with empty array
      }
      
      // Detect content type from the question
      if (questionText.toLowerCase().includes('topic') || questionText.toLowerCase().includes('theme')) {
        setDetectedContentType('topic')
      } else if (questionText.toLowerCase().includes('character') || questionText.toLowerCase().includes('person')) {
        setDetectedContentType('character')
      } else if (/^\s*[a-zA-Z]+\s+\d+:\d+/.test(questionText)) {
        setDetectedContentType('verse')
      } else {
        setDetectedContentType('general')
      }
      
      console.log('Received chat response data:', chatResponseData)
      
      // Mark data as loaded - ensure we're setting complete data
      setChatResponse(chatResponseData)
      
      // Ensure results panel is open to display the new results
      setResultsOpen(true)
      
      // If we're reusing an existing session, we should still make sure it's active
      // This covers the case where we might have switched sessions elsewhere
      if (currentSessionId !== activeSessionId) {
        switchSession(currentSessionId)
      }
      
      // Force add message to the active session
      console.log('Adding message to session:', currentSessionId)
      addMessage(questionText, chatResponseData)
      
    } catch (err: any) {
      // Clear the timeout to prevent multiple aborts
      clearTimeout(timeoutId)
      
      console.error('Error with primary API request:', err)
      
      // Check if the error was due to timeout/abort
      if (err.name === 'AbortError') {
        // Show a message indicating we're falling back to another provider
        setError('The request was taking too long. Automatically trying another AI provider...')
        
        // Declare fallbackTimeoutId at a higher scope so it can be accessed in both try and catch blocks
        let fallbackTimeoutId: NodeJS.Timeout | undefined;
        
        // Try the fallback provider
        try {
          console.log('Trying fallback provider...')
          
          // Create a new AbortController for the fallback request
          const fallbackController = new AbortController()
          const fallbackSignal = fallbackController.signal
          
          // Store the new controller
          abortControllerRef.current = fallbackController
          
          // Set a new timeout for the fallback request
          fallbackTimeoutId = setTimeout(() => {
            fallbackController.abort()
          }, 20000) // 20 seconds timeout
          
          const fallbackResponse = await fetch('/api/ask', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              question: questionText,
              useFallback: true // Tell backend to use the next provider in the chain
            }),
            signal: fallbackSignal // Attach the new abort signal
          })
          
          // Clear the fallback timeout since the request completed
          clearTimeout(fallbackTimeoutId)
          
          if (!fallbackResponse.ok) {
            throw new Error(`Error with fallback provider: ${fallbackResponse.status}`)
          }
          
          const fallbackData = await fallbackResponse.json()
          
          console.log('Fallback response received successfully')
          
          // Transform API response to match ChatResponseData format
          const fallbackChatResponseData: ChatResponseData = {
            aiAnswer: fallbackData.ai, 
            referencedVerses: fallbackData.verses.map((verse: {ref: string, text: string, translation?: string, link?: string}) => ({
              reference: verse.ref,
              text: verse.text,
              translation: verse.translation,
              link: verse.link
            })),
            commentaryExcerpts: [] // Initialize with empty array
          }
          
          // Use the same content type detection as primary request
          if (questionText.toLowerCase().includes('topic') || questionText.toLowerCase().includes('theme')) {
            setDetectedContentType('topic')
          } else if (questionText.toLowerCase().includes('character') || questionText.toLowerCase().includes('person')) {
            setDetectedContentType('character')
          } else if (/^\s*[a-zA-Z]+\s+\d+:\d+/.test(questionText)) {
            setDetectedContentType('verse')
          } else {
            setDetectedContentType('general')
          }
          
          console.log('Received fallback chat response data:', fallbackChatResponseData)
          
          // Mark data as loaded
          setChatResponse(fallbackChatResponseData)
          
          // Ensure results panel is open to display the fallback results
          setResultsOpen(true)
          
          // Only switch session if needed
          if (currentSessionId !== activeSessionId) {
            switchSession(currentSessionId)
          }
          
          // Add the fallback response to chat history
          console.log('Adding fallback response to session:', currentSessionId)
          addMessage(questionText, fallbackChatResponseData)
          
          // Clear the error since we recovered
          setError(null)
          
        } catch (fallbackErr: any) {
          // Clear the fallback timeout to prevent memory leaks
          if (fallbackTimeoutId) {
            clearTimeout(fallbackTimeoutId)
            fallbackTimeoutId = undefined
          }
          
          console.error('Error with fallback provider:', fallbackErr)
          setError('All AI providers failed to respond. Please try again later.')
        }
      } else {
        // Handle other types of errors
        setError(err.message || 'Failed to get answer. Please try again.')
      }
    } finally {
      // Clear the loading state and reset the AbortController
      setIsLoading(false)
      abortControllerRef.current = null
      clearTimeout(timeoutId)
    }
  }

  const toggleResults = () => {
    setResultsOpen(prev => !prev)
  }
  
  // Function to start a new chat - clear state and create new session
  const startNewChat = useCallback(() => {
    // Clear the input and results
    setInputValue('')
    setChatResponse(null)
    setLastQuestion(null)
    setIsLoading(false)
    setError(null)
    setDetectedContentType('general')
    
    // Create a new session and ensure it's active
    const newSessionId = createSession()
    console.log('Created new session from New Chat button:', newSessionId)
    
    // Explicitly switch to the new session to make sure it's active
    switchSession(newSessionId)
    
    // Set flag to prevent URL-triggered session creation
    isUpdatingUrlRef.current = true
    
    // Update URL parameters
    const params = new URLSearchParams(searchParams.toString())
    // Remove any existing query parameter
    params.delete('q')
    // Add the new session ID to URL
    params.set('id', newSessionId)  // Add the new session ID to URL
    router.push(`?${params.toString()}`)
    
    // Reset the flag after a small delay
    setTimeout(() => {
      isUpdatingUrlRef.current = false
    }, 100)
    
    // Reset document title
    document.title = 'BibScrip - AI Bible Study'
    
    // Focus the textarea
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [createSession, router, searchParams])
  
  // Handle cancellation of API request
  const handleCancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      console.log('Cancelling API request')
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsLoading(false)
      setError('Request cancelled')
    }
  }, [])
  
  // Listen for custom new chat event from sidebar
  useEffect(() => {
    const handleNewChatEvent = () => {
      console.log('Received new chat event')
      startNewChat()
    }
    
    // Add event listener
    document.addEventListener('bibscrip:newchat', handleNewChatEvent)
    
    // Clean up
    return () => {
      document.removeEventListener('bibscrip:newchat', handleNewChatEvent)
    }
  }, [startNewChat])
  
  // Listen for show results event from session items
  useEffect(() => {
    // Create event handler for the show results event
    const handleShowResultsEvent = (e: CustomEvent) => {
      console.log('Received show results event for session:', e.detail?.sessionId)
      
      // Open the results panel
      setResultsOpen(true)
      
      // If we have an active session and messages but no chat response,
      // attempt to load the chat response from the session
      if (activeSessionId && activeSession && activeSession.messages && activeSession.messages.length > 0 && !chatResponse) {
        const firstMessage = activeSession.messages[0]
        if (firstMessage && firstMessage.response) {
          console.log('Loading chat response from session')
          setChatResponse(firstMessage.response)
          setLastQuestion(firstMessage.question)
        }
      }
    }
    
    // Add event listener with type assertion
    document.addEventListener('bibscrip:showresults', handleShowResultsEvent as EventListener)
    
    // Clean up
    return () => {
      document.removeEventListener('bibscrip:showresults', handleShowResultsEvent as EventListener)
    }
  }, [activeSessionId, activeSession, chatResponse])

  const placeholderText = `Ask anything about Scripture, theology, or life.`;


  return (
    <div className={`flex w-full h-full ${resultsOpen && !isMobile ? 'overflow-hidden' : ''}`}>
      {/* Main content area - always visible but resized on desktop when results are open */}
      <div className={`flex flex-col h-full overflow-y-auto items-center border-r border-border/40 transition-all duration-300 ease-in-out
        ${resultsOpen && !isMobile ? 'w-1/3 min-w-[350px]' : 'w-full'}`}>
        <section className="w-full max-w-2xl mx-auto text-center py-8 md:py-12 px-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Ask BibScrip Anything</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Explore the Bible with AI-powered insight, scripture, and study tools.
          </p>
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 max-w-3xl mx-auto">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
                  // Check for Enter key press
                  if (e.key === 'Enter') {
                    // For Ctrl+Enter or Shift+Enter, manually insert a line break
                    if (e.ctrlKey || e.shiftKey) {
                      // For Ctrl+Enter, we need to manually handle it
                      if (e.ctrlKey) {
                        e.preventDefault(); // Prevent default to handle manually
                        const target = e.target as HTMLTextAreaElement;
                        const start = target.selectionStart;
                        const end = target.selectionEnd;
                        const value = target.value;
                        
                        // Insert a newline at cursor position
                        const newValue = value.substring(0, start) + '\n' + value.substring(end);
                        
                        // Update the state
                        setInputValue(newValue);
                        
                        // We need to manually set the cursor position after state update
                        // Using setTimeout to ensure this runs after React's state update
                        setTimeout(() => {
                          target.selectionStart = target.selectionEnd = start + 1;
                        }, 0);
                      }
                      // For Shift+Enter, default browser behavior works fine
                      return;
                    } else {
                      // Plain Enter without modifiers - submit form
                      e.preventDefault();
                      handleSubmit(e as unknown as FormEvent<HTMLFormElement>);
                    }
                  }
                }}
                placeholder={placeholderText}
                className="min-h-[100px] text-base shadow-sm focus-visible:ring-0 border-yellow-500/50 focus-visible:border-yellow-500 pr-14 resize-none rounded-xl py-3 px-4 overflow-hidden"
                aria-label="Ask a question about the Bible"
              />
              {isLoading ? (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {/* Cancel button */}
                  <Button 
                    type="button" 
                    size="icon" 
                    variant="ghost"
                    className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center text-destructive hover:text-destructive" 
                    onClick={handleCancelRequest}
                    title="Cancel request"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Cancel</span>
                  </Button>
                  
                  {/* Loading indicator */}
                  <div className="h-9 w-9 rounded-full bg-yellow-500 shadow-sm flex items-center justify-center animate-pulse">
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  </div>
                </div>
              ) : (
                <Button 
                  type="submit" 
                  size="icon"
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-yellow-500 hover:bg-yellow-600 shadow-sm flex items-center justify-center"
                >
                  <SendHorizonal className="h-4 w-4 text-primary-foreground" />
                  <span className="sr-only">Ask</span>
                </Button>
              )}
              <div className="text-xs text-muted-foreground mt-1">
                Use <kbd className="px-1 py-0.5 bg-muted rounded">Shift+Enter</kbd> or <kbd className="px-1 py-0.5 bg-muted rounded">Ctrl+Enter</kbd> for line breaks
            </div>
            </div>
          </form>
          <div className="mt-3 mb-5 flex justify-between items-center">
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

          {/* Prompt History Component - Added in the red box area */}
          {/* <div className="mt-1 bg-background/50">
            <PromptHistory />
          </div> */}

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
        className={`relative min-h-screen bg-background border-border overflow-y-auto transition-all duration-300 ease-in-out
          ${resultsOpen 
            ? 'translate-x-0 w-2/3' 
            : 'w-0 opacity-0 invisible'}`}
        data-mobile-position="true"
      >
        <div className="relative h-full pb-[3rem]">
          <Button 
            variant="outline"
            size="icon" 
            className="absolute top-4 left-4 z-50" 
            onClick={toggleResults}
            aria-label={resultsOpen ? "Close results" : "Open results"}
          >
            {resultsOpen ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>

          <div className="px-6 h-full overflow-y-auto">
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
                verses={Array.isArray(chatResponse.referencedVerses) ? 
                  chatResponse.referencedVerses.map(verse => ({
                    // ResultsLayout expects 'ref' according to its BibleVerse interface
                    ref: verse.reference || (verse as any).ref || '', // Type assertion to handle potential ref property
                    text: verse.text || '',
                    translation: verse.translation || 'Unknown',
                    link: verse.link || '#',
                    source: 'Bible API'
                  })) : []}
                loading={isLoading}
                chatResponse={chatResponse}
                detectedContentType={detectedContentType}
                onSave={() => alert('Bookmark feature coming soon!')}
                onShare={() => {
                  // Create a shareable URL with both the query and session ID
                  const params = new URLSearchParams()
                  params.set('q', lastQuestion || inputValue || '')
                  
                  // Include the session ID if available
                  if (activeSessionId) {
                    params.set('id', activeSessionId)
                  }
                  
                  const url = `${window.location.origin}?${params.toString()}`
                  navigator.clipboard.writeText(url).then(() => {
                    // Create a custom toast element for clipboard success
                    toast({
                      title: "Link copied",
                      description: (
                        <div className="flex items-center gap-2">
                          <ClipboardCheck className="h-4 w-4 text-green-500" />
                          <span>Share URL copied to clipboard</span>
                        </div>
                      ),
                      duration: 3000
                    })
                  }).catch(err => {
                    console.error("Failed to copy:", err)
                    toast({
                      title: "Failed to copy",
                      description: "Could not copy link to clipboard",
                      variant: "destructive",
                      duration: 3000
                    })
                  })
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
