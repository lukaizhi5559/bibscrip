"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChatSession } from '@/hooks/use-chat-history'
import { Button } from '@/components/ui/button'
import { MessageSquare, Pencil, Check, X, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Helper function to format long text with line breaks at word boundaries
const formatLongText = (text: string, charsPerLine: number = 40): React.ReactNode => {
  if (!text || text.length <= charsPerLine) return text;
  
  // Split the text into words
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  // Build lines respecting word boundaries
  words.forEach(word => {
    // If adding this word would exceed the line length
    if ((currentLine + ' ' + word).length > charsPerLine && currentLine !== '') {
      lines.push(currentLine);
      currentLine = word;
    } else {
      // Add the word to the current line with a space if not the first word
      currentLine = currentLine === '' ? word : `${currentLine} ${word}`;
    }
  });
  
  // Add the last line if not empty
  if (currentLine) {
    lines.push(currentLine);
  }
  
  // Join lines with line breaks
  return lines.map((line, index) => (
    <React.Fragment key={index}>
      {index > 0 && <br />}
      {line}
    </React.Fragment>
  ));
}

interface SessionItemProps {
  session: ChatSession
  isActive: boolean
  onClick: () => void
  onRename: (id: string, newTitle: string) => void
  onDelete: (id: string) => void
}

export function SessionItem({ session, isActive, onClick, onRename, onDelete }: SessionItemProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isEditing, setIsEditing] = useState(false)
  const [titleInput, setTitleInput] = useState(session.fullPrompt || session.title)
  
  // Use a ref to track if we've already auto-activated this session to prevent infinite loops
  const hasAutoActivatedRef = useRef(false)
  
  // Check URL parameters to correctly highlight active session - but don't log it
  const urlSessionId = searchParams.get('id')
  
  // Consider a session active if either:
  // 1. It was marked active by parent component (context-based) OR
  // 2. It matches the URL parameter 'id'
  const shouldBeActive = isActive || (urlSessionId === session.id)
  
  // Direct URL-based session activation - runs only on initial mount to avoid loops
  // Use a dedicated useEffect with an empty dependency array to ensure it runs exactly once
  useEffect(() => {
    // We need the URL to match this session's ID AND the session must not already be active
    if (urlSessionId === session.id && !isActive) {
      // Set a short delay to ensure the app is fully initialized before activating
      const timer = setTimeout(() => {
        // Double-check that we still need to activate (may have changed during the timeout)
        if (!hasAutoActivatedRef.current && !isActive) {
          // Lock this to prevent any possibility of running again
          hasAutoActivatedRef.current = true;
          
          // Call the click handler to activate this session
          onClick();
        }
      }, 100); // Slightly longer delay for more stability
      
      // Clean up timer if component unmounts before it fires
      return () => clearTimeout(timer);
    }
  }, []); // Empty dependency array = run once on mount
  
  const formattedDate = new Date(session.updatedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  })
  
  const handleClick = () => {
    if (!isEditing) {
      // Log the click for debugging
      console.log('SessionItem click handler for', session.id)
      
      // Emit custom event to ensure results panel is opened
      const event = new CustomEvent('bibscrip:showresults', { 
        bubbles: true, 
        detail: { sessionId: session.id } 
      })
      document.dispatchEvent(event)
      
      // Call the provided onClick handler to switch sessions
      onClick()
    }
  }
  
  const handleRename = () => {
    console.log('SessionItem: Renaming session', session.id, 'to', titleInput)
    onRename(session.id, titleInput)
    setIsEditing(false)
  }
  
  const cancelRename = () => {
    setTitleInput(session.title)
    setIsEditing(false)
  }
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering onClick of the parent
    console.log('SessionItem: Deleting session', session.id)
    onDelete(session.id)
  }
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering onClick of the parent
    setIsEditing(true)
  }
  
  // Handle session item clicks - needed for session selection
  const handleSessionClick = (e: React.MouseEvent) => {
    // Don't proceed if we're editing or clicking on action buttons
    if (isEditing || (e.target as HTMLElement).closest('.session-action-btn')) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    
    console.log('SessionItem clicked:', session.id)
    
    // Emit custom event to ensure results panel is opened
    const event = new CustomEvent('bibscrip:showresults', { 
      bubbles: true, 
      detail: { sessionId: session.id } 
    })
    document.dispatchEvent(event)
    
    // Call the onClick handler to update the context state
    onClick()
  }
  
  return (
    <div 
      className={cn(
        "group flex flex-col w-full rounded-md p-2 cursor-pointer hover:bg-muted/50 transition-colors relative",
        shouldBeActive && "bg-muted"
      )}
      onClick={isEditing ? undefined : handleSessionClick}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* <MessageSquare className="h-4 w-4 flex-shrink-0 text-muted-foreground" /> */}
          
          {isEditing ? (
            <form 
              onSubmit={(e) => {
                e.preventDefault()
                handleRename()
              }}
              className="flex-1 flex items-center gap-1"
            >
              <Input
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                autoFocus
                className="h-7 py-1"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex items-center">
                <Button 
                  type="submit" 
                  size="icon" 
                  variant="ghost" 
                  className="h-6 w-6 session-action-btn" 
                  onClick={(e) => e.stopPropagation()}
                >
                  <Check className="h-3 w-3" />
                </Button>
                <Button 
                  type="button" 
                  size="icon" 
                  variant="ghost" 
                  className="h-6 w-6 session-action-btn" 
                  onClick={(e) => {
                    e.stopPropagation()
                    cancelRename()
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between w-full min-w-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs text-muted-foreground mt-1 truncate">
                      {session.title.length > 15 ? `${session.title.substring(0, 15)}...` : session.fullPrompt}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[300px]">
                    <p className="text-xs">
                      {formatLongText(session.fullPrompt || session.title, 40)}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {formattedDate}
              </span>
            </div>
          )}
        </div>
        
        {!isEditing && (
          <div 
            className="flex items-center" 
            onClick={(e) => e.stopPropagation()}
          >
            <Button 
              type="button"
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 session-action-btn" 
              onClick={handleEdit}
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button 
              type="button"
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-destructive hover:text-destructive/90 session-action-btn" 
              onClick={handleDeleteClick}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
      
      {/* Removed subtitle to make items more compact */}
      {/* {session.messages.length > 0 && !isEditing && (
        <p className="text-xs text-muted-foreground mt-1 truncate">
          {session.messages[0].question.length > 20 
            ? `${session.messages[0].question.substring(0, 20)}...` 
            : session.messages[0].question}
        </p>
      )} */}
    </div>
  )
}
