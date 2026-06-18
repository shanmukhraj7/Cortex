import { create } from 'zustand'
import apiClient from '../api/client.js'

const DEFAULT_PREFERENCES = {
    theme: 'dark',
    accentColor: '#7C3AED',
    fontSize: 'md',
    emailDigest: false,
    weeklySummary: false,
}

const useSettingsStore = create((set, get) => ({
    preferences: DEFAULT_PREFERENCES,
    isLoading: false,
    isSaving: false,
    error: null,

    // ── Fetch ────────────────────────────────────────────────────────────────
    fetchSettings: async () => {
        set({ isLoading: true, error: null })
        try {
            const { data } = await apiClient.get('/settings')
            set({ preferences: data.preferences ?? DEFAULT_PREFERENCES, isLoading: false })
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to load settings.'
            set({ error: msg, isLoading: false })
        }
    },

    // ── Full update (PUT) ────────────────────────────────────────────────────
    saveSettings: async (prefs) => {
        set({ isSaving: true, error: null })
        try {
            const { data } = await apiClient.put('/settings', prefs)
            set({ preferences: data.preferences ?? prefs, isSaving: false })
            return { success: true }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to save settings.'
            set({ isSaving: false, error: msg })
            return { success: false, error: msg }
        }
    },

    // ── Partial update (PATCH) ───────────────────────────────────────────────
    patchSettings: async (partial) => {
        set({ isSaving: true, error: null })
        try {
            const { data } = await apiClient.patch('/settings', partial)
            set({ preferences: data.preferences ?? { ...get().preferences, ...partial }, isSaving: false })
            return { success: true }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update settings.'
            set({ isSaving: false, error: msg })
            return { success: false, error: msg }
        }
    },

    // ── Reset to defaults ────────────────────────────────────────────────────
    resetSettings: async () => {
        set({ isSaving: true, error: null })
        try {
            await apiClient.delete('/settings')
            set({ preferences: DEFAULT_PREFERENCES, isSaving: false })
            return { success: true }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to reset settings.'
            set({ isSaving: false, error: msg })
            return { success: false, error: msg }
        }
    },

    // ── Change password ──────────────────────────────────────────────────────
    changePassword: async (currentPassword, newPassword) => {
        set({ isSaving: true, error: null })
        try {
            await apiClient.put('/settings/account/password', { currentPassword, newPassword })
            set({ isSaving: false })
            return { success: true }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to change password.'
            set({ isSaving: false, error: msg })
            return { success: false, error: msg }
        }
    },

    // ── Delete account (danger zone) ─────────────────────────────────────────
    deleteAccount: async (password) => {
        set({ isSaving: true, error: null })
        try {
            await apiClient.delete('/settings/account', { data: { password } })
            set({ isSaving: false })
            return { success: true }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to delete account.'
            set({ isSaving: false, error: msg })
            return { success: false, error: msg }
        }
    },

    clearError: () => set({ error: null }),
}))

export default useSettingsStore
