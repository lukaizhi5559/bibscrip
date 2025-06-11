"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { BookText, Bookmark, Copy, ExternalLink, Lightbulb } from "lucide-react"
import Link from "next/link"

export interface Verse {
  reference: string
  text: string
  link?: string
  translation?: string
}

export interface Commentary {
  source: string
  text: string
  link?: string
}

export interface ChatResponseData {
  aiAnswer: string
  referencedVerses: Verse[]
  commentaryExcerpts: Commentary[]
}

interface ChatResponseCardProps {
  response: ChatResponseData
}

export function ChatResponseCard({ response }: ChatResponseCardProps) {
  const handleCopy = () => {
    // Basic copy functionality, can be improved with toast notifications
    const textToCopy = `AI Answer: ${response.aiAnswer}\n\nReferenced Verses:\n${response.referencedVerses.map((v) => `${v.reference} (${v.translation || "ESV"}): ${v.text}`).join("\n")}\n\nCommentary:\n${response.commentaryExcerpts.map((c) => `${c.source}: ${c.text}`).join("\n")}`
    navigator.clipboard.writeText(textToCopy).catch((err) => console.error("Failed to copy:", err))
  }

  return (
    <Card className="w-full shadow-soft-md">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Lightbulb className="mr-2 h-6 w-6 text-primary" />
          Your Answer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="mb-2 text-lg font-semibold flex items-center">
            <Lightbulb className="mr-2 h-5 w-5 text-primary/80" />
            AI Insight
          </h3>
          <p className="text-foreground/90 leading-relaxed">{response.aiAnswer}</p>
        </div>

        {response.referencedVerses.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="mb-3 text-lg font-semibold flex items-center">
                <BookText className="mr-2 h-5 w-5 text-primary/80" />
                Referenced Bible Verses
              </h3>
              <div className="space-y-4">
                {response.referencedVerses.map((verse, index) => (
                  <div key={index} className="p-3 bg-secondary/50 rounded-md border border-border">
                    <p className="font-medium text-foreground">
                      {verse.reference} ({verse.translation || "ESV"})
                    </p>
                    <p className="mt-1 text-sm text-foreground/80 leading-normal">{verse.text}</p>
                    {verse.link && (
                      <Button
                        variant="link"
                        size="sm"
                        asChild
                        className="mt-1 px-0 h-auto text-primary hover:text-primary/80"
                      >
                        <Link href={verse.link} target="_blank" rel="noopener noreferrer">
                          Read full chapter <ExternalLink className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {response.commentaryExcerpts.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="mb-3 text-lg font-semibold flex items-center">
                <BookText className="mr-2 h-5 w-5 text-primary/80" />
                Commentary Excerpts
              </h3>
              <div className="space-y-4">
                {response.commentaryExcerpts.map((commentary, index) => (
                  <div key={index} className="p-3 bg-secondary/50 rounded-md border border-border">
                    <p className="font-medium text-foreground">{commentary.source}</p>
                    <p className="mt-1 text-sm text-foreground/80 leading-normal">{commentary.text}</p>
                    {commentary.link && (
                      <Button
                        variant="link"
                        size="sm"
                        asChild
                        className="mt-1 px-0 h-auto text-primary hover:text-primary/80"
                      >
                        <Link href={commentary.link} target="_blank" rel="noopener noreferrer">
                          Read more <ExternalLink className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-6">
        <Button variant="outline" size="sm" onClick={() => alert("Bookmark feature coming soon!")}>
          <Bookmark className="mr-2 h-4 w-4" />
          Bookmark
        </Button>
        <Button variant="outline" size="sm" onClick={handleCopy}>
          <Copy className="mr-2 h-4 w-4" />
          Copy
        </Button>
      </CardFooter>
    </Card>
  )
}
