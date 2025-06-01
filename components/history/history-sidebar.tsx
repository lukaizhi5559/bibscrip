"use client"

import { useState } from 'react'
import { ChatSession } from '@/hooks/use-chat-history'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SessionItem } from './session-item'
import { PlusCircle, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from '@/lib/utils'

interface HistorySidebarProps {
  sessions: ChatSession[]
  activeSessionId: string | null
  onCreateSession: () => void
  onSwitchSession: (sessionId: string) => void
  onUpdateSessionTitle: (sessionId: string, newTitle: string) => void
  onDeleteSession: (sessionId: string) => void
  onClearAllSessions: () => void
  className?: string
}

export function HistorySidebar({
  sessions,
  activeSessionId,
  onCreateSession,
  onSwitchSession,
  onUpdateSessionTitle,
  onDeleteSession,
  onClearAllSessions,
  className
}: HistorySidebarProps) {
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  
  return (
    <div className={cn("flex flex-col h-full bg-card border-r", className)}>
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h2 className="text-sm font-medium">Chat History</h2>
        {sessions.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={() => setClearDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="p-3">
        <Button 
          variant="outline" 
          className="w-full flex items-center gap-2 justify-start" 
          onClick={onCreateSession}
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Chat</span>
        </Button>
      </div>
      
      {sessions.length > 0 ? (
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            {sessions.map((session) => (
              <SessionItem
                key={session.id}
                session={session}
                isActive={session.id === activeSessionId}
                onClick={() => onSwitchSession(session.id)}
                onRename={onUpdateSessionTitle}
                onDelete={onDeleteSession}
              />
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex flex-1 items-center justify-center p-4 text-center">
          <div className="text-sm text-muted-foreground">
            <p>No chat history yet.</p>
            <p>Start a new chat to begin.</p>
          </div>
        </div>
      )}
      
      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Chats</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your chat history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={onClearAllSessions}
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
