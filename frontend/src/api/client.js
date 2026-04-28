import axios from 'axios'

// Gateway runs on 8080. Vite proxy forwards /auth, /notes, /search to it.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const apiClient = axios.create({
    baseURL: BASE_URL,           // ← must be baseURL, not base_url
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
})

// Attach JWT from persisted Zustand store on every request
apiClient.interceptors.request.use((config) => {
    try {
        const raw = localStorage.getItem('cortex-auth')
        if (raw) {
            const { state } = JSON.parse(raw)
            if (state?.token) {
                config.headers.Authorization = `Bearer ${state.token}`
            }
        }
    } catch (_) {}
    return config
})

// Global 401 handler — clear auth and redirect to login
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