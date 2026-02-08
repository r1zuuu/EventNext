'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Event, Booking, BookingFormData, BookingStatus } from './schemas'

type Role = 'admin' | 'user'

interface AppState {
  // Auth
  role: Role
  isAuthenticated: boolean
  userEmail: string
  username: string
  setRole: (role: Role) => void
  signIn: (username: string, password: string) => Promise<boolean>
  signOut: () => void

  // Events
  events: Event[]
  loadingEvents: boolean
  fetchEvents: () => Promise<void>
  addEvent: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Event>
  updateEvent: (id: string, event: Partial<Event>) => Promise<void>
  deleteEvent: (id: string) => Promise<void>
  duplicateEvent: (id: string) => Promise<Event | null>

  // Bookings
  bookings: Booking[]
  loadingBookings: boolean
  fetchBookings: (eventId?: string, email?: string) => Promise<void>
  addBooking: (eventId: string, data: BookingFormData) => Promise<Booking>
  updateBookingStatus: (id: string, status: BookingStatus) => Promise<void>
  cancelBooking: (id: string) => Promise<void>
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
      role: 'user',
      isAuthenticated: false,
      userEmail: '',
      username: '',
      setRole: (role) => set({ role }),
      signIn: async (username, password) => {
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          })
          
          if (!response.ok) {
            return false
          }
          
          const user = await response.json()
          set({
            isAuthenticated: true,
            userEmail: user.email,
            username: username,
            role: user.role,
          })
          return true
        } catch (error) {
          console.error('Login failed:', error)
          return false
        }
      },
      signOut: () => set({ isAuthenticated: false, userEmail: '', username: '', role: 'user' }),

      // Events
      events: [],
      loadingEvents: false,
      fetchEvents: async () => {
        set({ loadingEvents: true })
        try {
          const response = await fetch('/api/events')
          const events = await response.json()
          set({ events })
        } catch (error) {
          console.error('Failed to fetch events:', error)
        } finally {
          set({ loadingEvents: false })
        }
      },
      addEvent: async (eventData) => {
        try {
          const response = await fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData),
          })
          const newEvent = await response.json()
          set((state) => ({ events: [...state.events, newEvent] }))
          return newEvent
        } catch (error) {
          console.error('Failed to create event:', error)
          throw error
        }
      },
      updateEvent: async (id, eventData) => {
        try {
          const response = await fetch(`/api/events/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData),
          })
          const updatedEvent = await response.json()
          set((state) => ({
            events: state.events.map((e) => (e.id === id ? updatedEvent : e)),
          }))
        } catch (error) {
          console.error('Failed to update event:', error)
          throw error
        }
      },
      deleteEvent: async (id) => {
        try {
          await fetch(`/api/events/${id}`, { method: 'DELETE' })
          set((state) => ({
            events: state.events.filter((e) => e.id !== id),
            bookings: state.bookings.filter((b) => b.eventId !== id),
          }))
        } catch (error) {
          console.error('Failed to delete event:', error)
          throw error
        }
      },
      duplicateEvent: async (id) => {
        try {
          const event = get().events.find((e) => e.id === id)
          if (!event) return null

          const { id: _, createdAt: __, updatedAt: ___, ...eventData } = event
          const newEvent = await get().addEvent({
            ...eventData,
            title: `${event.title} (Copy)`,
            status: 'draft' as any,
          })
          return newEvent
        } catch (error) {
          console.error('Failed to duplicate event:', error)
          return null
        }
      },

      // Bookings
      bookings: [],
      loadingBookings: false,
      fetchBookings: async (eventId, email) => {
        set({ loadingBookings: true })
        try {
          const params = new URLSearchParams()
          if (eventId) params.append('eventId', eventId)
          if (email) params.append('attendeeEmail', email)

          const response = await fetch(`/api/bookings?${params}`)
          const bookings = await response.json()
          set({ bookings })
        } catch (error) {
          console.error('Failed to fetch bookings:', error)
        } finally {
          set({ loadingBookings: false })
        }
      },
      addBooking: async (eventId, data) => {
        try {
          const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventId, ...data }),
          })
          const newBooking = await response.json()
          set((state) => ({ bookings: [...state.bookings, newBooking] }))
          return newBooking
        } catch (error) {
          console.error('Failed to create booking:', error)
          throw error
        }
      },
      updateBookingStatus: async (id, status) => {
        try {
          const response = await fetch(`/api/bookings/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
          })
          const updatedBooking = await response.json()
          set((state) => ({
            bookings: state.bookings.map((b) => (b.id === id ? updatedBooking : b)),
          }))
        } catch (error) {
          console.error('Failed to update booking:', error)
          throw error
        }
      },
      cancelBooking: async (id) => {
        try {
          await get().updateBookingStatus(id, 'cancelled' as BookingStatus)
        } catch (error) {
          console.error('Failed to cancel booking:', error)
          throw error
        }
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
            (b) => b.eventId === eventId && (b.status === 'confirmed' || b.status === 'checked_in')
          )
          .reduce((sum: number, b: any) => sum + b.quantity, 0)
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
      name: 'event-booking-storage',
    }
  )
)
