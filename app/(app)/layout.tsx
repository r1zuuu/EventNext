import { ReactNode } from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { StoreInitializer } from "@/components/store-initializer"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { getAllBookings, getAllEvents } from "@/lib/server-data"

interface AppLayoutProps {
  children: ReactNode
}

export default async function AppLayout({ children }: AppLayoutProps) {
  const [events, bookings] = await Promise.all([getAllEvents(), getAllBookings()])

  return (
    <SidebarProvider>
      <StoreInitializer events={events} bookings={bookings} />
      <AppSidebar />
      <SidebarInset>
        {children}
      </SidebarInset>
      <Toaster position="top-right" richColors />
    </SidebarProvider>
  )
}
