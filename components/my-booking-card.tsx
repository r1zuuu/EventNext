"use client"

import Link from "next/link"
import { CalendarDays, MapPin, Copy, Check, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { toValidDate } from "@/lib/utils"
import { BookingStatusBadge } from "@/components/badges"
import type { Booking, Event } from "@/lib/schemas"

interface MyBookingCardProps {
  booking: Booking & { event: Event | undefined }
  copiedId: string | null
  onCopy: (code: string, id: string) => void
}

export function MyBookingCard({ booking, copiedId, onCopy }: MyBookingCardProps) {
  if (!booking.event) return null
  const eventDate = toValidDate(booking.event.startDateTime)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <BookingStatusBadge status={booking.status} />
            <CardTitle className="text-lg">{booking.event.title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="size-4" />
            <span>
              {eventDate
                ? format(eventDate, "EEEE, MMMM d, yyyy 'at' h:mm a")
                : "Date unavailable"}
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
            onClick={() => onCopy(booking.bookingCode, booking.id)}
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
          <span className="font-medium">
            {booking.quantity} ticket{booking.quantity > 1 ? "s" : ""}
          </span>
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
