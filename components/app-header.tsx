"use client"
import Link from "next/link"
import { BibScripLogo } from "@/components/bibscrip-logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"

export function AppHeader() {
  const { open, isMobile } = useSidebar()

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full flex h-14 items-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* SidebarTrigger for mobile */}
        <SidebarTrigger className="md:hidden mr-2" />

        <div className="flex items-center justify-between flex-1">
          {(isMobile || (!isMobile && !open)) && (
            <div className="flex items-center">
              <Link href="/" aria-label="BibScrip Home">
                <BibScripLogo size="md" />
              </Link>
            </div>
          )}
          {!isMobile && open && (
            // Placeholder to balance the layout when sidebar is open on desktop and logo is in sidebar
            <div style={{ width: 'auto', minWidth: isMobile ? 0 : 'var(--sidebar-width-icon)' }} />
          )}
          <div className="flex items-center gap-2 ml-auto">
            <div className="relative z-50">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
