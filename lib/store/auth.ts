import type { StateCreator } from 'zustand'
import type { AppState, AuthSlice } from './types'

export const createAuthSlice: StateCreator<AppState, [['zustand/persist', unknown]], [], AuthSlice> = (set) => ({
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
      if (!response.ok) return false
      const user = await response.json()
      set({ isAuthenticated: true, userEmail: user.email, username, role: user.role })
      return true
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  },
  signOut: () => set({ isAuthenticated: false, userEmail: '', username: '', role: 'user' }),
})
