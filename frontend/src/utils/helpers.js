export function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1)  return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7)  return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function truncate(text, max = 120) {
  if (!text) return ''
  return text.length <= max ? text : text.slice(0, max).trimEnd() + '…'
}

export const parseTags = (input) => {
  if (!input || typeof input !== 'string') return []

  return input
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
}


export const tagsToString = (tags) => {
  if (!Array.isArray(tags)) return ''
  return tags.join(', ')
}

export function debounce(fn, delay = 300) {
  let timer
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay) }
}

export function tagColor(str) {
  if (!str) return '#a78bfa'
  const palette = [
    '#a78bfa', // violet
    '#22d3ee', // cyan
    '#34d399', // emerald
    '#f472b6', // pink
    '#fb923c', // orange
    '#60a5fa', // blue
    '#facc15', // yellow
    '#e879f9', // fuchsia
    '#4ade80', // green
    '#38bdf8', // sky
  ]
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return palette[Math.abs(hash) % palette.length]
}

export function extractError(err) {
  if (!err) return 'An unexpected error occurred.'
  const d = err.response?.data?.detail
  if (typeof d === 'string') return d
  if (Array.isArray(d)) return d.map((e) => e.msg).join(', ')
  return err.message || 'An unexpected error occurred.'
}

/**
 * Extract a user-friendly error message from an Axios error.
 * Handles: plain string details, validation arrays, @class-polluted
 * Redis-serialized responses, and network errors with no response body.
 */
export function extractApiError(err, fallback = 'Something went wrong.') {
  if (!err) return fallback

  // No response at all (network error, CORS, timeout)
  if (!err.response) {
    if (err.code === 'ECONNABORTED') return 'Request timed out. Please try again.'
    if (err.code === 'ERR_NETWORK') return 'Network error — are all services running?'
    return err.message || fallback
  }

  const data = err.response?.data
  if (!data) return fallback

  // Standard { detail: "..." } from our GlobalExceptionHandler
  const detail = data.detail
  if (typeof detail === 'string' && detail !== 'An unexpected error occurred.') return detail

  // FastAPI-style validation: { detail: [{ msg: "..." }, ...] }
  if (Array.isArray(detail)) return detail.map((e) => e.msg || e.message || '').filter(Boolean).join(', ') || fallback

  // Spring validation: { message: "..." }
  if (typeof data.message === 'string') return data.message

  return fallback
}