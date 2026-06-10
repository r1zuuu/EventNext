import type { StateCreator } from 'zustand'
import type { AppState, EventsSlice } from './types'

export const createEventsSlice: StateCreator<AppState, [['zustand/persist', unknown]], [], EventsSlice> = (set, get) => ({
  events: [],
  loadingEvents: false,
  hydrateEvents: (events) => set({ events: Array.isArray(events) ? events : [] }),
  fetchEvents: async () => {
    set({ loadingEvents: true })
    try {
      const response = await fetch('/api/events')
      if (!response.ok) {
        console.error('Failed to fetch events:', await response.json().catch(() => ({})))
        set({ events: [] })
        return
      }
      const events = await response.json()
      set({ events: Array.isArray(events) ? events : [] })
    } catch (error) {
      console.error('Failed to fetch events:', error)
      set({ events: [] })
    } finally {
      set({ loadingEvents: false })
    }
  },
  addEvent: async (eventData) => {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error?.error || 'Failed to create event')
    }
    const newEvent = await response.json()
    set((state) => ({ events: [...state.events, newEvent] }))
    return newEvent
  },
  updateEvent: async (id, eventData) => {
    const response = await fetch(`/api/events/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error?.error || 'Failed to update event')
    }
    const updatedEvent = await response.json()
    set((state) => ({ events: state.events.map((e) => (e.id === id ? updatedEvent : e)) }))
  },
  deleteEvent: async (id) => {
    await fetch(`/api/events/${id}`, { method: 'DELETE' })
    set((state) => ({
      events: state.events.filter((e) => e.id !== id),
      bookings: state.bookings.filter((b) => b.eventId !== id),
    }))
  },
  duplicateEvent: async (id) => {
    try {
      const event = get().events.find((e) => e.id === id)
      if (!event) return null
      const { id: _, createdAt: __, updatedAt: ___, ...eventData } = event
      return await get().addEvent({ ...eventData, title: `${event.title} (Copy)`, status: 'draft' })
    } catch (error) {
      console.error('Failed to duplicate event:', error)
      return null
    }
  },
})
