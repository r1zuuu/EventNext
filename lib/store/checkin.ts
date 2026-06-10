import type { StateCreator } from 'zustand'
import type { AppState, CheckInSlice } from './types'

export const createCheckInSlice: StateCreator<AppState, [['zustand/persist', unknown]], [], CheckInSlice> = (set) => ({
  checkInMode: {},
  toggleCheckInMode: (eventId) =>
    set((state) => ({
      checkInMode: { ...state.checkInMode, [eventId]: !state.checkInMode[eventId] },
    })),
})
