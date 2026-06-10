'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createAuthSlice } from './store/auth'
import { createEventsSlice } from './store/events'
import { createBookingsSlice } from './store/bookings'
import { createCheckInSlice } from './store/checkin'
import type { AppState } from './store/types'

export { type AppState }

export const useStore = create<AppState>()(
  persist(
    (...args) => ({
      ...createAuthSlice(...args),
      ...createEventsSlice(...args),
      ...createBookingsSlice(...args),
      ...createCheckInSlice(...args),
    }),
    { name: 'event-booking-storage' }
  )
)
