"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { AppHeader } from "@/components/app-header"
import { EventForm } from "@/components/event-form"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Event } from "@/lib/schemas"
import { useStore } from "@/lib/store"

interface AdminEventEditorProps {
  event: Event
}

export function AdminEventEditor({ event }: AdminEventEditorProps) {
  const { role } = useStore()

  if (role !== "admin") {
    return (
      <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
        <AppHeader showSearch={false} />
        <main className="flex-1 flex items-center justify-center p-6 relative z-10">
          <Card className="max-w-md w-full text-center bg-card/60 backdrop-blur-md border-white/5 shadow-xl">
            <CardHeader>
              <CardTitle className="text-foreground tracking-tight">Admin Access Required</CardTitle>
              <CardDescription className="text-muted-foreground">
                Switch to admin mode to access this page
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
      <AppHeader showSearch={false} />

      <main className="flex-1 p-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            asChild
            className="-ml-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          >
            <Link href="/admin/events">
              <ArrowLeft className="size-4 mr-2" />
              Back to Events
            </Link>
          </Button>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Edit Event</h1>
            <p className="text-muted-foreground">Update the details for "{event.title}"</p>
          </div>

          <EventForm event={event} />
        </div>
      </main>
    </div>
  )
}
