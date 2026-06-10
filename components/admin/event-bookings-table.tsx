"use client"

import { Check, X } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Booking } from "@/lib/schemas"
import { BookingStatusBadge } from "@/components/badges"

interface EventBookingsTableProps {
  bookings: Booking[]
  isCheckInMode: boolean
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onCheckIn: (id: string) => void
  onUndoCheckIn: (id: string) => void
}

export function EventBookingsTable({
  bookings,
  isCheckInMode,
  onApprove,
  onReject,
  onCheckIn,
  onUndoCheckIn,
}: EventBookingsTableProps) {
  return (
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
          {bookings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12">
                <p className="text-muted-foreground">No bookings yet</p>
              </TableCell>
            </TableRow>
          ) : (
            bookings.map((booking) => (
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
                <TableCell>
                  <BookingStatusBadge status={booking.status} />
                </TableCell>
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
                      <Button size="sm" variant="outline" onClick={() => onApprove(booking.id)}>
                        <Check className="size-3 mr-1" />
                        Approve
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onReject(booking.id)}>
                        <X className="size-3" />
                      </Button>
                    </div>
                  )}
                  {booking.status === "confirmed" && isCheckInMode && (
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => onCheckIn(booking.id)}
                    >
                      <Check className="size-3 mr-1" />
                      Check In
                    </Button>
                  )}
                  {booking.status === "checked_in" && isCheckInMode && (
                    <Button size="sm" variant="outline" onClick={() => onUndoCheckIn(booking.id)}>
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
  )
}
