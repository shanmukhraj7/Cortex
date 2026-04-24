/**
 * Format a date string into a human-readable relative or absolute date.
 */
export function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/**
 * Truncate text to a max character count, appending ellipsis.
 */
export function truncate(text, maxLength = 120) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}

/**
 * Parse a comma-separated tag string into a cleaned array.
 */
export function parseTags(tagString) {
  if (!tagString) return []
  return tagString
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
}

/**
 * Format tags array to comma-separated string for editing.
 */
export function tagsToString(tags) {
  if (!tags || !Array.isArray(tags)) return ''
  return tags.join(', ')
}

/**
 * Debounce utility — returns a debounced version of fn.
 */
export function debounce(fn, delay = 300) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Generate a random hex colour from a seeded string (for tag colours).
 */
export function stringToColour(str) {
  if (!str) return '#6366f1'
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 65%, 55%)`
}

/**
 * Extract validation error message from an Axios error response.
 */
export function extractError(err) {
  if (!err) return 'An unexpected error occurred.'
  if (err.response?.data?.detail) {
    const d = err.response.data.detail
    if (typeof d === 'string') return d
    if (Array.isArray(d)) return d.map((e) => e.msg).join(', ')
  }
  if (err.message) return err.message
  return 'An unexpected error occurred.'
}