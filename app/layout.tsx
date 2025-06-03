import type React from "react"
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AppHeader } from "@/components/app-header"
import { AppFooter } from "@/components/app-footer"
import { SidebarController } from "@/components/sidebar-controller"
import { ChatHistoryProvider } from "@/contexts/chat-history-context"
import { UserProvider } from "@/contexts/user-context"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { cookies } from "next/headers"
import { LocalStorageInitializer } from "@/components/local-storage-initializer"
import { Toaster } from "@/components/ui/toaster"
import IdleAdsController from "@/components/IdleAdsController"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "BibScrip - AI Bible Study",
  description: "Explore the Bible with AI-powered insight, scripture, and study tools.",
  generator: 'v0.dev',
  icons: [
    { rel: "icon", url: "/bibscrip-logo.svg", type: "image/svg+xml" },
    { rel: "apple-touch-icon", url: "/bibscrip-logo.svg", type: "image/svg+xml" },
    { rel: "shortcut icon", url: "/bibscrip-logo.svg", type: "image/svg+xml" }
  ]
}

// Google Analytics 4 Measurement ID
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Replace with your actual GA4 measurement ID

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const defaultSidebarOpen = cookieStore.get(process.env.SIDEBAR_COOKIE_NAME || "sidebar:state")?.value !== "false"

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Google AdSense verification meta tag */}
        <meta name="google-adsense-account" content="ca-pub-3920325569173233" />
        
        {/* Google AdSense Auto Ads */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3920325569173233"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
        {/* Google Analytics 4 Script */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {/* Add the initializer to clean up localStorage */}
          <LocalStorageInitializer />
          <UserProvider>
            <ChatHistoryProvider>
              <SidebarProvider defaultOpen={defaultSidebarOpen}>
              <div className="bg-background w-full h-screen overflow-hidden">
                <SidebarController />
                <SidebarInset>
                {" "}
                {/* This component has flex-1 and adjusts its margin-left */}
                <div className="flex flex-col h-screen w-full">
                  {" "}
                  {/* This div takes full width of SidebarInset */}
                  <AppHeader /> {/* AppHeader uses its own internal 'container' to center its content */}
                  {/* This 'main' element will host the page content. */}
                  {/* It takes available vertical space and full width of its parent. */}
                  <main className="flex-1 w-full overflow-y-auto">
                    {/* This div is the container for the page content (children). */}
                    {/* Removed mx-auto to prevent uneven margins */}
                    <div className="w-full h-full">
                      {children}
                    </div>
                  </main> {/* AppFooter uses its own internal 'container' to center its content */}
                  {" "}
                </div>
              </SidebarInset>
              {/* <AppFooter /> */}
              </div>
              </SidebarProvider>
              {/* Idle Detection for Video Ads */}
              <IdleAdsController />
            </ChatHistoryProvider>
            <Toaster />
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
