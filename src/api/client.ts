// Axios instance — shared HTTP client for all REST requests.
//
// All REST calls must go through this instance (never import axios directly).
// Interceptors are registered in src/api/interceptors/ and applied here.
//
// GraphQL requests go through Apollo Client (src/graphql/client.ts), not this.
import axios, { isAxiosError } from 'axios'
import { applyRequestInterceptor } from '@/api/interceptors/request.interceptor'
import { applyResponseInterceptor } from '@/api/interceptors/response.interceptor'

export const apiClient = axios.create({
  withCredentials: true, // required for HTTP-only cookies to be sent cross-origin
  headers: {
    'Content-Type': 'application/json',
  },
})

applyRequestInterceptor(apiClient)
applyResponseInterceptor(apiClient)

// Helper to extract the error message from an Axios response
export function getApiError(error: unknown, fallback = 'Something went wrong.'): string {
  return (isAxiosError(error) ? error.response?.data?.description : null) ?? fallback
}
