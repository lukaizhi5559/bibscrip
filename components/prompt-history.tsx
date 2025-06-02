"use client"

import React from "react"
import { useChatHistoryContext } from "@/contexts/chat-history-context"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { History, Search } from "lucide-react"
import { cn } from "@/lib/utils"

export function PromptHistory() {
  const { activeSession } = useChatHistoryContext()
  
  if (!activeSession || !activeSession.messages || activeSession.messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground">
        <History className="h-5 w-5 mb-2 opacity-50" />
        <p className="text-xs">No prompt history yet</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center px-4 py-2 border-b">
        <Search className="h-4 w-4 mr-2 text-muted-foreground" />
        <span className="text-sm font-medium">Prompt History</span>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {activeSession.messages.map((message, index) => (
            <Button
              key={index}
              variant="ghost"
              className={cn(
                "w-full justify-start h-auto py-2 px-3 text-xs font-normal text-left overflow-hidden",
                "hover:bg-accent/50 hover:text-accent-foreground",
                "transition-colors"
              )}
              title={message.question}
            >
              <div className="truncate w-full">{message.question}</div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
