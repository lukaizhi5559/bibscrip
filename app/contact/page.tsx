"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Mail, MapPin, Phone } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Metadata is now in metadata.ts file

export default function ContactPage() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // This would normally connect to your backend API
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast({
        title: "Message Sent!",
        description: "Thank you for reaching out. We'll respond to your inquiry soon.",
      })
      
      // Reset the form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      })
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Your message could not be sent. Please try again later.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-semibold mb-6">Get In Touch</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    placeholder="Your name" 
                    required 
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="your.email@example.com" 
                    required 
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input 
                    id="subject" 
                    name="subject" 
                    placeholder="What is this regarding?" 
                    required 
                    value={formData.subject}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    name="message" 
                    placeholder="Your message..." 
                    rows={5} 
                    required 
                    value={formData.message}
                    onChange={handleChange}
                  />
                </div>
                
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <p className="font-medium">Email</p>
                  <a href="mailto:contact@bibscrip.com" className="text-blue-600 hover:underline">
                    contact@bibscrip.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p>(555) 123-4567</p>
                  <p className="text-sm text-muted-foreground">Monday-Friday, 9am-5pm EST</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <p className="font-medium">Office</p>
                  <p>123 Scripture Lane</p>
                  <p>Suite 456</p>
                  <p>Faith City, FC 98765</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-xl font-medium mb-4">Frequently Asked Questions</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">How long will it take to get a response?</h4>
                  <p className="text-muted-foreground">We strive to respond to all inquiries within 1-2 business days.</p>
                </div>
                
                <div>
                  <h4 className="font-medium">Do you offer technical support?</h4>
                  <p className="text-muted-foreground">Yes! For technical issues, please include your device and browser information in your message.</p>
                </div>
                
                <div>
                  <h4 className="font-medium">Can I suggest new features?</h4>
                  <p className="text-muted-foreground">Absolutely! We welcome your ideas for improving BibScrip.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-12">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-semibold mb-4">About BibScrip Support</h2>
            <p className="mb-4">
              Our dedicated support team is committed to providing timely and helpful assistance to all users of BibScrip. Whether you have questions about using our platform, need help troubleshooting an issue, or simply want to share feedback, we're here to help.
            </p>
            <p className="mb-4">
              We value your input and use it to continuously improve our services. Your questions and suggestions directly influence the development of new features and improvements to our platform.
            </p>
            <p>
              For more information about BibScrip, please visit our <a href="/about" className="text-blue-600 hover:underline">About page</a>.
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Separator className="my-8" />
      
      <p className="text-center text-muted-foreground">
        © {new Date().getFullYear()} BibScrip. All rights reserved.
      </p>
    </div>
  )
}
