import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth.store'
import { apiClient } from '@/api/client'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    const store = useAuthStore.getState()

    if (!store.token) {
      // JWT is not in memory (e.g. page reload) — attempt silent refresh
      // using the HTTP-only cookie. If the cookie is missing or expired,
      // the request will fail and we redirect to /login.
      try {
        const { data } = await apiClient.post<{ jwtToken: string }>('/session/refresh-token')
        store.setToken(data.jwtToken)
      } catch {
        throw redirect({ to: '/login' })
      }
    }
  },
  component: () => <Outlet />,
})
