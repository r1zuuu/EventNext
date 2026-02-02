"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Event, Booking, BookingFormData, BookingStatus } from "./schemas"
import { initialEvents, initialBookings, generateBookingCode } from "./mock-data"

type Role = "admin" | "user"

interface AppState {
  // Auth
  role: Role
  isAuthenticated: boolean
  userEmail: string
  setRole: (role: Role) => void
  signIn: (email: string, role: Role) => void
  signOut: () => void

  // Events
  events: Event[]
  addEvent: (event: Omit<Event, "id" | "createdAt" | "updatedAt">) => Event
  updateEvent: (id: string, event: Partial<Event>) => void
  deleteEvent: (id: string) => void
  duplicateEvent: (id: string) => Event | null

  // Bookings
  bookings: Booking[]
  addBooking: (eventId: string, data: BookingFormData) => Booking
  updateBookingStatus: (id: string, status: BookingStatus) => void
  cancelBooking: (id: string) => void
  getBookingsForEvent: (eventId: string) => Booking[]
  getBookingsForUser: (email: string) => Booking[]
  getBookedCount: (eventId: string) => number

  // Check-in mode
  checkInMode: Record<string, boolean>
  toggleCheckInMode: (eventId: string) => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      role: "user",
      isAuthenticated: false,
      userEmail: "",
      setRole: (role) => set({ role }),
      signIn: (email, role) => set({ isAuthenticated: true, userEmail: email, role }),
      signOut: () => set({ isAuthenticated: false, userEmail: "", role: "user" }),

      // Events
      events: initialEvents,
      addEvent: (eventData) => {
        const newEvent: Event = {
          ...eventData,
          id: `evt-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set((state) => ({ events: [...state.events, newEvent] }))
        return newEvent
      },
      updateEvent: (id, eventData) => {
        set((state) => ({
          events: state.events.map((e) =>
            e.id === id ? { ...e, ...eventData, updatedAt: new Date().toISOString() } : e
          ),
        }))
      },
      deleteEvent: (id) => {
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
          bookings: state.bookings.filter((b) => b.eventId !== id),
        }))
      },
      duplicateEvent: (id) => {
        const event = get().events.find((e) => e.id === id)
        if (!event) return null
        const { id: _, createdAt: __, updatedAt: ___, ...eventData } = event
        const newEvent: Event = {
          ...eventData,
          id: `evt-${Date.now()}`,
          title: `${event.title} (Copy)`,
          status: "draft",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set((state) => ({ events: [...state.events, newEvent] }))
        return newEvent
      },

      // Bookings
      bookings: initialBookings,
      addBooking: (eventId, data) => {
        const event = get().events.find((e) => e.id === eventId)
        const bookedCount = get().getBookedCount(eventId)
        const remainingCapacity = event ? event.capacity - bookedCount : 0

        let status: BookingStatus = "confirmed"
        if (event?.bookingType === "approval") {
          status = "pending"
        } else if (data.quantity > remainingCapacity) {
          status = "waitlist"
        }

        const newBooking: Booking = {
          id: `bkg-${Date.now()}`,
          eventId,
          attendeeName: data.attendeeName,
          attendeeEmail: data.attendeeEmail,
          quantity: data.quantity,
          status,
          bookingCode: generateBookingCode(),
          notes: data.notes,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ bookings: [...state.bookings, newBooking] }))
        return newBooking
      },
      updateBookingStatus: (id, status) => {
        set((state) => ({
          bookings: state.bookings.map((b) => (b.id === id ? { ...b, status } : b)),
        }))
      },
      cancelBooking: (id) => {
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === id ? { ...b, status: "cancelled" as BookingStatus } : b
          ),
        }))
      },
      getBookingsForEvent: (eventId) => {
        return get().bookings.filter((b) => b.eventId === eventId)
      },
      getBookingsForUser: (email) => {
        return get().bookings.filter((b) => b.attendeeEmail === email)
      },
      getBookedCount: (eventId) => {
        return get()
          .bookings.filter(
            (b) => b.eventId === eventId && (b.status === "confirmed" || b.status === "checked_in")
          )
          .reduce((sum, b) => sum + b.quantity, 0)
      },

      // Check-in mode
      checkInMode: {},
      toggleCheckInMode: (eventId) => {
        set((state) => ({
          checkInMode: {
            ...state.checkInMode,
            [eventId]: !state.checkInMode[eventId],
          },
        }))
      },
    }),
    {
      name: "event-booking-storage",
    }
  )
)
