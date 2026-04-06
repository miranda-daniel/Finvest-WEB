// Axios instance — shared HTTP client for all REST requests.
//
// All REST calls must go through this instance (never import axios directly).
//
// Response interceptor handles silent JWT renewal:
//   - On 401: calls POST /session/refresh-token (cookie sent automatically)
//   - On success: stores new JWT in memory, retries original request
//   - On failure: clears auth state and redirects to /login
//   - Concurrent 401s are queued — only one refresh call is made
//
// GraphQL requests go through Apollo Client (src/graphql/client.ts), not this.
import axios, { isAxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth.store'

export const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
})

// Queue for requests that arrived while a refresh was already in progress
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token!)
    }
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!isAxiosError(error) || !error.config) {
      return Promise.reject(error)
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    const isRefreshEndpoint = originalRequest.url?.includes('/session/refresh-token')

    // Do not retry refresh calls or already-retried requests
    if (error.response?.status !== 401 || originalRequest._retry || isRefreshEndpoint) {
      return Promise.reject(error)
    }

    // If a refresh is already in flight, queue this request
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`
          return apiClient(originalRequest)
        })
        .catch((err) => Promise.reject(err))
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const { data } = await apiClient.post<{ jwtToken: string }>('/session/refresh-token')
      const { jwtToken } = data

      useAuthStore.getState().setToken(jwtToken)
      processQueue(null, jwtToken)

      originalRequest.headers['Authorization'] = `Bearer ${jwtToken}`
      return apiClient(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      useAuthStore.getState().clearAuth()
      window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

// Helper to extract the error message from an Axios response
export function getApiError(error: unknown, fallback = 'Something went wrong.'): string {
  return (isAxiosError(error) ? error.response?.data?.description : null) ?? fallback
}
