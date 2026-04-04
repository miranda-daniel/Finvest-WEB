import { useRouter } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth.store'
import { usePortfolios } from '@/api/hooks/portfolios/usePortfolios'

// DashboardPage — the main authenticated page.
//
// Reads user data from Zustand (available immediately after login, no extra request).
// Fetches the user's portfolios via GraphQL using usePortfolios().
// The JWT is injected automatically by Apollo Client's authLink.
export function DashboardPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const { portfolios, loading, error } = usePortfolios()

  function handleLogout() {
    logout()
    router.navigate({ to: '/login' })
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          {user && (
            <p className="text-gray-600 mt-1">
              {user.firstName} {user.lastName} · {user.email}
            </p>
          )}
        </div>
        <button onClick={handleLogout}>Sign out</button>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-3">Portfolios</h2>

        {loading && <p className="text-gray-500">Loading portfolios...</p>}

        {error && <p className="text-red-500">Error: {error.message}</p>}

        {!loading && !error && portfolios.length === 0 && (
          <p className="text-gray-400">No portfolios yet.</p>
        )}

        {portfolios.length > 0 && (
          <ul className="space-y-2">
            {portfolios.map((portfolio) => (
              <li key={portfolio.id} className="border rounded p-3">
                <span className="font-medium">{portfolio.name}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
