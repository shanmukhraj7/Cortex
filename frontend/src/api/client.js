import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
})

apiClient.interceptors.request.use((config) => {
    try {
        const raw = localStorage.getItem('cortex-auth')
        if (raw) {
            const { state } = JSON.parse(raw)
            if (state?.token) config.headers.Authorization = `Bearer ${state.token}`
        }
    } catch (_) {}
    return config
})

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