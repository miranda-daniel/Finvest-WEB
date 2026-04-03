// Auth store — global authentication state for the entire app.
//
// This is the single source of truth for "who is logged in".
// It stores the JWT token and basic user data after a successful login,
// and clears them on logout.
//
// Three consumers, each with a different access pattern:
//   1. Apollo Client (src/graphql/client.ts)
//      → reads token via .getState() (outside React) to inject the
//        Authorization header into every GraphQL request
//   2. TanStack Router (_authenticated.tsx)
//      → reads token via .getState() (outside React) in beforeLoad()
//        to protect routes — redirects to /login if no token
//   3. React components
//      → subscribe via useAuthStore(selector) hook so they re-render
//        only when the specific piece of state they use changes
//
// The `persist` middleware writes state to localStorage (key: "auth-storage")
// so the session survives a page refresh without requiring a new login.
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: number
  email: string
  firstName: string
  lastName: string
}

interface AuthState {
  token: string | null
  user: User | null
  login: (token: string, user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'auth-storage', // key in localStorage
    }
  )
)
