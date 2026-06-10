"use client"

import { Check, Copy, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Event, Booking } from "@/lib/schemas"
import { format } from "date-fns"

interface BookingConfirmationProps {
  event: Event
  booking: Booking
  copied: boolean
  onCopyCode: () => void
  onGenerateICS: () => void
}

export function BookingConfirmation({ event, booking, copied, onCopyCode, onGenerateICS }: BookingConfirmationProps) {
  const title =
    booking.status === "pending"
      ? "Request Submitted"
      : booking.status === "waitlist"
      ? "Added to Waitlist"
      : "Booking Confirmed"

  const description =
    booking.status === "pending"
      ? "Your request has been sent to the organizer for approval."
      : booking.status === "waitlist"
      ? "You'll be notified when a spot becomes available."
      : "Your spot has been reserved. See you there!"

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-foreground">{title}</DialogTitle>
        <DialogDescription className="text-muted-foreground">{description}</DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="rounded-lg bg-primary/10 p-4 text-center border border-primary/20">
          <p className="text-xs text-primary mb-1">Booking Code</p>
          <p className="text-2xl font-mono font-bold tracking-wider text-foreground">{booking.bookingCode}</p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Event</span>
            <span className="font-medium text-foreground">{event.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date</span>
            <span className="font-medium text-foreground">
              {format(new Date(event.startDateTime), "MMM d, yyyy")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Quantity</span>
            <span className="font-medium text-foreground">{booking.quantity}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium capitalize text-foreground">
              {booking.status?.replace("_", " ") ?? "unknown"}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 bg-secondary border-border/50 text-secondary-foreground hover:bg-secondary/80"
            onClick={onCopyCode}
          >
            {copied ? <Check className="size-4 mr-2" /> : <Copy className="size-4 mr-2" />}
            {copied ? "Copied!" : "Copy Code"}
          </Button>
          <Button
            variant="outline"
            className="flex-1 bg-secondary border-border/50 text-secondary-foreground hover:bg-secondary/80"
            onClick={onGenerateICS}
          >
            <Download className="size-4 mr-2" />
            Add to Calendar
          </Button>
        </div>
      </div>
    </>
  )
}
