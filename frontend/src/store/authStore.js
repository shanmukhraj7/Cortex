import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import apiClient from '../api/client.js'

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,

            login: async (email, password) => {
                set({ isLoading: true })
                try {
                    const { data } = await apiClient.post('/auth/login', { email, password })
                    set({ token: data.access_token, user: { email }, isAuthenticated: true, isLoading: false })
                    return { success: true }
                } catch (err) {
                    set({ isLoading: false })
                    const msg = err.response?.data?.detail || 'Invalid email or password.'
                    return { success: false, error: msg }
                }
            },

            register: async (email, password) => {
                set({ isLoading: true })
                try {
                    await apiClient.post('/auth/register', { email, password })
                    set({ isLoading: false })
                    return { success: true }
                } catch (err) {
                    set({ isLoading: false })
                    const msg = err.response?.data?.detail || 'Registration failed.'
                    return { success: false, error: msg }
                }
            },

            logout: () => set({ user: null, token: null, isAuthenticated: false }),
        }),
        {
            name: 'cortex-auth',
            partialize: (s) => ({ user: s.user, token: s.token, isAuthenticated: s.isAuthenticated }),
        },
    ),
)

export default useAuthStore