"use client"

import { Search, User } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useMounted } from "@/hooks/use-mounted"

interface AppHeaderProps {
  searchValue?: string
  onSearchChange?: (value: string) => void
  showSearch?: boolean
}

export function AppHeader({ searchValue = "", onSearchChange, showSearch = true }: AppHeaderProps) {
  const { role, userEmail, username, isAuthenticated, signOut } = useStore()
  const mounted = useMounted()

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4">
      <SidebarTrigger className="-ml-2" />

      {showSearch && onSearchChange && (
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            className="pl-9"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      )}

      <div className="ml-auto flex items-center gap-3">
        <Badge variant={role === "admin" ? "default" : "secondary"} className="hidden sm:inline-flex">
          {role === "admin" ? "Admin" : "User"}
        </Badge>

        {mounted ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="size-4" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {isAuthenticated ? (
                <>
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{username}</p>
                      <p className="text-xs text-muted-foreground">{userEmail}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/bookings">My Bookings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    Sign Out
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/login">Sign In</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="ghost" size="icon" className="rounded-full" aria-hidden>
            <User className="size-4" />
          </Button>
        )}
      </div>
    </header>
  )
}
