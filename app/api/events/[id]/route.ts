'use server'

import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        bookings: true,
      },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    const start = data.startDateTime ? new Date(data.startDateTime) : null
    const end = data.endDateTime ? new Date(data.endDateTime) : null
    const capacity = data.capacity !== undefined ? Number(data.capacity) : undefined

    if (start && Number.isNaN(start.getTime())) {
      return NextResponse.json({ error: 'Invalid start date' }, { status: 400 })
    }

    if (end && Number.isNaN(end.getTime())) {
      return NextResponse.json({ error: 'Invalid end date' }, { status: 400 })
    }

    if (start && end && end <= start) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 })
    }

    if (capacity !== undefined && (!Number.isFinite(capacity) || capacity < 1)) {
      return NextResponse.json({ error: 'Invalid capacity' }, { status: 400 })
    }

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.shortDescription && { shortDescription: data.shortDescription }),
        ...(data.longDescription !== undefined && { longDescription: data.longDescription }),
        ...(data.location && { location: data.location }),
        ...(data.onlineUrl !== undefined && { onlineUrl: data.onlineUrl }),
        ...(data.coverImageUrl !== undefined && { coverImageUrl: data.coverImageUrl }),
        ...(start && { startDateTime: start }),
        ...(end && { endDateTime: end }),
        ...(data.timezone && { timezone: data.timezone }),
        ...(capacity !== undefined && { capacity }),
        ...(data.bookingType && { bookingType: data.bookingType }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.tags && { tags: data.tags }),
        ...(data.status && { status: data.status }),
      },
      include: {
        bookings: true,
      },
    })

    return NextResponse.json(event)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.event.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }
}
