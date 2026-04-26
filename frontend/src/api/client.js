import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000
})

// JWT on each every request
apiClient.interceptors.request.use(
    (config) => {
        const raw = localStorage.getItem('auth-storage')
        if(raw){
            try{
                const { state } = JSON.parse(raw);
                if(state?.token){
                    config.headers.Authorization = `Bearer ${state.token}`
                }
            }
            catch(_) {}
        }
        return config
    },
    (error) => Promise.reject(error),
)

// Clear Auth and redirect
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if(error.response?.status == 401){
            localStorage.removeItem('auth-storage')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    },
)

export default apiClient
