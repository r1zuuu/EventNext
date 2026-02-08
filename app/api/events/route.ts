'use server'

import { prisma } from '@/lib/prisma'
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
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const event = await prisma.event.create({
      data: {
        title: data.title,
        shortDescription: data.shortDescription,
        longDescription: data.longDescription || null,
        location: data.location,
        onlineUrl: data.onlineUrl || null,
        coverImageUrl: data.coverImageUrl || null,
        startDateTime: new Date(data.startDateTime),
        endDateTime: new Date(data.endDateTime),
        timezone: data.timezone || 'Europe/Warsaw',
        capacity: data.capacity,
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
