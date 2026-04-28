import axios from 'axios'

// In production the Vite build bakes in VITE_API_URL at build time.
// In dev the vite.config.js proxy forwards /auth, /notes, /search to the
// gateway, so BASE_URL should be empty string (same origin) — but using
// the full URL also works because the proxy rewrites the host.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
})

// Attach JWT on every request
apiClient.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('cortex-auth')
    if (raw) {
      const { state } = JSON.parse(raw)
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`
      }
    }
  } catch (_) {
    // malformed storage — ignore
  }
  return config
})

// Global 401 → clear auth and redirect to login
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cortex-auth')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  },
)

export default apiClient