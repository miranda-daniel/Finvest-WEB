import { createFileRoute } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth.store'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      {user && <p className="mt-2 text-gray-600">Logged in as {user.email}</p>}
    </div>
  )
}
