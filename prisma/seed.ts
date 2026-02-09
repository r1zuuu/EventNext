import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { initialEvents, initialBookings } from "../lib/mock-data";

// Keep the seed client consistent with the app client (adapter-based)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seed from mock-data...");

  // ==================== CLEAN EXISTING DATA ====================
  // In dev, we want a clean slate that exactly matches our mocks.
  console.log("🧹 Clearing existing data (Booking, Event, User)...");
  await prisma.booking.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

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

  // ==================== EVENTS (z mock-data) ====================
  console.log("🎯 Seeding Events from initialEvents...");
  for (const eventData of initialEvents) {
    await prisma.event.upsert({
      where: { id: eventData.id },
      update: {
        title: eventData.title,
        shortDescription: eventData.shortDescription,
        longDescription: eventData.longDescription ?? null,
        location: eventData.location,
        onlineUrl: eventData.onlineUrl || null,
        coverImageUrl: eventData.coverImageUrl || null,
        startDateTime: new Date(eventData.startDateTime),
        endDateTime: new Date(eventData.endDateTime),
        timezone: eventData.timezone,
        capacity: eventData.capacity,
        bookingType: eventData.bookingType,
        price: eventData.price ?? null,
        tags: eventData.tags,
        status: eventData.status,
        organizerName: eventData.organizerName,
        organizerEmail: eventData.organizerEmail,
      },
      create: {
        id: eventData.id,
        title: eventData.title,
        shortDescription: eventData.shortDescription,
        longDescription: eventData.longDescription ?? null,
        location: eventData.location,
        onlineUrl: eventData.onlineUrl || null,
        coverImageUrl: eventData.coverImageUrl || null,
        startDateTime: new Date(eventData.startDateTime),
        endDateTime: new Date(eventData.endDateTime),
        timezone: eventData.timezone,
        capacity: eventData.capacity,
        bookingType: eventData.bookingType,
        price: eventData.price ?? null,
        tags: eventData.tags,
        status: eventData.status,
        organizerName: eventData.organizerName,
        organizerEmail: eventData.organizerEmail,
      },
    });
  }
  console.log(`✅ ${initialEvents.length} Events seeded`);

  // ==================== BOOKINGS (z mock-data) ====================
  console.log("🎫 Seeding Bookings from initialBookings...");
  for (const bookingData of initialBookings) {
    await prisma.booking.upsert({
      where: { bookingCode: bookingData.bookingCode },
      update: {
        quantity: bookingData.quantity,
        status: bookingData.status,
        notes: bookingData.notes ?? null,
      },
      create: {
        id: bookingData.id,
        eventId: bookingData.eventId,
        attendeeName: bookingData.attendeeName,
        attendeeEmail: bookingData.attendeeEmail,
        quantity: bookingData.quantity,
        status: bookingData.status,
        bookingCode: bookingData.bookingCode,
        notes: bookingData.notes ?? null,
      },
    });
  }
  console.log(`✅ ${initialBookings.length} Bookings seeded`);

  console.log("✨ Seed from mock-data completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
