import { useState, useEffect } from 'react'
import { ChatResponseData } from '@/components/chat-response-card'

export interface ChatMessage {
  question: string
  response: ChatResponseData
  timestamp: string
}

export interface ChatSession {
  id: string
  title: string
  fullPrompt?: string
  createdAt: string
  updatedAt: string
  messages: ChatMessage[]
}

const MAX_SESSIONS = 20

export function useChatHistory() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  
  // Load sessions from localStorage
  const loadSessions = (): ChatSession[] => {
    if (typeof window === 'undefined') {
      return []
    }
    
    try {
      const savedSessions = localStorage.getItem('bibscrip-chat-sessions')
      if (!savedSessions) {
        return []
      }
      
      const parsed = JSON.parse(savedSessions) as ChatSession[]
      
      // Track seen IDs to handle potential duplicate IDs
      const seenIds = new Set<string>()
      
      // Filter out any sessions with duplicate IDs and ensure fullPrompt property exists
      return parsed.filter(session => {
        if (seenIds.has(session.id)) {
          console.warn(`Duplicate session ID found when loading from localStorage: ${session.id}. Filtering it out.`)
          return false
        }
        seenIds.add(session.id)
        
        // Add fullPrompt property to existing sessions if it doesn't exist
        if (!session.fullPrompt && session.messages && session.messages.length > 0) {
          session.fullPrompt = session.messages[0].question
        }
        
        return true
      })
    } catch (error) {
      console.error('Error loading chat sessions:', error)
      return []
    }
  }

  // Initialize sessions from localStorage
  useEffect(() => {
    try {
      const loadedSessions = loadSessions()
      
      if (loadedSessions.length > 0) {
        console.log(`Loaded ${loadedSessions.length} sessions`)
        setSessions(loadedSessions)
        
        // Set active session to the most recent one if not already set
        if (!activeSessionId && loadedSessions.length > 0) {
          setActiveSessionId(loadedSessions[0].id)
        }
      }
    } catch (error) {
      console.error('Error loading sessions:', error)
    }
  }, [])
  
  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('bibscrip-chat-sessions', JSON.stringify(sessions))
      console.log('Saved sessions to localStorage:', sessions.length, 'sessions')
    } else {
      // If there are no sessions, remove the item from localStorage
      localStorage.removeItem('bibscrip-chat-sessions')
      console.log('Cleared sessions from localStorage')
    }
  }, [sessions])
  
  // Get the active session
  const activeSession = sessions.find(session => session.id === activeSessionId) || null
  
  // Create a new chat session
  const createSession = () => {
    // Helper function to generate a unique ID for a session
    const generateUniqueId = () => {
      // Use a combination of timestamp, random values, and a counter for uniqueness
      const timestamp = Date.now();
      const randomPart = Math.random().toString(36).substring(2, 10);
      const counter = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      
      // Format: timestamp-randomChars-counter
      return `${timestamp}-${randomPart}-${counter}`;
    }
    
    // Generate a more descriptive title with date and time
    const now = new Date()
    const formattedDate = now.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
    const formattedTime = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
    
    // Create session ID first so we can include it in the title
    const sessionId = generateUniqueId()
    
    const newSession: ChatSession = {
      id: sessionId,
      title: `Bible Study - ${formattedDate} ${formattedTime}`,
      messages: [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }
    
    // Add the new session to the beginning of the array
    setSessions(prev => {
      const updated = [newSession, ...prev.slice(0, MAX_SESSIONS - 1)]
      console.log('Updated sessions after create:', updated.length, 'sessions')
      return updated
    })
    
    setActiveSessionId(newSession.id)
    console.log('Set active session ID to:', newSession.id)
    
    return newSession.id
  }
  
  // Add a question and response to the active session
  const addMessage = (question: string, response: ChatResponseData) => {
    if (!activeSessionId) {
      const newSessionId = createSession()
      setActiveSessionId(newSessionId)
    }
    
    const newMessage: ChatMessage = {
      question,
      response,
      timestamp: new Date().toISOString()
    }
    
    setSessions(prev => {
      return prev.map(session => {
        if (session.id === activeSessionId) {
          // Always update the session title with the first message sent for this session
          // This ensures the title matches what the user first asked
          const title = session.messages.length === 0 
            ? (question.length > 30 ? `${question.substring(0, 30)}...` : question)
            : session.title
          
          // Store the full prompt text when creating a new title
          const fullPrompt = session.messages.length === 0 
            ? question // Store the complete prompt text 
            : session.fullPrompt
          
          return {
            ...session,
            title,
            fullPrompt,
            updatedAt: new Date().toISOString(),
            messages: [newMessage, ...session.messages]
          }
        }
        return session
      })
    })
  }
  
  // Switch to a different session
  const switchSession = (sessionId: string) => {
    setActiveSessionId(sessionId)
  }
  
  // Update session title
  const updateSessionTitle = (sessionId: string, newTitle: string) => {
    console.log('Updating session title:', sessionId, newTitle)
    setSessions(prev => {
      const updated = prev.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            title: newTitle
          }
        }
        return session
      })
      console.log('Updated sessions after title change:', updated)
      return updated
    })
  }
  
  // Delete a session
  const deleteSession = (sessionId: string) => {
    console.log('Deleting session:', sessionId)
    setSessions(prev => {
      const filteredSessions = prev.filter(session => session.id !== sessionId)
      console.log('Sessions after deletion:', filteredSessions)
      
      // If we deleted the active session, set the active session to the most recent one
      if (sessionId === activeSessionId && filteredSessions.length > 0) {
        console.log('Setting active session to:', filteredSessions[0].id)
        setActiveSessionId(filteredSessions[0].id)
      } else if (filteredSessions.length === 0) {
        console.log('No sessions left, setting active session to null')
        setActiveSessionId(null)
      }
      
      return filteredSessions
    })
  }
  
  // Clear all sessions
  const clearAllSessions = () => {
    setSessions([])
    setActiveSessionId(null)
    localStorage.removeItem('bibscrip-chat-sessions')
  }
  
  return {
    sessions,
    activeSessionId,
    activeSession,
    createSession,
    addMessage,
    switchSession,
    updateSessionTitle,
    deleteSession,
    clearAllSessions
  }
}
