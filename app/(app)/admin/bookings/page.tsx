"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Download, Filter } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore } from "@/lib/store"
import { format } from "date-fns"
import { toast } from "sonner"

export default function AdminBookingsPage() {
  const { bookings, events, role, updateBookingStatus } = useStore()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [eventFilter, setEventFilter] = useState("all")

  const bookingsWithEvents = useMemo(() => {
    return bookings
      .map((booking) => ({
        ...booking,
        event: events.find((e) => e.id === booking.eventId),
      }))
      .filter((b) => {
        if (statusFilter !== "all" && b.status !== statusFilter) return false
        if (eventFilter !== "all" && b.eventId !== eventFilter) return false
        if (search) {
          const searchLower = search.toLowerCase()
          return (
            b.attendeeName.toLowerCase().includes(searchLower) ||
            b.attendeeEmail.toLowerCase().includes(searchLower) ||
            b.bookingCode.toLowerCase().includes(searchLower) ||
            b.event?.title.toLowerCase().includes(searchLower)
          )
        }
        return true
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [bookings, events, search, statusFilter, eventFilter])

  const handleApprove = (id: string) => {
    updateBookingStatus(id, "confirmed")
    toast.success("Booking approved")
  }

  const handleReject = (id: string) => {
    updateBookingStatus(id, "cancelled")
    toast.success("Booking rejected")
  }

  const exportCSV = () => {
    const headers = ["Booking Code", "Attendee", "Email", "Event", "Quantity", "Status", "Date"]
    const rows = bookingsWithEvents.map((b) => [
      b.bookingCode,
      b.attendeeName,
      b.attendeeEmail,
      b.event?.title || "Unknown",
      b.quantity,
      b.status,
      Number.isNaN(new Date(b.createdAt).getTime())
        ? "TBD"
        : format(new Date(b.createdAt), "yyyy-MM-dd"),
    ])

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `bookings-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("CSV exported")
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">All Bookings</h1>
              <p className="text-muted-foreground">Manage bookings across all events</p>
            </div>
            <Button variant="outline" onClick={exportCSV}>
              <Download className="size-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <div className="flex flex-wrap gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] bg-slate-900/80 border-purple-500/20 text-slate-100 hover:bg-slate-800">
                <Filter className="size-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900/80 border-purple-500/20">
                <SelectItem value="all" className="text-slate-100">All Statuses</SelectItem>
                <SelectItem value="confirmed" className="text-slate-100">Confirmed</SelectItem>
                <SelectItem value="pending" className="text-slate-100">Pending</SelectItem>
                <SelectItem value="waitlist" className="text-slate-100">Waitlist</SelectItem>
                <SelectItem value="checked_in" className="text-slate-100">Checked In</SelectItem>   
                <SelectItem value="cancelled" className="text-slate-100">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger className="w-[200px] bg-slate-900/80 border-purple-500/20 text-slate-100 hover:bg-slate-800">
                <SelectValue placeholder="All Events" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900/80 border-purple-500/20">
                <SelectItem value="all" className="text-slate-100">All Events</SelectItem>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id} className="text-slate-100">
                    {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking Code</TableHead>
                  <TableHead>Attendee</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookingsWithEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <p className="text-muted-foreground">No bookings found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  bookingsWithEvents.map((booking, index) => (
                    <TableRow key={booking.id ?? `${booking.bookingCode}-${index}`}>
                      <TableCell className="font-mono text-sm">{booking.bookingCode}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.attendeeName}</p>
                          <p className="text-sm text-muted-foreground">{booking.attendeeEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/events/${booking.eventId}/bookings`}
                          className="hover:underline"
                        >
                          {booking.event?.title || "Unknown Event"}
                        </Link>
                      </TableCell>
                      <TableCell>{booking.quantity}</TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {Number.isNaN(new Date(booking.createdAt).getTime())
                          ? "TBD"
                          : format(new Date(booking.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        {booking.status === "pending" && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove(booking.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => handleReject(booking.id)}
                            >
                              Reject
                            </Button>
                          </div>
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
