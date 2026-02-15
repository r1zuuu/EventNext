'use server'

import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'

export async function POST() {
  try {
    // Clear existing data
    await prisma.booking.deleteMany({})
    await prisma.event.deleteMany({})
    await prisma.user.deleteMany({})

    // Create test users
    const adminPassword = await bcrypt.hash('admin', 10)
    const userPassword = await bcrypt.hash('user', 10)

    await prisma.user.createMany({
      data: [
        {
          username: 'admin',
          email: 'admin@eventnext.com',
          password: adminPassword,
          role: 'admin',
        },
        {
          username: 'user',
          email: 'user@eventnext.com',
          password: userPassword,
          role: 'user',
        },
      ],
    })

    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const events = await prisma.event.createMany({
      data: [
        {
          title: 'Tech Startup Networking Night',
          shortDescription:
            "Connect with founders, investors, and tech enthusiasts in Warsaw's vibrant startup scene.",
          longDescription:
            "Join us for an evening of networking, lightning talks, and discussions about the latest trends in technology and entrepreneurship.",
          location: 'WeWork Mennica Legacy, Warsaw',
          onlineUrl: '',
          coverImageUrl: '',
          startDateTime: tomorrow,
          endDateTime: new Date(tomorrow.getTime() + 3 * 60 * 60 * 1000),
          timezone: 'Europe/Warsaw',
          capacity: 50,
          bookingType: 'free',
          tags: ['networking', 'tech', 'startup'],
          status: 'published',
          organizerName: 'Warsaw Tech Hub',
          organizerEmail: 'events@warsawtechhub.com',
        },
        {
          title: 'Advanced React Workshop',
          shortDescription:
            'Deep dive into React 19, Server Components, and modern patterns with hands-on exercises.',
          longDescription:
            'This intensive workshop covers advanced React concepts including Server Components, Suspense, concurrent features, and performance optimization.',
          location: 'Google Campus Warsaw',
          onlineUrl: 'https://meet.google.com/abc-defg-hij',
          coverImageUrl: '',
          startDateTime: nextWeek,
          endDateTime: new Date(nextWeek.getTime() + 8 * 60 * 60 * 1000),
          timezone: 'Europe/Warsaw',
          capacity: 30,
          bookingType: 'ticketed',
          price: 199,
          tags: ['workshop', 'react', 'programming'],
          status: 'published',
          organizerName: 'Code Academy',
          organizerEmail: 'workshops@codeacademy.pl',
        },
        {
          title: 'AI Ethics Roundtable',
          shortDescription:
            'Invitation-only discussion on responsible AI development with industry leaders.',
          longDescription:
            'An intimate gathering of AI researchers, ethicists, and policy makers to discuss the challenges and opportunities in responsible AI development.',
          location: 'University of Warsaw, Main Hall',
          onlineUrl: '',
          coverImageUrl: '',
          startDateTime: new Date(nextMonth.getTime() + 2 * 24 * 60 * 60 * 1000),
          endDateTime: new Date(
            nextMonth.getTime() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000
          ),
          timezone: 'Europe/Warsaw',
          capacity: 20,
          bookingType: 'approval',
          tags: ['ai', 'ethics', 'discussion'],
          status: 'published',
          organizerName: 'AI Research Institute',
          organizerEmail: 'events@airesearch.edu.pl',
        },
        {
          title: 'Summer Music Festival',
          shortDescription: 'A full day of live music featuring local and international artists.',
          longDescription:
            'Experience the best of summer with an all-day music festival featuring multiple stages, food vendors, and art installations.',
          location: 'Lazienki Park, Warsaw',
          onlineUrl: '',
          coverImageUrl: '',
          startDateTime: new Date(nextMonth.getTime() + 15 * 24 * 60 * 60 * 1000),
          endDateTime: new Date(
            nextMonth.getTime() + 15 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000
          ),
          timezone: 'Europe/Warsaw',
          capacity: 5,
          bookingType: 'ticketed',
          price: 89,
          tags: ['music', 'festival', 'outdoor'],
          status: 'published',
          organizerName: 'Warsaw Events Co',
          organizerEmail: 'info@warsawevents.pl',
        },
        {
          title: 'Community Yoga Session',
          shortDescription: 'Free weekly yoga session for all skill levels in the park.',
          longDescription:
            'Join us for a relaxing yoga session in the heart of the city. All levels welcome!',
          location: 'Polo Mokotowskie Park',
          onlineUrl: '',
          coverImageUrl: '',
          startDateTime: new Date(nextMonth.getTime() + 1 * 24 * 60 * 60 * 1000),
          endDateTime: new Date(
            nextMonth.getTime() + 1 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000
          ),
          timezone: 'Europe/Warsaw',
          capacity: 40,
          bookingType: 'free',
          tags: ['yoga', 'wellness', 'outdoor'],
          status: 'published',
          organizerName: 'Wellness Warriors',
          organizerEmail: 'hello@wellnesswarriors.pl',
        },
        {
          title: 'event zapoznawczy',
          shortDescription: 'ewewewew',
          longDescription: null,
          location: 'Polska poddasie',
          onlineUrl: '',
          coverImageUrl: '',
          startDateTime: new Date(nextMonth.getTime() + 1 * 24 * 60 * 60 * 1000),
          endDateTime: new Date(
            nextMonth.getTime() + 1 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000
          ),
          timezone: 'Europe/Warsaw',
          capacity: 50,
          bookingType: 'ticketed',
          price: 20,
          tags: [],
          status: 'published',
          organizerName: 'test',
          organizerEmail: 'test@test.com',
        },
      ],
    })

    return NextResponse.json(
      { success: true, count: events.count, message: 'Database seeded successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 })
  }
}
