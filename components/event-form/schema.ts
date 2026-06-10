import { z } from "zod"

export const eventFormSchema = z
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
      start.setHours(...(data.startTime.split(":").map(Number) as [number, number]))
      const end = new Date(data.endDate)
      end.setHours(...(data.endTime.split(":").map(Number) as [number, number]))
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

export type EventFormValues = z.infer<typeof eventFormSchema>

export const FIELD_TO_TAB: Record<string, string> = {
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
