import { prisma } from "./prisma"
import type { Booking, Event } from "./schemas"

const logPrismaError = (error: unknown, context: string) => {
  const message = error instanceof Error ? error.message : String(error)
  if (process.env.NODE_ENV === "development") {
    console.error(`[server-data] ${context} failed`, error)
  } else {
    console.error(`[server-data] ${context} failed: ${message}`)
  }
}

export async function getAllEvents(): Promise<Event[]> {
  try {
    return await prisma.event.findMany({
      orderBy: {
        startDateTime: "asc",
      },
    })
  } catch (error) {
    logPrismaError(error, "getAllEvents")
    return []
  }
}

export async function getEventById(id: string): Promise<Event | null> {
  if (!id) {
    return null
  }

  try {
    return await prisma.event.findUnique({
      where: { id },
    })
  } catch (error) {
    logPrismaError(error, "getEventById")
    return null
  }
}

export async function getAllBookings(): Promise<Booking[]> {
  try {
    return await prisma.booking.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })
  } catch (error) {
    logPrismaError(error, "getAllBookings")
    return []
  }
}

export async function getBookingsForEvent(eventId: string): Promise<Booking[]> {
  if (!eventId) {
    return []
  }

  try {
    return await prisma.booking.findMany({
      where: { eventId },
      orderBy: {
        createdAt: "desc",
      },
    })
  } catch (error) {
    logPrismaError(error, "getBookingsForEvent")
    return []
  }
}
