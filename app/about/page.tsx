import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata = {
  title: "About Us | BibScrip",
  description: "Learn about BibScrip's mission to make biblical wisdom accessible through AI-powered scripture exploration, commentary, and study tools.",
}

export default function AboutPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">About BibScrip</h1>
      
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="mb-4">
            BibScrip was founded with a clear mission: to make biblical wisdom more accessible and applicable to everyday life through modern technology. We believe that the ancient truths found in scripture remain profoundly relevant today, and we're passionate about helping people engage with these texts in meaningful ways.
          </p>
          <p className="mb-4">
            Our platform combines artificial intelligence with carefully curated biblical resources to create a unique study experience that's both informative and spiritually enriching. Whether you're a scholar, pastor, student, or simply someone seeking wisdom, BibScrip provides tools to deepen your understanding of scripture.
          </p>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-semibold mb-4">What Makes Us Different</h2>
          <p className="mb-4">
            Unlike standard Bible apps or search engines, BibScrip offers a truly interactive experience. Our AI-powered tools help you:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Ask questions about scripture in natural language and receive thoughtful, contextually aware responses</li>
            <li>Explore related verses that illuminate the themes and principles you're studying</li>
            <li>Access insights from respected biblical commentaries spanning different traditions and historical periods</li>
            <li>Save and organize your study sessions for continued learning</li>
            <li>Discover new connections between passages and themes across the Bible</li>
          </ul>
          <p className="mb-4">
            We emphasize human editorial oversight in our AI systems to ensure that responses align with scholarly understanding while respecting diverse theological perspectives.
          </p>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-semibold mb-4">Our Values</h2>
          <p className="mb-4">At BibScrip, we're guided by these core values:</p>
          
          <h3 className="text-xl font-medium mt-6 mb-3">Faithful Scholarship</h3>
          <p className="mb-4">
            We believe in approaching scripture with both reverence and intellectual rigor. Our platform integrates insights from respected biblical scholars across traditions while maintaining respect for the text.
          </p>
          
          <h3 className="text-xl font-medium mt-6 mb-3">Inclusive Community</h3>
          <p className="mb-4">
            Scripture has been cherished by diverse communities throughout history. We strive to create a platform that serves believers from various backgrounds and denominations, acknowledging different interpretative traditions.
          </p>
          
          <h3 className="text-xl font-medium mt-6 mb-3">Technological Innovation</h3>
          <p className="mb-4">
            We embrace cutting-edge technology as a means to make ancient wisdom accessible. AI serves as our tool, not our authority, helping users engage with scripture in new and meaningful ways.
          </p>
          
          <h3 className="text-xl font-medium mt-6 mb-3">Personal Transformation</h3>
          <p className="mb-4">
            Beyond information, we believe scripture study should foster personal growth and spiritual development. Our platform aims to facilitate not just learning, but transformation.
          </p>
        </CardContent>
      </Card>
      
      {/* <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-semibold mb-4">Our Team</h2>
          <p className="mb-4">
            BibScrip brings together experts in biblical studies, theology, artificial intelligence, and software development. Our team includes:
          </p>
          
          <div className="mt-6 space-y-6">
            <div>
              <h3 className="text-xl font-medium mb-1">Dr. Sarah Johnson</h3>
              <p className="text-muted-foreground mb-2">Founder & Biblical Studies Director</p>
              <p>
                With a Ph.D. in New Testament studies and over 15 years of teaching experience, Dr. Johnson leads our content development and ensures scholarly accuracy across the platform.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-medium mb-1">Michael Chen</h3>
              <p className="text-muted-foreground mb-2">Chief Technology Officer</p>
              <p>
                A veteran software engineer with expertise in AI and natural language processing, Michael oversees the development of our intelligent scripture analysis tools.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-medium mb-1">Rev. James Williams</h3>
              <p className="text-muted-foreground mb-2">Theological Advisor</p>
              <p>
                An ordained minister with an interdisciplinary background in systematic theology and biblical hermeneutics, Rev. Williams helps ensure our platform respects diverse theological traditions.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-medium mb-1">Rachel Torres</h3>
              <p className="text-muted-foreground mb-2">User Experience Director</p>
              <p>
                With a passion for making complex information accessible, Rachel designs intuitive interfaces that help users of all backgrounds engage meaningfully with scripture.
              </p>
            </div>
          </div>
          
          <p className="mt-6">
            Our team is united by a shared commitment to creating technology that serves spiritual growth and biblical understanding.
          </p>
        </CardContent>
      </Card> */}
      
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-semibold mb-4">Our Approach to AI</h2>
          <p className="mb-4">
            At BibScrip, we view artificial intelligence as a powerful tool for scripture study, but never as a replacement for human discernment or spiritual guidance. Our AI systems are:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            {/* <li><strong>Human-reviewed:</strong> Our team regularly evaluates AI responses to ensure accuracy and appropriateness</li> */}
            <li><strong>Transparently sourced:</strong> We clearly distinguish between AI-generated content and direct quotations from commentaries or scripture</li>
            <li><strong>Continuously improved:</strong> We regularly update our systems based on user feedback and advances in biblical scholarship</li>
            <li><strong>Designed to support, not replace:</strong> Our AI serves as a study companion, not an authoritative interpreter</li>
          </ul>
          <p className="mb-4">
            We believe this balanced approach allows us to harness technology's benefits while maintaining the human connection and spiritual depth essential to meaningful scripture study.
          </p>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-semibold mb-4">Join Our Journey</h2>
          <p className="mb-4">
            BibScrip is more than a platform—it's a community of learners and seekers. We invite you to:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Create an account to personalize your scripture study experience</li>
            <li>Share your feedback to help us improve our tools and resources</li>
            <li>Connect with other users exploring similar passages or themes</li>
            <li>Consider supporting our mission through subscription or donation</li>
          </ul>
          <p className="mb-4">
            Together, we can create new ways to engage with ancient wisdom for contemporary life.
          </p>
          <p className="mb-4">
            Have questions or suggestions? We'd love to hear from you. Visit our <a href="/contact" className="text-blue-600 hover:underline">Contact page</a> to get in touch.
          </p>
        </CardContent>
      </Card>
      
      <Separator className="my-8" />
      
      <p className="text-center text-muted-foreground">
        © {new Date().getFullYear()} BibScrip. All rights reserved.
      </p>
    </div>
  )
}
