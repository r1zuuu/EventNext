"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Download, Users } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { Booking, Event } from "@/lib/schemas"
import { useStore } from "@/lib/store"
import { EventBookingsTable } from "@/components/admin/event-bookings-table"

interface AdminEventBookingsProps {
  event: Event
  initialBookings: Booking[]
}

const getBookedCount = (bookings: Booking[], eventId: string) =>
  bookings
    .filter(
      (b) => b.eventId === eventId && (b.status === "confirmed" || b.status === "checked_in")
    )
    .reduce((sum, b) => sum + b.quantity, 0)

export function AdminEventBookings({ event, initialBookings }: AdminEventBookingsProps) {
  const { bookings, role, updateBookingStatus, checkInMode, toggleCheckInMode, hydrateBookings } =
    useStore()
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
      .filter((b) => b.eventId === event.id)
      .filter((b) => {
        if (!search) return true
        const s = search.toLowerCase()
        return (
          b.attendeeName.toLowerCase().includes(s) ||
          b.attendeeEmail.toLowerCase().includes(s) ||
          b.bookingCode.toLowerCase().includes(s)
        )
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [activeBookings, event.id, search])

  const isCheckInMode = checkInMode[event.id] || false
  const bookedCount = getBookedCount(activeBookings, event.id)

  const stats = useMemo(() => ({
    confirmed: eventBookings.filter((b) => b.status === "confirmed").length,
    checkedIn: eventBookings.filter((b) => b.status === "checked_in").length,
    pending: eventBookings.filter((b) => b.status === "pending").length,
    waitlist: eventBookings.filter((b) => b.status === "waitlist").length,
  }), [eventBookings])

  const handleApprove = (id: string) => { updateBookingStatus(id, "confirmed"); toast.success("Booking approved") }
  const handleReject = (id: string) => { updateBookingStatus(id, "cancelled"); toast.success("Booking rejected") }
  const handleCheckIn = (id: string) => { updateBookingStatus(id, "checked_in"); toast.success("Attendee checked in") }
  const handleUndoCheckIn = (id: string) => { updateBookingStatus(id, "confirmed"); toast.success("Check-in undone") }

  const exportCSV = () => {
    const headers = ["Booking Code", "Name", "Email", "Quantity", "Status", "Notes", "Booked On"]
    const rows = eventBookings.map((b) => [
      b.bookingCode, b.attendeeName, b.attendeeEmail, b.quantity, b.status, b.notes || "",
      format(new Date(b.createdAt), "yyyy-MM-dd HH:mm"),
    ])
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n")
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
                <Label htmlFor="check-in-mode" className="text-sm">Check-in Mode</Label>
              </div>
              <Button variant="outline" onClick={exportCSV}>
                <Download className="size-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
            <Card><CardContent className="p-4"><div className="text-2xl font-bold">{bookedCount}</div><p className="text-xs text-muted-foreground">of {event.capacity} booked</p></CardContent></Card>
            <Card><CardContent className="p-4"><div className="text-2xl font-bold">{stats.confirmed}</div><p className="text-xs text-muted-foreground">Confirmed</p></CardContent></Card>
            <Card><CardContent className="p-4"><div className="text-2xl font-bold">{stats.checkedIn}</div><p className="text-xs text-muted-foreground">Checked In</p></CardContent></Card>
            <Card><CardContent className="p-4"><div className="text-2xl font-bold">{stats.pending}</div><p className="text-xs text-muted-foreground">Pending</p></CardContent></Card>
            <Card><CardContent className="p-4"><div className="text-2xl font-bold">{stats.waitlist}</div><p className="text-xs text-muted-foreground">Waitlist</p></CardContent></Card>
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

          <EventBookingsTable
            bookings={eventBookings}
            isCheckInMode={isCheckInMode}
            onApprove={handleApprove}
            onReject={handleReject}
            onCheckIn={handleCheckIn}
            onUndoCheckIn={handleUndoCheckIn}
          />
        </div>
      </main>
    </div>
  )
}
