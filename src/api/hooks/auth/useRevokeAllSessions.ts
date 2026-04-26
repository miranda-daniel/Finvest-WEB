import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/auth.store';
import { apolloClient } from '@/graphql/client';
import { apiClient, getApiError } from '@/api/client';

// useRevokeAllSessions — revokes all active sessions for the current user.
//
// Calls POST /auth/sessions/revoke-all (requires valid JWT).
//
// On success, clears auth state and navigates to /login directly — bypassing
// useLogout's HTTP call intentionally. The revoke-all endpoint kills the refresh
// cookie server-side, so calling POST /session/logout afterwards would fail with
// an expired cookie, triggering a silent refresh loop before landing on /login.
export const useRevokeAllSessions = () => {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router = useRouter();

  const {
    mutate: revokeAll,
    isPending: loading,
    error,
  } = useMutation({
    mutationFn: () => apiClient.post('/auth/sessions/revoke-all'),
    onSuccess: async () => {
      clearAuth();
      await apolloClient.clearStore();
      router.navigate({ to: '/login' });
    },
  });

  const errorMessage = getApiError(error, 'Failed to revoke sessions.');

  return { revokeAll, loading, error: errorMessage };
};
