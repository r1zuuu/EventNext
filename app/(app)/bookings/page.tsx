"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { CalendarDays } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useStore } from "@/lib/store"
import { isPast } from "date-fns"
import { toValidDate } from "@/lib/utils"
import { MyBookingCard } from "@/components/my-booking-card"

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

  const upcomingBookings = userBookings.filter((booking) => {
    if (!booking.event || booking.status === "cancelled") return false
    const startDate = toValidDate(booking.event.startDateTime)
    return startDate ? !isPast(startDate) : false
  })

  const pastBookings = userBookings.filter((booking) => {
    if (!booking.event) return false
    if (booking.status === "cancelled") return true
    const startDate = toValidDate(booking.event.startDateTime)
    return startDate ? isPast(startDate) : false
  })

  const copyBookingCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
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
              <TabsTrigger value="upcoming">Upcoming ({upcomingBookings.length})</TabsTrigger>
              <TabsTrigger value="past">Past ({pastBookings.length})</TabsTrigger>
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
                    <MyBookingCard
                      key={booking.id}
                      booking={booking}
                      copiedId={copiedId}
                      onCopy={copyBookingCode}
                    />
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
                    <MyBookingCard
                      key={booking.id}
                      booking={booking}
                      copiedId={copiedId}
                      onCopy={copyBookingCode}
                    />
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
