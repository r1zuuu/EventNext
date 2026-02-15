"use client"

import React, { useEffect, useCallback } from "react"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/sonner"
import { useStore } from "@/lib/store"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { fetchEvents, fetchBookings } = useStore()

  useEffect(() => {
    fetchEvents()
    fetchBookings()
  }, [])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {children}
      </SidebarInset>
      <Toaster position="top-right" richColors />
    </SidebarProvider>
  )
}
