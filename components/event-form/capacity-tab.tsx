"use client"

import type { UseFormReturn } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { EventFormValues } from "./schema"

interface CapacityTabProps {
  form: UseFormReturn<EventFormValues>
}

export function CapacityTab({ form }: CapacityTabProps) {
  const watchBookingType = form.watch("bookingType")

  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <CardTitle className="text-foreground">Capacity & Booking Settings</CardTitle>
        <CardDescription className="text-muted-foreground">Configure how attendees can book</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Maximum Capacity</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  className="bg-input border-border text-foreground focus:border-primary"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormDescription className="text-muted-foreground">Maximum number of attendees</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bookingType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Booking Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-card border-border/50">
                  <SelectItem value="free">Free - No payment required</SelectItem>
                  <SelectItem value="ticketed">Ticketed - Paid entry</SelectItem>
                  <SelectItem value="approval">Approval - Manual approval required</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {watchBookingType === "ticketed" && (
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Ticket Price (PLN)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    placeholder="0"
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Separator className="bg-border/50" />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="organizerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Organizer Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name or organization" className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="organizerEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Organizer Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="contact@example.com" className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  )
}
