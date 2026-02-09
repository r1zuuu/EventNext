import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper function to generate unique booking codes
function generateBookingCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

async function main() {
  console.log("🌱 Starting seed...");

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // ==================== USERS ====================
  const users = [
    {
      email: "admin@eventnext.pl",
      password: "admin123",
      role: "admin",
    },
    {
      email: "user@eventnext.pl",
      password: "user123",
      role: "user",
    },
    {
      email: "organizer@warsawtechhub.com",
      password: "organizer123",
      role: "user",
    },
  ];

  console.log("📝 Seeding Users...");
  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { role: user.role },
      create: user,
    });
  }
  console.log(`✅ Users seeded`);

  // ==================== EVENTS ====================
  const eventsData = [
    {
      id: "event-tech-networking",
      title: "Tech Startup Networking Night",
      shortDescription:
        "Connect with founders, investors, and tech enthusiasts in Warsaw's vibrant startup scene.",
      longDescription:
        "Join us for an evening of networking, lightning talks, and discussions about the latest trends in technology and entrepreneurship. Whether you're a seasoned founder or just curious about the startup world, this event is perfect for making meaningful connections.",
      location: "WeWork Mennica Legacy, Warsaw",
      onlineUrl: "",
      coverImageUrl: "",
      startDateTime: tomorrow,
      endDateTime: new Date(tomorrow.getTime() + 3 * 60 * 60 * 1000),
      timezone: "Europe/Warsaw",
      capacity: 50,
      bookingType: "free",
      tags: ["networking", "tech", "startup"],
      status: "published" as const,
      organizerName: "Warsaw Tech Hub",
      organizerEmail: "events@warsawtechhub.com",
    },
    {
      id: "event-react-workshop",
      title: "Advanced React Workshop",
      shortDescription:
        "Deep dive into React 19, Server Components, and modern patterns with hands-on exercises.",
      longDescription:
        "This intensive workshop covers advanced React concepts including Server Components, Suspense, concurrent features, and performance optimization. Bring your laptop and get ready to code! Lunch and refreshments included in the ticket price.",
      location: "Google Campus Warsaw",
      onlineUrl: "https://meet.google.com/abc-defg-hij",
      coverImageUrl: "",
      startDateTime: nextWeek,
      endDateTime: new Date(nextWeek.getTime() + 8 * 60 * 60 * 1000),
      timezone: "Europe/Warsaw",
      capacity: 30,
      bookingType: "ticketed" as const,
      price: 199,
      tags: ["workshop", "react", "programming"],
      status: "published" as const,
      organizerName: "Code Academy",
      organizerEmail: "workshops@codeacademy.pl",
    },
    {
      id: "event-ai-ethics",
      title: "AI Ethics Roundtable",
      shortDescription:
        "Invitation-only discussion on responsible AI development with industry leaders.",
      longDescription:
        "An intimate gathering of AI researchers, ethicists, and policy makers to discuss the challenges and opportunities in responsible AI development. This is an approval-based event to ensure diverse perspectives and meaningful dialogue.",
      location: "University of Warsaw, Main Hall",
      onlineUrl: "",
      coverImageUrl: "",
      startDateTime: new Date(nextMonth.getTime() + 2 * 24 * 60 * 60 * 1000),
      endDateTime: new Date(
        nextMonth.getTime() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000
      ),
      timezone: "Europe/Warsaw",
      capacity: 20,
      bookingType: "approval" as const,
      tags: ["ai", "ethics", "discussion"],
      status: "published" as const,
      organizerName: "AI Research Institute",
      organizerEmail: "events@airesearch.edu.pl",
    },
    {
      id: "event-music-festival",
      title: "Summer Music Festival",
      shortDescription:
        "A full day of live music featuring local and international artists.",
      longDescription:
        "Experience the best of summer with an all-day music festival featuring multiple stages, food vendors, and art installations. Early bird tickets available now!",
      location: "Lazienki Park, Warsaw",
      onlineUrl: "",
      coverImageUrl: "",
      startDateTime: new Date(
        nextMonth.getTime() + 15 * 24 * 60 * 60 * 1000
      ),
      endDateTime: new Date(
        nextMonth.getTime() + 15 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000
      ),
      timezone: "Europe/Warsaw",
      capacity: 5,
      bookingType: "ticketed" as const,
      price: 89,
      tags: ["music", "festival", "outdoor"],
      status: "published" as const,
      organizerName: "Warsaw Events Co",
      organizerEmail: "info@warsawevents.pl",
    },
    {
      id: "event-yoga",
      title: "Community Yoga Session",
      shortDescription:
        "Free weekly yoga session for all skill levels in the park.",
      longDescription:
        "Join us for a relaxing yoga session in the heart of the city. All levels welcome! Bring your own mat or we have extras available. Coffee and tea will be served after the session.",
      location: "Polo Mokotowskie Park",
      onlineUrl: "",
      coverImageUrl: "",
      startDateTime: new Date(nextMonth.getTime() + 1 * 24 * 60 * 60 * 1000),
      endDateTime: new Date(
        nextMonth.getTime() + 1 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000
      ),
      timezone: "Europe/Warsaw",
      capacity: 40,
      bookingType: "free" as const,
      tags: ["yoga", "wellness", "outdoor"],
      status: "published" as const,
      organizerName: "Wellness Warriors",
      organizerEmail: "hello@wellnesswarriors.pl",
    },
    {
      id: "event-intro",
      title: "event zapoznawczy",
      shortDescription: "ewewewew",
      longDescription: null,
      location: "Polska poddasie",
      onlineUrl: "",
      coverImageUrl: "",
      startDateTime: new Date(nextMonth.getTime() + 1 * 24 * 60 * 60 * 1000),
      endDateTime: new Date(
        nextMonth.getTime() + 1 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000
      ),
      timezone: "Europe/Warsaw",
      capacity: 50,
      bookingType: "ticketed" as const,
      price: 20,
      tags: [],
      status: "published" as const,
      organizerName: "test",
      organizerEmail: "test@test.com",
    },
  ];

  console.log("🎯 Seeding Events (upsert for idempotency)...");
  const events: { [key: string]: string } = {};
  for (const eventData of eventsData) {
    const event = await prisma.event.upsert({
      where: { id: eventData.id },
      update: {
        title: eventData.title,
        shortDescription: eventData.shortDescription,
        longDescription: eventData.longDescription,
        startDateTime: eventData.startDateTime,
        endDateTime: eventData.endDateTime,
        capacity: eventData.capacity,
        price: eventData.price,
        tags: eventData.tags,
        status: eventData.status,
      },
      create: eventData,
    });
    events[eventData.id] = event.id;
  }
  console.log(`✅ ${Object.keys(events).length} Events seeded`);

  // ==================== BOOKINGS ====================
  const bookingsData = [
    {
      eventId: events["event-tech-networking"],
      attendeeName: "Jan Kowalski",
      attendeeEmail: "jan.kowalski@example.com",
      quantity: 2,
      status: "confirmed" as const,
    },
    {
      eventId: events["event-tech-networking"],
      attendeeName: "Maria Nowak",
      attendeeEmail: "maria.nowak@example.com",
      quantity: 1,
      status: "confirmed" as const,
    },
    {
      eventId: events["event-react-workshop"],
      attendeeName: "Piotr Lewandowski",
      attendeeEmail: "piotr.lewandowski@example.com",
      quantity: 1,
      status: "confirmed" as const,
    },
    {
      eventId: events["event-react-workshop"],
      attendeeName: "Anna Szymczyk",
      attendeeEmail: "anna.szymczyk@example.com",
      quantity: 1,
      status: "pending" as const,
    },
    {
      eventId: events["event-ai-ethics"],
      attendeeName: "Dr. Robert Wisniewski",
      attendeeEmail: "robert.wisniewski@university.edu.pl",
      quantity: 1,
      status: "confirmed" as const,
    },
    {
      eventId: events["event-music-festival"],
      attendeeName: "Ewa Kaminska",
      attendeeEmail: "ewa.kaminska@example.com",
      quantity: 4,
      status: "confirmed" as const,
    },
    {
      eventId: events["event-music-festival"],
      attendeeName: "Tomasz Zajac",
      attendeeEmail: "tomasz.zajac@example.com",
      quantity: 1,
      status: "waitlist" as const,
    },
    {
      eventId: events["event-yoga"],
      attendeeName: "Katarzyna Zielinska",
      attendeeEmail: "katarzyna.zielinska@example.com",
      quantity: 1,
      status: "confirmed" as const,
    },
  ];

  console.log("🎫 Seeding Bookings (upsert for idempotency)...");
  for (const bookingData of bookingsData) {
    const bookingCode = `${bookingData.eventId.substring(0, 4)}-${generateBookingCode()}`;
    await prisma.booking.upsert({
      where: { bookingCode: bookingCode },
      update: {
        quantity: bookingData.quantity,
        status: bookingData.status,
      },
      create: {
        ...bookingData,
        bookingCode: bookingCode,
      },
    });
  }
  console.log(`✅ ${bookingsData.length} Bookings seeded`);

  console.log("✨ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
