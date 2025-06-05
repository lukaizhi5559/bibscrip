import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, MessageSquare, Search, Sparkles } from "lucide-react"
import Link from "next/link"

export function WelcomeSection() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">Welcome to BibScrip</h1>
        <p className="text-xl mb-6 max-w-3xl mx-auto text-muted-foreground">
          Discover deeper biblical wisdom through AI-assisted scripture exploration, 
          trusted commentaries, and personalized study tools
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" />
              Ask Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Ask questions about scripture in everyday language. Our AI provides thoughtful responses
              grounded in biblical wisdom, with references to specific verses and respected commentaries.
            </p>
            <div className="bg-muted p-3 rounded-md text-sm mb-4">
              <strong>Example:</strong> "What does the Bible say about overcoming anxiety?"
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              Explore Passages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Dive deeper into specific Bible verses with cross-references, historical context,
              and insights from multiple translations and commentary traditions.
            </p>
            <div className="bg-muted p-3 rounded-md text-sm mb-4">
              <strong>Example:</strong> "Explain the meaning of Romans 8:28 in context"
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="mr-2 h-5 w-5" />
              Discover Connections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Uncover connections between biblical themes, characters, and stories across
              both Old and New Testaments to enhance your understanding.
            </p>
            <div className="bg-muted p-3 rounded-md text-sm mb-4">
              <strong>Example:</strong> "How does the covenant with Abraham relate to Jesus?"
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-12">
        <CardHeader>
          <CardTitle>Daily Verse Reflection</CardTitle>
          <CardDescription>Wisdom for today from God's Word</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <blockquote className="text-xl italic mb-4">
              "For I know the plans I have for you," declares the LORD, "plans to prosper you and not to harm you, plans to give you hope and a future."
            </blockquote>
            <p className="font-semibold">Jeremiah 29:11</p>
            <div className="mt-6 max-w-2xl mx-auto">
              <p className="mb-4">
                This beloved verse was spoken to the Israelites during their exile in Babylon. Though they were experiencing hardship and displacement, God assured them that their current circumstance was not their final destination. 
              </p>
              <p>
                Even in our most challenging seasons, this verse reminds us that God has a broader perspective and a purpose that extends beyond our immediate difficulties. The hope it offers isn't necessarily for immediate prosperity, but for God's faithful guidance toward a meaningful future aligned with His purposes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Start Your Study Journey</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-6">
              BibScrip combines time-honored biblical wisdom with modern AI technology to create
              a uniquely personal and insightful Bible study experience. Our mission is to make scripture
              accessible, understandable, and applicable to your daily life.
            </p>
            <p className="mb-6">
              Whether you're a seasoned theology student, a pastor preparing a sermon, or simply seeking
              spiritual wisdom, BibScrip offers tools to deepen your understanding of scripture.
            </p>
            <div className="flex justify-center">
              <Button className="flex items-center">
                Begin Exploring <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Featured Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <Search className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Topical Scripture Index</h3>
                  <p className="text-sm text-muted-foreground">Browse verses organized by themes like faith, hope, and love</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Commentary Collection</h3>
                  <p className="text-sm text-muted-foreground">Access insights from respected biblical scholars through the ages</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Study Guides</h3>
                  <p className="text-sm text-muted-foreground">Structured approaches to exploring books of the Bible</p>
                </div>
              </li>
            </ul>
            <div className="mt-6 text-center">
              <Link href="/about" className="text-primary hover:underline">Learn more about our resources</Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Join the BibScrip Community</h2>
            <p className="mb-6 max-w-2xl mx-auto">
              Create a free account to save your study sessions, access premium features,
              and connect with others on their spiritual journey.
            </p>
            <Button variant="secondary" className="mx-2">Sign Up</Button>
            <Button variant="outline" className="mx-2">Learn More</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
