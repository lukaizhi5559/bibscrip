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
  createdAt: string
  updatedAt: string
  messages: ChatMessage[]
}

const MAX_SESSIONS = 20

export function useChatHistory() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  
  // Load sessions from localStorage on mount
  useEffect(() => {
    const storedSessions = localStorage.getItem('bibscrip-chat-sessions')
    if (storedSessions) {
      const parsedSessions = JSON.parse(storedSessions) as ChatSession[]
      setSessions(parsedSessions)
      
      // Set active session to the most recent one if not already set
      if (!activeSessionId && parsedSessions.length > 0) {
        setActiveSessionId(parsedSessions[0].id)
      }
    }
  }, [])
  
  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('bibscrip-chat-sessions', JSON.stringify(sessions))
    }
  }, [sessions])
  
  // Get the active session
  const activeSession = sessions.find(session => session.id === activeSessionId) || null
  
  // Create a new session
  const createSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: []
    }
    
    // Add new session to the beginning of the array
    setSessions(prev => [newSession, ...prev])
    setActiveSessionId(newSession.id)
    
    // Trim sessions if we exceed the maximum
    if (sessions.length >= MAX_SESSIONS) {
      setSessions(prev => prev.slice(0, MAX_SESSIONS))
    }
    
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
          
          return {
            ...session,
            title,
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
    setSessions(prev => {
      return prev.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            title: newTitle
          }
        }
        return session
      })
    })
  }
  
  // Delete a session
  const deleteSession = (sessionId: string) => {
    setSessions(prev => {
      const filteredSessions = prev.filter(session => session.id !== sessionId)
      
      // If we deleted the active session, set the active session to the most recent one
      if (sessionId === activeSessionId && filteredSessions.length > 0) {
        setActiveSessionId(filteredSessions[0].id)
      } else if (filteredSessions.length === 0) {
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
