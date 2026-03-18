"use client"

import { useEffect, useRef } from "react"

import type { Booking, Event } from "@/lib/schemas"
import { useStore } from "@/lib/store"

interface StoreInitializerProps {
  events?: Event[]
  bookings?: Booking[]
}

export function StoreInitializer({ events, bookings }: StoreInitializerProps) {
  const hydrateEvents = useStore((state) => state.hydrateEvents)
  const hydrateBookings = useStore((state) => state.hydrateBookings)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) {
      return
    }

    if (events && events.length) {
      hydrateEvents(events)
    }

    if (bookings && bookings.length) {
      hydrateBookings(bookings)
    }

    initializedRef.current = true
  }, [events, bookings, hydrateEvents, hydrateBookings])

  return null
}
