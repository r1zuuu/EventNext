import { prisma } from "./prisma"
import type { Booking, Event } from "./schemas"

export async function getAllEvents(): Promise<Event[]> {
  return prisma.event.findMany({
    orderBy: {
      startDateTime: "asc",
    },
  })
}

export async function getEventById(id: string): Promise<Event | null> {
  if (!id) {
    return null
  }

  return prisma.event.findUnique({
    where: { id },
  })
}

export async function getAllBookings(): Promise<Booking[]> {
  return prisma.booking.findMany({
    orderBy: {
      createdAt: "desc",
    },
  })
}

export async function getBookingsForEvent(eventId: string): Promise<Booking[]> {
  if (!eventId) {
    return []
  }

  return prisma.booking.findMany({
    where: { eventId },
    orderBy: {
      createdAt: "desc",
    },
  })
}
