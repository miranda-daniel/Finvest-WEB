// Response interceptor — silent JWT renewal on 401.
//
// Flow:
//   1. Request fails with 401
//   2. If the failing request is already a retry or the refresh endpoint itself → reject (no loop)
//   3. If a refresh is already in flight → queue this request, retry once refresh resolves
//   4. Otherwise → call POST /session/refresh-token (HTTP-only cookie sent automatically)
//      - Success: store new JWT in memory, process queue, retry original request
//      - Failure: clear auth state, redirect to /login
import { isAxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth.store'

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

export function applyResponseInterceptor(client: AxiosInstance) {
  client.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (!isAxiosError(error) || !error.config) {
        return Promise.reject(error)
      }

      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
      const isRefreshEndpoint = originalRequest.url?.includes('/session/refresh-token')

      if (error.response?.status !== 401 || originalRequest._retry || isRefreshEndpoint) {
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`
            return client(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { data } = await client.post<{ jwtToken: string }>('/session/refresh-token')
        const { jwtToken } = data

        useAuthStore.getState().setToken(jwtToken)
        processQueue(null, jwtToken)

        originalRequest.headers['Authorization'] = `Bearer ${jwtToken}`
        return client(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        useAuthStore.getState().clearAuth()
        window.location.href = '/login'

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
  )
}
