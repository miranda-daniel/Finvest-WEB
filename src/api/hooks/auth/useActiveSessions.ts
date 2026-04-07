import { useQuery } from '@tanstack/react-query'
import { apiClient, getApiError } from '@/api/client'

// Shape of a session returned by GET /session.
interface ActiveSession {
  id: number
  createdByIp: string
  userAgent: string | null
  createdAt: string // ISO string
  expires: string // ISO string
}

// useActiveSessions — fetches the list of active sessions for the current user.
//
// Calls GET /session (requires valid JWT — injected by the Axios interceptor).
// Returns sessions, loading state, error message, and a refetch function.
export function useActiveSessions() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['active-sessions'],
    queryFn: () => apiClient.get<ActiveSession[]>('/session').then((r) => r.data),
  })

  const errorMessage = error ? getApiError(error, 'Failed to load sessions.') : null

  return {
    sessions: data ?? [],
    loading: isLoading,
    error: errorMessage,
    refetch,
  }
}
