import { z } from "zod"

export const eventStatusSchema = z.enum(["draft", "published", "cancelled"])
export const bookingTypeSchema = z.enum(["ticketed", "free", "approval"])
export const bookingStatusSchema = z.enum(["confirmed", "waitlist", "cancelled", "checked_in", "pending"])

export const eventSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  shortDescription: z.string().min(1, "Short description is required").max(200, "Max 200 characters"),
  longDescription: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  onlineUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  coverImageUrl: z.string().optional(),
  startDateTime: z.string().min(1, "Start date is required"),
  endDateTime: z.string().min(1, "End date is required"),
  timezone: z.string().default("Europe/Warsaw"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  bookingType: bookingTypeSchema,
  price: z.number().min(0).optional(),
  tags: z.array(z.string()),
  status: eventStatusSchema,
  organizerName: z.string().min(1, "Organizer name is required"),
  organizerEmail: z.string().email("Must be a valid email"),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const eventFormSchema = eventSchema
  .omit({ id: true, createdAt: true, updatedAt: true })
  .refine(
    (data) => new Date(data.endDateTime) > new Date(data.startDateTime),
    { message: "End date must be after start date", path: ["endDateTime"] }
  )
  .refine(
    (data) => {
      if (data.bookingType === "ticketed") {
        return data.price !== undefined && data.price > 0
      }
      return true
    },
    { message: "Price is required and must be greater than 0 for ticketed events", path: ["price"] }
  )

export const bookingSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  attendeeName: z.string().min(1, "Name is required"),
  attendeeEmail: z.string().email("Must be a valid email"),
  quantity: z.number().min(1, "At least 1 ticket required"),
  status: bookingStatusSchema,
  bookingCode: z.string(),
  notes: z.string().optional(),
  createdAt: z.string(),
})

export const bookingFormSchema = z.object({
  attendeeName: z.string().min(1, "Name is required"),
  attendeeEmail: z.string().email("Must be a valid email"),
  quantity: z.number().min(1, "At least 1 ticket required"),
  notes: z.string().optional(),
})

export const sessionSlotSchema = z.object({
  id: z.string(),
  startTime: z.string(),
  endTime: z.string(),
})

export const autoSlotsFormSchema = z.object({
  sessionDuration: z.number().min(15, "Minimum 15 minutes"),
  breakDuration: z.number().min(0, "Cannot be negative"),
  numberOfSessions: z.number().min(1, "At least 1 session required"),
})

export type Event = z.infer<typeof eventSchema>
export type EventFormData = z.infer<typeof eventFormSchema>
export type Booking = z.infer<typeof bookingSchema>
export type BookingFormData = z.infer<typeof bookingFormSchema>
export type SessionSlot = z.infer<typeof sessionSlotSchema>
export type AutoSlotsFormData = z.infer<typeof autoSlotsFormSchema>
export type EventStatus = z.infer<typeof eventStatusSchema>
export type BookingType = z.infer<typeof bookingTypeSchema>
export type BookingStatus = z.infer<typeof bookingStatusSchema>
