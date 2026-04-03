import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth.store'

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
//   3. On success: navigates to /dashboard
//   4. On failure: returns a user-readable error message
//
// Returns:
//   submit  — async function to call with { email, password }
//   loading — true while the request is in flight
//   error   — string error message if the request failed, null otherwise
export function useLogin() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const login = useAuthStore((s) => s.login)
  const router = useRouter()

  async function submit(credentials: LoginCredentials) {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/session/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        setError(body?.description ?? 'Invalid email or password.')
        return
      }

      const data: LoginResponse = await response.json()
      login(data.token, data.user)
      router.navigate({ to: '/dashboard' })
    } catch {
      setError('Could not connect to the server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return { submit, loading, error }
}
