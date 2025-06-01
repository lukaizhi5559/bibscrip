"use client"
import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarClose,
  useSidebar,
  SidebarGroup,
} from "@/components/ui/sidebar"
import { BibScripLogo } from "@/components/bibscrip-logo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Bookmark,
  History,
  Newspaper,
  Settings,
  LogOut,
  UserCircle2,
  PlusCircle,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightOpen,
} from "lucide-react"
import { HistorySidebar } from "@/components/history/history-sidebar"
import { useChatHistoryContext } from "@/contexts/chat-history-context"

const mainMenuItems = [
  { label: "Recent Chats", icon: <History />, href: "#recent", disabled: true, tooltip: "Recent Chats" },
  { label: "Bookmarks", icon: <Bookmark />, href: "#bookmarks", disabled: true, tooltip: "Bookmarks" },
  { label: "Reading Plans", icon: <Newspaper />, href: "#plans", badge: "Soon", tooltip: "Reading Plans" },
]

const secondaryMenuItems = [
  { label: "Settings", icon: <Settings />, href: "#settings", disabled: true, tooltip: "Settings" },
  { label: "Profile", icon: <UserCircle2 />, href: "#profile", disabled: true, tooltip: "Profile" },
]

export function AppSidebar({
  isMobile,
  openMobile,
  setOpenMobile,
  onNewChat, // Add a prop for the New Chat handler
}: {
  isMobile?: boolean
  openMobile?: boolean
  setOpenMobile?: (open: boolean) => void
  onNewChat?: () => void // Function to create a completely new chat
}) {
  const { state: sidebarState, setOpen, toggleSidebar, open: sidebarOpen } = useSidebar()
  const {
    sessions,
    activeSessionId,
    createSession,
    switchSession,
    updateSessionTitle,
    deleteSession,
    clearAllSessions
  } = useChatHistoryContext()

  return (
    <Sidebar collapsible="icon" side="left" variant="sidebar">
      <SidebarHeader>
        <div className="flex items-center w-full">
          {/* When expanded and not mobile, center the logo and put toggle to the right */}
          {sidebarState === "expanded" && !isMobile && (
            <>
              <div className="flex-1 flex justify-center">
                <Link href="/" aria-label="BibScrip Home">
                  <BibScripLogo size="md" />
                </Link>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="text-sidebar-foreground hover:bg-sidebar-accent"
                aria-label="Close sidebar"
              >
                <PanelLeftClose className="h-5 w-5" />
              </Button>
            </>
          )}

          {/* When expanded and mobile, logo left, close button right (standard sheet behavior) */}
          {sidebarState === "expanded" && isMobile && (
            <> 
              <Link href="/" aria-label="BibScrip Home" className="mr-auto">
                <BibScripLogo size="md" />
              </Link>
              {/* <SidebarClose /> Removed: SheetContent provides its own close button */}
            </>
          )}

          {/* When collapsed and not mobile, center the toggle icon */}
          {sidebarState === "collapsed" && !isMobile && (
            <div className="w-full flex justify-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="text-sidebar-foreground hover:bg-sidebar-accent"
                aria-label="Open sidebar"
              >
                <PanelLeftOpen className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </SidebarHeader>

      {sidebarState === "expanded" ? (
        // Only show history when sidebar is expanded
        <HistorySidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onCreateSession={() => {
            // Use the parent component's onNewChat function if available
            if (onNewChat) {
              onNewChat()
            } else {
              // Fallback to just creating a session
              createSession()
            }
            
            // Close sidebar on mobile after creating session
            if (isMobile && setOpenMobile) setOpenMobile(false)
          }}
          onSwitchSession={(sessionId) => {
            switchSession(sessionId)
            if (isMobile) setOpenMobile(false)
          }}
          onUpdateSessionTitle={updateSessionTitle}
          onDeleteSession={deleteSession}
          onClearAllSessions={clearAllSessions}
        />
      ) : (
        // When collapsed, show just the new chat button
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                icon={<PlusCircle />}
                tooltip="New Chat"
                onClick={() => {
                  // Use the parent component's onNewChat function if available
                  if (onNewChat) {
                    onNewChat()
                  } else {
                    // Fallback to just creating a session
                    createSession()
                  }
                  toggleSidebar()
                }}
              />
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                icon={<History />}
                tooltip="Chat History"
                onClick={toggleSidebar}
              />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      )}

      {sidebarState === "expanded" && (
        <SidebarFooter>
          <SidebarMenu>
            {secondaryMenuItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild={!item.disabled}
                  icon={item.icon}
                  label={item.label}
                  tooltip={item.tooltip}
                  disabled={item.disabled}
                  onClick={() => {
                    if (isMobile && !item.disabled) setOpenMobile(false)
                  }}
                >
                  {!item.disabled ? <Link href={item.href} /> : <span className="w-full" />}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  )
}
