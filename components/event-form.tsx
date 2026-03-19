"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { CalendarIcon, Plus, X } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { Event } from "@/lib/schemas"
import { useStore } from "@/lib/store"

const eventFormSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    shortDescription: z.string().min(1, "Short description is required").max(200, "Max 200 characters"),
    longDescription: z.string().optional(),
    location: z.string().min(1, "Location is required"),
    onlineUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    startDate: z.date({ required_error: "Start date is required" }),
    startTime: z.string().min(1, "Start time is required"),
    endDate: z.date({ required_error: "End date is required" }),
    endTime: z.string().min(1, "End time is required"),
    timezone: z.string().default("Europe/Warsaw"),
    capacity: z.number().min(1, "Capacity must be at least 1"),
    bookingType: z.enum(["free", "ticketed", "approval"]),
    price: z.number().optional(),
    status: z.enum(["draft", "published", "cancelled"]),
    organizerName: z.string().min(1, "Organizer name is required"),
    organizerEmail: z.string().email("Must be a valid email"),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate)
      start.setHours(...data.startTime.split(":").map(Number) as [number, number])
      const end = new Date(data.endDate)
      end.setHours(...data.endTime.split(":").map(Number) as [number, number])
      return end > start
    },
    { message: "End date/time must be after start date/time", path: ["endTime"] }
  )
  .refine(
    (data) => {
      if (data.bookingType === "ticketed") {
        return data.price !== undefined && data.price > 0
      }
      return true
    },
    { message: "Price is required for ticketed events", path: ["price"] }
  )

type EventFormValues = z.infer<typeof eventFormSchema>

interface EventFormProps {
  event?: Event
}

export function EventForm({ event }: EventFormProps) {
  const router = useRouter()
  const { addEvent, updateEvent } = useStore()
  const [tags, setTags] = useState<string[]>(event?.tags || [])
  const [tagInput, setTagInput] = useState<string>("")
  const [showOnline, setShowOnline] = useState<boolean>(!!event?.onlineUrl)
  const [activeTab, setActiveTab] = useState<string>("basics")

  const isEditing = !!event

  const getDefaultValues = (): Partial<EventFormValues> => {
    if (event) {
      const startDate = new Date(event.startDateTime)
      const endDate = new Date(event.endDateTime)
      return {
        title: event.title,
        shortDescription: event.shortDescription,
        longDescription: event.longDescription || "",
        location: event.location,
        onlineUrl: event.onlineUrl || "",
        startDate,
        startTime: format(startDate, "HH:mm"),
        endDate,
        endTime: format(endDate, "HH:mm"),
        timezone: event.timezone,
        capacity: event.capacity,
        bookingType: event.bookingType,
        price: event.price,
        status: event.status,
        organizerName: event.organizerName,
        organizerEmail: event.organizerEmail,
      }
    }
    return {
      title: "",
      shortDescription: "",
      longDescription: "",
      location: "",
      onlineUrl: "",
      timezone: "Europe/Warsaw",
      capacity: 50,
      bookingType: "free" as const,
      price: 0,
      status: "draft" as const,
      organizerName: "",
      organizerEmail: "",
      startDate: new Date(),
      startTime: "09:00",
      endDate: new Date(),
      endTime: "17:00",
    }
  }

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: getDefaultValues(),
  })

  const watchBookingType = form.watch("bookingType")

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const onSubmit = async (data: EventFormValues) => {
    // Mapa pól do tabów
    const fieldToTab: Record<string, string> = {
      title: "basics",
      shortDescription: "basics",
      longDescription: "basics",
      location: "datetime",
      startDate: "datetime",
      startTime: "datetime",
      endDate: "datetime",
      endTime: "datetime",
      capacity: "capacity",
      bookingType: "capacity",
      price: "capacity",
      status: "publishing",
      organizerName: "publishing",
      organizerEmail: "publishing",
    }

    // Sprawdzenie czy są błędy
    const errors = form.formState.errors
    const errorFields = Object.keys(errors)
    
    if (errorFields.length > 0) {
      const firstErrorField = errorFields[0] as keyof typeof fieldToTab
      const errorTab = fieldToTab[firstErrorField]
      
      if (errorTab) {
        setActiveTab(errorTab)
        toast.error(`Please fix the errors in the ${errorTab} tab`)
        return
      }
    }

    const startDateTime = new Date(data.startDate)
    startDateTime.setHours(...data.startTime.split(":").map(Number) as [number, number])

    const endDateTime = new Date(data.endDate)
    endDateTime.setHours(...data.endTime.split(":").map(Number) as [number, number])

    const eventData = {
      title: data.title,
      shortDescription: data.shortDescription,
      longDescription: data.longDescription || "",
      location: data.location,
      onlineUrl: showOnline ? data.onlineUrl || "" : "",
      coverImageUrl: "",
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
      timezone: data.timezone,
      capacity: data.capacity,
      bookingType: data.bookingType,
      price: data.bookingType === "ticketed" ? data.price : undefined,
      tags,
      status: data.status,
      organizerName: data.organizerName,
      organizerEmail: data.organizerEmail,
    }

    if (isEditing && event) {
      updateEvent(event.id, eventData)
      toast.success("Event updated")
    } else {
      addEvent(eventData)
      toast.success("Event created")
    }

    router.push("/admin/events")
  }

  // Helper: sprawdzenie czy tab ma błędy
  const hasTabErrors = (tab: string): boolean => {
    const fieldToTab: Record<string, string> = {
      title: "basics",
      shortDescription: "basics",
      longDescription: "basics",
      location: "datetime",
      startDate: "datetime",
      startTime: "datetime",
      endDate: "datetime",
      endTime: "datetime",
      capacity: "capacity",
      bookingType: "capacity",
      price: "capacity",
      status: "publishing",
      organizerName: "publishing",
      organizerEmail: "publishing",
    }
    
    const errors = form.formState.errors
    return Object.keys(errors).some(
      (field) => fieldToTab[field as keyof typeof fieldToTab] === tab
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 mt-2">
          <TabsList className="grid w-full h-auto gap-1 bg-card border-border/50 p-1 grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="basics" className="relative text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-primary/20">
              Basics
              {hasTabErrors("basics") && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </TabsTrigger>
            <TabsTrigger value="datetime" className="relative text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-primary/20">
              Date & Location
              {hasTabErrors("datetime") && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </TabsTrigger>
            <TabsTrigger value="capacity" className="relative text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-primary/20">
              Capacity & Booking
              {hasTabErrors("capacity") && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </TabsTrigger>
            <TabsTrigger value="publishing" className="relative text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-primary/20">
              Publishing
              {hasTabErrors("publishing") && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basics">
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle className="text-foreground">Basic Information</CardTitle>
                <CardDescription className="text-muted-foreground">Core details about your event</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Event Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter event title" className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Short Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief summary (max 200 chars)"
                          className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                          {...field}
                          maxLength={200}
                        />
                      </FormControl>
                      <FormDescription className="text-muted-foreground">
                        {field.value?.length || 0}/200 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="longDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Full Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Detailed description of your event"
                          className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Label className="text-foreground">Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag"
                      className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addTag()
                        }
                      }}
                    />
                    <Button type="button" variant="outline" className="bg-secondary border-border/50 text-secondary-foreground hover:bg-secondary/80" onClick={addTag}>
                      <Plus className="size-4" />
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => (
                        <Badge key={tag} className="bg-secondary text-secondary-foreground border-border/50 gap-1">
                          {tag}
                          <button type="button" onClick={() => removeTag(tag)}>
                            <X className="size-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="datetime">
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
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
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
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
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
                  <Switch
                    id="online-toggle"
                    checked={showOnline}
                    onCheckedChange={setShowOnline}
                  />
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
          </TabsContent>

          <TabsContent value="capacity">
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
                      <FormDescription className="text-muted-foreground">
                        Maximum number of attendees
                      </FormDescription>
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
          </TabsContent>

          <TabsContent value="publishing">
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
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" className="bg-secondary/50 border-border/50 text-secondary-foreground hover:bg-secondary/80" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" className="bg-primary/90 text-primary-foreground hover:bg-primary hover:shadow-lg hover:shadow-primary/30">
            {isEditing ? "Update Event" : "Create Event"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
