# Finvest WEB — Frontend Architecture

## Overview

The frontend communicates with the Finvest API through two channels, mirroring the backend's
REST + GraphQL split:

| Channel | Used for | Library |
|---|---|---|
| **GraphQL** | All data fetching and display queries | Apollo Client |
| **REST** | Auth mutations (login, register, logout) | `fetch` |

All HTTP communication is funneled through custom hooks in `src/api/hooks/`. Components never
call Apollo or `fetch` directly.

---

## Request flow — GraphQL (data fetching)

```
┌─────────────────────────────────────────────────────────┐
│                   React Component                        │
│                                                          │
│   const { data } = usePortfolios()   ← custom hook      │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              src/api/hooks/{domain}/                     │
│                                                          │
│   export function usePortfolios() {                      │
│     return useQuery(GetPortfoliosDocument, {...})        │
│   }                                                      │
│                                                          │
│   - Wraps Apollo's useQuery / useMutation                │
│   - Handles input validation (Zod)                       │
│   - Maps errors to user-readable messages                │
│   - Returns typed data + loading/error state             │
└─────────────────────────┬───────────────────────────────┘
                          │  Apollo hook call
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   Apollo Client                          │
│              src/graphql/client.ts                       │
│                                                          │
│   Link chain:   authLink  →  httpLink                    │
│                                                          │
│   authLink: reads JWT from Zustand, adds header          │
│     Authorization: Bearer <token>                        │
│                                                          │
│   httpLink: sends POST to /graphql                       │
└─────────────────────────┬───────────────────────────────┘
                          │  POST /graphql
                          │  Authorization: Bearer <token>
                          ▼
┌─────────────────────────────────────────────────────────┐
│               Finvest API — Apollo Server                │
│                   localhost:3001/graphql                 │
│                                                          │
│   buildApolloContext → validates JWT → context.user      │
│   Resolver → Service → Repository → PostgreSQL           │
└─────────────────────────────────────────────────────────┘
```

---

## Request flow — REST (authentication)

Auth endpoints (login, register, logout) live on the REST side of the API. The WEB side
uses the native `fetch` API wrapped in custom hooks.

```
┌─────────────────────────────────────────────────────────┐
│                   React Component                        │
│                                                          │
│   const { login } = useLogin()       ← custom hook      │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              src/api/hooks/auth/                         │
│                                                          │
│   export function useLogin() {                           │
│     const login = useAuthStore((s) => s.login)          │
│     async function submit(credentials) {                 │
│       const res = await fetch('/api/sessions', {...})    │
│       login(res.token, res.user)   ← store in Zustand   │
│     }                                                    │
│     return { submit, loading, error }                    │
│   }                                                      │
└─────────────────────────┬───────────────────────────────┘
                          │  POST /api/sessions
                          ▼
┌─────────────────────────────────────────────────────────┐
│               Finvest API — Express REST                 │
│                   localhost:3001                         │
│                                                          │
│   POST /api/sessions  → SessionController → AuthService  │
│   Returns: { token: string, user: { id, email } }        │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│            Zustand — auth.store.ts                       │
│                                                          │
│   login(token, user)                                     │
│   → stores token + user in memory                        │
│   → persists to localStorage (key: "auth-storage")       │
│   → Apollo authLink picks up token on next request       │
└─────────────────────────────────────────────────────────┘
```

---

## Role of each piece

### TanStack Router — Navigation and route protection

TanStack Router manages all navigation. Routes are defined as files under `src/routes/`.

```
src/routes/
  __root.tsx              → root layout (ApolloProvider is above this in main.tsx)
  index.tsx               → / (public)
  login.tsx               → /login (public)
  _authenticated.tsx      → layout route: guards all children with beforeLoad()
  _authenticated/
    dashboard.tsx         → /dashboard (protected)
```

**Auth guard** — `_authenticated.tsx` runs `beforeLoad()` before rendering any protected route:

```
beforeLoad() {
  token = useAuthStore.getState().token   ← reads Zustand directly (not a hook)
  if (!token) throw redirect({ to: '/login' })
}
```

The underscore prefix (`_authenticated`) means it is a layout group: it adds the guard
without adding a URL segment. `/dashboard` stays `/dashboard`, not `/_authenticated/dashboard`.

TanStack Router has **no direct role in data fetching** — it only controls navigation and
access. Data is fetched by Apollo hooks inside each page component.

---

### Apollo Client — GraphQL transport

Apollo Client handles all GraphQL communication. It is configured once in
`src/graphql/client.ts` and injected at the root via `<ApolloProvider>` in `main.tsx`.

```
main.tsx
  <ApolloProvider client={apolloClient}>   ← single instance, available everywhere
    <RouterProvider router={router} />
  </ApolloProvider>
```

The link chain has two steps:

```
authLink
  Runs before every request.
  Reads useAuthStore.getState().token (Zustand, outside React lifecycle).
  Adds Authorization: Bearer <token> header.
  No token → adds empty string header (public queries still work).

httpLink
  Sends the operation to POST /graphql.
  In development, Vite proxies /graphql → http://localhost:3001/graphql.
```

Apollo stores query results in `InMemoryCache`. Components that subscribe to the same
query share the cached result without re-fetching.

---

### Zustand — Auth state

Zustand holds the authenticated user's JWT and basic profile. It is the single source
of truth for "is the user logged in?".

```
auth.store.ts
  token: string | null   → JWT, persisted to localStorage
  user: { id, email }    → basic profile, persisted to localStorage

  login(token, user)     → called by useLogin hook after successful REST auth
  logout()               → clears token + user; triggers redirect to /login
```

It is used in three ways:

| Where | How | Why |
|---|---|---|
| `src/graphql/client.ts` | `useAuthStore.getState()` | Read token synchronously, outside React |
| `src/routes/_authenticated.tsx` | `useAuthStore.getState()` | Read token in `beforeLoad()`, outside React |
| Components / hooks | `useAuthStore((s) => s.user)` | Subscribe to state changes reactively |

---

### graphql-codegen — Types and documents

`graphql-codegen` connects to the running API, reads its schema, and generates TypeScript
types into `src/api/generated/`. It must be re-run whenever the API schema changes.

```bash
npm run codegen   # requires Finvest API running at localhost:3001
```

The generated code provides:

- `gql()` — typed document builder (used in `.graphql` files or inline)
- All schema types (`Query`, `Mutation`, types per entity)
- Typed document nodes (e.g. `GetPortfoliosDocument`) imported by hooks

GraphQL operations live in `src/api/operations/{domain}/` as `.graphql` files.
Codegen scans those files and generates a typed document node per operation.

---

## Full data-flow example: loading portfolios on the Dashboard

```
1. User navigates to /dashboard

2. TanStack Router runs _authenticated.tsx beforeLoad()
   → reads token from Zustand → token exists → continue

3. DashboardPage component renders
   → calls usePortfolios() (custom hook)

4. usePortfolios() calls Apollo's useQuery(GetPortfoliosDocument)

5. Apollo Client checks InMemoryCache
   → cache miss → send request

6. authLink reads token from Zustand
   → adds Authorization: Bearer eyJ... to request headers

7. httpLink sends POST /graphql with query GetPortfolios

8. Finvest API (Apollo Server):
   → buildApolloContext validates JWT → context.user = { userId }
   → PortfolioResolver calls PortfolioService
   → PortfolioService calls PortfolioRepository
   → returns data

9. Apollo Client receives response
   → stores result in InMemoryCache
   → useQuery returns { data: { portfolios: [...] }, loading: false }

10. usePortfolios() returns typed data to DashboardPage
    → component renders portfolio list
```

---

## Full data-flow example: login

```
1. User fills LoginForm and submits

2. LoginPage calls useLogin().submit({ email, password })

3. useLogin hook:
   → validates input with Zod
   → calls fetch('POST /api/sessions', { body: credentials })

4. Finvest API (Express REST):
   → SessionController → AuthService → validates credentials
   → returns { token, user }

5. useLogin hook:
   → calls useAuthStore.getState().login(token, user)
   → Zustand stores token + user in memory + localStorage

6. useLogin hook triggers navigation to /dashboard

7. TanStack Router runs _authenticated.tsx beforeLoad()
   → reads token from Zustand → token exists → continue

8. All subsequent Apollo requests now include Authorization: Bearer <token>
   via authLink reading from Zustand
```

---

## Key files

| File | Purpose |
|---|---|
| `src/main.tsx` | Entry point. Mounts ApolloProvider + RouterProvider. |
| `src/graphql/client.ts` | Apollo Client instance with authLink + httpLink chain. |
| `src/stores/auth.store.ts` | Zustand store. Auth state + localStorage persistence. |
| `src/routes/__root.tsx` | Root layout. |
| `src/routes/_authenticated.tsx` | Auth guard for all protected routes. |
| `src/api/hooks/` | Custom hooks — only place that calls Apollo or fetch. |
| `src/api/operations/` | `.graphql` files defining queries, mutations, fragments. |
| `src/api/generated/` | Auto-generated by codegen — do not edit manually. |
| `codegen.ts` | graphql-codegen config. Points to API schema at localhost:3001. |
