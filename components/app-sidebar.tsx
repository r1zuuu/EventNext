"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Calendar,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Settings,
  Ticket,
  Users,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

const publicNavItems = [
  {
    title: "Browse Events",
    href: "/events",
    icon: CalendarDays,
  },
  {
    title: "My Bookings",
    href: "/bookings",
    icon: Ticket,
  },
]

const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Events",
    href: "/admin/events",
    icon: Calendar,
  },
  {
    title: "Bookings",
    href: "/admin/bookings",
    icon: Users,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { role, setRole, userEmail, signOut, isAuthenticated } = useStore()

  const isAdmin = role === "admin"

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/events" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background">
            <Calendar className="size-4" />
          </div>
          <span className="font-semibold text-lg">EventBook</span>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Browse</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {publicNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}>
                      <Link href={item.href}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator className="mx-0" />
        {isAuthenticated && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={signOut}
            >
              <LogOut className="size-4 mr-2 text-slate-100" />
              Sign Out
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
