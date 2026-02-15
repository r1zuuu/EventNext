import { z } from "zod"

export const eventStatusSchema = z.enum(["draft", "published", "cancelled"])
export const bookingTypeSchema = z.enum(["ticketed", "free", "approval"])
export const bookingStatusSchema = z.enum(["confirmed", "waitlist", "cancelled", "checked_in", "pending"])

export const eventSchema = z.object({
  id: z.string(),
  title: z.string()
    .min(1, "Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters")
    .regex(/^[a-zA-Z0-9\s\-&().,]/i, "Title contains invalid characters"),
  shortDescription: z.string()
    .min(1, "Short description is required")
    .max(200, "Max 200 characters")
    .regex(/^[a-zA-Z0-9\s\-&().,!?]/i, "Description contains invalid characters"),
  longDescription: z.string().optional(),
  location: z.string()
    .min(1, "Location is required")
    .regex(/^[a-zA-Z0-9\s\-,&()./]/i, "Location contains invalid characters"),
  onlineUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  coverImageUrl: z.string().optional(),
  startDateTime: z.string().min(1, "Start date is required"),
  endDateTime: z.string().min(1, "End date is required"),
  timezone: z.string().default("Europe/Warsaw"),
  capacity: z.number().min(1, "Capacity must be at least 1").max(100000, "Capacity must be less than 100000"),
  bookingType: bookingTypeSchema,
  price: z.number().min(0).max(999999, "Price is too high").optional(),
  tags: z.array(z.string().regex(/^[a-z0-9\-]+$/i, "Tags must contain only letters, numbers and hyphens")),
  status: eventStatusSchema,
  organizerName: z.string()
    .min(1, "Organizer name is required")
    .regex(/^[a-zA-Z\s\-']/i, "Organizer name contains invalid characters"),
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
  attendeeName: z.string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s\-']/i, "Name contains invalid characters"),
  attendeeEmail: z.string().email("Must be a valid email"),
  quantity: z.number()
    .min(1, "At least 1 ticket required")
    .max(100, "Maximum 100 tickets per booking"),
  notes: z.string().optional(),
}).refine(
  (data) => {
    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(data.attendeeEmail)
  },
  { message: "Invalid email format", path: ["attendeeEmail"] }
)

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
