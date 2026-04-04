# Design: GraphQL users flow — end-to-end learning exercise

**Date:** 2026-04-02
**Scope:** Finvest-API + Finvest-WEB

## Goal

Wire up the existing `Query.users` GraphQL endpoint so that opening the app at `/`
fetches all users from the API and logs them to the browser console, with a minimal list
rendered on screen. Primary purpose is to understand the full request flow across both repos.

---

## API — no code changes needed

The GraphQL side is already complete:

| File | Role | Status |
|---|---|---|
| `src/graphql/schema/schema.ts` | Defines `type User` and `Query.users` | Done |
| `src/graphql/resolvers/Query.ts` | `users` resolver calls `UserService.getAllUsersService()` | Done |
| `src/services/user-services.ts` | `getAllUsersService()` calls the repository | Done |
| `src/repositories/user-repository.ts` | `findMany()` queries PostgreSQL via Prisma | Done |

Change: add clarifying comments to `Query.ts` and `apolloServer.ts` explaining that GraphQL
has no router/controller layer — the resolver calls the service directly.

---

## WEB — 4 changes

### 1. `vite.config.ts` — add Vite dev proxy

```
/graphql  →  http://localhost:3001/graphql
```

Without this, `POST /graphql` from the browser hits the Vite dev server (port 5100)
and gets a 404.

### 2. `src/api/operations/users/getUsers.query.graphql`

```graphql
query GetUsers {
  users {
    id
    email
    firstName
    lastName
  }
}
```

This file is the source of truth for the operation. After running `npm run codegen`,
graphql-codegen reads this file and generates a typed `GetUsersDocument` in
`src/api/generated/`.

### 3. `src/api/hooks/users/useUsers.ts`

Custom hook wrapping Apollo's `useQuery`. Returns `{ users, loading, error }`.

Uses `gql` inline for now (no codegen run yet). Comment marks where to swap in the
generated document once codegen is run.

### 4. `src/routes/index.tsx` — replace placeholder with `HomePage` component

- Calls `useUsers()`
- `console.log` the user list when data arrives
- Renders a simple list: email + full name per user
- Shows loading and error states

---

## Success criteria

1. Dev server running at `localhost:5100`
2. API running at `localhost:3001`
3. Open browser at `http://localhost:5100/`
4. Browser console shows the array of users fetched from the API
5. Page renders a list of users

---

## Out of scope

- Authentication (the `users` query is public — no JWT required)
- Codegen run (hook uses inline gql; documented how to switch once codegen is run)
- Any styling beyond minimal readability
