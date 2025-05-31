import type React from "react"
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AppHeader } from "@/components/app-header"
import { AppFooter } from "@/components/app-footer"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { cookies } from "next/headers"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "BibScrip - AI Bible Study",
  description: "Explore the Bible with AI-powered insight, scripture, and study tools.",
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const defaultSidebarOpen = cookieStore.get(process.env.SIDEBAR_COOKIE_NAME || "sidebar:state")?.value !== "false"

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SidebarProvider defaultOpen={defaultSidebarOpen}>
            <div className="bg-background w-full h-screen overflow-hidden">
              <AppSidebar />
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
                      <AppFooter />
                    </div>
                  </main> {/* AppFooter uses its own internal 'container' to center its content */}
                </div>
              </SidebarInset>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
