"use client"

import { use } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CalendarDays, Clock, Globe, MapPin, User, Users } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useStore } from "@/lib/store"
import { BookingDialog } from "@/components/booking-dialog"
import { format } from "date-fns"

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { events, getBookedCount } = useStore()
  const event = events.find((e) => e.id === id)

  if (!event) {
    notFound()
  }

  const bookedCount = getBookedCount(event.id)
  const remainingCapacity = event.capacity - bookedCount
  const isFull = remainingCapacity <= 0

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    if (Number.isNaN(date.getTime())) {
      return "TBD"
    }
    return format(date, "EEEE, MMMM d, yyyy")
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    if (Number.isNaN(date.getTime())) {
      return "TBD"
    }
    return format(date, "h:mm a")
  }

  const getDuration = () => {
    const start = new Date(event.startDateTime)
    const end = new Date(event.endDateTime)
    const diffMs = end.getTime() - start.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffHours === 0) return `${diffMinutes} min`
    if (diffMinutes === 0) return `${diffHours} hr`
    return `${diffHours} hr ${diffMinutes} min`
  }

  const getBookingTypeBadge = () => {
    switch (event.bookingType) {
      case "free":
        return <Badge variant="secondary" className="text-sm">Free Event</Badge>
      case "ticketed":
        return <Badge variant="default" className="text-sm">{event.price} PLN</Badge>
      case "approval":
        return <Badge variant="outline" className="text-sm">Approval Required</Badge>
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader showSearch={false} />

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" asChild className="mb-6 -ml-2">
            <Link href="/events">
              <ArrowLeft className="size-4 mr-2" />
              Back to Events
            </Link>
          </Button>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  {getBookingTypeBadge()}
                  {isFull && <Badge variant="destructive">Full</Badge>}
                  {event.status === "cancelled" && <Badge variant="destructive">Cancelled</Badge>}
                  {(event.tags ?? []).map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-balance">{event.title}</h1>
                <p className="text-lg text-muted-foreground">{event.shortDescription}</p>
              </div>

              <Separator />

              {/* Details */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CalendarDays className="size-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{formatDate(event.startDateTime)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(event.startDateTime)} - {formatTime(event.endDateTime)} ({event.timezone})
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="size-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Duration</p>
                    <p className="text-sm text-muted-foreground">{getDuration()}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="size-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{event.location}</p>
                    <p className="text-sm text-muted-foreground">In-person event</p>
                  </div>
                </div>

                {event.onlineUrl && (
                  <div className="flex items-start gap-3">
                    <Globe className="size-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Online Access</p>
                      <p className="text-sm text-muted-foreground">
                        Link will be provided after booking
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <User className="size-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Organized by</p>
                    <p className="text-sm text-muted-foreground">{event.organizerName}</p>
                  </div>
                </div>
              </div>

              {event.longDescription && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h2 className="text-xl font-semibold">About this event</h2>
                    <p className="text-muted-foreground whitespace-pre-wrap">{event.longDescription}</p>
                  </div>
                </>
              )}
            </div>

            {/* Booking Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle className="text-xl">
                    {event.bookingType === "ticketed" ? `${event.price} PLN` : "Free"}
                  </CardTitle>
                  <CardDescription>
                    {event.bookingType === "approval"
                      ? "This event requires approval from the organizer"
                      : "per person"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Users className="size-4" />
                      Capacity
                    </span>
                    <span className="font-medium">
                      {bookedCount} / {event.capacity}
                    </span>
                  </div>

                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        isFull ? "bg-destructive" : "bg-primary"
                      }`}
                      style={{ width: `${Math.min((bookedCount / event.capacity) * 100, 100)}%` }}
                    />
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {isFull
                      ? "This event is full. You can join the waitlist."
                      : `${remainingCapacity} spot${remainingCapacity !== 1 ? "s" : ""} remaining`}
                  </p>

                  {event.status === "cancelled" ? (
                    <Button disabled className="w-full">
                      Event Cancelled
                    </Button>
                  ) : (
                    <BookingDialog event={event} remainingCapacity={remainingCapacity} />
                  )}

                  {event.bookingType === "approval" && (
                    <p className="text-xs text-muted-foreground text-center">
                      Your booking will be pending until approved by the organizer.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
