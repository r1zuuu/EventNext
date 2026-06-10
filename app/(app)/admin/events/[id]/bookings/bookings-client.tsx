"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, Download, Users, X } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

import { AppHeader } from "@/components/app-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Booking, Event } from "@/lib/schemas"
import { useStore } from "@/lib/store"
import { BookingStatusBadge } from "@/components/badges"

interface AdminEventBookingsProps {
  event: Event
  initialBookings: Booking[]
}

const getBookedCount = (bookings: Booking[], eventId: string) => {
  return bookings
    .filter(
      (booking) =>
        booking.eventId === eventId &&
        (booking.status === "confirmed" || booking.status === "checked_in")
    )
    .reduce((sum, booking) => sum + booking.quantity, 0)
}

export function AdminEventBookings({ event, initialBookings }: AdminEventBookingsProps) {
  const {
    bookings,
    role,
    updateBookingStatus,
    checkInMode,
    toggleCheckInMode,
    hydrateBookings,
  } = useStore()
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (initialBookings.length) {
      hydrateBookings(initialBookings)
    }
  }, [initialBookings, hydrateBookings])

  const activeBookings = bookings.length ? bookings : initialBookings

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

  const eventBookings = useMemo(() => {
    return activeBookings
      .filter((booking) => booking.eventId === event.id)
      .filter((booking) => {
        if (!search) return true
        const searchLower = search.toLowerCase()
        return (
          booking.attendeeName.toLowerCase().includes(searchLower) ||
          booking.attendeeEmail.toLowerCase().includes(searchLower) ||
          booking.bookingCode.toLowerCase().includes(searchLower)
        )
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [activeBookings, event.id, search])

  const isCheckInMode = checkInMode[event.id] || false
  const bookedCount = getBookedCount(activeBookings, event.id)

  const stats = useMemo(() => {
    const confirmed = eventBookings.filter((booking) => booking.status === "confirmed").length
    const checkedIn = eventBookings.filter((booking) => booking.status === "checked_in").length
    const pending = eventBookings.filter((booking) => booking.status === "pending").length
    const waitlist = eventBookings.filter((booking) => booking.status === "waitlist").length
    return { confirmed, checkedIn, pending, waitlist }
  }, [eventBookings])

  const handleApprove = (bookingId: string) => {
    updateBookingStatus(bookingId, "confirmed")
    toast.success("Booking approved")
  }

  const handleReject = (bookingId: string) => {
    updateBookingStatus(bookingId, "cancelled")
    toast.success("Booking rejected")
  }

  const handleCheckIn = (bookingId: string) => {
    updateBookingStatus(bookingId, "checked_in")
    toast.success("Attendee checked in")
  }

  const handleUndoCheckIn = (bookingId: string) => {
    updateBookingStatus(bookingId, "confirmed")
    toast.success("Check-in undone")
  }

  const exportCSV = () => {
    const headers = ["Booking Code", "Name", "Email", "Quantity", "Status", "Notes", "Booked On"]
    const rows = eventBookings.map((booking) => [
      booking.bookingCode,
      booking.attendeeName,
      booking.attendeeEmail,
      booking.quantity,
      booking.status,
      booking.notes || "",
      format(new Date(booking.createdAt), "yyyy-MM-dd HH:mm"),
    ])

    const csv = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${event.title.replace(/\s+/g, "-")}-bookings.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Bookings exported")
  }


  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader searchValue={search} onSearchChange={setSearch} />

      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Button variant="ghost" asChild className="-ml-2">
            <Link href="/admin/events">
              <ArrowLeft className="size-4 mr-2" />
              Back to Events
            </Link>
          </Button>

          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{event.title}</h1>
              <p className="text-muted-foreground">
                {format(new Date(event.startDateTime), "EEEE, MMMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="check-in-mode"
                  checked={isCheckInMode}
                  onCheckedChange={() => toggleCheckInMode(event.id)}
                />
                <Label htmlFor="check-in-mode" className="text-sm">
                  Check-in Mode
                </Label>
              </div>
              <Button variant="outline" onClick={exportCSV}>
                <Download className="size-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{bookedCount}</div>
                <p className="text-xs text-muted-foreground">of {event.capacity} booked</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{stats.confirmed}</div>
                <p className="text-xs text-muted-foreground">Confirmed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{stats.checkedIn}</div>
                <p className="text-xs text-muted-foreground">Checked In</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">Pending</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{stats.waitlist}</div>
                <p className="text-xs text-muted-foreground">Waitlist</p>
              </CardContent>
            </Card>
          </div>

          {isCheckInMode && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4 flex items-center gap-3">
                <Users className="size-5 text-blue-700" />
                <div>
                  <p className="font-medium text-blue-800">Check-in Mode Active</p>
                  <p className="text-sm text-blue-700">
                    Click the check-in button next to each attendee as they arrive.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking Code</TableHead>
                  <TableHead>Attendee</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Booked</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <p className="text-muted-foreground">No bookings yet</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  eventBookings.map((booking) => (
                    <TableRow
                      key={booking.id}
                      className={booking.status === "checked_in" ? "bg-blue-50" : ""}
                    >
                      <TableCell className="font-mono text-sm">{booking.bookingCode}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.attendeeName}</p>
                          <p className="text-sm text-muted-foreground">{booking.attendeeEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>{booking.quantity}</TableCell>
                      <TableCell><BookingStatusBadge status={booking.status} /></TableCell>
                      <TableCell className="max-w-[200px]">
                        {booking.notes && (
                          <p className="text-sm text-muted-foreground truncate">{booking.notes}</p>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(booking.createdAt), "MMM d")}
                      </TableCell>
                      <TableCell>
                        {booking.status === "pending" && (
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => handleApprove(booking.id)}>
                              <Check className="size-3 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleReject(booking.id)}>
                              <X className="size-3" />
                            </Button>
                          </div>
                        )}
                        {booking.status === "confirmed" && isCheckInMode && (
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => handleCheckIn(booking.id)}
                          >
                            <Check className="size-3 mr-1" />
                            Check In
                          </Button>
                        )}
                        {booking.status === "checked_in" && isCheckInMode && (
                          <Button size="sm" variant="outline" onClick={() => handleUndoCheckIn(booking.id)}>
                            Undo
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </main>
    </div>
  )
}
