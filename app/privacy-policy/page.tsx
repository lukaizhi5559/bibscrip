import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata = {
  title: "Privacy Policy | BibScrip",
  description: "Learn how BibScrip collects, uses, and protects your personal information when you use our Bible study and scripture analysis service.",
}

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-muted-foreground mb-6">Last updated: June 4, 2025</p>
      
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
          <p className="mb-4">
            Welcome to BibScrip. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
          </p>
          <p className="mb-4">
            BibScrip is a faith-based platform designed to help you study and explore biblical scriptures through AI-assisted analysis, commentary references, and verse explorations. Our mission is to make biblical wisdom more accessible while respecting your personal information and privacy.
          </p>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
          <p className="mb-4">We may collect several different types of information for various purposes:</p>
          
          <h3 className="text-xl font-medium mt-6 mb-3">Personal Data</h3>
          <p className="mb-4">While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). This may include:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Email address (if you choose to create an account)</li>
            <li>First name and last name (optional for personalized experiences)</li>
            <li>Usage Data (described below)</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
          
          <h3 className="text-xl font-medium mt-6 mb-3">Usage Data</h3>
          <p className="mb-4">
            We may also collect information on how the Service is accessed and used ("Usage Data"). This Usage Data may include information such as your computer's Internet Protocol address (IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers, and other diagnostic data.
          </p>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
          <p className="mb-4">BibScrip uses the collected data for various purposes:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>To provide and maintain our Service</li>
            <li>To notify you about changes to our Service</li>
            <li>To provide customer support</li>
            <li>To gather analysis or valuable information so that we can improve our Service</li>
            <li>To monitor the usage of our Service</li>
            <li>To detect, prevent and address technical issues</li>
            <li>To personalize your experience with scripture study and commentary</li>
            <li>To save your study preferences and history (if you create an account)</li>
          </ul>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking</h2>
          <p className="mb-4">
            We use cookies and similar tracking technologies to track activity on our Service and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier.
          </p>
          <p className="mb-4">
            You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.
          </p>
          <p className="mb-4">Examples of Cookies we use:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Session Cookies:</strong> We use Session Cookies to operate our Service.</li>
            <li><strong>Preference Cookies:</strong> We use Preference Cookies to remember your preferences and various settings.</li>
            <li><strong>Security Cookies:</strong> We use Security Cookies for security purposes.</li>
            <li><strong>Advertising Cookies:</strong> Advertising Cookies are used to serve you with advertisements that may be relevant to you and your interests.</li>
          </ul>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-semibold mb-4">Advertising</h2>
          <p className="mb-4">
            We may use third-party Service Providers, including Google AdSense, to show advertisements to you to help support and maintain our Service.
          </p>
          <p className="mb-4">
            These third-party ad servers or ad networks use technology to send the advertisements and links that appear on BibScrip directly to your browser. They automatically receive your IP address when this occurs. Other technologies (such as cookies, JavaScript, or Web Beacons) may also be used by our third-party ad networks to measure the effectiveness of their advertisements and/or to personalize the advertising content that you see.
          </p>
          <p className="mb-4">
            BibScrip has no access to or control over these cookies that are used by third-party advertisers. You should consult the respective privacy policies of these third-party ad servers for more detailed information on their practices as well as for instructions about how to opt-out of certain practices.
          </p>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
          <p className="mb-4">
            The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
          </p>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
          <p className="mb-4">
            Our Service may contain links to other sites that are not operated by us. If you click on a third-party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit.
          </p>
          <p className="mb-4">
            We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
          </p>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
          <p className="mb-4">
            Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13. If you are a parent or guardian and you are aware that your child has provided us with Personal Data, please contact us. If we become aware that we have collected Personal Data from children without verification of parental consent, we take steps to remove that information from our servers.
          </p>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-semibold mb-4">Changes to This Privacy Policy</h2>
          <p className="mb-4">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this Privacy Policy.
          </p>
          <p className="mb-4">
            You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
          </p>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this Privacy Policy, please contact us:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>By email: contact@bibscrip.com</li>
            <li>By visiting the contact page on our website: <a href="/contact" className="text-blue-600 hover:underline">Contact Us</a></li>
          </ul>
        </CardContent>
      </Card>
      
      <Separator className="my-8" />
      
      <p className="text-center text-muted-foreground">
        © {new Date().getFullYear()} BibScrip. All rights reserved.
      </p>
    </div>
  )
}
