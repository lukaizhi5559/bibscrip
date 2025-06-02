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
        setSessions(loadedSessions)
        
        // Don't automatically set active session on initial load
        // This allows URL parameters to control which session is loaded
        console.log('Deferring active session selection to URL parameters')
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
      updatedAt: now.toISOString(),
      fullPrompt: '' // Initialize with empty prompt
    }
    
    console.log('Creating new session with ID:', sessionId)
    
    // First set the active session ID before updating the sessions array
    // This ensures the UI knows which session to highlight when the array updates
    setActiveSessionId(sessionId)
    
    // Then add the new session to the beginning of the array
    setSessions(prev => {
      const updated = [newSession, ...prev.slice(0, MAX_SESSIONS - 1)]
      console.log('Updated sessions after create:', updated.length, 'sessions')
      return updated
    })
    
    // Log that we've set this session as active
    console.log('Set active session ID to:', sessionId)
    
    return sessionId
  }
  
  // Add a question and response to the active session
  const addMessage = (question: string, response: ChatResponseData) => {
    // Validate that we have both required parameters
    if (!question || !response) {
      console.error('Missing required parameters in addMessage:', { question, response })
      return
    }

    console.log('Adding message to session, activeSessionId:', activeSessionId)
    
    // If no active session, create one and use it
    if (!activeSessionId) {
      console.log('No active session, creating one')
      const newSessionId = createSession()
      setActiveSessionId(newSessionId)
      
      // Since state updates are asynchronous, we need to handle this differently
      // Create a new message to add to the new session immediately
      const newMessage: ChatMessage = {
        question,
        response,
        timestamp: new Date().toISOString()
      }
      
      // Create a new session with this message directly
      setSessions(prev => {
        // Find the session we just created
        const newSession = prev.find(s => s.id === newSessionId)
        if (!newSession) {
          console.error('Could not find newly created session')
          return prev
        }
        
        // Create an updated session with the title from the question
        const title = question.length > 30 ? `${question.substring(0, 30)}...` : question
        
        const updatedSessions = prev.map(session => {
          if (session.id === newSessionId) {
            return {
              ...session,
              title,
              fullPrompt: question,
              updatedAt: new Date().toISOString(),
              messages: [newMessage, ...session.messages]
            }
          }
          return session
        })
        
        console.log('Updated sessions with new message in new session')
        return updatedSessions
      })
      
      return
    }
    
    // Create new message object
    const newMessage: ChatMessage = {
      question,
      response,
      timestamp: new Date().toISOString()
    }
    
    // Update sessions state
    setSessions(prev => {
      // Check if the active session actually exists in the sessions array
      const sessionExists = prev.some(s => s.id === activeSessionId)
      if (!sessionExists) {
        console.error('Active session not found in sessions array:', activeSessionId)
        return prev
      }
      
      return prev.map(session => {
        if (session.id === activeSessionId) {
          console.log('Updating session with ID:', session.id)
          
          // Always update the session title with the first message sent for this session
          // This ensures the title matches what the user first asked
          const title = session.messages.length === 0 
            ? (question.length > 30 ? `${question.substring(0, 30)}...` : question)
            : session.title
          
          // Store the full prompt text when creating a new title
          const fullPrompt = session.messages.length === 0 
            ? question // Store the complete prompt text 
            : session.fullPrompt
          
          console.log('Updating session title to:', title)
          
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
    
    console.log('Message added to session')
  }
  
  // Switch to a different session
  const switchSession = (sessionId: string) => {
    setActiveSessionId(sessionId)
  }
  
  // Update session title
  const updateSessionTitle = (sessionId: string, newTitle: string) => {
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
    setSessions(prev => {
      const filteredSessions = prev.filter(session => session.id !== sessionId)
      
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
