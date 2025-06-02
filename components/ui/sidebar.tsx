"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { type VariantProps, cva } from "class-variance-authority"
import { PanelLeft, ChevronDown, X, ChevronLeft, ChevronRight } from "lucide-react" // Added MenuIconLucide for potential use

import { useMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetClose } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const SIDEBAR_COOKIE_NAME = process.env.SIDEBAR_COOKIE_NAME || "sidebar:state" // Use env variable
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days
const SIDEBAR_WIDTH = "16rem" // 256px
const SIDEBAR_WIDTH_MOBILE = "18rem" // 288px
const SIDEBAR_WIDTH_ICON = "3.75rem" // 60px, adjusted for slightly larger icons/padding
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContextProps = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
  isLoading?: boolean
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }
  return context
}

export const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
    isLoading?: boolean
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      isLoading = false,
      className,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const isMobile = useMobile()
    const [openMobile, setOpenMobile] = React.useState(false)
    const [_open, _setOpen] = React.useState(defaultOpen)

    const open = openProp ?? _open
    const setOpen = React.useCallback(
      (value: boolean | ((currentOpen: boolean) => boolean)) => {
        const newOpenState = typeof value === "function" ? value(open) : value
        if (setOpenProp) {
          setOpenProp(newOpenState)
        } else {
          _setOpen(newOpenState)
        }
        try {
          document.cookie = `${SIDEBAR_COOKIE_NAME}=${newOpenState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}; SameSite=Lax`
        } catch (error) {
          console.warn("Failed to set sidebar cookie:", error)
        }
      },
      [setOpenProp, open],
    )

    const toggleSidebar = React.useCallback(() => {
      if (isMobile) {
        setOpenMobile((prev) => !prev)
      } else {
        setOpen((prev) => !prev)
      }
    }, [isMobile, setOpen, setOpenMobile])

    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
          event.preventDefault()
          toggleSidebar()
        }
      }
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }, [toggleSidebar])

    const state = open ? "expanded" : "collapsed"

    const contextValue = React.useMemo<SidebarContextProps>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
        isLoading,
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar, isLoading],
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH,
                "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                ...style,
              } as React.CSSProperties
            }
            className={cn(
              "group/sidebar-wrapper flex min-h-svh w-full bg-background has-[[data-variant=inset]]:bg-sidebar",
              className,
            )}
            ref={ref}
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    )
  },
)
SidebarProvider.displayName = "SidebarProvider"

export const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right"
    variant?: "sidebar" | "floating" | "inset"
    collapsible?: "offcanvas" | "icon" | "none"
  }
>(({ side = "left", variant = "sidebar", collapsible = "icon", className, children, ...props }, ref) => {
  const { isMobile, state, openMobile, setOpenMobile, isLoading } = useSidebar()

  if (isLoading) {
    return (
      <div
        className={cn(
          "hidden md:flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border",
          variant === "floating" || variant === "inset" ? "p-2" : "",
          state === "collapsed" && (variant === "floating" || variant === "inset")
            ? "w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]"
            : state === "collapsed"
              ? "w-[var(--sidebar-width-icon)]"
              : "w-[var(--sidebar-width)]",
          "h-svh transition-[width] duration-200 ease-linear",
        )}
      >
        <SidebarHeaderSkeleton hasLogo={true} />
        <SidebarContent>
          <SidebarMenuSkeleton count={3} showIcon={state === "collapsed"} />
          <SidebarSeparator className="my-4" />
          <SidebarMenuSkeleton count={2} showIcon={state === "collapsed"} />
        </SidebarContent>
        <SidebarFooterSkeleton showIcon={state === "collapsed"} />
      </div>
    )
  }

  if (collapsible === "none" && !isMobile) {
    return (
      <div
        className={cn(
          "hidden md:flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border",
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          data-sidebar="sidebar"
          data-mobile="true"
          className="w-[--sidebar-width-mobile] bg-sidebar p-0 text-sidebar-foreground border-none shadow-xl"
          style={{ "--sidebar-width": SIDEBAR_WIDTH_MOBILE } as React.CSSProperties}
          side={side}
        >
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      ref={ref}
      className={cn(
        "group hidden md:flex text-sidebar-foreground flex-col fixed top-0 bottom-0 transition-[width] duration-200 ease-linear z-40",
        "bg-sidebar border-r border-sidebar-border overflow-hidden",
        side === "left" ? "left-0" : "right-0",
        variant === "floating" || variant === "inset" ? "p-2 rounded-lg m-2 shadow-soft-md border" : "",
        state === "expanded"
          ? "w-[--sidebar-width]"
          : collapsible === "icon"
            ? variant === "floating" || variant === "inset"
              ? "w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]" // For inset/floating, add padding
              : "w-[var(--sidebar-width-icon)]" // Standard icon sidebar width
            : "w-0", // Off-canvas collapsed
        collapsible === "offcanvas" && state === "collapsed"
          ? side === "left"
            ? "-ml-[var(--sidebar-width)]"
            : "-mr-[var(--sidebar-width)]"
          : "",
        className,
      )}
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      {...props}
    >
      {children}
    </div>
  )
})
Sidebar.displayName = "Sidebar"

export const SidebarTrigger = React.forwardRef<React.ElementRef<typeof Button>, React.ComponentProps<typeof Button>>(
  ({ className, onClick, ...props }, ref) => {
    const { isMobile, toggleSidebar, state, isLoading, openMobile } = useSidebar()

    // This trigger is now only for mobile
    if (!isMobile) return null

    return (
      <Button
        ref={ref}
        data-sidebar="trigger"
        variant="ghost"
        size="icon"
        className={cn("h-9 w-9", className)}
        onClick={(event) => {
          onClick?.(event)
          toggleSidebar()
        }}
        aria-expanded={openMobile}
        aria-controls="mobile-sidebar"
        {...props}
      >
        {state === "expanded" ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        <span className="sr-only">{state === "expanded" ? "Collapse Sidebar" : "Expand Sidebar"}</span>
      </Button>
    )
  },
)
SidebarTrigger.displayName = "SidebarTrigger"

export const SidebarClose = React.forwardRef<
  React.ElementRef<typeof SheetClose>,
  React.ComponentProps<typeof SheetClose>
>(({ className, ...props }, ref) => {
  const { isMobile } = useSidebar()
  if (!isMobile) return null

  return (
    <SheetClose
      ref={ref}
      className={cn(
        "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary",
        className,
      )}
      {...props}
    >
      <X className="h-5 w-5" />
      <span className="sr-only">Close</span>
    </SheetClose>
  )
})
SidebarClose.displayName = "SidebarClose"

export const SidebarHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, children, ...props }, ref) => {
    const { state } = useSidebar()
    return (
      <div
        ref={ref}
        data-sidebar="header"
        className={cn(
          "flex flex-col gap-2 p-3 border-b border-sidebar-border min-h-[3.5rem] items-start justify-center", // Ensure consistent height
          state === "collapsed" ? "items-center" : "",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)
SidebarHeader.displayName = "SidebarHeader"

export const SidebarFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, children, ...props }, ref) => {
    const { state } = useSidebar()
    return (
      <div
        ref={ref}
        data-sidebar="footer"
        className={cn(
          "flex flex-col gap-2 p-3 mt-auto border-t border-sidebar-border",
          state === "collapsed" ? "items-center" : "",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)
SidebarFooter.displayName = "SidebarFooter"

export const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => {
  const { state } = useSidebar()
  return (
    <Separator
      ref={ref}
      data-sidebar="separator"
      className={cn("bg-sidebar-border", state === "collapsed" ? "mx-auto w-3/4" : "mx-3", className)}
      {...props}
    />
  )
})
SidebarSeparator.displayName = "SidebarSeparator"

export const SidebarContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(

  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-sidebar="content"
        className={cn("flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden p-3 max-h-[calc(100vh-8.5rem)]", className)}
        {...props}
      >
        {children}
      </div>
    )
  },
)
SidebarContent.displayName = "SidebarContent"

export const SidebarGroup = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & { label?: string }>(
  ({ className, label, children, ...props }, ref) => {
    const { state } = useSidebar()
    return (
      <Collapsible defaultOpen>
        <div
          ref={ref}
          data-sidebar="group"
          className={cn("relative border-sidebar-border flex w-full min-w-0 flex-col", className)}
          {...props}
        >
          {label && (
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn("w-full justify-start h-8 px-2 mb-1", state === "collapsed" ? "hidden" : "")}
              >
                <span className="text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider">{label}</span>
                <ChevronDown className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </Button>
            </CollapsibleTrigger>
          )}
          {label && state === "collapsed" && <SidebarSeparator className="my-2" />}
          <CollapsibleContent className={cn(state === "collapsed" && !label ? "mt-2" : "")}>
            {children}
          </CollapsibleContent>
        </div>
      </Collapsible>
    )
  },
)
SidebarGroup.displayName = "SidebarGroup"

const sidebarMenuButtonVariants = cva(
  "peer/menu-button group flex w-full items-center gap-2.5 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-all duration-150 ease-in-out hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-semibold data-[active=true]:text-sidebar-accent-foreground",
  {
    variants: {
      size: {
        default: "h-9 text-sm",
        sm: "h-8 text-xs",
        lg: "h-10 text-sm",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
)

export const SidebarMenu = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} data-sidebar="menu" className={cn("flex w-full min-w-0 flex-col gap-0.5", className)} {...props} />
  ),
)
SidebarMenu.displayName = "SidebarMenu"

export const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(
  ({ className, ...props }, ref) => (
    <li ref={ref} data-sidebar="menu-item" className={cn("group/menu-item relative", className)} {...props} />
  ),
)
SidebarMenuItem.displayName = "SidebarMenuItem"

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button> & {
    asChild?: boolean
    isActive?: boolean
    tooltip?: string | React.ReactNode
    icon?: React.ReactNode
    label?: string | React.ReactNode
  } & VariantProps<typeof sidebarMenuButtonVariants>
>(
  (
    { asChild = false, isActive = false, size = "default", tooltip, icon, label, className, children, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : Button
    const { isMobile, state: sidebarState } = useSidebar()

    const content = children || (
      <>
        {React.isValidElement(icon) && React.cloneElement(icon, { ...(icon.props as any), className: cn((icon.props as any)?.className, "h-4 w-4 shrink-0") })}
        {sidebarState === "expanded" && label && <span className="truncate flex-grow">{label}</span>}
      </>
    )

    const buttonElement = (
      <Comp
        ref={ref}
        data-sidebar="menu-button"
        data-size={size}
        data-active={isActive}
        variant="ghost"
        className={cn(
          sidebarMenuButtonVariants({ size }),
          sidebarState === "collapsed" && "justify-center w-9 h-9 p-0",
          className,
        )}
        {...props}
      >
        {content}
      </Comp>
    )

    if (!tooltip || sidebarState === "expanded" || isMobile) {
      return buttonElement
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>{buttonElement}</TooltipTrigger>
        <TooltipContent side="right" align="center" className="bg-sidebar-accent text-sidebar-accent-foreground">
          {typeof tooltip === "string" ? <p>{tooltip}</p> : tooltip}
        </TooltipContent>
      </Tooltip>
    )
  },
)
SidebarMenuButton.displayName = "SidebarMenuButton"

export const SidebarMenuSkeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    count?: number
    showIcon?: boolean
    hasLogo?: boolean
  }
>(({ className, count = 3, showIcon = true, hasLogo = false, ...props }, ref) => {
  const { state } = useSidebar()
  const collapsed = state === "collapsed"

  return (
    <div ref={ref} className={cn("flex flex-col gap-2 p-0", className)} {...props}>
      {hasLogo && (
        <div className={cn("flex items-center gap-2 h-9 mb-1", collapsed ? "justify-center" : "px-2")}>
          <Skeleton className="h-6 w-6 rounded-md" />
          {!collapsed && <Skeleton className="h-4 w-20 rounded-md" />}
        </div>
      )}
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={cn("flex items-center gap-2 h-9", collapsed ? "justify-center" : "px-2")}>
          {showIcon && <Skeleton className="h-5 w-5 rounded-md shrink-0" />}
          {!collapsed && <Skeleton className="h-4 w-full rounded-md" />}
        </div>
      ))}
    </div>
  )
})
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton"

export const SidebarHeaderSkeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { hasLogo?: boolean }
>(({ className, hasLogo = true, ...props }, ref) => {
  const { state } = useSidebar()
  const collapsed = state === "collapsed"
  return (
    <div ref={ref} className={cn("p-3 border-b border-sidebar-border", className)} {...props}>
      {hasLogo && (
        <div className={cn("flex items-center gap-2 h-9", collapsed ? "justify-center" : "")}>
          <Skeleton className="h-7 w-7 rounded-md" />
          {!collapsed && <Skeleton className="h-5 w-24 rounded-md" />}
        </div>
      )}
    </div>
  )
})
SidebarHeaderSkeleton.displayName = "SidebarHeaderSkeleton"

export const SidebarFooterSkeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { showIcon?: boolean }
>(({ className, showIcon = true, ...props }, ref) => {
  const { state } = useSidebar()
  const collapsed = state === "collapsed"
  return (
    <div ref={ref} className={cn("p-3 mt-auto border-t border-sidebar-border", className)} {...props}>
      <div className={cn("flex items-center gap-2 h-9", collapsed ? "justify-center" : "")}>
        {showIcon && <Skeleton className="h-6 w-6 rounded-full shrink-0" />}
        {!collapsed && <Skeleton className="h-4 w-20 rounded-md" />}
      </div>
    </div>
  )
})
SidebarFooterSkeleton.displayName = "SidebarFooterSkeleton"

export const SidebarInset = React.forwardRef<HTMLDivElement, React.ComponentProps<"main">>(
  ({ className, ...props }, ref) => {
    const { isMobile, state, open } = useSidebar()

    // The margin-left should only apply if the sidebar is not mobile (i.e., desktop)
    // and it's the standard "sidebar" variant (not floating or inset, which handle their own positioning).
    // When the sidebar is collapsed to icons, the margin should be the width of the icon bar.
    // When expanded, it's the full sidebar width.
    // If the sidebar is completely off-canvas (e.g. collapsible="offcanvas" and state="collapsed"), margin should be 0.
    // For this app, collapsible="icon" is used.

    let marginLeftClass = "md:ml-0" // Default for mobile or if sidebar is off-canvas

    if (!isMobile) {
      // Only apply margins on desktop
      if (open && state === "expanded") {
        marginLeftClass = "md:ml-[var(--sidebar-width)]"
      } else if (!open && state === "collapsed") {
        // This is for the icon-only collapsed state
        marginLeftClass = "md:ml-[var(--sidebar-width-icon)]"
      }
    }

    return (
      <main
        ref={ref}
        className={cn("flex-1 transition-[margin-left] duration-200 ease-linear", marginLeftClass, className)}
        {...props}
      />
    )
  },
)
SidebarInset.displayName = "SidebarInset"
