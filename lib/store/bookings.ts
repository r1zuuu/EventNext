import type { StateCreator } from 'zustand'
import type { AppState, BookingsSlice } from './types'

export const createBookingsSlice: StateCreator<AppState, [['zustand/persist', unknown]], [], BookingsSlice> = (set, get) => ({
  bookings: [],
  loadingBookings: false,
  hydrateBookings: (bookings) => set({ bookings: Array.isArray(bookings) ? bookings : [] }),
  fetchBookings: async (eventId, email) => {
    set({ loadingBookings: true })
    try {
      const params = new URLSearchParams()
      if (eventId) params.append('eventId', eventId)
      if (email) params.append('attendeeEmail', email)
      const response = await fetch(`/api/bookings?${params}`)
      if (!response.ok) {
        console.error('Failed to fetch bookings:', await response.json().catch(() => ({})))
        set({ bookings: [] })
        return
      }
      const bookings = await response.json()
      set({ bookings: Array.isArray(bookings) ? bookings : [] })
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
      set({ bookings: [] })
    } finally {
      set({ loadingBookings: false })
    }
  },
  addBooking: async (eventId, data) => {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, ...data }),
    })
    const newBooking = await response.json()
    set((state) => ({ bookings: [...state.bookings, newBooking] }))
    return newBooking
  },
  updateBookingStatus: async (id, status) => {
    const response = await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const updatedBooking = await response.json()
    set((state) => ({
      bookings: state.bookings.map((b) => (b.id === id ? updatedBooking : b)),
    }))
  },
  cancelBooking: async (id) => {
    await get().updateBookingStatus(id, 'cancelled')
  },
  getBookingsForEvent: (eventId) => get().bookings.filter((b) => b.eventId === eventId),
  getBookingsForUser: (email) => get().bookings.filter((b) => b.attendeeEmail === email),
  getBookedCount: (eventId) =>
    get()
      .bookings.filter((b) => b.eventId === eventId && (b.status === 'confirmed' || b.status === 'checked_in'))
      .reduce((sum, b) => sum + b.quantity, 0),
})
