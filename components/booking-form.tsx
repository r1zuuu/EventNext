"use client"

import type { UseFormReturn } from "react-hook-form"
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
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Event, BookingFormData } from "@/lib/schemas"

interface BookingFormProps {
  form: UseFormReturn<BookingFormData>
  event: Event
  remainingCapacity: number
  isFull: boolean
  onSubmit: (data: BookingFormData) => Promise<void>
}

export function BookingForm({ form, event, remainingCapacity, isFull, onSubmit }: BookingFormProps) {
  const title = isFull ? "Join Waitlist" : "Book Event"
  const description = isFull
    ? "This event is full, but you can join the waitlist."
    : event.bookingType === "approval"
    ? "Submit your details for approval by the organizer."
    : "Fill in your details to complete your booking."

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-foreground">{title}</DialogTitle>
        <DialogDescription className="text-muted-foreground">{description}</DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="attendeeName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Full Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="John Doe"
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                    {...field}
                  />
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
                <FormLabel className="text-foreground">Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-muted-foreground">
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
                <FormLabel className="text-foreground">Number of Tickets</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={isFull ? 10 : remainingCapacity}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                {!isFull && (
                  <FormDescription className="text-muted-foreground">
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
                  <FormLabel className="text-foreground">Message to Organizer (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell the organizer why you'd like to attend..."
                      className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {event.bookingType === "ticketed" && (
            <div className="rounded-lg bg-primary/10 p-3 border border-primary/20">
              <div className="flex justify-between text-sm text-foreground">
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
            className="w-full bg-primary/90 text-primary-foreground hover:bg-primary transition-colors hover:shadow-lg hover:shadow-primary/30"
            disabled={form.formState.isSubmitting}
          >
            {isFull ? "Join Waitlist" : event.bookingType === "approval" ? "Submit Request" : "Complete Booking"}
          </Button>
        </form>
      </Form>
    </>
  )
}
