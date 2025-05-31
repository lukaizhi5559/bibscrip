"use client"
import * as React from "react"
import { Moon, Sun, Laptop } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  
  // After mounting, we have access to the theme
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="border border-yellow-500/50" aria-label="Select theme">
        <span className="h-5 w-5" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="border border-yellow-500/50 hover:bg-accent" aria-label="Select theme">
          {theme === "light" && <Sun className="h-5 w-5 text-yellow-500" />}
          {theme === "dark" && <Moon className="h-5 w-5 text-blue-400" />}
          {theme === "system" && <Laptop className="h-5 w-5 text-green-400" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px] p-2">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setTheme("light")} className={`my-1 ${theme === "light" ? "bg-accent font-medium" : ""}`}>
          <Sun className="mr-2 h-4 w-4 text-yellow-500" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className={`my-1 ${theme === "dark" ? "bg-accent font-medium" : ""}`}>
          <Moon className="mr-2 h-4 w-4 text-blue-400" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className={`my-1 ${theme === "system" ? "bg-accent font-medium" : ""}`}>
          <Laptop className="mr-2 h-4 w-4 text-green-400" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
