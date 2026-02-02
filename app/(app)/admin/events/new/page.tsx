"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { EventForm } from "@/components/event-form"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore } from "@/lib/store"

export default function NewEventPage() {
  const { role } = useStore()

  if (role !== "admin") {
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader showSearch={false} />
        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md w-full text-center">
            <CardHeader>
              <CardTitle>Admin Access Required</CardTitle>
              <CardDescription>Switch to admin mode to access this page</CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader showSearch={false} />

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button variant="ghost" asChild className="-ml-2">
            <Link href="/admin/events">
              <ArrowLeft className="size-4 mr-2" />
              Back to Events
            </Link>
          </Button>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Create New Event</h1>
            <p className="text-muted-foreground">Fill in the details for your new event</p>
          </div>

          <EventForm />
        </div>
      </main>
    </div>
  )
}
