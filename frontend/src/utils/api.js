import axios from 'axios'

/**
 * Axios instance configured to hit the FastAPI backend.
 * In dev, Vite proxies /api → http://localhost:8000
 * In production, set VITE_API_URL env var.
 */
const resolveBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL
  if (!envUrl) return '/api'
  const trimmed = envUrl.replace(/\/+$/, '')
  if (trimmed.startsWith('http') && !trimmed.endsWith('/api')) {
    return `${trimmed}/api`
  }
  return trimmed
}

const api = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 60000,   // 60s — HuggingFace models can be slow on first load
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request/response interceptors for debugging
api.interceptors.request.use(config => {
  console.debug(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.data)
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    console.error('[API Error]', err.response?.data || err.message)
    return Promise.reject(err)
  }
)

export default api
