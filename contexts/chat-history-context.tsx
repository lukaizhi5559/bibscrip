"use client"

import React, { createContext, useContext, ReactNode } from 'react'
import { useChatHistory } from '@/hooks/use-chat-history'
import { ChatSession, ChatMessage } from '@/hooks/use-chat-history'
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
const ChatHistoryContext = createContext<ChatHistoryContextType | undefined>(undefined)

// Create a provider component
export function ChatHistoryProvider({ children }: { children: ReactNode }) {
  // Use the hook to get all the chat history functionality
  const chatHistory = useChatHistory()
  
  return (
    <ChatHistoryContext.Provider value={chatHistory}>
      {children}
    </ChatHistoryContext.Provider>
  )
}

// Create a custom hook to use the context
export function useChatHistoryContext() {
  const context = useContext(ChatHistoryContext)
  
  if (context === undefined) {
    throw new Error('useChatHistoryContext must be used within a ChatHistoryProvider')
  }
  
  return context
}
