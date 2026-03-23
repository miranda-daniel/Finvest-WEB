# Vue 3 → React 19 Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Vue 3 starter with a React 19 + Vite 6 + TanStack Router + Apollo Client + Zustand scaffold ready for a GraphQL-powered app with authentication.

**Architecture:** React 19 app mounted via `main.tsx`, wrapped in `ApolloProvider` and `RouterProvider`. TanStack Router handles routing with a pathless `_authenticated` layout route that guards protected pages. Zustand manages auth state (token + user); Apollo Client reads the token via `useAuthStore.getState()` in an `authLink` on every request.

**Tech Stack:** React 19, Vite 6, TypeScript 5.8+, Tailwind CSS v4 (`@tailwindcss/vite`), SCSS, TanStack Router v1 (file-based), Apollo Client v3, Zustand v5, Zod v3, React Hook Form v7, graphql-codegen v5 (client-preset), ESLint 9 + Prettier 3.

---

## File Map

| File                                               | Action  | Responsibility                                                                  |
| -------------------------------------------------- | ------- | ------------------------------------------------------------------------------- |
| `package.json`                                     | Rewrite | Dependencies + scripts                                                          |
| `vite.config.ts`                                   | Rewrite | Vite plugins (React, Tailwind v4, TanStack Router) + `@` alias                  |
| `tsconfig.app.json`                                | Rewrite | React JSX, Bundler resolution, paths                                            |
| `tsconfig.node.json`                               | Modify  | Add `codegen.ts` to include                                                     |
| `index.html`                                       | Modify  | Update script src to `main.tsx`                                                 |
| `src/main.tsx`                                     | Create  | App entry — mounts React, ApolloProvider, RouterProvider                        |
| `src/main.ts`                                      | Delete  | Old Vue entry                                                                   |
| `src/App.vue`                                      | Delete  | Replaced by Router                                                              |
| `src/vue-shim.d.ts`                                | Delete  | Vue-specific type shim                                                          |
| `src/style.scss`                                   | Delete  | Merged into `src/assets/main.scss`                                              |
| `src/assets/main.scss`                             | Modify  | Add `@import "tailwindcss";` at top (Tailwind v4 entry)                         |
| `src/components/HelloWorld/HelloWorld.vue`         | Delete  | Vue SFC                                                                         |
| `src/components/HelloWorld/HelloWorld.tsx`         | Create  | React functional component                                                      |
| `src/components/HelloWorld/HelloWorld.module.scss` | Keep    | No changes needed                                                               |
| `src/components/HelloWorld/index.ts`               | Modify  | Export `.tsx` instead of `.vue`                                                 |
| `src/routes/__root.tsx`                            | Create  | Root layout — renders `<Outlet />`                                              |
| `src/routes/index.tsx`                             | Create  | `/` home route                                                                  |
| `src/routes/login.tsx`                             | Create  | `/login` public route                                                           |
| `src/routes/_authenticated.tsx`                    | Create  | Pathless layout — auth guard, redirects to `/login`                             |
| `src/routes/_authenticated/dashboard.tsx`          | Create  | `/dashboard` protected route (placeholder)                                      |
| `src/stores/auth.store.ts`                         | Create  | Zustand store: token, user, login/logout                                        |
| `src/graphql/client.ts`                            | Create  | Apollo Client + authLink                                                        |
| `codegen.ts`                                       | Create  | graphql-codegen config                                                          |
| `schema.graphql`                                   | Create  | Minimal stub schema for codegen                                                 |
| `eslint.config.js`                                 | Create  | ESLint 9 flat config                                                            |
| `.prettierrc`                                      | Create  | Prettier config                                                                 |
| `postcss.config.js`                                | Delete  | Not needed by Tailwind v4                                                       |
| `tailwind.config.js`                               | Delete  | Not needed by Tailwind v4                                                       |
| `src/vite-env.d.ts`                                | Keep    | Provides Vite types (`import.meta.env`, CSS modules, HMR) — needed in React too |

---

## Task 1: Swap Dependencies

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Remove Vue packages and install React + all dependencies**

Run these commands from the project root:

```bash
# Remove Vue-specific packages
npm uninstall vue @vitejs/plugin-vue vue-tsc autoprefixer postcss

# Install React core
npm install react@^19 react-dom@^19

# Install React dev types + Vite plugin
npm install -D @types/react@^19 @types/react-dom@^19 @vitejs/plugin-react@^4

# Install Tailwind v4 Vite plugin (replaces postcss integration)
npm install -D @tailwindcss/vite@^4 tailwindcss@^4

# Install TanStack Router
npm install @tanstack/react-router@^1
npm install -D @tanstack/router-plugin@^1 @tanstack/router-devtools@^1

# Install Apollo Client + GraphQL
npm install @apollo/client@^3 graphql@^16

# Install Zustand
npm install zustand@^5

# Install Zod + React Hook Form
npm install zod@^3 react-hook-form@^7 @hookform/resolvers@^3

# Install graphql-codegen
npm install -D @graphql-codegen/cli@^5 @graphql-codegen/client-preset@^4

# Install ESLint 9 + Prettier
npm install -D eslint@^9 @eslint/js@^9 typescript-eslint@^8 eslint-plugin-react@^7 eslint-plugin-react-hooks@^5 prettier@^3 eslint-config-prettier@^9 globals@^15
```

- [ ] **Step 2: Update scripts in `package.json`**

Replace the `scripts` section with:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "codegen": "graphql-codegen --config codegen.ts",
  "lint": "eslint .",
  "format": "prettier --write ."
}
```

- [ ] **Step 3: Verify node_modules are consistent**

```bash
npm ls react
```

Expected: `react@19.x.x` listed with no peer dep errors.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: swap Vue dependencies for React 19 stack"
```

---

## Task 2: Update Config Files

**Files:**

- Rewrite: `vite.config.ts`
- Rewrite: `tsconfig.app.json`
- Modify: `tsconfig.node.json`
- Delete: `postcss.config.js`
- Delete: `tailwind.config.js`

- [ ] **Step 1: Rewrite `vite.config.ts`**

Replace the entire file with:

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

Note: `TanStackRouterVite` must be listed **before** `react()`.

- [ ] **Step 2: Rewrite `tsconfig.app.json`**

Replace the entire file with:

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

- [ ] **Step 3: Add `codegen.ts` to `tsconfig.node.json` include**

Change the `include` array from `["vite.config.ts"]` to:

```json
"include": ["vite.config.ts", "codegen.ts"]
```

- [ ] **Step 4: Delete `postcss.config.js` and `tailwind.config.js`**

```bash
rm postcss.config.js tailwind.config.js
```

- [ ] **Step 5: Commit**

```bash
git add vite.config.ts tsconfig.app.json tsconfig.node.json
git commit -m "chore: update config files for React 19 + Tailwind v4 + TanStack Router"
```

Note: `postcss.config.js` and `tailwind.config.js` were already staged by `git rm` in Step 4 and are included in this commit automatically.

---

## Task 3: Update Styles and Delete Vue Files

**Files:**

- Modify: `src/assets/main.scss`
- Delete: `src/style.scss`
- Modify: `index.html`

- [ ] **Step 1: Update `src/assets/main.scss` — add Tailwind v4 import and merge `style.scss` content**

Replace the entire file with:

```scss
@import 'tailwindcss';

@use './normalize';
@use './colors';
@use './global-styles';
@use './mixins';
@use './text-styles';
@use './variables';
```

Explanation: `@import "tailwindcss"` replaces the old `@tailwind base/components/utilities` directives. The `@use` partials from `style.scss` were already here, and `style.scss`'s only unique content (`@tailwind components/utilities`) is replaced by the single import.

- [ ] **Step 2: Delete `src/style.scss`**

```bash
rm src/style.scss
```

- [ ] **Step 3: Update `index.html` script src**

Change line 19 from:

```html
<script type="module" src="/src/main.ts"></script>
```

To:

```html
<script type="module" src="/src/main.tsx"></script>
```

- [ ] **Step 4: Commit**

```bash
git add src/assets/main.scss index.html
git rm src/style.scss
git commit -m "chore: update styles for Tailwind v4 and remove old Vue entry points"
```

---

## Task 4: Delete Vue Source Files and Convert HelloWorld

**Files:**

- Delete: `src/main.ts`
- Delete: `src/App.vue`
- Delete: `src/vue-shim.d.ts`
- Delete: `src/components/HelloWorld/HelloWorld.vue`
- Create: `src/components/HelloWorld/HelloWorld.tsx`
- Modify: `src/components/HelloWorld/index.ts`

- [ ] **Step 1: Delete Vue source files**

```bash
git rm src/main.ts src/App.vue src/vue-shim.d.ts src/components/HelloWorld/HelloWorld.vue
```

- [ ] **Step 2: Create `src/components/HelloWorld/HelloWorld.tsx`**

```tsx
import styles from './HelloWorld.module.scss'

export function HelloWorld() {
  return (
    <div className="p-4 rounded-lg">
      <p>TEST</p>
      <h1 className="text-2xl font-bold text-blue-500">Hello</h1>
      <p className={styles.specialStyle}>Este es un componente de prueba con Tailwind CSS.</p>
    </div>
  )
}
```

Note: Vue's `:class` binding becomes `className` in React. The SCSS module file is unchanged.

- [ ] **Step 3: Update `src/components/HelloWorld/index.ts`**

Replace the entire file with:

```ts
export { HelloWorld } from './HelloWorld'
```

- [ ] **Step 4: Commit**

```bash
git add src/components/HelloWorld/HelloWorld.tsx src/components/HelloWorld/index.ts
git commit -m "feat: convert HelloWorld component from Vue SFC to React TSX"
```

---

## Task 5: Create Zustand Auth Store

**Files:**

- Create: `src/stores/auth.store.ts`

- [ ] **Step 1: Create the directory and store file**

```bash
mkdir -p src/stores
```

Create `src/stores/auth.store.ts`:

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
}

interface AuthState {
  token: string | null
  user: User | null
  login: (token: string, user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'auth-storage', // key in localStorage
    }
  )
)
```

`persist` from Zustand middleware automatically syncs state to `localStorage`. The `name` field is the localStorage key. No manual `localStorage.setItem/removeItem` needed — Zustand handles it.

- [ ] **Step 2: Commit**

```bash
git add src/stores/auth.store.ts
git commit -m "feat: add Zustand auth store with localStorage persistence"
```

---

## Task 6: Create Apollo Client

**Files:**

- Create: `src/graphql/client.ts`

- [ ] **Step 1: Create the directory and client file**

```bash
mkdir -p src/graphql/generated
```

Create `src/graphql/client.ts`:

```ts
import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client'
import { useAuthStore } from '@/stores/auth.store'

const httpLink = createHttpLink({
  uri: '/graphql', // proxied to backend; change to full URL if needed
})

const authLink = new ApolloLink((operation, forward) => {
  const token = useAuthStore.getState().token
  operation.setContext({
    headers: {
      authorization: token ? `Bearer ${token}` : '',
    },
  })
  return forward(operation)
})

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
})
```

Key point: `useAuthStore.getState()` reads Zustand state **outside** a React component — this is the correct pattern for use in non-component contexts like this. Do not use the `useAuthStore()` hook here.

- [ ] **Step 2: Commit**

```bash
git add src/graphql/client.ts
git commit -m "feat: add Apollo Client with JWT auth link"
```

---

## Task 7: Set Up TanStack Router Routes

**Files:**

- Create: `src/routes/__root.tsx`
- Create: `src/routes/index.tsx`
- Create: `src/routes/login.tsx`
- Create: `src/routes/_authenticated.tsx`
- Create: `src/routes/_authenticated/dashboard.tsx`

- [ ] **Step 1: Create `src/routes/__root.tsx`**

```bash
mkdir -p src/routes/_authenticated
```

```tsx
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})
```

`Outlet` renders the matched child route. `TanStackRouterDevtools` shows the route inspector in development — it renders nothing in production builds.

- [ ] **Step 2: Create `src/routes/index.tsx`** (home page `/`)

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: () => (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Finvest</h1>
      <p className="mt-2 text-gray-600">Welcome.</p>
    </div>
  ),
})
```

- [ ] **Step 3: Create `src/routes/login.tsx`** (login page `/login`)

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm rounded-lg border p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold">Sign in</h1>
        <p className="text-sm text-gray-500">Login form goes here.</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create `src/routes/_authenticated.tsx`** (pathless auth guard layout)

```tsx
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
```

`beforeLoad` runs before the route renders. If there is no token, it throws a redirect to `/login`. This guard applies to all routes nested under `_authenticated/`. Note the leading `_` makes this a **pathless** route — it does not add `/_authenticated` to the URL.

- [ ] **Step 5: Create `src/routes/_authenticated/dashboard.tsx`** (protected `/dashboard` route)

```tsx
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
```

- [ ] **Step 6: Commit**

```bash
git add src/routes/
git commit -m "feat: set up TanStack Router routes with auth guard"
```

---

## Task 8: Create `main.tsx` Entry Point

**Files:**

- Create: `src/main.tsx`

- [ ] **Step 1: Create `src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ApolloProvider } from '@apollo/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { apolloClient } from '@/graphql/client'
import '@/assets/main.scss'

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <ApolloProvider client={apolloClient}>
      <RouterProvider router={router} />
    </ApolloProvider>
  </StrictMode>
)
```

Notes:

- `routeTree` is auto-generated by the TanStack Router Vite plugin when `npm run dev` starts — it will not exist yet; the dev server generates it on first run.
- The `declare module` block registers the router type globally so all TanStack Router hooks are fully type-safe.
- `@/assets/main.scss` is the single style entry point (Tailwind v4 + SCSS partials).

- [ ] **Step 2: Start the dev server to trigger route tree generation**

```bash
npm run dev
```

Expected: Vite compiles, `src/routeTree.gen.ts` is created automatically by the TanStack Router plugin, browser opens without TypeScript errors. You should see the home page.

If TypeScript errors appear about `routeTree.gen.ts` not existing: stop the dev server (Ctrl+C), run it again — the file is generated on first startup.

- [ ] **Step 3: Commit**

```bash
git add src/main.tsx src/routeTree.gen.ts
git commit -m "feat: add React entry point and wire ApolloProvider + RouterProvider"
```

---

## Task 9: Set Up graphql-codegen

**Files:**

- Create: `codegen.ts`
- Create: `schema.graphql`

- [ ] **Step 1: Create `schema.graphql` stub at project root**

```graphql
type Query {
  _empty: String
}
```

This is a placeholder until the real backend schema is available. Replace with the actual schema SDL or switch `documents`/`schema` to the backend URL once the backend is running.

- [ ] **Step 2: Create `codegen.ts` at project root**

```ts
import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: './schema.graphql',
  documents: ['src/**/*.tsx', 'src/**/*.ts'],
  generates: {
    './src/graphql/generated/': {
      preset: 'client',
      presetConfig: {
        gqlTagName: 'gql',
      },
    },
  },
}

export default config
```

- [ ] **Step 3: Run codegen to verify it works**

```bash
npm run codegen
```

Expected: `src/graphql/generated/` is created with `graphql.ts` and `gql/` files. No errors. Since the schema has only `_empty`, the generated types will be minimal — that is expected.

- [ ] **Step 4: Add generated folder to `.gitignore`**

Add to `.gitignore`:

```
src/graphql/generated/
```

Generated files should not be committed — they are always regenerated from the schema.

- [ ] **Step 5: Commit**

```bash
git add codegen.ts schema.graphql .gitignore
git commit -m "chore: add graphql-codegen config with stub schema"
```

---

## Task 10: Set Up ESLint + Prettier

**Files:**

- Create: `eslint.config.js`
- Create: `.prettierrc`

- [ ] **Step 1: Create `eslint.config.js`** (ESLint 9 flat config)

```js
import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import prettierConfig from 'eslint-config-prettier'

export default tseslint.config(
  { ignores: ['dist', 'src/routeTree.gen.ts', 'src/graphql/generated/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // Not needed with React 17+ JSX transform
    },
    settings: {
      react: { version: 'detect' },
    },
  },
  prettierConfig
)
```

- [ ] **Step 2: Create `.prettierrc`**

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

- [ ] **Step 3: Run linter to verify zero errors**

```bash
npm run lint
```

Expected: No errors. Warnings about unused vars in stub files are acceptable at this stage.

- [ ] **Step 4: Run formatter**

```bash
npm run format
```

Expected: Files reformatted (or already clean). No errors.

- [ ] **Step 5: Commit**

```bash
git add eslint.config.js .prettierrc
git commit -m "chore: add ESLint 9 flat config + Prettier"
```

---

## Task 11: Final Verification

- [ ] **Step 1: Clean install to verify no stale dependencies**

```bash
rm -rf node_modules
npm install
```

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc -b --noEmit
```

Expected: No TypeScript errors.

- [ ] **Step 3: Run full dev build check**

```bash
npm run build
```

Expected: `dist/` created with no errors. Output should include `index.html`, JS bundles, and CSS.

- [ ] **Step 4: Start dev server and manually verify**

```bash
npm run dev
```

Open browser at `http://localhost:5173`. Verify:

- `/` → Home page renders "Finvest"
- `/dashboard` → Redirects to `/login` (no token in store)
- `/login` → Login placeholder renders
- TanStack Router Devtools panel visible at bottom of screen

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: Vue to React 19 migration complete — scaffold ready"
```

---

## Post-Migration Checklist

Once the backend is ready:

- Replace `schema.graphql` stub with real SDL (or point `codegen.ts` to backend URL)
- Run `npm run codegen` to generate typed hooks
- Implement the login form in `src/routes/login.tsx` using `useLoginMutation` (generated) + React Hook Form + Zod
- Add `@/graphql/client.ts` `uri` to match backend URL or set up Vite proxy in `vite.config.ts`
