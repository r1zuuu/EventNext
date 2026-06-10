"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Event } from "@/lib/schemas"
import { useStore } from "@/lib/store"
import { eventFormSchema, type EventFormValues, FIELD_TO_TAB } from "./event-form/schema"
import { BasicsTab } from "./event-form/basics-tab"
import { DateTimeTab } from "./event-form/datetime-tab"
import { CapacityTab } from "./event-form/capacity-tab"
import { PublishingTab } from "./event-form/publishing-tab"

interface EventFormProps {
  event?: Event
}

export function EventForm({ event }: EventFormProps) {
  const router = useRouter()
  const { addEvent, updateEvent } = useStore()
  const [tags, setTags] = useState<string[]>(event?.tags || [])
  const [tagInput, setTagInput] = useState("")
  const [showOnline, setShowOnline] = useState(!!event?.onlineUrl)
  const [activeTab, setActiveTab] = useState("basics")

  const isEditing = !!event

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: event
      ? {
          title: event.title,
          shortDescription: event.shortDescription,
          longDescription: event.longDescription || "",
          location: event.location,
          onlineUrl: event.onlineUrl || "",
          startDate: new Date(event.startDateTime),
          startTime: format(new Date(event.startDateTime), "HH:mm"),
          endDate: new Date(event.endDateTime),
          endTime: format(new Date(event.endDateTime), "HH:mm"),
          timezone: event.timezone,
          capacity: event.capacity,
          bookingType: event.bookingType,
          price: event.price,
          status: event.status,
          organizerName: event.organizerName,
          organizerEmail: event.organizerEmail,
        }
      : {
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
        },
  })

  const hasTabErrors = (tab: string) =>
    Object.keys(form.formState.errors).some((field) => FIELD_TO_TAB[field] === tab)

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag))

  const onSubmit = (data: EventFormValues) => {
    const errors = form.formState.errors
    const firstError = Object.keys(errors)[0]
    if (firstError && FIELD_TO_TAB[firstError]) {
      setActiveTab(FIELD_TO_TAB[firstError])
      toast.error(`Please fix the errors in the ${FIELD_TO_TAB[firstError]} tab`)
      return
    }

    const startDateTime = new Date(data.startDate)
    startDateTime.setHours(...(data.startTime.split(":").map(Number) as [number, number]))
    const endDateTime = new Date(data.endDate)
    endDateTime.setHours(...(data.endTime.split(":").map(Number) as [number, number]))

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 mt-2">
          <TabsList className="grid w-full h-auto gap-1 bg-card border-border/50 p-1 grid-cols-2 md:grid-cols-4">
            {(["basics", "datetime", "capacity", "publishing"] as const).map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="relative text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-primary/20"
              >
                {tab === "basics" && "Basics"}
                {tab === "datetime" && "Date & Location"}
                {tab === "capacity" && "Capacity & Booking"}
                {tab === "publishing" && "Publishing"}
                {hasTabErrors(tab) && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="basics">
            <BasicsTab
              form={form}
              tags={tags}
              tagInput={tagInput}
              onTagInputChange={setTagInput}
              onAddTag={addTag}
              onRemoveTag={removeTag}
            />
          </TabsContent>

          <TabsContent value="datetime">
            <DateTimeTab form={form} showOnline={showOnline} onShowOnlineChange={setShowOnline} />
          </TabsContent>

          <TabsContent value="capacity">
            <CapacityTab form={form} />
          </TabsContent>

          <TabsContent value="publishing">
            <PublishingTab form={form} />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            className="bg-secondary/50 border-border/50 text-secondary-foreground hover:bg-secondary/80"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-primary/90 text-primary-foreground hover:bg-primary hover:shadow-lg hover:shadow-primary/30"
          >
            {isEditing ? "Update Event" : "Create Event"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
