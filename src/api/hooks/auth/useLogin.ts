import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/auth.store';
import { apolloClient } from '@/graphql/client';
import { apiClient, getApiError } from '@/api/client';

// Shape of the credentials the user submits on the Sign In form.
interface LoginCredentials {
  email: string;
  password: string;
}

// Shape of the response returned by POST /session/login.
// Mirrors Session from the API (src/types/session.ts).
interface LoginResponse {
  jwtToken: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
}

// useLogin — handles the Sign In form submission.
//
// Flow:
//   1. Calls POST /session/login (REST — auth endpoints use REST per architecture rules)
//   2. On success: stores JWT in memory + user in Zustand (user persisted to localStorage)
//   3. On success: clears Apollo cache to avoid stale data from a previous session
//   4. On success: navigates to /dashboard
//   5. On failure: Axios rejects on 4xx/5xx — error is available via the mutation state
//
// The refresh token is set as an HTTP-only cookie by the backend automatically.
//
// Returns:
//   submit  — function to call with { email, password }
//   loading — true while the request is in flight
//   error   — error message string if the request failed, null otherwise
export const useLogin = () => {
  const login = useAuthStore((s) => s.login);
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    mutate: submit,
    isPending: loading,
    error,
  } = useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      apiClient.post<LoginResponse>('/session/login', credentials),
    onSuccess: async ({ data }) => {
      login(data.jwtToken, data.user);

      // Clear both caches so data from a previous session doesn't bleed into this one.
      await apolloClient.clearStore();
      queryClient.clear();
      router.navigate({ to: '/dashboard' });
    },
  });

  const errorMessage = getApiError(error, 'Invalid email or password.');

  return { submit, loading, error: errorMessage };
};
