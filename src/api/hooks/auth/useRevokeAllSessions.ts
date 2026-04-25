import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, getApiError } from '@/api/client';

// useRevokeAllSessions — revokes all active sessions for the current user.
//
// Calls POST /session/revoke-all (requires valid JWT — injected by the Axios interceptor).
// On success, invalidates the active-sessions cache so the list refreshes.
//
// Note: revoking all sessions also invalidates the current session, so the caller
// should trigger logout after a successful revocation.
export const useRevokeAllSessions = () => {
  const queryClient = useQueryClient();

  const {
    mutate: revokeAll,
    isPending: loading,
    error,
  } = useMutation({
    mutationFn: () => apiClient.post('/auth/sessions/revoke-all'),
    onSuccess: () => {
      // Invalidate sessions cache so the list refreshes if the user stays on the page.
      queryClient.invalidateQueries({ queryKey: ['active-sessions'] });
    },
  });

  const errorMessage = getApiError(error, 'Failed to revoke sessions.');

  return { revokeAll, loading, error: errorMessage };
};
