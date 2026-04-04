# Auth Flow + Portfolios Query Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a working Sign In flow (REST), a placeholder Sign Up page, a Dashboard that shows the logged-in user's info, and a GraphQL `portfolios` query to demonstrate authenticated data fetching.

**Architecture:** Login uses `POST /session/login` (REST, already exists — response extended to include user data). After login, user data is stored in Zustand. The Dashboard reads user from Zustand and fetches portfolios via GraphQL using the stored JWT. API and WEB tasks are sequential: API must be completed first.

**Tech Stack:** TypeScript · Node.js · Express 5 · TSOA · Apollo Server · Prisma · Jest (API) | React 19 · TanStack Router · Apollo Client v4 · Zustand · React Hook Form · Zod (WEB)

---

## Files

### Finvest-API

| Action | File | What it does |
|---|---|---|
| Modify | `src/types/session.ts` | Add `SessionUser` interface, extend `Session` to include `user` |
| Modify | `src/services/session-services.ts` | Return `{ token, user }` instead of `{ token }` |
| Modify | `src/apollo/schema/schema.ts` | Add `Portfolio` type + `portfolios` query |
| Modify | `src/apollo/resolvers/Query.ts` | Add `portfolios` resolver with auth check |
| Create | `src/services/portfolio-services.ts` | `getPortfoliosByUserId(userId)` |
| Create | `src/repositories/portfolio-repository.ts` | `findManyByUserId(userId)` |
| Modify | `src/services/__tests__/session-services.test.ts` | Add test for user data in login response |
| Create | `src/repositories/__tests__/portfolio-repository.test.ts` | Test `findManyByUserId` |
| Create | `src/services/__tests__/portfolio-services.test.ts` | Test `getPortfoliosByUserId` |

### Finvest-WEB

| Action | File | What it does |
|---|---|---|
| Modify | `src/stores/auth.store.ts` | Extend `User` with `firstName`, `lastName` |
| Modify | `vite.config.ts` | Add `/session` to dev proxy |
| Create | `src/api/hooks/auth/useLogin.ts` | Calls REST login, saves to Zustand, navigates |
| Create | `src/api/operations/portfolios/getPortfolios.query.graphql` | GraphQL operation |
| Create | `src/api/hooks/portfolios/usePortfolios.ts` | Wraps `useQuery` for portfolios |
| Create | `src/components/SignInForm/SignInForm.tsx` | Login form using React Hook Form + Zod |
| Create | `src/components/SignInForm/index.ts` | Barrel export |
| Create | `src/components/SignUpForm/SignUpForm.tsx` | Placeholder, no logic |
| Create | `src/components/SignUpForm/index.ts` | Barrel export |
| Create | `src/components/DashboardPage/DashboardPage.tsx` | Shows user info + portfolios list |
| Create | `src/components/DashboardPage/index.ts` | Barrel export |
| Modify | `src/routes/login.tsx` | Mount `SignInForm` |
| Create | `src/routes/sign-up.tsx` | New route `/sign-up`, mounts `SignUpForm` |
| Modify | `src/routes/_authenticated/dashboard.tsx` | Mount `DashboardPage` |

---

## ── FINVEST-API ──────────────────────────────────────────

## Task 1: Extend Session type to include user data

**Files:**
- Modify: `d:/GIT_MIS_PROYECTOS/finvest/Finvest-API/src/types/session.ts`

- [ ] **Step 1: Update session.ts**

Replace the full file content:

```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email({ message: 'Email not valid' }),
  password: z.string().min(1, { message: 'Password required' }),
});

export type LoginUserRequest = z.infer<typeof loginSchema>;

// The user data returned as part of a successful login response.
// Intentionally minimal — only what the frontend needs to display immediately.
export interface SessionUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

// The full response returned by POST /session/login.
export interface Session {
  token: string;
  user: SessionUser;
}

export interface TokenPayload {
  userId: number;
}
```

- [ ] **Step 2: Commit**

```bash
cd d:/GIT_MIS_PROYECTOS/finvest/Finvest-API
git add src/types/session.ts
git commit -m "feat(session): add user data to Session response type"
```

---

## Task 2: Return user data from SessionService.loginUser

**Files:**
- Modify: `d:/GIT_MIS_PROYECTOS/finvest/Finvest-API/src/services/session-services.ts`
- Modify: `d:/GIT_MIS_PROYECTOS/finvest/Finvest-API/src/services/__tests__/session-services.test.ts`

- [ ] **Step 1: Update session-services.ts**

Replace the full file content:

```typescript
import JWT from 'jsonwebtoken';
import { ApiError } from '@config/api-error';
import { ENV_VARIABLES } from '@config/config';
import { errors } from '@config/errors';
import { comparePasswords } from '@helpers/password';
import { UserRepository } from '@repositories/user-repository';
import { Session, LoginUserRequest } from '@typing/session';

export class SessionService {
  static loginUser = async (
    credentials: LoginUserRequest,
  ): Promise<Session> => {
    const { email, password } = credentials;

    const user = await UserRepository.findByEmail(email);

    if (!user) {
      throw new ApiError(errors.INVALID_USER);
    }

    const isMatch = await comparePasswords(password, user.password);

    if (!isMatch) {
      throw new ApiError(errors.INVALID_CREDENTIALS);
    }

    const token = JWT.sign(
      { userId: user.id },
      ENV_VARIABLES.jwtSignature,
      {
        expiresIn: ENV_VARIABLES.jwtExpiresIn,
      },
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  };
}
```

- [ ] **Step 2: Add test for user data in response**

Add this test case to `src/services/__tests__/session-services.test.ts` inside the existing `loginUser` describe block, after the existing "returns a JWT token" test:

```typescript
it('returns user data alongside the token on valid credentials', async () => {
  const email = `login.userdata.${Date.now()}@test.com`;

  await UserService.registerUserService({
    firstName: 'Data',
    lastName: 'Test',
    email,
    password: 'password123',
  });

  const result = await SessionService.loginUser({
    email,
    password: 'password123',
  });

  expect(result.user).toBeDefined();
  expect(result.user.email).toBe(email);
  expect(result.user.firstName).toBe('Data');
  expect(result.user.lastName).toBe('Test');
  expect(result.user.id).toBeDefined();
  expect(typeof result.user.id).toBe('number');
});
```

- [ ] **Step 3: Run tests**

```bash
cd d:/GIT_MIS_PROYECTOS/finvest/Finvest-API
npm test -- --testPathPattern="session-services"
```

Expected: all tests pass (including the 3 existing ones + the new one).

- [ ] **Step 4: Commit**

```bash
git add src/services/session-services.ts src/services/__tests__/session-services.test.ts
git commit -m "feat(session): include user data in login response"
```

---

## Task 3: Add PortfolioRepository

**Files:**
- Create: `d:/GIT_MIS_PROYECTOS/finvest/Finvest-API/src/repositories/portfolio-repository.ts`
- Create: `d:/GIT_MIS_PROYECTOS/finvest/Finvest-API/src/repositories/__tests__/portfolio-repository.test.ts`

- [ ] **Step 1: Write the failing test first**

Create `src/repositories/__tests__/portfolio-repository.test.ts`:

```typescript
import { PortfolioRepository } from '@repositories/portfolio-repository';
import { UserRepository } from '@repositories/user-repository';

describe('PortfolioRepository', () => {
  describe('findManyByUserId', () => {
    it('returns an empty array when the user has no portfolios', async () => {
      const user = await UserRepository.create({
        firstName: 'Empty',
        lastName: 'Portfolio',
        email: `empty.portfolio.${Date.now()}@test.com`,
        password: 'hash',
      });

      const portfolios = await PortfolioRepository.findManyByUserId(user.id);

      expect(Array.isArray(portfolios)).toBe(true);
      expect(portfolios).toHaveLength(0);
    });

    it('returns portfolios belonging to the user', async () => {
      const user = await UserRepository.create({
        firstName: 'Has',
        lastName: 'Portfolio',
        email: `has.portfolio.${Date.now()}@test.com`,
        password: 'hash',
      });

      await PortfolioRepository.create({ name: 'Long Term', userId: user.id });
      await PortfolioRepository.create({ name: 'Trading', userId: user.id });

      const portfolios = await PortfolioRepository.findManyByUserId(user.id);

      expect(portfolios).toHaveLength(2);
      expect(portfolios.map((p) => p.name)).toContain('Long Term');
      expect(portfolios.map((p) => p.name)).toContain('Trading');
    });

    it('does not return portfolios from other users', async () => {
      const userA = await UserRepository.create({
        firstName: 'User',
        lastName: 'A',
        email: `user.a.${Date.now()}@test.com`,
        password: 'hash',
      });

      const userB = await UserRepository.create({
        firstName: 'User',
        lastName: 'B',
        email: `user.b.${Date.now()}@test.com`,
        password: 'hash',
      });

      await PortfolioRepository.create({ name: 'UserA Portfolio', userId: userA.id });

      const portfolios = await PortfolioRepository.findManyByUserId(userB.id);

      expect(portfolios).toHaveLength(0);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd d:/GIT_MIS_PROYECTOS/finvest/Finvest-API
npm test -- --testPathPattern="portfolio-repository"
```

Expected: FAIL — `Cannot find module '@repositories/portfolio-repository'`

- [ ] **Step 3: Create portfolio-repository.ts**

Create `src/repositories/portfolio-repository.ts`:

```typescript
import { db } from '@config/db';

export const PortfolioRepository = {
  findManyByUserId: (userId: number) =>
    db.portfolio.findMany({ where: { userId } }),

  create: (data: { name: string; userId: number }) =>
    db.portfolio.create({ data }),
};
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- --testPathPattern="portfolio-repository"
```

Expected: all 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/repositories/portfolio-repository.ts src/repositories/__tests__/portfolio-repository.test.ts
git commit -m "feat(portfolio): add PortfolioRepository with findManyByUserId"
```

---

## Task 4: Add PortfolioService

**Files:**
- Create: `d:/GIT_MIS_PROYECTOS/finvest/Finvest-API/src/services/portfolio-services.ts`
- Create: `d:/GIT_MIS_PROYECTOS/finvest/Finvest-API/src/services/__tests__/portfolio-services.test.ts`

- [ ] **Step 1: Write the failing test first**

Create `src/services/__tests__/portfolio-services.test.ts`:

```typescript
import { PortfolioService } from '@services/portfolio-services';
import { UserService } from '@services/user-services';
import { PortfolioRepository } from '@repositories/portfolio-repository';

describe('PortfolioService', () => {
  describe('getPortfoliosByUserId', () => {
    it('returns an empty array when the user has no portfolios', async () => {
      const user = await UserService.registerUserService({
        firstName: 'No',
        lastName: 'Portfolios',
        email: `no.portfolios.${Date.now()}@test.com`,
        password: 'password123',
      });

      const result = await PortfolioService.getPortfoliosByUserId(user.id);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    it('returns portfolios for the user with id, name, and createdAt', async () => {
      const user = await UserService.registerUserService({
        firstName: 'With',
        lastName: 'Portfolios',
        email: `with.portfolios.${Date.now()}@test.com`,
        password: 'password123',
      });

      await PortfolioRepository.create({ name: 'Growth', userId: user.id });

      const result = await PortfolioService.getPortfoliosByUserId(user.id);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Growth');
      expect(result[0].id).toBeDefined();
      expect(result[0].createdAt).toBeDefined();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd d:/GIT_MIS_PROYECTOS/finvest/Finvest-API
npm test -- --testPathPattern="portfolio-services"
```

Expected: FAIL — `Cannot find module '@services/portfolio-services'`

- [ ] **Step 3: Create portfolio-services.ts**

Create `src/services/portfolio-services.ts`:

```typescript
import { PortfolioRepository } from '@repositories/portfolio-repository';

export interface Portfolio {
  id: number;
  name: string;
  createdAt: Date;
}

export class PortfolioService {
  static getPortfoliosByUserId = async (userId: number): Promise<Portfolio[]> => {
    const portfolios = await PortfolioRepository.findManyByUserId(userId);

    return portfolios.map(({ id, name, createdAt }) => ({ id, name, createdAt }));
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- --testPathPattern="portfolio-services"
```

Expected: both tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/services/portfolio-services.ts src/services/__tests__/portfolio-services.test.ts
git commit -m "feat(portfolio): add PortfolioService with getPortfoliosByUserId"
```

---

## Task 5: Add GraphQL Portfolio type and portfolios query

**Files:**
- Modify: `d:/GIT_MIS_PROYECTOS/finvest/Finvest-API/src/apollo/schema/schema.ts`
- Modify: `d:/GIT_MIS_PROYECTOS/finvest/Finvest-API/src/apollo/resolvers/Query.ts`

- [ ] **Step 1: Update schema.ts**

Replace the full file content:

```typescript
export const typeDefs = `#graphql
  # TODO: remove - temporary type for testing purposes only
  type User {
    id: Int!
    email: String!
    firstName: String!
    lastName: String!
    isActive: Boolean!
    createdAt: String!
  }

  type Portfolio {
    id: Int!
    name: String!
    createdAt: String!
  }

  type Query {
    hello: String
    # TODO: remove - temporary query for testing purposes only
    users: [User!]!
    # Returns the portfolios owned by the authenticated user.
    # Requires a valid JWT in the Authorization header.
    portfolios: [Portfolio!]!
  }
`;
```

- [ ] **Step 2: Update Query.ts resolver**

Replace the full file content:

```typescript
import { GraphQLError } from 'graphql';
import { UserService } from '@services/user-services';
import { PortfolioService } from '@services/portfolio-services';
import { ApolloContext } from '@graphql/apolloServer';

// GraphQL resolvers — the entry point for all Query operations.
//
// Key difference from REST:
//   REST:    HTTP request → Express Router → Controller → Service → Repository
//   GraphQL: HTTP request → Apollo Server → Resolver (here) → Service → Repository
//
// There is no router or controller in the GraphQL path. Apollo Server parses the
// incoming operation (e.g. "query GetPortfolios { portfolios { ... } }"), matches the
// field name to the resolver function below, and calls it automatically.
//
// The resolver's only job is to call the service and return the result.
// No request parsing, no response shaping — Apollo handles both.
export const Query = {
  hello: () => 'Hello, World!',
  // TODO: remove - temporary resolver for testing purposes only
  users: () => UserService.getAllUsersService(),
  portfolios: (_: unknown, __: unknown, context: ApolloContext) => {
    if (!context.user) {
      throw new GraphQLError('Not authenticated', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }
    return PortfolioService.getPortfoliosByUserId(context.user.userId);
  },
};
```

- [ ] **Step 3: Verify the API compiles (in dev mode)**

```bash
cd d:/GIT_MIS_PROYECTOS/finvest/Finvest-API
npm run update-routes-and-swagger
```

Expected: exits with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/apollo/schema/schema.ts src/apollo/resolvers/Query.ts
git commit -m "feat(portfolio): add portfolios GraphQL query"
```

---

## Task 6: Run the full test suite

- [ ] **Step 1: Run all tests**

```bash
cd d:/GIT_MIS_PROYECTOS/finvest/Finvest-API
npm test
```

Expected: all tests pass.

---

## ── FINVEST-WEB ──────────────────────────────────────────

## Task 7: Extend Zustand auth store User type

**Files:**
- Modify: `d:/GIT_MIS_PROYECTOS/finvest/Finvest-WEB/src/stores/auth.store.ts`

- [ ] **Step 1: Update User interface in auth.store.ts**

The `User` interface currently only has `id` and `email`. Extend it to match `SessionUser` from the API:

```typescript
interface User {
  id: number
  email: string
  firstName: string
  lastName: string
}
```

Full file after change:

```typescript
// Auth store — global authentication state for the entire app.
//
// This is the single source of truth for "who is logged in".
// It stores the JWT token and basic user data after a successful login,
// and clears them on logout.
//
// Three consumers, each with a different access pattern:
//   1. Apollo Client (src/graphql/client.ts)
//      → reads token via .getState() (outside React) to inject the
//        Authorization header into every GraphQL request
//   2. TanStack Router (_authenticated.tsx)
//      → reads token via .getState() (outside React) in beforeLoad()
//        to protect routes — redirects to /login if no token
//   3. React components
//      → subscribe via useAuthStore(selector) hook so they re-render
//        only when the specific piece of state they use changes
//
// The `persist` middleware writes state to localStorage (key: "auth-storage")
// so the session survives a page refresh without requiring a new login.
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: number
  email: string
  firstName: string
  lastName: string
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

- [ ] **Step 2: Commit**

```bash
cd d:/GIT_MIS_PROYECTOS/finvest/Finvest-WEB
git add src/stores/auth.store.ts
git commit -m "feat(auth): extend User type with firstName and lastName"
```

---

## Task 8: Add /session to Vite dev proxy

**Files:**
- Modify: `d:/GIT_MIS_PROYECTOS/finvest/Finvest-WEB/vite.config.ts`

- [ ] **Step 1: Add /session to proxy**

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
    proxy: {
      // Forward /graphql and /session requests to the API during development.
      // In production, the reverse proxy (nginx, etc.) handles this.
      '/graphql': 'http://localhost:3001',
      '/session': 'http://localhost:3001',
    },
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
```

- [ ] **Step 2: Commit**

```bash
git add vite.config.ts
git commit -m "chore(web): add /session to Vite dev proxy"
```

---

## Task 9: Create useLogin hook

**Files:**
- Create: `d:/GIT_MIS_PROYECTOS/finvest/Finvest-WEB/src/api/hooks/auth/useLogin.ts`

- [ ] **Step 1: Create useLogin.ts**

```typescript
import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth.store'

// Shape of the credentials the user submits on the Sign In form.
interface LoginCredentials {
  email: string
  password: string
}

// Shape of the response returned by POST /session/login.
// Mirrors SessionUser + token from the API (src/types/session.ts).
interface LoginResponse {
  token: string
  user: {
    id: number
    email: string
    firstName: string
    lastName: string
  }
}

// useLogin — handles the Sign In form submission.
//
// Flow:
//   1. Calls POST /session/login (REST — auth endpoints use REST per architecture rules)
//   2. On success: stores token + user in Zustand (persisted to localStorage)
//   3. On success: navigates to /dashboard
//   4. On failure: returns a user-readable error message
//
// Returns:
//   submit  — async function to call with { email, password }
//   loading — true while the request is in flight
//   error   — string error message if the request failed, null otherwise
export function useLogin() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const login = useAuthStore((s) => s.login)
  const router = useRouter()

  async function submit(credentials: LoginCredentials) {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/session/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        setError(body?.description ?? 'Invalid email or password.')
        return
      }

      const data: LoginResponse = await response.json()
      login(data.token, data.user)
      router.navigate({ to: '/dashboard' })
    } catch {
      setError('Could not connect to the server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return { submit, loading, error }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/api/hooks/auth/useLogin.ts
git commit -m "feat(auth): add useLogin hook"
```

---

## Task 10: Add GetPortfolios GraphQL operation and hook

**Files:**
- Create: `d:/GIT_MIS_PROYECTOS/finvest/Finvest-WEB/src/api/operations/portfolios/getPortfolios.query.graphql`
- Create: `d:/GIT_MIS_PROYECTOS/finvest/Finvest-WEB/src/api/hooks/portfolios/usePortfolios.ts`

- [ ] **Step 1: Create the operation file**

Create `src/api/operations/portfolios/getPortfolios.query.graphql`:

```graphql
# GetPortfolios — fetches the portfolios of the authenticated user.
#
# Requires a valid JWT in the Authorization header (handled automatically
# by Apollo Client's authLink reading the token from Zustand).
#
# The API resolver (src/apollo/resolvers/Query.ts) rejects this query
# with UNAUTHENTICATED if no token is present.
#
# Run `npm run codegen` (with the API running) to regenerate types after
# any schema change.
query GetPortfolios {
  portfolios {
    id
    name
    createdAt
  }
}
```

- [ ] **Step 2: Run codegen**

```bash
cd d:/GIT_MIS_PROYECTOS/finvest/Finvest-WEB
npm run codegen
```

Expected: `src/api/generated/graphql.ts` is updated with `GetPortfoliosQuery`, `GetPortfoliosDocument`.

- [ ] **Step 3: Create usePortfolios.ts**

Create `src/api/hooks/portfolios/usePortfolios.ts`:

```typescript
import { useQuery } from '@apollo/client'
import { GetPortfoliosDocument } from '@/api/generated/graphql'
import type { GetPortfoliosQuery } from '@/api/generated/graphql'

// usePortfolios — fetches the authenticated user's portfolios via GraphQL.
//
// This hook is the only entry point components have to portfolio data.
// Components must never call useQuery directly.
//
// The JWT is injected automatically by Apollo Client's authLink (src/graphql/client.ts),
// which reads the token from Zustand on every request.
//
// The API resolver will return an UNAUTHENTICATED error if no token is present.
// This hook should only be called from authenticated routes.
//
// Returns:
//   portfolios — Portfolio[] (empty array while loading or on error)
//   loading    — true while the request is in flight
//   error      — ApolloError if the request failed, undefined otherwise
export function usePortfolios() {
  const { data, loading, error } = useQuery<GetPortfoliosQuery>(GetPortfoliosDocument)

  return {
    portfolios: data?.portfolios ?? [],
    loading,
    error,
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/api/operations/portfolios/getPortfolios.query.graphql \
        src/api/hooks/portfolios/usePortfolios.ts \
        src/api/generated/
git commit -m "feat(portfolio): add GetPortfolios operation and usePortfolios hook"
```

---

## Task 11: Create SignInForm component

**Files:**
- Create: `d:/GIT_MIS_PROYECTOS/finvest/Finvest-WEB/src/components/SignInForm/SignInForm.tsx`
- Create: `d:/GIT_MIS_PROYECTOS/finvest/Finvest-WEB/src/components/SignInForm/index.ts`

- [ ] **Step 1: Create SignInForm.tsx**

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useLogin } from '@/api/hooks/auth/useLogin'

const signInSchema = z.object({
  email: z.email({ message: 'Enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
})

type SignInFormValues = z.infer<typeof signInSchema>

// SignInForm — the login form.
//
// Uses React Hook Form + Zod for validation.
// Delegates the actual login request and navigation to useLogin().
export function SignInForm() {
  const { submit, loading, error } = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
  })

  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" {...register('email')} />
        {errors.email && <p>{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input id="password" type="password" {...register('password')} />
        {errors.password && <p>{errors.password.message}</p>}
      </div>

      {error && <p>{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  )
}
```

- [ ] **Step 2: Create index.ts**

```typescript
export { SignInForm } from './SignInForm'
```

- [ ] **Step 3: Commit**

```bash
git add src/components/SignInForm/
git commit -m "feat(auth): add SignInForm component"
```

---

## Task 12: Create SignUpForm placeholder component

**Files:**
- Create: `d:/GIT_MIS_PROYECTOS/finvest/Finvest-WEB/src/components/SignUpForm/SignUpForm.tsx`
- Create: `d:/GIT_MIS_PROYECTOS/finvest/Finvest-WEB/src/components/SignUpForm/index.ts`

- [ ] **Step 1: Create SignUpForm.tsx**

```typescript
// SignUpForm — placeholder for the registration form.
// Logic is not implemented yet.
export function SignUpForm() {
  return (
    <div>
      <h1>Create account</h1>
      <p>Registration coming soon.</p>
    </div>
  )
}
```

- [ ] **Step 2: Create index.ts**

```typescript
export { SignUpForm } from './SignUpForm'
```

- [ ] **Step 3: Commit**

```bash
git add src/components/SignUpForm/
git commit -m "feat(auth): add SignUpForm placeholder component"
```

---

## Task 13: Create DashboardPage component

**Files:**
- Create: `d:/GIT_MIS_PROYECTOS/finvest/Finvest-WEB/src/components/DashboardPage/DashboardPage.tsx`
- Create: `d:/GIT_MIS_PROYECTOS/finvest/Finvest-WEB/src/components/DashboardPage/index.ts`

- [ ] **Step 1: Create DashboardPage.tsx**

```typescript
import { useAuthStore } from '@/stores/auth.store'
import { usePortfolios } from '@/api/hooks/portfolios/usePortfolios'

// DashboardPage — the main authenticated page.
//
// Reads user data from Zustand (available immediately after login, no extra request).
// Fetches the user's portfolios via GraphQL using usePortfolios().
// The JWT is injected automatically by Apollo Client's authLink.
export function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const { portfolios, loading, error } = usePortfolios()

  function handleLogout() {
    logout()
    // TanStack Router's _authenticated beforeLoad() will redirect to /login
    // on the next navigation. Force a redirect now for immediate effect.
    window.location.href = '/login'
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
```

- [ ] **Step 2: Create index.ts**

```typescript
export { DashboardPage } from './DashboardPage'
```

- [ ] **Step 3: Commit**

```bash
git add src/components/DashboardPage/
git commit -m "feat(dashboard): add DashboardPage component"
```

---

## Task 14: Wire routes to components

**Files:**
- Modify: `d:/GIT_MIS_PROYECTOS/finvest/Finvest-WEB/src/routes/login.tsx`
- Create: `d:/GIT_MIS_PROYECTOS/finvest/Finvest-WEB/src/routes/sign-up.tsx`
- Modify: `d:/GIT_MIS_PROYECTOS/finvest/Finvest-WEB/src/routes/_authenticated/dashboard.tsx`

- [ ] **Step 1: Update login.tsx**

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { SignInForm } from '@/components/SignInForm'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm rounded-lg border p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold">Sign in</h1>
        <SignInForm />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create sign-up.tsx**

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { SignUpForm } from '@/components/SignUpForm'

export const Route = createFileRoute('/sign-up')({
  component: SignUpPage,
})

function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm rounded-lg border p-8 shadow-sm">
        <SignUpForm />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Update dashboard.tsx**

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { DashboardPage } from '@/components/DashboardPage'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
})
```

- [ ] **Step 4: Commit**

```bash
git add src/routes/login.tsx src/routes/sign-up.tsx src/routes/_authenticated/dashboard.tsx
git commit -m "feat(routes): wire login, sign-up, and dashboard routes to components"
```

---

## Verification

After completing all tasks, verify the full flow:

- [ ] Rebuild and start the API: `cd d:/GIT_MIS_PROYECTOS/finvest/Finvest-API && docker compose down && docker compose up --build`
- [ ] Start the WEB: `cd d:/GIT_MIS_PROYECTOS/finvest/Finvest-WEB && npm run dev`
- [ ] Open `http://localhost:5100/login`
- [ ] Enter valid credentials → click Sign in
- [ ] Confirm: redirected to `/dashboard`
- [ ] Confirm: user's firstName, lastName, and email are displayed
- [ ] Confirm: Portfolios section shows "No portfolios yet." (empty DB is expected)
- [ ] Click Sign out → confirm redirected to `/login`
- [ ] Open `http://localhost:5100/sign-up` → confirm placeholder renders
- [ ] Open `http://localhost:5100/dashboard` without being logged in → confirm redirect to `/login`
