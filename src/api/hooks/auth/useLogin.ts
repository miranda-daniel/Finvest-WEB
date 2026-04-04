import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth.store'
import { apolloClient } from '@/graphql/client'
import { apiClient } from '@/api/client'

// Shape of the credentials the user submits on the Sign In form.
interface LoginCredentials {
  email: string
  password: string
}

// Shape of the response returned by POST /session/login.
// Mirrors SessionUser + token from the API (src/types/session.ts).
interface LoginResponse {
  token: string
  user: {
    id: number
    email: string
    firstName: string
    lastName: string
  }
}

// useLogin — handles the Sign In form submission.
//
// Flow:
//   1. Calls POST /session/login (REST — auth endpoints use REST per architecture rules)
//   2. On success: stores token + user in Zustand (persisted to localStorage)
//   3. On success: clears Apollo cache to avoid stale data from a previous session
//   4. On success: navigates to /dashboard
//   5. On failure: Axios rejects on 4xx/5xx — error is available via the mutation state
//
// Returns:
//   submit  — function to call with { email, password }
//   loading — true while the request is in flight
//   error   — error message string if the request failed, null otherwise
export function useLogin() {
  const login = useAuthStore((s) => s.login)
  const router = useRouter()

  const { mutate: submit, isPending: loading, error } = useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      apiClient.post<LoginResponse>('/session/login', credentials),
    onSuccess: async ({ data }) => {
      login(data.token, data.user)
      await apolloClient.clearStore()
      router.navigate({ to: '/dashboard' })
    },
  })

  const errorMessage = error
    ? (error as { response?: { data?: { description?: string } } }).response?.data?.description ??
      'Invalid email or password.'
    : null

  return { submit, loading, error: errorMessage }
}
