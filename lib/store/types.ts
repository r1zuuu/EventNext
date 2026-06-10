import type { Event, Booking, BookingFormData, BookingStatus } from '../schemas'

export type Role = 'admin' | 'user'

export interface AuthSlice {
  role: Role
  isAuthenticated: boolean
  userEmail: string
  username: string
  setRole: (role: Role) => void
  signIn: (username: string, password: string) => Promise<boolean>
  signOut: () => void
}

export interface EventsSlice {
  events: Event[]
  loadingEvents: boolean
  hydrateEvents: (events: Event[]) => void
  fetchEvents: () => Promise<void>
  addEvent: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Event>
  updateEvent: (id: string, event: Partial<Event>) => Promise<void>
  deleteEvent: (id: string) => Promise<void>
  duplicateEvent: (id: string) => Promise<Event | null>
}

export interface BookingsSlice {
  bookings: Booking[]
  loadingBookings: boolean
  hydrateBookings: (bookings: Booking[]) => void
  fetchBookings: (eventId?: string, email?: string) => Promise<void>
  addBooking: (eventId: string, data: BookingFormData) => Promise<Booking>
  updateBookingStatus: (id: string, status: BookingStatus) => Promise<void>
  cancelBooking: (id: string) => Promise<void>
  getBookingsForEvent: (eventId: string) => Booking[]
  getBookingsForUser: (email: string) => Booking[]
  getBookedCount: (eventId: string) => number
}

export interface CheckInSlice {
  checkInMode: Record<string, boolean>
  toggleCheckInMode: (eventId: string) => void
}

export type AppState = AuthSlice & EventsSlice & BookingsSlice & CheckInSlice
