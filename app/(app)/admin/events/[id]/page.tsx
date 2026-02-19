"use client"

import { use } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { EventForm } from "@/components/event-form"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore } from "@/lib/store"

export default function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { events, role } = useStore()
  const event = events.find((e) => e.id === id)

  if (!event) {
    notFound()
  }

  if (role !== "admin") {
    return (
      <div className="flex flex-col min-h-screen bg-slate-950">
        <AppHeader showSearch={false} />
        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md w-full text-center bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Admin Access Required</CardTitle>
              <CardDescription className="text-slate-400">Switch to admin mode to access this page</CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <AppHeader showSearch={false} />

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button variant="ghost" asChild className="-ml-2 text-slate-300 hover:text-slate-100 hover:bg-slate-800">
            <Link href="/admin/events">
              <ArrowLeft className="size-4 mr-2" />
              Back to Events
            </Link>
          </Button>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Edit Event</h1>
            <p className="text-slate-400">Update the details for "{event.title}"</p>
          </div>

          <EventForm event={event} />
        </div>
      </main>
    </div>
  )
}
