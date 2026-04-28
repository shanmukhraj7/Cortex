import { create } from 'zustand'
import apiClient from '../api/client.js'

const useNotesStore = create((set, get) => ({
  notes: [],
  searchResults: null,
  isLoading: false,
  isSearching: false,
  isSaving: false,
  pagination: { page: 1, limit: 20, total: 0 },
  activeTag: null,

  fetchNotes: async (page = 1, tag = null) => {
    set({ isLoading: true })
    try {
      const params = { page, limit: 20 }
      if (tag) params.tag = tag
      const { data } = await apiClient.get('/notes', { params })
      const notes = data.notes ?? data
      set({
        notes,
        pagination: data.pagination ?? { page, limit: 20, total: notes.length },
        activeTag: tag,
        isLoading: false,
        searchResults: null,
      })
    } catch (err) {
      console.error('fetchNotes error:', err.response?.status, err.response?.data)
      set({ isLoading: false })
    }
  },

  createNote: async (payload) => {
    set({ isSaving: true })
    try {
      // Ensure tags is always a clean string array
      const body = {
        title:   payload.title,
        content: payload.content,
        tags:    Array.isArray(payload.tags)
          ? payload.tags.map((t) => String(t).trim()).filter(Boolean)
          : [],
      }

      console.log('POST /notes body:', JSON.stringify(body))

      const { data } = await apiClient.post('/notes', body)
      set((s) => ({ notes: [data, ...s.notes], isSaving: false }))
      return { success: true, note: data }
    } catch (err) {
      set({ isSaving: false })
      console.error('createNote error:', err.response?.status, err.response?.data)
      const detail = err.response?.data?.detail
      const msg = typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
          ? detail.map((e) => e.msg).join(', ')
          : err.message || 'Failed to create note.'
      return { success: false, error: msg }
    }
  },

  updateNote: async (id, payload) => {
    set({ isSaving: true })
    try {
      const body = {
        title:   payload.title,
        content: payload.content,
        tags:    Array.isArray(payload.tags)
          ? payload.tags.map((t) => String(t).trim()).filter(Boolean)
          : [],
      }

      console.log('PUT /notes/' + id + ' body:', JSON.stringify(body))

      const { data } = await apiClient.put(`/notes/${id}`, body)
      set((s) => ({
        notes: s.notes.map((n) => (n.id === id ? data : n)),
        isSaving: false,
      }))
      return { success: true, note: data }
    } catch (err) {
      set({ isSaving: false })
      console.error('updateNote error:', err.response?.status, err.response?.data)
      const detail = err.response?.data?.detail
      const msg = typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
          ? detail.map((e) => e.msg).join(', ')
          : err.message || 'Failed to update note.'
      return { success: false, error: msg }
    }
  },

  deleteNote: async (id) => {
    try {
      await apiClient.delete(`/notes/${id}`)
      set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }))
      return { success: true }
    } catch (err) {
      console.error('deleteNote error:', err.response?.status, err.response?.data)
      return { success: false, error: 'Failed to delete note.' }
    }
  },

  searchNotes: async (query, topK = 5) => {
    if (!query?.trim()) {
      set({ searchResults: null, isSearching: false })
      return
    }
    set({ isSearching: true })
    try {
      const { data } = await apiClient.post('/search', { query, top_k: topK })
      set({ searchResults: data.results ?? [], isSearching: false })
    } catch (err) {
      console.error('searchNotes error:', err.response?.status, err.response?.data)
      set({ searchResults: [], isSearching: false })
    }
  },

  clearSearch: () => set({ searchResults: null }),
}))

export default useNotesStore