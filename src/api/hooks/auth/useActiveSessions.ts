import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient, getApiError } from '@/api/client';

// Shape of a session returned by GET /session.
interface ActiveSession {
  id: number;
  createdByIp: string;
  userAgent: string | null;
  createdAt: string; // ISO string
  expires: string; // ISO string
}

// useActiveSessions — fetches the list of active sessions for the current user.
//
// Calls GET /auth/sessions (requires valid JWT — injected by the Axios interceptor).
// Returns sessions, loading state, error message, and a refetch function.
export const useActiveSessions = () => {
  const userId = useAuthStore((s) => s.user?.id);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['active-sessions', userId],
    queryFn: () => apiClient.get<ActiveSession[]>('/auth/sessions').then((r) => r.data),
    enabled: !!userId,
  });

  const errorMessage = getApiError(error, 'Failed to load sessions.');

  return {
    sessions: data ?? [],
    loading: isLoading,
    error: errorMessage,
    refetch,
  };
};
