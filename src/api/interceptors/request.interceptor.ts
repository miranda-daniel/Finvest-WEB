// Request interceptor — injects the JWT into every REST request.
//
// Reads the token from Zustand (in-memory only, never from localStorage).
// If no token is present the request goes out without an Authorization header —
// the response interceptor will catch the resulting 401 and trigger a silent refresh.
import type { AxiosInstance } from 'axios'
import { useAuthStore } from '@/stores/auth.store'

export function applyRequestInterceptor(client: AxiosInstance) {
  client.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  })
}
