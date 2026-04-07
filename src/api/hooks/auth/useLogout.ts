import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/auth.store';
import { apolloClient } from '@/graphql/client';
import { apiClient } from '@/api/client';

// useLogout — handles logout flow.
//
// Flow:
//   1. Calls POST /session/logout (REST — sends HTTP-only cookie automatically)
//   2. Clears JWT and user from Zustand store
//   3. Clears Apollo cache to avoid stale data on next login
//   4. Navigates to /login
//
// The logout call fires even if the JWT is expired — the backend reads
// the cookie and revokes it regardless of the Authorization header.
//
// onSettled is used instead of onSuccess so that auth state is always
// cleared regardless of whether the logout request succeeded.
export const useLogout = () => {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router = useRouter();

  const { mutate: logout, isPending: loading } = useMutation({
    mutationFn: () => apiClient.post('/session/logout'),
    onSettled: async () => {
      // Clear auth state regardless of whether the logout request succeeded.
      // The user should always be taken to /login on logout intent.
      clearAuth();
      await apolloClient.clearStore();
      router.navigate({ to: '/login' });
    },
  });

  return { logout, loading };
};
