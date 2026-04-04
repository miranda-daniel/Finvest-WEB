# GraphQL Users Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the existing `Query.users` GraphQL endpoint so that opening `/` fetches all users from the API, logs them to the browser console, and renders a minimal list on screen.

**Architecture:** No API logic changes are needed — `Query.users` is already fully implemented (schema → resolver → service → repository). The WEB side adds a Vite dev proxy, a `.graphql` operation file, a custom `useUsers` hook, and updates the root route component to call the hook and display results.

**Tech Stack:** TypeScript · React 19 · TanStack Router · Apollo Client v4 · Vite 8 · graphql-codegen (passive — operation file is written but codegen is not run as part of this plan)

---

## Files

| Action | File | What it does |
|---|---|---|
| Modify | `Finvest-WEB/vite.config.ts` | Add `/graphql` → `localhost:3001` dev proxy |
| Create | `Finvest-WEB/src/api/operations/users/getUsers.query.graphql` | GraphQL operation document (source for codegen) |
| Create | `Finvest-WEB/src/api/hooks/users/useUsers.ts` | Custom hook wrapping `useQuery` |
| Modify | `Finvest-WEB/src/routes/index.tsx` | Replace placeholder with `HomePage` component |
| Modify | `Finvest-API/src/graphql/resolvers/Query.ts` | Add comments explaining the no-controller/router pattern |

---

## Task 1: Add Vite dev proxy

Without this, `POST /graphql` from the browser hits the Vite dev server (port 5100) and gets a 404.

**Files:**
- Modify: `Finvest-WEB/vite.config.ts`

- [ ] **Step 1: Add proxy to server config**

Replace the `server` line in `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [tanstackRouter({ routesDirectory: './src/routes' }), react(), tailwindcss()],
  server: {
    port: 5100,
    // Forward /graphql requests to the API during development.
    // In production, the reverse proxy (nginx, etc.) handles this.
    proxy: {
      '/graphql': 'http://localhost:3001',
    },
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
```

- [ ] **Step 2: Verify the dev server still starts**

```bash
cd d:/GIT_MIS_PROYECTOS/finvest/Finvest-WEB
npm run dev
```

Expected: server starts on port 5100 with no errors. Stop with Ctrl+C.

---

## Task 2: Add GraphQL operation file

This file is the source of truth for the `GetUsers` operation. graphql-codegen reads it
to generate typed TypeScript documents. It also serves as documentation of what fields
the frontend requests.

**Files:**
- Create: `Finvest-WEB/src/api/operations/users/getUsers.query.graphql`

- [ ] **Step 1: Create the operation file**

```graphql
# GetUsers — fetches all users for display.
#
# Naming rule (from src/api/CLAUDE.md):
#   filename:       getUsers.query.graphql
#   operation name: GetUsers
# They must match so graphql-codegen produces a predictable document name: GetUsersDocument.
#
# After running `npm run codegen` (requires API on localhost:3001),
# this file generates src/api/generated/graphql.ts with:
#   - GetUsersQuery type
#   - GetUsersDocument (typed document node used in useUsers.ts)
query GetUsers {
  users {
    id
    email
    firstName
    lastName
  }
}
```

---

## Task 3: Create useUsers hook

The hook is the only place in the codebase that calls `useQuery`. Components never import
Apollo directly — they call this hook instead.

**Files:**
- Create: `Finvest-WEB/src/api/hooks/users/useUsers.ts`

- [ ] **Step 1: Create the hook file**

```typescript
import { useQuery, gql } from '@apollo/client'

// The query document is defined inline here because graphql-codegen has not been run yet.
//
// Once codegen is run (`npm run codegen` with the API running), replace this block with:
//   import { GetUsersDocument, GetUsersQuery } from '@/api/generated'
//
// The .graphql source lives at: src/api/operations/users/getUsers.query.graphql
const GET_USERS = gql`
  query GetUsers {
    users {
      id
      email
      firstName
      lastName
    }
  }
`

// User shape as defined in the GraphQL schema (src/graphql/schema/schema.ts in the API).
// Once codegen is run, delete this interface and import GetUsersQuery['users'][number] instead.
interface User {
  id: number
  email: string
  firstName: string
  lastName: string
}

// useUsers — fetches the full user list from the API via GraphQL.
//
// This hook is the only entry point components have to this data.
// Components must never call useQuery directly.
//
// Internally:
//   useQuery sends POST /graphql with the GetUsers operation
//   → Vite proxy forwards to localhost:3001/graphql
//   → Apollo Server resolves Query.users → UserService → UserRepository → PostgreSQL
//   → Apollo Client stores the result in InMemoryCache and re-renders the component
//
// Returns:
//   users   — User[] (empty array while loading or on error)
//   loading — true while the request is in flight
//   error   — ApolloError if the request failed, undefined otherwise
export function useUsers() {
  const { data, loading, error } = useQuery<{ users: User[] }>(GET_USERS)

  return {
    users: data?.users ?? [],
    loading,
    error,
  }
}
```

---

## Task 4: Update root route component

Replace the static placeholder at `/` with a component that calls `useUsers()` and
renders the result.

**Files:**
- Modify: `Finvest-WEB/src/routes/index.tsx`

- [ ] **Step 1: Replace placeholder with HomePage component**

```typescript
import { createFileRoute } from '@tanstack/react-router'
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
```

---

## Task 5: Add clarifying comments to the API resolver

Explain that GraphQL has no router/controller layer so the difference with REST is clear.

**Files:**
- Modify: `Finvest-API/src/graphql/resolvers/Query.ts`

- [ ] **Step 1: Add comments to Query.ts**

```typescript
import { UserService } from '@services/user-services'

// GraphQL resolvers — the entry point for all Query operations.
//
// Key difference from REST:
//   REST:    HTTP request → Express Router → Controller → Service → Repository
//   GraphQL: HTTP request → Apollo Server → Resolver (here) → Service → Repository
//
// There is no router or controller in the GraphQL path. Apollo Server parses the
// incoming operation (e.g. "query GetUsers { users { ... } }"), matches the field
// name ("users") to the resolver function below, and calls it automatically.
//
// The resolver's only job is to call the service and return the result.
// No request parsing, no response shaping — Apollo handles both.
export const Query = {
  hello: () => 'Hello, World!',
  // TODO: remove - temporary resolver for testing purposes only
  users: () => UserService.getAllUsersService(),
}
```

---

## Verification

After completing all tasks, verify the full flow:

- [ ] Start the API: `cd d:/GIT_MIS_PROYECTOS/finvest/Finvest-API && npm run dev`
- [ ] Start the WEB: `cd d:/GIT_MIS_PROYECTOS/finvest/Finvest-WEB && npm run dev`
- [ ] Open `http://localhost:5100` in the browser
- [ ] Open browser DevTools → Console tab
- [ ] Confirm: `[HomePage] Users fetched from API: [...]` appears with user objects
- [ ] Confirm: the page renders the users list
- [ ] Open DevTools → Network tab → filter by "graphql"
- [ ] Confirm: a `POST /graphql` request appears with status 200
