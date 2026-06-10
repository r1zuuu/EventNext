"use client"

import type { UseFormReturn } from "react-hook-form"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { EventFormValues } from "./schema"

interface PublishingTabProps {
  form: UseFormReturn<EventFormValues>
}

export function PublishingTab({ form }: PublishingTabProps) {
  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <CardTitle className="text-foreground">Publishing Settings</CardTitle>
        <CardDescription className="text-muted-foreground">Control event visibility</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Event Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-card border-border/50">
                  <SelectItem value="draft">Draft - Not visible to public</SelectItem>
                  <SelectItem value="published">Published - Visible and bookable</SelectItem>
                  <SelectItem value="cancelled">Cancelled - Event cancelled</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription className="text-muted-foreground">
                {field.value === "draft" && "Only admins can see this event"}
                {field.value === "published" && "Event is visible to everyone"}
                {field.value === "cancelled" && "Event will show as cancelled"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}
