import { create } from 'zustand'
import apiClient from '../api/client.js'

// Normalize a tag list regardless of whether it arrives as an array or a
// comma-separated string (defensive against both server formats).
const normalizeTags = (tags) => {
  if (Array.isArray(tags)) {
    return tags.map(t => String(t).trim()).filter(Boolean)
  }
  if (typeof tags === 'string') {
    return tags.split(',').map(t => t.trim()).filter(Boolean)
  }
  return []
}

const useNotesStore = create((set, get) => ({
  notes: [],
  searchResults: null,
  isLoading: false,
  isSearching: false,
  isSaving: false,
  pagination: { page: 1, limit: 20, total: 0 },
  activeTag: null,

  // ── Fetch ──────────────────────────────────────────────────────────────
  fetchNotes: async (page = 1, tag = null) => {
    set({ isLoading: true })
    try {
      const params = { page, limit: 20 }
      if (tag) params.tag = tag

      const { data } = await apiClient.get('/notes', { params })
      // Server returns { notes: [...], pagination: {...} }
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

  // ── Create ─────────────────────────────────────────────────────────────
  createNote: async (payload) => {
    set({ isSaving: true })
    try {
      const body = {
        title:   payload.title,
        content: payload.content,
        tags:    normalizeTags(payload.tags),
      }
      const { data } = await apiClient.post('/notes', body)
      set((s) => ({ notes: [data, ...s.notes], isSaving: false }))
      return { success: true, note: data }
    } catch (err) {
      set({ isSaving: false })
      const detail = err.response?.data?.detail
      const msg = typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
          ? detail.map((e) => e.msg).join(', ')
          : err.message || 'Failed to create note.'
      return { success: false, error: msg }
    }
  },

  // ── Update ─────────────────────────────────────────────────────────────
  updateNote: async (id, payload) => {
    set({ isSaving: true })
    try {
      const body = {
        title:   payload.title,
        content: payload.content,
        tags:    normalizeTags(payload.tags),
      }
      const { data } = await apiClient.put(`/notes/${id}`, body)
      set((s) => ({
        notes: s.notes.map((n) => (n.id === id ? data : n)),
        isSaving: false,
      }))
      return { success: true, note: data }
    } catch (err) {
      set({ isSaving: false })
      const detail = err.response?.data?.detail
      const msg = typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
          ? detail.map((e) => e.msg).join(', ')
          : err.message || 'Failed to update note.'
      return { success: false, error: msg }
    }
  },

  // ── Delete ─────────────────────────────────────────────────────────────
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

  // ── Search ─────────────────────────────────────────────────────────────
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