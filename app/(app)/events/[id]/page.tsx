import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CalendarDays, Clock, Globe, MapPin, User, Users } from "lucide-react"
import { format } from "date-fns"

import { AppHeader } from "@/components/app-header"
import { BookingDialog } from "@/components/booking-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getBookingsForEvent, getEventById } from "@/lib/server-data"
import { BookingTypeBadge } from "@/components/badges"

const getBookedCount = (bookings: Awaited<ReturnType<typeof getBookingsForEvent>>) => {
  return bookings
    .filter((booking) => booking.status === "confirmed" || booking.status === "checked_in")
    .reduce((sum, booking) => sum + booking.quantity, 0)
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const event = await getEventById(id)

  if (!event) {
    notFound()
  }

  const bookings = await getBookingsForEvent(event.id)
  const bookedCount = getBookedCount(bookings)
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


  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
      <AppHeader showSearch={false} />

      <main className="flex-1 p-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" asChild className="mb-6 -ml-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50">
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
                  <BookingTypeBadge bookingType={event.bookingType} price={event.price} />
                  {isFull && <Badge className="bg-destructive/10 text-destructive border-destructive/20 backdrop-blur-sm">Full</Badge>}
                  {event.status === "cancelled" && <Badge className="bg-destructive/10 text-destructive border-destructive/20 backdrop-blur-sm">Cancelled</Badge>}
                  {(event.tags ?? []).map((tag) => (
                    <Badge key={tag} className="bg-secondary/50 text-secondary-foreground border-border/50 backdrop-blur-sm">
                      #{tag}
                    </Badge>
                  ))}
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-balance text-foreground">{event.title}</h1>
                <p className="text-lg text-muted-foreground">{event.shortDescription}</p>
              </div>

              <Separator className="bg-border/50" />

              {/* Details */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <CalendarDays className="size-5 text-primary" />
                  </div>
                  <div className="mt-1">
                    <p className="font-medium text-foreground">{formatDate(event.startDateTime)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(event.startDateTime)} - {formatTime(event.endDateTime)} ({event.timezone})
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <Clock className="size-5 text-primary" />
                  </div>
                  <div className="mt-1">
                    <p className="font-medium text-foreground">Duration</p>
                    <p className="text-sm text-muted-foreground">{getDuration()}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <MapPin className="size-5 text-primary" />
                  </div>
                  <div className="mt-1">
                    <p className="font-medium text-foreground">{event.location}</p>
                    <p className="text-sm text-muted-foreground">In-person event</p>
                  </div>
                </div>

                {event.onlineUrl && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                      <Globe className="size-5 text-primary" />
                    </div>
                    <div className="mt-1">
                      <p className="font-medium text-foreground">Online Access</p>
                      <p className="text-sm text-muted-foreground">
                        Link will be provided after booking
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <User className="size-5 text-primary" />
                  </div>
                  <div className="mt-1">
                    <p className="font-medium text-foreground">Organized by</p>
                    <p className="text-sm text-muted-foreground">{event.organizerName}</p>
                  </div>
                </div>
              </div>

              {event.longDescription && (
                <>
                  <Separator className="bg-border/50" />
                  <div className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground tracking-tight">About this event</h2>
                    <p className="text-muted-foreground whitespace-pre-wrap">{event.longDescription}</p>
                  </div>
                </>
              )}
            </div>

            {/* Booking Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 bg-card/60 backdrop-blur-md border-white/5 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl text-foreground tracking-tight">
                    {event.bookingType === "ticketed" ? `${event.price} PLN` : "Free"}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {event.bookingType === "approval"
                      ? "This event requires approval from the organizer"
                      : "per person"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Users className="size-4 text-primary" />
                      Capacity
                    </span>
                    <span className="font-medium text-foreground">
                      {bookedCount} / {event.capacity}
                    </span>
                  </div>

                  <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        isFull ? "bg-destructive" : "bg-primary"
                      }`}
                      style={{ width: `${Math.min((bookedCount / event.capacity) * 100, 100)}%` }}
                    />
                  </div>

                  <p className="text-sm text-muted-foreground w-full text-center">
                    {isFull
                      ? "This event is full. You can join the waitlist."
                      : `${remainingCapacity} spot${remainingCapacity !== 1 ? "s" : ""} remaining`}
                  </p>

                  {event.status === "cancelled" ? (
                    <Button disabled className="w-full bg-secondary text-secondary-foreground">
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
