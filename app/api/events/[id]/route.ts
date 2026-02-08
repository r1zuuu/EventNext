'use server'

import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
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
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()

    const event = await prisma.event.update({
      where: { id: params.id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.shortDescription && { shortDescription: data.shortDescription }),
        ...(data.longDescription !== undefined && { longDescription: data.longDescription }),
        ...(data.location && { location: data.location }),
        ...(data.onlineUrl !== undefined && { onlineUrl: data.onlineUrl }),
        ...(data.coverImageUrl !== undefined && { coverImageUrl: data.coverImageUrl }),
        ...(data.startDateTime && { startDateTime: new Date(data.startDateTime) }),
        ...(data.endDateTime && { endDateTime: new Date(data.endDateTime) }),
        ...(data.timezone && { timezone: data.timezone }),
        ...(data.capacity && { capacity: data.capacity }),
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
  { params }: { params: { id: string } }
) {
  try {
    await prisma.event.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }
}
