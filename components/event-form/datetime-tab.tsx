"use client"

import type { UseFormReturn } from "react-hook-form"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { EventFormValues } from "./schema"

interface DateTimeTabProps {
  form: UseFormReturn<EventFormValues>
  showOnline: boolean
  onShowOnlineChange: (value: boolean) => void
}

export function DateTimeTab({ form, showOnline, onShowOnlineChange }: DateTimeTabProps) {
  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <CardTitle className="text-foreground">Date, Time & Location</CardTitle>
        <CardDescription className="text-muted-foreground">When and where your event takes place</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-input border-border text-foreground hover:bg-secondary/50",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 size-4" />
                        {field.value ? format(field.value, "PPP") : "Pick a date"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card border-border/50" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Start Time</FormLabel>
                <FormControl>
                  <Input type="time" className="bg-input border-border text-foreground focus:border-primary" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-input border-border text-foreground hover:bg-secondary/50",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 size-4" />
                        {field.value ? format(field.value, "PPP") : "Pick a date"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card border-border/50" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">End Time</FormLabel>
                <FormControl>
                  <Input type="time" className="bg-input border-border text-foreground focus:border-primary" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="timezone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Timezone</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-card border-border/50">
                  <SelectItem value="Europe/Warsaw">Europe/Warsaw</SelectItem>
                  <SelectItem value="Europe/London">Europe/London</SelectItem>
                  <SelectItem value="America/New_York">America/New York</SelectItem>
                  <SelectItem value="America/Los_Angeles">America/Los Angeles</SelectItem>
                  <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator className="bg-border/50" />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Location</FormLabel>
              <FormControl>
                <Input placeholder="Venue name and address" className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-2">
          <Switch id="online-toggle" checked={showOnline} onCheckedChange={onShowOnlineChange} />
          <Label htmlFor="online-toggle" className="text-foreground">This event has an online option</Label>
        </div>

        {showOnline && (
          <FormField
            control={form.control}
            name="onlineUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Online Meeting URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary" {...field} />
                </FormControl>
                <FormDescription className="text-muted-foreground">
                  Link will be shared with confirmed attendees
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </CardContent>
    </Card>
  )
}
