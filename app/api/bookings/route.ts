'use server'

import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
// generowanie kodu rezerwacji format EVT-XXXXX
function generateBookingCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'EVT-'
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const eventId = searchParams.get('eventId')
    const attendeeEmail = searchParams.get('attendeeEmail')

    const where: any = {}
    if (eventId) where.eventId = eventId
    if (attendeeEmail) where.attendeeEmail = attendeeEmail

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        event: true,
      },
    })

    return NextResponse.json(bookings)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const event = await prisma.event.findUnique({
      where: { id: data.eventId },
      include: {
        bookings: {
          where: {
            status: {
              in: ['confirmed', 'checked_in'],
            },
          },
        },
      },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const bookedCount = event.bookings.reduce((sum: number, b: any) => sum + b.quantity, 0)
    const remainingCapacity = event.capacity - bookedCount

    let status = 'confirmed'
    if (event.bookingType === 'approval') {
      status = 'pending'
    } else if (data.quantity > remainingCapacity) {
      status = 'waitlist'
    }

    const booking = await prisma.booking.create({
      data: {
        eventId: data.eventId,
        attendeeName: data.attendeeName,
        attendeeEmail: data.attendeeEmail,
        quantity: data.quantity,
        status,
        bookingCode: generateBookingCode(),
        notes: data.notes || null,
      },
      include: {
        event: true,
      },
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
