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
                    // Auth service returns { access_token, token_type }
                    // email comes from our own request payload (not in response body)
                    set({ token: data.access_token, user: { email }, isAuthenticated: true, isLoading: false })
                    return { success: true }
                } catch (err) {
                    set({ isLoading: false })
                    // Auth service errors use 'detail'; Spring Security 401s use 'message'
                    const msg = err.response?.data?.detail
                        || err.response?.data?.message
                        || 'Invalid email or password.'
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
                    const msg = err.response?.data?.detail
                        || err.response?.data?.message
                        || 'Registration failed.'
                    return { success: false, error: msg }
                }
            },

            logout: () => {
                // Clears persisted auth state — also called after account deletion
                set({ user: null, token: null, isAuthenticated: false })
            },
        }),
        {
            name: 'cortex-auth',
            partialize: (s) => ({ user: s.user, token: s.token, isAuthenticated: s.isAuthenticated }),
        },
    ),
)

export default useAuthStore