"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Check, Copy, Calendar as CalendarIcon, Download } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { Event, BookingFormData, Booking } from "@/lib/schemas"
import { bookingFormSchema } from "@/lib/schemas"
import { useStore } from "@/lib/store"
import { format } from "date-fns"

interface BookingDialogProps {
  event: Event
  remainingCapacity: number
}

export function BookingDialog({ event, remainingCapacity }: BookingDialogProps) {
  const [open, setOpen] = useState(false)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [copied, setCopied] = useState(false)
  const { addBooking, isAuthenticated, userEmail } = useStore()
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

  const onSubmit = (data: BookingFormData) => {
    const newBooking = addBooking(event.id, data)
    setBooking(newBooking)

    if (newBooking.status === "waitlist") {
      toast.info("Added to waitlist", {
        description: "You'll be notified if a spot becomes available.",
      })
    } else if (newBooking.status === "pending") {
      toast.success("Booking request submitted", {
        description: "The organizer will review your request.",
      })
    } else {
      toast.success("Booking confirmed!", {
        description: `Your booking code is ${newBooking.bookingCode}`,
      })
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

    const formatICSDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
    }

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//EventBook//EN
BEGIN:VEVENT
UID:${booking?.bookingCode}@eventbook
DTSTART:${formatICSDate(start)}
DTEND:${formatICSDate(end)}
SUMMARY:${event.title}
DESCRIPTION:${event.shortDescription}\\n\\nBooking Code: ${booking?.bookingCode}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`

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
      // Reset state when dialog closes
      setTimeout(() => {
        setBooking(null)
        form.reset()
      }, 200)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg">
          {isFull ? "Join Waitlist" : "Book Now"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {booking ? (
          <>
            <DialogHeader>
              <DialogTitle>
                {booking.status === "pending"
                  ? "Request Submitted"
                  : booking.status === "waitlist"
                  ? "Added to Waitlist"
                  : "Booking Confirmed"}
              </DialogTitle>
              <DialogDescription>
                {booking.status === "pending"
                  ? "Your request has been sent to the organizer for approval."
                  : booking.status === "waitlist"
                  ? "You'll be notified when a spot becomes available."
                  : "Your spot has been reserved. See you there!"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Booking Code</p>
                <p className="text-2xl font-mono font-bold tracking-wider">{booking.bookingCode}</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Event</span>
                  <span className="font-medium">{event.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">
                    {format(new Date(event.startDateTime), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity</span>
                  <span className="font-medium">{booking.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium capitalize">{booking.status.replace("_", " ")}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={copyBookingCode}>
                  {copied ? (
                    <Check className="size-4 mr-2" />
                  ) : (
                    <Copy className="size-4 mr-2" />
                  )}
                  {copied ? "Copied!" : "Copy Code"}
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent" onClick={generateICS}>
                  <Download className="size-4 mr-2" />
                  Add to Calendar
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                {isFull ? "Join Waitlist" : "Book Event"}
              </DialogTitle>
              <DialogDescription>
                {isFull
                  ? "This event is full, but you can join the waitlist."
                  : event.bookingType === "approval"
                  ? "Submit your details for approval by the organizer."
                  : "Fill in your details to complete your booking."}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="attendeeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="attendeeEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Confirmation will be sent to this email.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Tickets</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={isFull ? 10 : remainingCapacity}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      {!isFull && (
                        <FormDescription>
                          {remainingCapacity} spot{remainingCapacity !== 1 ? "s" : ""} available
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {event.bookingType === "approval" && (
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message to Organizer (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell the organizer why you'd like to attend..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {event.bookingType === "ticketed" && (
                  <div className="rounded-lg bg-muted p-3">
                    <div className="flex justify-between text-sm">
                      <span>
                        {event.price} PLN × {form.watch("quantity")}
                      </span>
                      <span className="font-semibold">
                        {(event.price || 0) * form.watch("quantity")} PLN
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {isFull
                    ? "Join Waitlist"
                    : event.bookingType === "approval"
                    ? "Submit Request"
                    : "Complete Booking"}
                </Button>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
