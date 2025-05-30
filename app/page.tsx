"use client"

import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChatResponseCard, type ChatResponseData } from "@/components/chat-response-card"
import { AiTypingIndicator } from "@/components/ai-typing-indicator"
import { SendHorizonal } from 'lucide-react'

const mockResponse: ChatResponseData = {
  aiAnswer:
    "Romans 8:28 reminds us that in all things God works for the good of those who love him, who have been called according to his purpose. This doesn't mean that bad things won't happen, but that God can use even difficult situations for an ultimate good in the lives of believers. It's a promise of God's sovereign care and redemptive power in the midst of life's trials.",
  referencedVerses: [
    {
      reference: "Romans 8:28",
      translation: "NIV",
      text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
      link: "#",
    },
    {
      reference: "Genesis 50:20",
      translation: "ESV",
      text: "As for you, you meant evil against me, but God meant it for good, to bring it about that many people should be kept alive, as they are today.",
      link: "#",
    },
  ],
  commentaryExcerpts: [
    {
      source: "Matthew Henry's Commentary",
      text: "Whatever the particular providences of God may be, they are all to work for good to them that love God. This verse is a great comfort in all afflictions and distresses, that God is working all things together for their good.",
    },
    {
      source: "John Gill's Exposition",
      text: "This is a general rule, which holds true of all things that happen in the world, or that ever did, or will befall the saints. All afflictions, of whatever kind, are for their good.",
    },
  ],
}

export default function HomePage() {
  const [inputValue, setInputValue] = useState("")
  const [chatResponse, setChatResponse] = useState<ChatResponseData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!inputValue.trim()) return

    setIsLoading(true)
    setChatResponse(null)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setChatResponse(mockResponse)
    setIsLoading(false)
    setInputValue("")
  }

  return (
    <div className="py-8 md:py-12 flex flex-col items-center h-full w-full">
      <section className="w-full max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Ask BibScrip Anything</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Explore the Bible with AI-powered insight, scripture, and study tools.
        </p>
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="What does Romans 8:28 mean?"
            className="h-12 flex-grow text-base shadow-sm focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="Ask a question about the Bible"
          />
          <Button type="submit" size="lg" className="h-12 w-full sm:w-auto shadow-sm" disabled={isLoading}>
            <SendHorizonal className="mr-2 h-4 w-4 sm:hidden md:inline-block" />
            Ask
          </Button>
        </form>
        <p className="mt-3 text-xs text-muted-foreground">
          BibScrip provides responses based on Scripture and trusted commentary.
        </p>
      </section>

      {isLoading && (
        <section className="mt-12 w-full max-w-3xl flex justify-center">
          <AiTypingIndicator />
        </section>
      )}

      {chatResponse && !isLoading && (
        <section className="mt-12 w-full max-w-3xl">
          <ChatResponseCard response={chatResponse} />
        </section>
      )}
    </div>
  )
}
