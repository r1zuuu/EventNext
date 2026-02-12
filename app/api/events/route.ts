'use server'

import { prisma } from '@/lib/prisma'
import { initialBookings, initialEvents } from '@/lib/mock-data'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: {
        bookings: true,
      },
      orderBy: {
        startDateTime: 'asc',
      },
    })
    return NextResponse.json(events)
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      const events = initialEvents
        .map((event) => ({
          ...event,
          bookings: initialBookings.filter((booking) => booking.eventId === event.id),
        }))
        .sort(
          (a, b) =>
            new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
        )
      return NextResponse.json(events)
    }
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const start = data.startDateTime ? new Date(data.startDateTime) : null
    const end = data.endDateTime ? new Date(data.endDateTime) : null
    const capacity = Number(data.capacity)

    if (!start || Number.isNaN(start.getTime())) {
      return NextResponse.json({ error: 'Invalid start date' }, { status: 400 })
    }

    if (!end || Number.isNaN(end.getTime())) {
      return NextResponse.json({ error: 'Invalid end date' }, { status: 400 })
    }

    if (end <= start) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 })
    }

    if (!Number.isFinite(capacity) || capacity < 1) {
      return NextResponse.json({ error: 'Invalid capacity' }, { status: 400 })
    }
    
    const event = await prisma.event.create({
      data: {
        title: data.title,
        shortDescription: data.shortDescription,
        longDescription: data.longDescription || null,
        location: data.location,
        onlineUrl: data.onlineUrl || null,
        coverImageUrl: data.coverImageUrl || null,
        startDateTime: start,
        endDateTime: end,
        timezone: data.timezone || 'Europe/Warsaw',
        capacity,
        bookingType: data.bookingType,
        price: data.price || null,
        tags: data.tags || [],
        status: data.status || 'draft',
        organizerName: data.organizerName,
        organizerEmail: data.organizerEmail,
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}
