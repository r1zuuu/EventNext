"use client"

import { use, useState, useMemo } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Check, Download, Users, X } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore } from "@/lib/store"
import { format } from "date-fns"
import { toast } from "sonner"

export default function EventBookingsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const {
    events,
    bookings,
    role,
    updateBookingStatus,
    checkInMode,
    toggleCheckInMode,
    getBookedCount,
  } = useStore()

  const [search, setSearch] = useState("")

  const event = events.find((e) => e.id === id)

  if (!event) {
    notFound()
  }

  const eventBookings = useMemo(() => {
    return bookings
      .filter((b) => b.eventId === id)
      .filter((b) => {
        if (!search) return true
        const searchLower = search.toLowerCase()
        return (
          b.attendeeName.toLowerCase().includes(searchLower) ||
          b.attendeeEmail.toLowerCase().includes(searchLower) ||
          b.bookingCode.toLowerCase().includes(searchLower)
        )
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [bookings, id, search])

  const isCheckInMode = checkInMode[id] || false
  const bookedCount = getBookedCount(id)

  const stats = useMemo(() => {
    const confirmed = eventBookings.filter((b) => b.status === "confirmed").length
    const checkedIn = eventBookings.filter((b) => b.status === "checked_in").length
    const pending = eventBookings.filter((b) => b.status === "pending").length
    const waitlist = eventBookings.filter((b) => b.status === "waitlist").length
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
    const rows = eventBookings.map((b) => [
      b.bookingCode,
      b.attendeeName,
      b.attendeeEmail,
      b.quantity,
      b.status,
      b.notes || "",
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="default">Confirmed</Badge>
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "waitlist":
        return <Badge variant="outline">Waitlist</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      case "checked_in":
        return <Badge className="bg-blue-600 hover:bg-blue-700 text-white">Checked In</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

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
                  onCheckedChange={() => toggleCheckInMode(id)}
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

          {/* Stats */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{bookedCount}</div>
                <p className="text-xs text-muted-foreground">
                  of {event.capacity} booked
                </p>
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
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
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
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove(booking.id)}
                            >
                              <Check className="size-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleReject(booking.id)}
                            >
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
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUndoCheckIn(booking.id)}
                          >
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
