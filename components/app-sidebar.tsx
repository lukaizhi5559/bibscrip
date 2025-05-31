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
  PanelRightOpen,
} from "lucide-react"

const mainMenuItems = [
  { label: "Recent Chats", icon: <History />, href: "#recent", disabled: true, tooltip: "Recent Chats" },
  { label: "Bookmarks", icon: <Bookmark />, href: "#bookmarks", disabled: true, tooltip: "Bookmarks" },
  { label: "Reading Plans", icon: <Newspaper />, href: "#plans", badge: "Soon", tooltip: "Reading Plans" },
]

const secondaryMenuItems = [
  { label: "Settings", icon: <Settings />, href: "#settings", disabled: true, tooltip: "Settings" },
  { label: "Profile", icon: <UserCircle2 />, href: "#profile", disabled: true, tooltip: "Profile" },
]

export function AppSidebar() {
  const { state: sidebarState, setOpenMobile, toggleSidebar, open, isMobile } = useSidebar()

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
                <PanelRightOpen className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              icon={<PlusCircle />}
              label="New Chat"
              tooltip="Start a New Chat"
              className="bg-primary/10 text-primary hover:bg-primary/20 data-[active=true]:bg-primary/20 font-medium"
              onClick={() => {
                if (isMobile && sidebarState === "expanded") setOpenMobile(false)
                alert("New Chat clicked!")
              }}
            />
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarSeparator className="my-3" />

        <SidebarGroup label={sidebarState === "expanded" ? "History" : undefined}>
          <SidebarMenu>
            {mainMenuItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild={!item.disabled && !item.badge}
                  icon={item.icon}
                  label={
                    <span className="flex items-center justify-between w-full">
                      {item.label}
                      {item.badge && sidebarState === "expanded" && (
                        <Badge variant="secondary" className="ml-auto h-5 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </span>
                  }
                  tooltip={item.tooltip}
                  isActive={false}
                  disabled={item.disabled || !!item.badge}
                  onClick={() => {
                    if (isMobile && sidebarState === "expanded" && !item.disabled && !item.badge) setOpenMobile(false)
                  }}
                >
                  {!item.disabled && !item.badge ? <Link href={item.href} /> : <span className="w-full" />}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

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
                  if (isMobile && sidebarState === "expanded" && !item.disabled) setOpenMobile(false)
                }}
              >
                {!item.disabled ? <Link href={item.href} /> : <span className="w-full" />}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarSeparator className="my-1" />
          <SidebarMenuItem>
            <SidebarMenuButton
              icon={<LogOut />}
              label="Logout"
              tooltip="Logout"
              onClick={() => alert("Logout clicked!")}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
