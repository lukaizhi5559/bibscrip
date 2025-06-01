"use client"

import { createContext, ReactNode, useContext, useEffect } from "react"
import { ChatSession, ChatMessage, useChatHistory } from '@/hooks/use-chat-history'
import { ChatResponseData } from '@/components/chat-response-card'

// Define the context shape
interface ChatHistoryContextType {
  sessions: ChatSession[]
  activeSessionId: string | null
  activeSession: ChatSession | null
  createSession: () => string
  addMessage: (question: string, response: ChatResponseData) => void
  switchSession: (sessionId: string) => void
  updateSessionTitle: (sessionId: string, newTitle: string) => void
  deleteSession: (sessionId: string) => void
  clearAllSessions: () => void
}

// Create the context
const ChatHistoryContext = createContext<ChatHistoryContextType | null>(null)

// Create a provider component
export function ChatHistoryProvider({ children }: { children: ReactNode }) {
  // Use the hook to get all the chat history functionality
  const chatHistory = useChatHistory()
  
  // Add debug logging for provider renders
  console.log('ChatHistoryProvider rendering with', chatHistory.sessions.length, 'sessions')
  
  // Add logging for session changes to track updates
  useEffect(() => {
    console.log('Session state changed in context:', chatHistory.sessions.length, 'sessions')
  }, [chatHistory.sessions])
  
  useEffect(() => {
    console.log('Active session changed:', chatHistory.activeSessionId)
  }, [chatHistory.activeSessionId])
  
  return (
    <ChatHistoryContext.Provider value={chatHistory}>
      {children}
    </ChatHistoryContext.Provider>
  )
}

// Create a custom hook to use the context
export function useChatHistoryContext(): ChatHistoryContextType {
  const context = useContext(ChatHistoryContext)
  
  if (context === null) {
    throw new Error('useChatHistoryContext must be used within a ChatHistoryProvider')
  }
  
  return context
}
