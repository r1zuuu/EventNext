"use client"

import { Search, User, LogOut, Calendar } from "lucide-react"
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
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-lg transition-all duration-200">
      <div className="flex h-16 items-center gap-6 px-4 sm:px-6 lg:px-8">
        <SidebarTrigger className="-ml-2 transition-colors hover:text-slate-200 active:scale-95" />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-70">
          <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-white/10 text-white font-medium text-sm backdrop-blur-sm">
            E
          </div>
          <span className="hidden sm:inline font-medium text-base text-white">
            EventBook
          </span>
        </Link>

        {showSearch && onSearchChange && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              placeholder="Search events..."
              className="pl-9 bg-slate-900/50 border-slate-800/50 text-slate-100 placeholder:text-slate-500 focus:border-slate-700 focus:bg-slate-900 focus:ring-0 transition-colors"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        )}

        <div className="ml-auto flex items-center gap-4">
          {/* Role Badge */}
          <Badge 
            variant="secondary" 
            className={`hidden sm:inline-flex text-xs font-medium ${
              role === "admin" 
                ? "bg-slate-800/50 text-slate-200 border-slate-700/50" 
                : "bg-slate-800/50 text-slate-300 border-slate-700/50"
            }`}
          >
            {role === "admin" ? "Admin" : "User"}
          </Badge>

          {/* User Menu */}
          {mounted ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-lg transition-colors hover:bg-slate-800/50 active:scale-95 text-slate-400 hover:text-slate-200"
                >
                  <User className="h-5 w-5" />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-800">
                {isAuthenticated ? (
                  <>
                    <DropdownMenuLabel className="pb-2">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium text-slate-100">{username}</p>
                        <p className="text-xs text-slate-500">{userEmail}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-800/50" />
                    <DropdownMenuItem asChild className="text-slate-300 focus:bg-slate-800/50 focus:text-slate-100 cursor-pointer">
                      <Link href="/bookings">
                        My Bookings
                      </Link>
                    </DropdownMenuItem>
                    {role === "admin" && (
                      <DropdownMenuItem asChild className="text-slate-300 focus:bg-slate-800/50 focus:text-slate-100 cursor-pointer">
                        <Link href="/admin">
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-slate-800/50" />
                    <DropdownMenuItem 
                      onClick={() => signOut()}
                      className="text-slate-400 focus:text-slate-100 focus:bg-slate-800/50 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuLabel>Account</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-800/50" />
                    <DropdownMenuItem asChild className="text-slate-300 focus:bg-slate-800/50 focus:text-slate-100 cursor-pointer">
                      <Link href="/login">
                        Sign In
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="icon" className="rounded-lg" aria-hidden>
              <User className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
