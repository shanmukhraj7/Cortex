import { create } from 'zustand'
import apiClient from '../api/client.js'

const useNotesStore = create((set, get) => ({
  notes: [],
  searchResults: null, // null = not searching; [] = searched but empty
  isLoading: false,
  isSearching: false,
  isSaving: false,
  error: null,
  pagination: { page: 1, limit: 20, total: 0 },
  activeTag: null,

  fetchNotes: async (page = 1, tag = null) => {
    set({ isLoading: true, error: null })
    try {
      const params = { page, limit: 20 }
      if (tag) params.tag = tag
      const { data } = await apiClient.get('/notes', { params })
      set({
        notes: data.notes ?? data,
        pagination: data.pagination ?? { page, limit: 20, total: (data.notes ?? data).length },
        activeTag: tag,
        isLoading: false,
        searchResults: null,
      })
    } catch (err) {
      set({ error: 'Failed to load notes.', isLoading: false })
    }
  },

  createNote: async (payload) => {
    set({ isSaving: true, error: null })
    try {
      const { data } = await apiClient.post('/notes', payload)
      set((s) => ({ notes: [data, ...s.notes], isSaving: false }))
      return { success: true, note: data }
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to create note.'
      set({ isSaving: false, error: message })
      return { success: false, error: message }
    }
  },

  updateNote: async (id, payload) => {
    set({ isSaving: true, error: null })
    try {
      const { data } = await apiClient.put(`/notes/${id}`, payload)
      set((s) => ({
        notes: s.notes.map((n) => (n.id === id ? data : n)),
        isSaving: false,
      }))
      return { success: true, note: data }
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to update note.'
      set({ isSaving: false, error: message })
      return { success: false, error: message }
    }
  },

  deleteNote: async (id) => {
    try {
      await apiClient.delete(`/notes/${id}`)
      set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }))
      return { success: true }
    } catch (err) {
      return { success: false, error: 'Failed to delete note.' }
    }
  },

  searchNotes: async (query, topK = 5) => {
    if (!query.trim()) {
      set({ searchResults: null, isSearching: false })
      return
    }
    set({ isSearching: true })
    try {
      const { data } = await apiClient.post('/search', { query, top_k: topK })
      set({ searchResults: data.results ?? [], isSearching: false })
    } catch (err) {
      set({ searchResults: [], isSearching: false })
    }
  },

  clearSearch: () => set({ searchResults: null }),
  clearError: () => set({ error: null }),
}))

export default useNotesStore