// Auth store — global authentication state for the entire app.
//
// Split persistence strategy:
//   - token: in memory only (never persisted). Lost on reload, recovered via
//     the refresh token flow in _authenticated.tsx. Keeps JWT out of localStorage
//     to eliminate XSS exposure.
//   - user: persisted to localStorage via Zustand `persist` + `partialize`.
//     Not sensitive — avoids UI flash on page reload while the silent refresh runs.
//
// Three consumers, each with a different access pattern:
//   1. Apollo Client (src/graphql/client.ts)
//      → reads token via .getState() (outside React) to inject the
//        Authorization header into every GraphQL request
//   2. TanStack Router (_authenticated.tsx)
//      → reads token via .getState() (outside React) in beforeLoad()
//        to guard routes — triggers silent refresh if token is null
//   3. React components
//      → subscribe via useAuthStore(selector) hook so they re-render
//        only when the specific piece of state they use changes
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
  setToken: (token: string) => void
  login: (token: string, user: User) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setToken: (token) => set({ token }),
      login: (token, user) => set({ token, user }),
      clearAuth: () => set({ token: null, user: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }), // only user goes to localStorage
    }
  )
)
