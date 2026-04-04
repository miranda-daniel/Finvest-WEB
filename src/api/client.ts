// Axios instance — shared HTTP client for all REST requests.
//
// All REST calls must go through this instance (never import axios directly).
// This gives us a single place to configure:
//   - baseURL: requests use relative paths, Vite proxy handles routing in dev
//   - headers: Content-Type set globally so callers don't repeat it
//   - interceptors: add token refresh, error normalization, etc. here when needed
//
// GraphQL requests go through Apollo Client (src/graphql/client.ts), not this.
import axios, { isAxiosError } from 'axios'

export const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
})

// Helper to extract the error message from an Axios response
export function getApiError(error: unknown, fallback = 'Something went wrong.'): string {
  return (isAxiosError(error) ? error.response?.data?.description : null) ?? fallback
}
