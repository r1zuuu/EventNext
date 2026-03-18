import { notFound } from "next/navigation"

import { getBookingsForEvent, getEventById } from "@/lib/server-data"

import { AdminEventBookings } from "./bookings-client"

export default async function EventBookingsPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const event = await getEventById(id)

  if (!event) {
    notFound()
  }

  const bookings = await getBookingsForEvent(id)

  return <AdminEventBookings event={event} initialBookings={bookings} />
}
