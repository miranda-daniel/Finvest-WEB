import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useUsers } from '@/api/hooks/users/useUsers'

export const Route = createFileRoute('/')({
  component: HomePage,
})

// HomePage — root page of the app.
//
// Full request flow when this component mounts:
//   1. TanStack Router matches the URL "/" and renders HomePage
//   2. useUsers() calls Apollo's useQuery with the GetUsers operation
//   3. Apollo Client runs authLink: reads token from Zustand (null → empty header, query is public)
//   4. Apollo Client runs httpLink: sends POST /graphql to the Vite dev server
//   5. Vite proxy forwards the request to localhost:3001/graphql
//   6. Apollo Server (API) calls buildApolloContext → no token → context.user = null
//   7. Query.users resolver calls UserService.getAllUsersService()
//   8. UserService calls UserRepository.findMany() → Prisma → PostgreSQL
//   9. Response travels back: API → Vite proxy → Apollo Client → InMemoryCache
//  10. useQuery returns data → useUsers returns { users, loading, error }
//  11. Component re-renders with the user list
function HomePage() {
  const { users, loading, error } = useUsers()

  // Log to console when data arrives so the full round-trip is visible in DevTools.
  // Open the browser console (F12) and look for "[HomePage] Users fetched from API:"
  useEffect(() => {
    if (users.length > 0) {
      console.log('[HomePage] Users fetched from API:', users)
    }
  }, [users])

  if (loading) return <p className="p-8 text-gray-500">Loading users...</p>

  if (error) return <p className="p-8 text-red-500">Error: {error.message}</p>

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Finvest</h1>
      <Link
        to="/login"
        className="inline-block mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Sign in
      </Link>
      <h2 className="text-lg font-semibold mb-2">Users ({users.length})</h2>
      <ul className="space-y-1">
        {users.map((user) => (
          <li key={user.id} className="text-sm text-gray-700">
            {user.firstName} {user.lastName} — {user.email}
          </li>
        ))}
      </ul>
    </div>
  )
}
