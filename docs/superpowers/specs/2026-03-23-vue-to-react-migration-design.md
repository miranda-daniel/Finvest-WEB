# Design: Vue 3 to React 19 Migration

**Date:** 2026-03-23
**Project:** Finvest-WEB
**Status:** Approved

---

## Context

The project is currently a minimal Vue 3 starter (Vite + TypeScript + Tailwind CSS v3 + SCSS) with a single `HelloWorld` component and no business logic. The goal is to migrate to React 19 while updating all tooling to latest versions, and lay the foundation for a full app that connects to a Node + Prisma + GraphQL (Apollo) backend.

---

## Stack

| Layer             | Technology        | Version            |
| ----------------- | ----------------- | ------------------ |
| UI Framework      | React             | 19                 |
| Build             | Vite              | 6                  |
| Language          | TypeScript        | 5.8+               |
| Styles            | Tailwind CSS      | v4                 |
| Custom styles     | SCSS/Sass         | latest             |
| Routing           | TanStack Router   | v1 (file-based)    |
| Data fetching     | Apollo Client     | v3                 |
| Client/auth state | Zustand           | v5                 |
| Validation        | Zod               | v3                 |
| Forms             | React Hook Form   | v7                 |
| GraphQL types     | graphql-codegen   | v5 (client-preset) |
| Linting           | ESLint + Prettier | latest             |

---

## Architecture

### Folder Structure

```
src/
├── routes/                  # TanStack Router file-based routes
│   ├── __root.tsx           # Root layout + auth guard
│   ├── index.tsx            # Home /
│   ├── login.tsx            # /login
│   └── _authenticated/      # Pathless layout route (leading _ = no path segment)
│       └── dashboard.tsx    # Example protected route: /dashboard
├── components/              # Reusable UI components
│   └── HelloWorld/
│       ├── HelloWorld.tsx
│       └── HelloWorld.module.scss
├── graphql/
│   ├── client.ts            # Apollo Client config (with auth headers via authLink)
│   └── generated/           # Auto-generated types + hooks from graphql-codegen
├── stores/
│   └── auth.store.ts        # Zustand store: token, user info, login/logout actions
├── hooks/                   # Custom React hooks
├── assets/                  # SCSS files + images
│   ├── main.scss            # Main entry (imports all partials + Tailwind)
│   ├── variables.scss
│   ├── colors.scss
│   ├── mixins.scss
│   ├── text-styles.scss
│   ├── normalize.scss
│   └── global-styles.scss
└── main.tsx                 # App entry point
```

`src/style.scss` (currently at root of `src/`) is merged into `src/assets/main.scss` and deleted. `src/assets/main.scss` becomes the single style entry point, imported in `main.tsx`.

---

## Data Flow

1. `main.tsx` mounts React, wraps app in `ApolloProvider` and `RouterProvider`
2. TanStack Router handles navigation; `__root.tsx` reads Zustand auth state to redirect unauthenticated users away from `_authenticated/` routes
3. Apollo Client is configured with an `authLink` that injects the JWT token from the Zustand store into every GraphQL request header
4. `graphql-codegen` reads the GraphQL schema and generates TypeScript types + typed Apollo hooks into `src/graphql/generated/`

---

## Authentication Flow

1. User submits login form (React Hook Form + Zod validation)
2. Apollo fires login mutation → backend returns JWT token
3. Zustand `auth.store.ts` saves token to state + `localStorage` for persistence across page reloads
4. Apollo Client's `authLink` reads the token via `useAuthStore.getState().token` (Zustand stores can be read outside React components using `store.getState()` — no hooks needed in `client.ts`)
5. TanStack Router's `__root.tsx` checks Zustand auth state; if unauthenticated, redirects to `/login`
6. Logout clears Zustand state + `localStorage` + resets Apollo cache

---

## Tailwind CSS v4

Tailwind v4 uses the official **Vite plugin** (`@tailwindcss/vite`) instead of PostCSS. The existing `postcss.config.js` (currently configured for Tailwind v3 via PostCSS) must be **deleted**. `@tailwindcss/vite` is added to `vite.config.ts` alongside `@vitejs/plugin-react`.

Configuration is done via CSS custom properties using `@theme` in `src/assets/main.scss`. Add `@import "tailwindcss";` at the top of `main.scss`, followed by any `@theme` block for custom tokens. No `tailwind.config.js` is needed.

---

## Vite Configuration

`vite.config.ts` plugins after migration:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [TanStackRouterVite({ routesDirectory: './src/routes' }), react(), tailwindcss()],
  resolve: {
    alias: { '@': '/src' },
  },
})
```

The `TanStackRouterVite` plugin auto-generates the route tree on file changes. It must be listed **before** the React plugin.

---

## TypeScript Configuration

### `tsconfig.app.json` (covers `src/`) — complete final shape

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "jsx": "react-jsx",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "lib": ["ESNext", "DOM"],
    "skipLibCheck": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "allowImportingTsExtensions": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.d.ts", "src/routeTree.gen.ts"]
}
```

`src/routeTree.gen.ts` is the file auto-generated by the TanStack Router Vite plugin on each dev/build run. It must be in `include` so TypeScript picks up the typed route tree.

### `tsconfig.node.json`

Updated to cover `vite.config.ts` and `codegen.ts`.

### `src/vite-env.d.ts`

**Kept** (not deleted). The `/// <reference types="vite/client" />` directive provides types for `import.meta.env`, CSS module imports, and HMR — these are needed in React projects too. The `vue-shim.d.ts` file is deleted (Vue-specific).

---

## Path Aliases

All imports use `@/` as an alias for `src/`. Configured in both `vite.config.ts` (under `resolve.alias`) and `tsconfig.app.json` (under `compilerOptions.paths`). Example: `import { useAuthStore } from '@/stores/auth.store'`.

---

## graphql-codegen

Uses the `@graphql-codegen/client-preset` bundle (the current recommended approach).

`codegen.ts` at project root. Since the backend may not be running during initial frontend setup, the schema source is a **local SDL file** (`schema.graphql` at project root) until the backend is live, then switched to the backend URL.

`schema.graphql` must exist for codegen to run. During initial setup (before the real schema is available), create it as a minimal stub:

```graphql
type Query {
  _empty: String
}
```

This is replaced with the real schema once the backend is ready. Codegen is not expected to produce useful output until then.

`package.json` script: `"codegen": "graphql-codegen --config codegen.ts"`

### Apollo Client link chain (`src/graphql/client.ts`)

```ts
import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client'
import { useAuthStore } from '@/stores/auth.store'

const httpLink = createHttpLink({ uri: '/graphql' })

const authLink = new ApolloLink((operation, forward) => {
  const token = useAuthStore.getState().token
  operation.setContext({
    headers: { authorization: token ? `Bearer ${token}` : '' },
  })
  return forward(operation)
})

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
})
```

---

## Build Script

`package.json` build script is updated from `vue-tsc -b && vite build` to `tsc -b && vite build`. The `vue-tsc` package is removed.

---

## Key Files Changed from Vue

| Vue file                                   | Action                                                                 |
| ------------------------------------------ | ---------------------------------------------------------------------- |
| `src/main.ts`                              | Rewritten as `src/main.tsx`                                            |
| `src/App.vue`                              | Deleted — replaced by TanStack Router's `RouterProvider` in `main.tsx` |
| `src/components/HelloWorld/HelloWorld.vue` | Rewritten as `HelloWorld.tsx`                                          |
| `src/components/HelloWorld/index.ts`       | Updated to export `.tsx` component                                     |
| `src/vite-env.d.ts`                        | Kept as-is (still needed for Vite types)                               |
| `src/vue-shim.d.ts`                        | Deleted                                                                |
| `src/style.scss`                           | Merged into `src/assets/main.scss`, then deleted                       |
| `vite.config.ts`                           | Rewritten (Vue plugin → React + Tailwind + TanStack Router plugins)    |
| `tsconfig.app.json`                        | Updated (jsx, moduleResolution, paths, remove vue includes)            |
| `tsconfig.node.json`                       | Minor updates                                                          |
| `postcss.config.js`                        | Deleted (Tailwind v4 uses Vite plugin instead)                         |
| `tailwind.config.js`                       | Deleted (Tailwind v4 uses `@theme` in CSS instead)                     |
| `index.html`                               | Update `<script src>` from `/src/main.ts` to `/src/main.tsx`           |
| `package.json`                             | Full dependency swap; build script updated                             |

---

## Out of Scope

- Backend implementation (Node + Prisma + GraphQL — separate project)
- Specific business logic pages beyond the auth scaffold
- Testing setup (can be added in a follow-up)
- CI/CD configuration
