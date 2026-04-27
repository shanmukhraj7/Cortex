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

export function parseTags(str) {
  if (!str) return []
  return str.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
}

export function tagsToString(tags) {
  return Array.isArray(tags) ? tags.join(', ') : ''
}

export function debounce(fn, delay = 300) {
  let timer
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay) }
}

export function tagColor(str) {
  if (!str) return '#fbbf24'
  const palette = [
    '#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899',
    '#06b6d4','#84cc16','#f97316','#6366f1','#14b8a6',
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