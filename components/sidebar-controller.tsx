"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { useRouter, useSearchParams } from "next/navigation"
import { useChatHistoryContext } from "@/contexts/chat-history-context"

// This client component serves as a controller for the sidebar
// It receives the startNewChat function via a custom event
export function SidebarController() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { createSession } = useChatHistoryContext() // Get createSession from context

  const handleNewChat = () => {
    // Create a new session from context
    createSession()
    
    // Dispatch a custom event that the page component can listen for
    const newChatEvent = new CustomEvent('bibscrip:newchat', {
      bubbles: true,
      cancelable: true,
    })
    
    // Dispatch the event from the document
    document.dispatchEvent(newChatEvent)
    
    // Also clear the URL query params directly
    const params = new URLSearchParams(searchParams.toString())
    params.delete('q')
    router.push(`?${params.toString()}`)
  }

  return <AppSidebar onNewChat={handleNewChat} />
}
