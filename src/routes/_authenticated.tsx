import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth.store'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: () => {
    const token = useAuthStore.getState().token
    if (!token) {
      throw redirect({ to: '/login' })
    }
  },
  component: () => <Outlet />,
})
