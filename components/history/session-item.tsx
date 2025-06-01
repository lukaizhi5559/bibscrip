"use client"

import { useState } from 'react'
import { ChatSession } from '@/hooks/use-chat-history'
import { Button } from '@/components/ui/button'
import { MessageSquare, Pencil, Check, X, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface SessionItemProps {
  session: ChatSession
  isActive: boolean
  onClick: () => void
  onRename: (id: string, newTitle: string) => void
  onDelete: (id: string) => void
}

export function SessionItem({ session, isActive, onClick, onRename, onDelete }: SessionItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [titleInput, setTitleInput] = useState(session.title)
  
  const formattedDate = new Date(session.updatedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  })
  
  const handleRename = () => {
    onRename(session.id, titleInput)
    setIsEditing(false)
  }
  
  const cancelRename = () => {
    setTitleInput(session.title)
    setIsEditing(false)
  }
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering onClick of the parent
    onDelete(session.id)
  }
  
  return (
    <div 
      className={cn(
        "group flex flex-col w-full rounded-md p-3 cursor-pointer hover:bg-muted/50 transition-colors",
        isActive && "bg-muted"
      )}
      onClick={isEditing ? undefined : onClick}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <MessageSquare className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          
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
                  className="h-6 w-6" 
                  onClick={(e) => e.stopPropagation()}
                >
                  <Check className="h-3 w-3" />
                </Button>
                <Button 
                  type="button" 
                  size="icon" 
                  variant="ghost" 
                  className="h-6 w-6" 
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
              <span className="font-medium truncate mr-2">
                {session.title.length > 20 ? `${session.title.substring(0, 20)}...` : session.title}
              </span>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {formattedDate}
              </span>
            </div>
          )}
        </div>
        
        {!isEditing && (
          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={(e) => {
                e.stopPropagation()
                setIsEditing(true)
              }}
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-destructive hover:text-destructive" 
              onClick={handleDeleteClick}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
      
      {session.messages.length > 0 && !isEditing && (
        <p className="text-xs text-muted-foreground mt-1 truncate">
          {session.messages[0].question.length > 40 
            ? `${session.messages[0].question.substring(0, 40)}...` 
            : session.messages[0].question}
        </p>
      )}
    </div>
  )
}
