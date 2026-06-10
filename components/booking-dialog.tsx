"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Event, BookingFormData, Booking } from "@/lib/schemas"
import { bookingFormSchema } from "@/lib/schemas"
import { useStore } from "@/lib/store"
import { BookingConfirmation } from "@/components/booking-confirmation"
import { BookingForm } from "@/components/booking-form"

interface BookingDialogProps {
  event: Event
  remainingCapacity: number
}

export function BookingDialog({ event, remainingCapacity }: BookingDialogProps) {
  const [open, setOpen] = useState(false)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [copied, setCopied] = useState(false)
  const { addBooking, userEmail } = useStore()
  const isFull = remainingCapacity <= 0

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      attendeeName: "",
      attendeeEmail: userEmail || "",
      quantity: 1,
      notes: "",
    },
  })

  const onSubmit = async (data: BookingFormData) => {
    const newBooking = await addBooking(event.id, data)
    setBooking(newBooking)

    if (newBooking.status === "waitlist") {
      toast.info("Added to waitlist", { description: "You'll be notified if a spot becomes available." })
    } else if (newBooking.status === "pending") {
      toast.success("Booking request submitted", { description: "The organizer will review your request." })
    } else {
      toast.success("Booking confirmed!", { description: `Your booking code is ${newBooking.bookingCode}` })
    }
  }

  const copyBookingCode = () => {
    if (booking) {
      navigator.clipboard.writeText(booking.bookingCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const generateICS = () => {
    const start = new Date(event.startDateTime)
    const end = new Date(event.endDateTime)
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//EventBook//EN",
      "BEGIN:VEVENT",
      `UID:${booking?.bookingCode}@eventbook`,
      `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(end)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.shortDescription}\\n\\nBooking Code: ${booking?.bookingCode}`,
      `LOCATION:${event.location}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\n")

    const blob = new Blob([icsContent], { type: "text/calendar" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${event.title.replace(/\s+/g, "-")}.ics`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Calendar file downloaded")
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setTimeout(() => {
        setBooking(null)
        form.reset()
      }, 200)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          className="w-full bg-primary/90 text-primary-foreground hover:bg-primary transition-colors hover:shadow-lg hover:shadow-primary/30"
          size="lg"
        >
          {isFull ? "Join Waitlist" : "Book Now"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border">
        {booking ? (
          <BookingConfirmation
            event={event}
            booking={booking}
            copied={copied}
            onCopyCode={copyBookingCode}
            onGenerateICS={generateICS}
          />
        ) : (
          <BookingForm
            form={form}
            event={event}
            remainingCapacity={remainingCapacity}
            isFull={isFull}
            onSubmit={onSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
