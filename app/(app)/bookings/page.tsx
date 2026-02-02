"use client"

import { useMemo } from "react"
import Link from "next/link"
import { CalendarDays, MapPin, Copy, Check, ExternalLink } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useStore } from "@/lib/store"
import { format, isPast, parseISO } from "date-fns"
import { useState } from "react"

export default function MyBookingsPage() {
  const { bookings, events, userEmail, isAuthenticated } = useStore()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const userBookings = useMemo(() => {
    if (!userEmail) return []
    return bookings
      .filter((b) => b.attendeeEmail === userEmail)
      .map((booking) => ({
        ...booking,
        event: events.find((e) => e.id === booking.eventId),
      }))
      .sort((a, b) => {
        const dateA = a.event ? new Date(a.event.startDateTime).getTime() : 0
        const dateB = b.event ? new Date(b.event.startDateTime).getTime() : 0
        return dateA - dateB
      })
  }, [bookings, events, userEmail])

  const upcomingBookings = userBookings.filter(
    (b) => b.event && !isPast(parseISO(b.event.startDateTime)) && b.status !== "cancelled"
  )

  const pastBookings = userBookings.filter(
    (b) => b.event && (isPast(parseISO(b.event.startDateTime)) || b.status === "cancelled")
  )

  const copyBookingCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="default">Confirmed</Badge>
      case "pending":
        return <Badge variant="secondary">Pending Approval</Badge>
      case "waitlist":
        return <Badge variant="outline">Waitlist</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      case "checked_in":
        return <Badge className="bg-green-600 hover:bg-green-700 text-white">Checked In</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const BookingCard = ({ booking }: { booking: (typeof userBookings)[0] }) => {
    if (!booking.event) return null

    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              {getStatusBadge(booking.status)}
              <CardTitle className="text-lg">{booking.event.title}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="size-4" />
              <span>
                {format(parseISO(booking.event.startDateTime), "EEEE, MMMM d, yyyy 'at' h:mm a")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-4" />
              <span>{booking.event.location}</span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-muted p-3">
            <div>
              <p className="text-xs text-muted-foreground">Booking Code</p>
              <p className="font-mono font-semibold">{booking.bookingCode}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => copyBookingCode(booking.bookingCode, booking.id)}
            >
              {copiedId === booking.id ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Quantity</span>
            <span className="font-medium">{booking.quantity} ticket{booking.quantity > 1 ? "s" : ""}</span>
          </div>

          <Button variant="outline" asChild className="w-full bg-transparent">
            <Link href={`/events/${booking.event.id}`}>
              View Event
              <ExternalLink className="size-4 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader showSearch={false} />
        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md w-full text-center">
            <CardHeader>
              <CardTitle>Sign in to view your bookings</CardTitle>
              <CardDescription>
                You need to be signed in to see your booking history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader showSearch={false} />

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">My Bookings</h1>
            <p className="text-muted-foreground">View and manage your event bookings</p>
          </div>

          <Tabs defaultValue="upcoming" className="space-y-6">
            <TabsList>
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingBookings.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past ({pastBookings.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              {upcomingBookings.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CalendarDays className="size-12 text-muted-foreground mb-4" />
                    <h3 className="font-medium text-lg">No upcoming bookings</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You don't have any upcoming events booked
                    </p>
                    <Button asChild>
                      <Link href="/events">Browse Events</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {upcomingBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past">
              {pastBookings.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CalendarDays className="size-12 text-muted-foreground mb-4" />
                    <h3 className="font-medium text-lg">No past bookings</h3>
                    <p className="text-sm text-muted-foreground">
                      Your past bookings will appear here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {pastBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
