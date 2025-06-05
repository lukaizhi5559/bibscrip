import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata = {
  title: "Terms of Use | BibScrip",
  description: "Read BibScrip's terms of use agreement, including user responsibilities, content policies, and intellectual property rights.",
}

export default function TermsPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Terms of Use</h1>
      <p className="text-muted-foreground mb-6">Last updated: June 4, 2025</p>
      
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-semibold mb-4">Welcome to BibScrip</h2>
          <p className="mb-4">
            These Terms of Use constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and BibScrip ("we," "us" or "our"), concerning your access to and use of the BibScrip website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the "Site").
          </p>
          <p className="mb-4">
            You agree that by accessing the Site, you have read, understood, and agree to be bound by all of these Terms of Use. If you do not agree with all of these terms, you are prohibited from using the site and must discontinue use immediately.
          </p>
          <p className="mb-4">
            Supplemental terms and conditions or documents that may be posted on the Site from time to time are hereby expressly incorporated herein by reference. We reserve the right, in our sole discretion, to make changes or modifications to these Terms of Use at any time and for any reason.
          </p>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-semibold mb-4">Intellectual Property Rights</h2>
          <p className="mb-4">
            Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws and various other intellectual property rights and unfair competition laws of the United States, international copyright laws, and international conventions.
          </p>
          <p className="mb-4">
            The Content and the Marks are provided on the Site "AS IS" for your information and personal use only. Except as expressly provided in these Terms of Use, no part of the Site and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, without our express prior written permission.
          </p>
          <p className="mb-4">
            Provided that you are eligible to use the Site, you are granted a limited license to access and use the Site and to download or print a copy of any portion of the Content to which you have properly gained access solely for your personal, non-commercial use. We reserve all rights not expressly granted to you in and to the Site, the Content and the Marks.
          </p>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-semibold mb-4">User Representations</h2>
          <p className="mb-4">By using the Site, you represent and warrant that:</p>
          <ol className="list-decimal pl-6 mb-4 space-y-2">
            <li>All registration information you submit will be true, accurate, current, and complete;</li>
            <li>You will maintain the accuracy of such information and promptly update such registration information as necessary;</li>
            <li>You have the legal capacity and you agree to comply with these Terms of Use;</li>
            <li>You are not a minor in the jurisdiction in which you reside;</li>
            <li>You will not access the Site through automated or non-human means, whether through a bot, script or otherwise;</li>
            <li>You will not use the Site for any illegal or unauthorized purpose;</li>
            <li>Your use of the Site will not violate any applicable law or regulation.</li>
          </ol>
          <p className="mb-4">
            If you provide any information that is untrue, inaccurate, not current, or incomplete, we have the right to suspend or terminate your account and refuse any and all current or future use of the Site (or any portion thereof).
          </p>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-semibold mb-4">User Registration</h2>
          <p className="mb-4">
            You may be required to register with the Site. You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable.
          </p>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-semibold mb-4">Prohibited Activities</h2>
          <p className="mb-4">
            You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
          </p>
          <p className="mb-4">As a user of the Site, you agree not to:</p>
          <ol className="list-decimal pl-6 mb-4 space-y-2">
            <li>Systematically retrieve data or other content from the Site to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</li>
            <li>Make any unauthorized use of the Site, including collecting usernames and/or email addresses of users by electronic or other means for the purpose of sending unsolicited email, or creating user accounts by automated means or under false pretenses.</li>
            <li>Circumvent, disable, or otherwise interfere with security-related features of the Site, including features that prevent or restrict the use or copying of any Content or enforce limitations on the use of the Site and/or the Content contained therein.</li>
            <li>Engage in unauthorized framing of or linking to the Site.</li>
            <li>Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.</li>
            <li>Engage in any automated use of the system, such as using scripts to send comments or messages, or using any data mining, robots, or similar data gathering and extraction tools.</li>
            <li>Interfere with, disrupt, or create an undue burden on the Site or the networks or services connected to the Site.</li>
            <li>Attempt to impersonate another user or person or use the username of another user.</li>
            <li>Use any information obtained from the Site in order to harass, abuse, or harm another person.</li>
            <li>Use the Site as part of any effort to compete with us or otherwise use the Site and/or the Content for any revenue-generating endeavor or commercial enterprise.</li>
          </ol>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-semibold mb-4">User-Generated Content</h2>
          <p className="mb-4">
            The Site may invite you to chat, contribute to, or participate in blogs, message boards, online forums, and other functionality, and may provide you with the opportunity to create, submit, post, display, transmit, perform, publish, distribute, or broadcast content and materials to us or on the Site, including but not limited to text, writings, video, audio, photographs, graphics, comments, suggestions, or personal information or other material (collectively, "Contributions").
          </p>
          <p className="mb-4">
            Contributions may be viewable by other users of the Site and through third-party websites. As such, any Contributions you transmit may be treated as non-confidential and non-proprietary. When you create or make available any Contributions, you thereby represent and warrant that:
          </p>
          <ol className="list-decimal pl-6 mb-4 space-y-2">
            <li>The creation, distribution, transmission, public display, or performance, and the accessing, downloading, or copying of your Contributions do not and will not infringe the proprietary rights, including but not limited to the copyright, patent, trademark, trade secret, or moral rights of any third party.</li>
            <li>You are the creator and owner of or have the necessary licenses, rights, consents, releases, and permissions to use and to authorize us, the Site, and other users of the Site to use your Contributions in any manner contemplated by the Site and these Terms of Use.</li>
            <li>You have the written consent, release, and/or permission of each and every identifiable individual person in your Contributions to use the name or likeness of each and every such identifiable individual person to enable inclusion and use of your Contributions in any manner contemplated by the Site and these Terms of Use.</li>
            <li>Your Contributions are not false, inaccurate, or misleading.</li>
          </ol>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-semibold mb-4">Content Disclaimers</h2>
          <p className="mb-4">
            We are not responsible or liable to any third party for the content or accuracy of any materials posted by you or any other user of the Site. Opinions, advice, statements, offers, or other information or content made available through the Site, but not directly by us, are those of their respective authors.
          </p>
          <p className="mb-4">
            AI-generated content on BibScrip is produced through algorithmic processes that analyze and synthesize information from multiple sources. While we strive for accuracy and helpfulness, AI responses should be considered as study aids and not as authoritative theological teaching. Users should always verify important information through recognized scholarly and denominational resources.
          </p>
          <p className="mb-4">
            Scripture quotations may be drawn from various translations, and we make every effort to attribute these properly. Users should consult official Bible translations for critical study and teaching purposes.
          </p>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-semibold mb-4">Site Management</h2>
          <p className="mb-4">
            We reserve the right, but not the obligation, to:
          </p>
          <ol className="list-decimal pl-6 mb-4 space-y-2">
            <li>Monitor the Site for violations of these Terms of Use;</li>
            <li>Take appropriate legal action against anyone who, in our sole discretion, violates the law or these Terms of Use, including without limitation, reporting such user to law enforcement authorities;</li>
            <li>In our sole discretion and without limitation, refuse, restrict access to, limit the availability of, or disable (to the extent technologically feasible) any of your Contributions or any portion thereof;</li>
            <li>In our sole discretion and without limitation, notice, or liability, to remove from the Site or otherwise disable all files and content that are excessive in size or are in any way burdensome to our systems;</li>
            <li>Otherwise manage the Site in a manner designed to protect our rights and property and to facilitate the proper functioning of the Site.</li>
          </ol>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-semibold mb-4">Privacy Policy</h2>
          <p className="mb-4">
            We care about data privacy and security. Please review our <a href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</a>. By using the Site, you agree to be bound by our Privacy Policy, which is incorporated into these Terms of Use. Most importantly, we store and process your information to provide our services effectively.
          </p>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-semibold mb-4">Term and Termination</h2>
          <p className="mb-4">
            These Terms of Use shall remain in full force and effect while you use the Site. WITHOUT LIMITING ANY OTHER PROVISION OF THESE TERMS OF USE, WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE SITE (INCLUDING BLOCKING CERTAIN IP ADDRESSES), TO ANY PERSON FOR ANY REASON OR FOR NO REASON, INCLUDING WITHOUT LIMITATION FOR BREACH OF ANY REPRESENTATION, WARRANTY, OR COVENANT CONTAINED IN THESE TERMS OF USE OR OF ANY APPLICABLE LAW OR REGULATION.
          </p>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="mb-4">
            In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at:
          </p>
          <p className="mb-4">
            BibScrip<br />
            123 Scripture Lane, Suite 456<br />
            Faith City, FC 98765<br />
            Email: legal@bibscrip.com<br />
            Phone: (555) 123-4567
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
