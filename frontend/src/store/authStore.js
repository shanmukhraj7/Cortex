import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import apiClient from '../api/client.js'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await apiClient.post('/auth/login', { email, password })
          set({
            token: data.access_token,
            user: { email },
            isAuthenticated: true,
            isLoading: false,
          })
          return { success: true }
        } catch (err) {
          const message = err.response?.data?.detail || 'Login failed. Please check your credentials.'
          set({ isLoading: false, error: message })
          return { success: false, error: message }
        }
      },

      register: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          await apiClient.post('/auth/register', { email, password })
          set({ isLoading: false })
          return { success: true }
        } catch (err) {
          const message = err.response?.data?.detail || 'Registration failed. Please try again.'
          set({ isLoading: false, error: message })
          return { success: false, error: message }
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, error: null })
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    },
  ),
)

export default useAuthStore