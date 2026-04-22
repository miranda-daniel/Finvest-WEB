# Create Portfolio + Favorite System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "New Portfolio" modal to the dashboard with a favorite toggle, backed by a `createPortfolio` GraphQL mutation, and replace the dashboard placeholder with a grid of portfolio cards that each have a clickable star for setting the favorite.

**Architecture:** `favoritePortfolioId` is stored on the `User` model (nullable Int). `isFavorite` on the `Portfolio` GraphQL type is computed in the service layer by comparing each portfolio's id with the user's `favoritePortfolioId`. The frontend uses two new mutations (`createPortfolio`, `setFavoritePortfolio`) and renders `PortfolioCard` components that use the existing `Dialog` components from `ui/dialog.tsx`.

**Tech Stack:** Prisma 7 · PostgreSQL · Apollo Server 4 · TypeScript · React 19 · Apollo Client 4 · React Hook Form · Zod · Tailwind CSS · `@base-ui-react/dialog`

---

## File Map

### Finvest-API

| Action | Path |
|--------|------|
| Modify | `prisma/schema.prisma` |
| New migration | `prisma/migrations/` (auto-generated) |
| Modify | `src/repositories/user-repository.ts` |
| Modify | `src/repositories/__tests__/user-repository.test.ts` (create if absent) |
| Modify | `src/repositories/portfolio-repository.ts` |
| Modify | `src/services/portfolio-services.ts` |
| Modify | `src/services/__tests__/portfolio-services.test.ts` |
| Modify | `src/apollo/schema/schema.ts` |
| Create | `src/apollo/resolvers/Mutation.ts` |
| Modify | `src/apollo/resolvers/index.ts` |
| Modify | `src/apollo/resolvers/Query.ts` |

### Finvest-WEB

| Action | Path |
|--------|------|
| Modify | `src/api/operations/portfolios/getPortfolios.query.graphql` |
| Create | `src/api/operations/portfolios/createPortfolio.mutation.graphql` |
| Create | `src/api/operations/portfolios/setFavoritePortfolio.mutation.graphql` |
| Auto-generated | `src/api/generated/graphql.ts` (via codegen) |
| Create | `src/api/hooks/portfolios/useCreatePortfolio.ts` |
| Create | `src/api/hooks/portfolios/useSetFavoritePortfolio.ts` |
| Create | `src/components/DashboardPage/PortfolioCard.tsx` |
| Create | `src/components/DashboardPage/CreatePortfolioModal.tsx` |
| Modify | `src/components/DashboardPage/DashboardPage.tsx` |

---

## Task 1: Add `favoritePortfolioId` to Prisma schema and migrate

**Repo:** `Finvest-API`

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add the relation fields to schema**

In `prisma/schema.prisma`, add to the `User` model (after the `portfolios` line):

```prisma
favoritePortfolioId  Int?
favoritePortfolio    Portfolio? @relation("UserFavoritePortfolio", fields: [favoritePortfolioId], references: [id], onDelete: SetNull)
```

Add to the `Portfolio` model (after the `holdings` line):

```prisma
favoritedBy  User[] @relation("UserFavoritePortfolio")
```

- [ ] **Step 2: Run migration**

```bash
npx dotenv-cli -e .env.test -- npx prisma migrate dev --name add_favorite_portfolio_to_user
```

Expected: new migration file created in `prisma/migrations/`, Prisma client regenerated.

- [ ] **Step 3: Verify migration applied**

```bash
npx dotenv-cli -e .env.test -- npx prisma studio
```

Open `User` table and confirm `favoritePortfolioId` column is present (nullable). Then close Prisma Studio.

- [ ] **Step 4: Commit**

```bash
git -C path/to/Finvest-API add prisma/schema.prisma prisma/migrations/
git -C path/to/Finvest-API commit -m "feat(portfolio): add favoritePortfolioId relation to User model"
```

---

## Task 2: `UserRepository.setFavoritePortfolio`

**Repo:** `Finvest-API`

**Files:**
- Modify: `src/repositories/user-repository.ts`
- Create/Modify: `src/repositories/__tests__/user-repository.test.ts`

- [ ] **Step 1: Write the failing test**

Check if `src/repositories/__tests__/user-repository.test.ts` exists. If not, create it. Add these two tests:

```ts
import { UserRepository } from '@repositories/user-repository';
import { PortfolioRepository } from '@repositories/portfolio-repository';

describe('UserRepository', () => {
  describe('setFavoritePortfolio', () => {
    it('sets the favorite portfolio id on a user', async () => {
      const user = await UserRepository.create({
        firstName: 'Fav',
        lastName: 'Test',
        email: `fav.set.${Date.now()}@test.com`,
        password: 'hash',
      });
      const portfolio = await PortfolioRepository.create({ name: 'My Portfolio', userId: user.id });

      const updated = await UserRepository.setFavoritePortfolio(user.id, portfolio.id);

      expect(updated.favoritePortfolioId).toBe(portfolio.id);
    });

    it('unsets the favorite portfolio when called with null', async () => {
      const user = await UserRepository.create({
        firstName: 'Fav',
        lastName: 'Unset',
        email: `fav.unset.${Date.now()}@test.com`,
        password: 'hash',
      });
      const portfolio = await PortfolioRepository.create({ name: 'My Portfolio', userId: user.id });
      await UserRepository.setFavoritePortfolio(user.id, portfolio.id);

      const updated = await UserRepository.setFavoritePortfolio(user.id, null);

      expect(updated.favoritePortfolioId).toBeNull();
    });
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npx dotenv-cli -e .env.test -- jest src/repositories/__tests__/user-repository.test.ts -t "setFavoritePortfolio" --verbose
```

Expected: FAIL — `UserRepository.setFavoritePortfolio is not a function`.

- [ ] **Step 3: Implement `setFavoritePortfolio` in `UserRepository`**

Add to `src/repositories/user-repository.ts`:

```ts
setFavoritePortfolio: (userId: number, portfolioId: number | null) =>
  db.user.update({ where: { id: userId }, data: { favoritePortfolioId: portfolioId } }),
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
npx dotenv-cli -e .env.test -- jest src/repositories/__tests__/user-repository.test.ts -t "setFavoritePortfolio" --verbose
```

Expected: PASS — both tests green.

- [ ] **Step 5: Commit**

```bash
git -C path/to/Finvest-API add src/repositories/user-repository.ts src/repositories/__tests__/user-repository.test.ts
git -C path/to/Finvest-API commit -m "feat(user): add setFavoritePortfolio to UserRepository"
```

---

## Task 3: `PortfolioRepository.findById`

**Repo:** `Finvest-API`

**Files:**
- Modify: `src/repositories/portfolio-repository.ts`
- Modify: `src/repositories/__tests__/portfolio-repository.test.ts`

- [ ] **Step 1: Write the failing test**

Add to `src/repositories/__tests__/portfolio-repository.test.ts`:

```ts
describe('findById', () => {
  it('returns a portfolio by id', async () => {
    const user = await UserRepository.create({
      firstName: 'Find',
      lastName: 'ById',
      email: `find.byid.${Date.now()}@test.com`,
      password: 'hash',
    });
    const created = await PortfolioRepository.create({ name: 'Find Me', userId: user.id });

    const result = await PortfolioRepository.findById(created.id);

    expect(result).not.toBeNull();
    expect(result?.id).toBe(created.id);
    expect(result?.name).toBe('Find Me');
  });

  it('returns null when portfolio does not exist', async () => {
    const result = await PortfolioRepository.findById(999999);
    expect(result).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npx dotenv-cli -e .env.test -- jest src/repositories/__tests__/portfolio-repository.test.ts -t "findById" --verbose
```

Expected: FAIL — `PortfolioRepository.findById is not a function`.

- [ ] **Step 3: Implement `findById`**

Add to `src/repositories/portfolio-repository.ts`:

```ts
findById: (id: number) => db.portfolio.findUnique({ where: { id } }),
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
npx dotenv-cli -e .env.test -- jest src/repositories/__tests__/portfolio-repository.test.ts -t "findById" --verbose
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git -C path/to/Finvest-API add src/repositories/portfolio-repository.ts src/repositories/__tests__/portfolio-repository.test.ts
git -C path/to/Finvest-API commit -m "feat(portfolio): add findById to PortfolioRepository"
```

---

## Task 4: Update `PortfolioService.getPortfoliosByUserId` to include `isFavorite`

**Repo:** `Finvest-API`

**Files:**
- Modify: `src/services/portfolio-services.ts`
- Modify: `src/services/__tests__/portfolio-services.test.ts`

- [ ] **Step 1: Write the failing test**

Add to `src/services/__tests__/portfolio-services.test.ts` (inside the existing `describe('PortfolioService')`):

```ts
describe('getPortfoliosByUserId', () => {
  // ... existing tests stay ...

  it('returns isFavorite: true for the user favorite portfolio', async () => {
    const user = await UserService.registerUserService({
      firstName: 'Fav',
      lastName: 'Portfolio',
      email: `fav.portfolio.${Date.now()}@test.com`,
      password: 'password123',
    });
    const portfolio = await PortfolioRepository.create({ name: 'Favorite One', userId: user.id });
    await UserRepository.setFavoritePortfolio(user.id, portfolio.id);

    const result = await PortfolioService.getPortfoliosByUserId(user.id);

    const fav = result.find((p) => p.id === portfolio.id);
    expect(fav?.isFavorite).toBe(true);
  });

  it('returns isFavorite: false for non-favorite portfolios', async () => {
    const user = await UserService.registerUserService({
      firstName: 'NonFav',
      lastName: 'Portfolio',
      email: `nonfav.portfolio.${Date.now()}@test.com`,
      password: 'password123',
    });
    await PortfolioRepository.create({ name: 'Not Favorite', userId: user.id });

    const result = await PortfolioService.getPortfoliosByUserId(user.id);

    expect(result[0].isFavorite).toBe(false);
  });
});
```

Add `UserRepository` to the imports at the top of the test file:

```ts
import { UserRepository } from '@repositories/user-repository';
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npx dotenv-cli -e .env.test -- jest src/services/__tests__/portfolio-services.test.ts -t "isFavorite" --verbose
```

Expected: FAIL — `isFavorite` is undefined.

- [ ] **Step 3: Update `Portfolio` interface and `getPortfoliosByUserId` in `portfolio-services.ts`**

Replace the file contents with:

```ts
import { PortfolioRepository } from '@repositories/portfolio-repository';
import { UserRepository } from '@repositories/user-repository';

export interface Portfolio {
  id: number;
  name: string;
  createdAt: string;
  isFavorite: boolean;
}

export class PortfolioService {
  static getPortfoliosByUserId = async (userId: number): Promise<Portfolio[]> => {
    const [portfolios, user] = await Promise.all([
      PortfolioRepository.findManyByUserId(userId),
      UserRepository.findById(userId),
    ]);

    return portfolios.map(({ id, name, createdAt }) => ({
      id,
      name,
      createdAt: createdAt.toISOString(),
      isFavorite: user?.favoritePortfolioId === id,
    }));
  };
}
```

- [ ] **Step 4: Run all portfolio service tests**

```bash
npx dotenv-cli -e .env.test -- jest src/services/__tests__/portfolio-services.test.ts --verbose
```

Expected: all tests PASS (existing tests and new ones).

- [ ] **Step 5: Commit**

```bash
git -C path/to/Finvest-API add src/services/portfolio-services.ts src/services/__tests__/portfolio-services.test.ts
git -C path/to/Finvest-API commit -m "feat(portfolio): add isFavorite field to getPortfoliosByUserId"
```

---

## Task 5: `PortfolioService.createPortfolio`

**Repo:** `Finvest-API`

**Files:**
- Modify: `src/services/portfolio-services.ts`
- Modify: `src/services/__tests__/portfolio-services.test.ts`

- [ ] **Step 1: Write the failing tests**

Add a new `describe('createPortfolio')` block inside the existing `describe('PortfolioService')` in `portfolio-services.test.ts`:

```ts
describe('createPortfolio', () => {
  it('creates a portfolio and returns it with isFavorite: false when not marked', async () => {
    const user = await UserService.registerUserService({
      firstName: 'Create',
      lastName: 'NoFav',
      email: `create.nofav.${Date.now()}@test.com`,
      password: 'password123',
    });

    const result = await PortfolioService.createPortfolio(user.id, 'My New Portfolio');

    expect(result.name).toBe('My New Portfolio');
    expect(result.id).toBeDefined();
    expect(typeof result.createdAt).toBe('string');
    expect(result.isFavorite).toBe(false);
  });

  it('creates a portfolio and sets it as favorite when isFavorite is true', async () => {
    const user = await UserService.registerUserService({
      firstName: 'Create',
      lastName: 'Fav',
      email: `create.fav.${Date.now()}@test.com`,
      password: 'password123',
    });

    const result = await PortfolioService.createPortfolio(user.id, 'Favorite Portfolio', true);

    expect(result.isFavorite).toBe(true);

    const updatedUser = await UserRepository.findById(user.id);
    expect(updatedUser?.favoritePortfolioId).toBe(result.id);
  });

  it('replaces the previous favorite when creating a new one marked as favorite', async () => {
    const user = await UserService.registerUserService({
      firstName: 'Replace',
      lastName: 'Fav',
      email: `replace.fav.${Date.now()}@test.com`,
      password: 'password123',
    });

    const first = await PortfolioService.createPortfolio(user.id, 'First', true);
    const second = await PortfolioService.createPortfolio(user.id, 'Second', true);

    const updatedUser = await UserRepository.findById(user.id);
    expect(updatedUser?.favoritePortfolioId).toBe(second.id);
    expect(first.id).not.toBe(second.id);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx dotenv-cli -e .env.test -- jest src/services/__tests__/portfolio-services.test.ts -t "createPortfolio" --verbose
```

Expected: FAIL — `PortfolioService.createPortfolio is not a function`.

- [ ] **Step 3: Add `createPortfolio` to `portfolio-services.ts`**

Add inside the `PortfolioService` class:

```ts
static createPortfolio = async (
  userId: number,
  name: string,
  isFavorite?: boolean,
): Promise<Portfolio> => {
  const portfolio = await PortfolioRepository.create({ name, userId });

  if (isFavorite) {
    await UserRepository.setFavoritePortfolio(userId, portfolio.id);
  }

  return {
    id: portfolio.id,
    name: portfolio.name,
    createdAt: portfolio.createdAt.toISOString(),
    isFavorite: !!isFavorite,
  };
};
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx dotenv-cli -e .env.test -- jest src/services/__tests__/portfolio-services.test.ts -t "createPortfolio" --verbose
```

Expected: all 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git -C path/to/Finvest-API add src/services/portfolio-services.ts src/services/__tests__/portfolio-services.test.ts
git -C path/to/Finvest-API commit -m "feat(portfolio): add createPortfolio to PortfolioService"
```

---

## Task 6: `PortfolioService.setFavoritePortfolio`

**Repo:** `Finvest-API`

**Files:**
- Modify: `src/services/portfolio-services.ts`
- Modify: `src/services/__tests__/portfolio-services.test.ts`

- [ ] **Step 1: Write the failing tests**

Add a new `describe('setFavoritePortfolio')` block inside `describe('PortfolioService')`:

```ts
describe('setFavoritePortfolio', () => {
  it('sets a portfolio as favorite and returns it with isFavorite: true', async () => {
    const user = await UserService.registerUserService({
      firstName: 'Set',
      lastName: 'Fav',
      email: `set.fav.${Date.now()}@test.com`,
      password: 'password123',
    });
    const portfolio = await PortfolioRepository.create({ name: 'Star Me', userId: user.id });

    const result = await PortfolioService.setFavoritePortfolio(user.id, portfolio.id);

    expect(result).not.toBeNull();
    expect(result?.id).toBe(portfolio.id);
    expect(result?.isFavorite).toBe(true);
  });

  it('returns null and clears the favorite when portfolioId is null', async () => {
    const user = await UserService.registerUserService({
      firstName: 'Clear',
      lastName: 'Fav',
      email: `clear.fav.${Date.now()}@test.com`,
      password: 'password123',
    });
    const portfolio = await PortfolioRepository.create({ name: 'Unstar Me', userId: user.id });
    await UserRepository.setFavoritePortfolio(user.id, portfolio.id);

    const result = await PortfolioService.setFavoritePortfolio(user.id, null);

    expect(result).toBeNull();
    const updatedUser = await UserRepository.findById(user.id);
    expect(updatedUser?.favoritePortfolioId).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx dotenv-cli -e .env.test -- jest src/services/__tests__/portfolio-services.test.ts -t "setFavoritePortfolio" --verbose
```

Expected: FAIL — `PortfolioService.setFavoritePortfolio is not a function`.

- [ ] **Step 3: Add `setFavoritePortfolio` to `portfolio-services.ts`**

Add inside the `PortfolioService` class:

```ts
static setFavoritePortfolio = async (
  userId: number,
  portfolioId: number | null,
): Promise<Portfolio | null> => {
  await UserRepository.setFavoritePortfolio(userId, portfolioId);

  if (portfolioId === null) return null;

  const portfolio = await PortfolioRepository.findById(portfolioId);
  if (!portfolio) return null;

  return {
    id: portfolio.id,
    name: portfolio.name,
    createdAt: portfolio.createdAt.toISOString(),
    isFavorite: true,
  };
};
```

- [ ] **Step 4: Run all portfolio service tests**

```bash
npx dotenv-cli -e .env.test -- jest src/services/__tests__/portfolio-services.test.ts --verbose
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git -C path/to/Finvest-API add src/services/portfolio-services.ts src/services/__tests__/portfolio-services.test.ts
git -C path/to/Finvest-API commit -m "feat(portfolio): add setFavoritePortfolio to PortfolioService"
```

---

## Task 7: GraphQL schema + Mutation resolver

**Repo:** `Finvest-API`

**Files:**
- Modify: `src/apollo/schema/schema.ts`
- Create: `src/apollo/resolvers/Mutation.ts`
- Modify: `src/apollo/resolvers/index.ts`
- Modify: `src/apollo/resolvers/Query.ts`

- [ ] **Step 1: Update GraphQL schema**

Replace the contents of `src/apollo/schema/schema.ts`:

```ts
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
    isFavorite: Boolean!
  }

  type Query {
    hello: String
    # TODO: remove - temporary query for testing purposes only
    users: [User!]!
    # Returns the portfolios owned by the authenticated user.
    # Requires a valid JWT in the Authorization header.
    portfolios: [Portfolio!]!
  }

  type Mutation {
    # Creates a new portfolio. If isFavorite is true, replaces any existing favorite.
    createPortfolio(name: String!, isFavorite: Boolean): Portfolio!
    # Sets the favorite portfolio for the authenticated user. Pass null to unset.
    setFavoritePortfolio(portfolioId: Int): Portfolio
  }
`;
```

- [ ] **Step 2: Create `src/apollo/resolvers/Mutation.ts`**

```ts
import { GraphQLError } from 'graphql';
import { PortfolioService } from '@services/portfolio-services';
import { ApolloContext } from '@graphql/apolloServer';

export const Mutation = {
  createPortfolio: (
    _: unknown,
    args: { name: string; isFavorite?: boolean },
    context: ApolloContext,
  ) => {
    if (!context.user) {
      throw new GraphQLError('Not authenticated', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }
    return PortfolioService.createPortfolio(context.user.userId, args.name, args.isFavorite);
  },

  setFavoritePortfolio: (
    _: unknown,
    args: { portfolioId?: number | null },
    context: ApolloContext,
  ) => {
    if (!context.user) {
      throw new GraphQLError('Not authenticated', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }
    return PortfolioService.setFavoritePortfolio(context.user.userId, args.portfolioId ?? null);
  },
};
```

- [ ] **Step 3: Export `Mutation` from `resolvers/index.ts`**

Replace `src/apollo/resolvers/index.ts`:

```ts
export * from './Query';
export * from './Mutation';
```

- [ ] **Step 4: Wire resolvers into Apollo Server**

Open `src/apollo/apolloServer.ts` and confirm the resolvers object passed to `ApolloServer` spreads from the index. It should look like:

```ts
import { Query } from '@graphql/resolvers/Query';
import { Mutation } from '@graphql/resolvers/Mutation';

const resolvers = { Query, Mutation };
```

If it already imports via index, just verify `Mutation` is now included. Update the import/resolvers object if needed.

- [ ] **Step 5: Start the API and verify schema with a test mutation**

```bash
npm run start
```

Open `http://localhost:3001/graphql` (Apollo Sandbox) and run:

```graphql
mutation {
  createPortfolio(name: "Test", isFavorite: false) {
    id
    name
    isFavorite
  }
}
```

Expected: response with new portfolio (must be logged in — attach JWT in the headers panel).

- [ ] **Step 6: Run full test suite**

```bash
npm test
```

Expected: all tests PASS.

- [ ] **Step 7: Commit**

```bash
git -C path/to/Finvest-API add src/apollo/schema/schema.ts src/apollo/resolvers/Mutation.ts src/apollo/resolvers/index.ts src/apollo/resolvers/Query.ts src/apollo/apolloServer.ts
git -C path/to/Finvest-API commit -m "feat(graphql): add createPortfolio and setFavoritePortfolio mutations"
```

---

## Task 8: GraphQL operations + codegen (WEB)

**Repo:** `Finvest-WEB`

**Files:**
- Modify: `src/api/operations/portfolios/getPortfolios.query.graphql`
- Create: `src/api/operations/portfolios/createPortfolio.mutation.graphql`
- Create: `src/api/operations/portfolios/setFavoritePortfolio.mutation.graphql`
- Auto-generated: `src/api/generated/graphql.ts`

- [ ] **Step 1: Add `isFavorite` to the existing query**

Replace `src/api/operations/portfolios/getPortfolios.query.graphql`:

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
    isFavorite
  }
}
```

- [ ] **Step 2: Create `createPortfolio.mutation.graphql`**

Create `src/api/operations/portfolios/createPortfolio.mutation.graphql`:

```graphql
mutation CreatePortfolio($name: String!, $isFavorite: Boolean) {
  createPortfolio(name: $name, isFavorite: $isFavorite) {
    id
    name
    createdAt
    isFavorite
  }
}
```

- [ ] **Step 3: Create `setFavoritePortfolio.mutation.graphql`**

Create `src/api/operations/portfolios/setFavoritePortfolio.mutation.graphql`:

```graphql
mutation SetFavoritePortfolio($portfolioId: Int) {
  setFavoritePortfolio(portfolioId: $portfolioId) {
    id
    name
    createdAt
    isFavorite
  }
}
```

- [ ] **Step 4: Run codegen (API must be running)**

```bash
npm run codegen
```

Expected: `src/api/generated/graphql.ts` updated — confirm it exports `CreatePortfolioDocument`, `SetFavoritePortfolioDocument`, and that `GetPortfoliosQuery` now includes `isFavorite: boolean`.

- [ ] **Step 5: Commit**

```bash
git -C path/to/Finvest-WEB add src/api/operations/portfolios/ src/api/generated/
git -C path/to/Finvest-WEB commit -m "feat(graphql): add createPortfolio and setFavoritePortfolio operations"
```

---

## Task 9: `useCreatePortfolio` hook

**Repo:** `Finvest-WEB`

**Files:**
- Create: `src/api/hooks/portfolios/useCreatePortfolio.ts`

- [ ] **Step 1: Create the hook**

```ts
import { useMutation } from '@apollo/client/react';
import {
  CreatePortfolioDocument,
  GetPortfoliosDocument,
} from '@/api/generated/graphql';

export const useCreatePortfolio = (onSuccess: () => void) => {
  const [mutate, { loading, error }] = useMutation(CreatePortfolioDocument, {
    refetchQueries: [{ query: GetPortfoliosDocument }],
    onCompleted: () => onSuccess(),
  });

  const submit = (name: string, isFavorite: boolean) =>
    mutate({ variables: { name, isFavorite } });

  return { submit, loading, error };
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors related to this file.

- [ ] **Step 3: Commit**

```bash
git -C path/to/Finvest-WEB add src/api/hooks/portfolios/useCreatePortfolio.ts
git -C path/to/Finvest-WEB commit -m "feat(portfolio): add useCreatePortfolio hook"
```

---

## Task 10: `useSetFavoritePortfolio` hook

**Repo:** `Finvest-WEB`

**Files:**
- Create: `src/api/hooks/portfolios/useSetFavoritePortfolio.ts`

- [ ] **Step 1: Create the hook**

```ts
import { useMutation } from '@apollo/client/react';
import {
  SetFavoritePortfolioDocument,
  GetPortfoliosDocument,
} from '@/api/generated/graphql';

export const useSetFavoritePortfolio = () => {
  const [mutate, { loading }] = useMutation(SetFavoritePortfolioDocument, {
    refetchQueries: [{ query: GetPortfoliosDocument }],
  });

  const setFavorite = (portfolioId: number | null) =>
    mutate({ variables: { portfolioId } });

  return { setFavorite, loading };
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git -C path/to/Finvest-WEB add src/api/hooks/portfolios/useSetFavoritePortfolio.ts
git -C path/to/Finvest-WEB commit -m "feat(portfolio): add useSetFavoritePortfolio hook"
```

---

## Task 11: `PortfolioCard` component

**Repo:** `Finvest-WEB`

**Files:**
- Create: `src/components/DashboardPage/PortfolioCard.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { StarIcon } from 'lucide-react';
import { useSetFavoritePortfolio } from '@/api/hooks/portfolios/useSetFavoritePortfolio';
import { useDashboardStore } from '@/stores/dashboard.store';

interface Portfolio {
  id: number;
  name: string;
  isFavorite: boolean;
}

interface PortfolioCardProps {
  portfolio: Portfolio;
  color: string;
}

export const PortfolioCard = ({ portfolio, color }: PortfolioCardProps) => {
  const { setFavorite, loading } = useSetFavoritePortfolio();
  const setSelectedPortfolio = useDashboardStore((s) => s.setSelectedPortfolio);
  const selectedPortfolioId = useDashboardStore((s) => s.selectedPortfolioId);

  const isSelected = selectedPortfolioId === portfolio.id;

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;
    setFavorite(portfolio.isFavorite ? null : portfolio.id);
  };

  return (
    <div
      onClick={() => setSelectedPortfolio(portfolio.id)}
      className={`relative cursor-pointer rounded-2xl border p-5 transition-colors ${
        isSelected
          ? 'border-blue-400/40 bg-blue-400/6'
          : 'border-white/8 bg-white/4 hover:border-white/15'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className={`size-2 shrink-0 rounded-full ${color}`} />
          <span className="text-sm font-medium text-slate-100">{portfolio.name}</span>
        </div>
        <button
          onClick={handleStarClick}
          className={`transition-colors ${
            portfolio.isFavorite
              ? 'text-amber-400'
              : 'text-slate-600 hover:text-slate-400'
          }`}
          aria-label={portfolio.isFavorite ? 'Remove from favorites' : 'Set as favorite'}
        >
          <StarIcon className="size-4" fill={portfolio.isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="mt-5">
        <p className="text-xs uppercase tracking-wide text-slate-500">Total Value</p>
        <p className="mt-1 text-xl font-semibold text-slate-100">—</p>
        <p className="mt-0.5 text-xs text-slate-500">Holdings coming soon</p>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git -C path/to/Finvest-WEB add src/components/DashboardPage/PortfolioCard.tsx
git -C path/to/Finvest-WEB commit -m "feat(portfolio): add PortfolioCard component with favorite star"
```

---

## Task 12: `CreatePortfolioModal` component

**Repo:** `Finvest-WEB`

**Files:**
- Create: `src/components/DashboardPage/CreatePortfolioModal.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { StarIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCreatePortfolio } from '@/api/hooks/portfolios/useCreatePortfolio';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be 50 characters or fewer'),
});

type FormValues = z.infer<typeof schema>;

interface CreatePortfolioModalProps {
  open: boolean;
  onClose: () => void;
}

export const CreatePortfolioModal = ({ open, onClose }: CreatePortfolioModalProps) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const { submit, loading, error } = useCreatePortfolio(() => {
    reset();
    setIsFavorite(false);
    onClose();
  });

  const onSubmit = (values: FormValues) => {
    submit(values.name, isFavorite);
  };

  const handleClose = () => {
    reset();
    setIsFavorite(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-sm rounded-2xl border-white/10 bg-[#0f131b] p-6">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-slate-100">New Portfolio</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-slate-500">
              Name
            </label>
            <Input
              {...register('name')}
              placeholder="e.g. Long Term, Trading…"
              autoFocus
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="mt-1.5 text-xs text-rose-400">{errors.name.message}</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsFavorite((prev) => !prev)}
            className="flex w-full items-center justify-between rounded-xl border border-white/8 bg-white/3 px-3.5 py-3 text-left transition-colors hover:bg-white/5"
          >
            <div className="flex items-center gap-3">
              <StarIcon
                className={`size-4 ${isFavorite ? 'text-amber-400' : 'text-slate-500'}`}
                fill={isFavorite ? 'currentColor' : 'none'}
              />
              <div>
                <p className="text-sm font-medium text-slate-200">Mark as favorite</p>
                <p className="text-xs text-slate-500">Open this portfolio by default on login</p>
              </div>
            </div>
            <div
              className={`relative h-5 w-9 rounded-full transition-colors ${
                isFavorite ? 'bg-blue-500' : 'bg-white/10'
              }`}
            >
              <div
                className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform ${
                  isFavorite ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </div>
          </button>

          {error && (
            <p className="text-xs text-rose-400">
              {error.message ?? 'Something went wrong. Please try again.'}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={loading}
              className="rounded-xl border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="rounded-xl bg-white text-slate-950 hover:bg-slate-200"
            >
              {loading ? 'Creating…' : 'Create Portfolio'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git -C path/to/Finvest-WEB add src/components/DashboardPage/CreatePortfolioModal.tsx
git -C path/to/Finvest-WEB commit -m "feat(portfolio): add CreatePortfolioModal component"
```

---

## Task 13: Update `DashboardPage`

**Repo:** `Finvest-WEB`

**Files:**
- Modify: `src/components/DashboardPage/DashboardPage.tsx`

- [ ] **Step 1: Replace DashboardPage with full implementation**

```tsx
import { useEffect, useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { usePortfolios } from '@/api/hooks/portfolios/usePortfolios';
import { useDashboardStore } from '@/stores/dashboard.store';
import { PortfolioSelector } from './PortfolioSelector';
import { PortfolioCard } from './PortfolioCard';
import { CreatePortfolioModal } from './CreatePortfolioModal';

const DOT_COLORS = [
  'bg-emerald-400',
  'bg-violet-400',
  'bg-orange-400',
  'bg-amber-400',
  'bg-pink-400',
] as const;

export const DashboardPage = () => {
  const user = useAuthStore((s) => s.user);
  const { portfolios, loading: portfoliosLoading, error: portfoliosError } = usePortfolios();

  const selectedPortfolioId = useDashboardStore((s) => s.selectedPortfolioId);
  const setSelectedPortfolio = useDashboardStore((s) => s.setSelectedPortfolio);

  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (portfolios.length === 0 || selectedPortfolioId !== null) return;
    const favorite = portfolios.find((p) => p.isFavorite);
    if (favorite) setSelectedPortfolio(favorite.id);
  }, [portfolios, selectedPortfolioId, setSelectedPortfolio]);

  return (
    <div className="px-8 pb-8 pt-20">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-100">Dashboard</h1>
          {user && (
            <p className="mt-1 text-sm text-slate-400">
              {user.firstName} {user.lastName}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2.5">
          <PortfolioSelector portfolios={portfolios} loading={portfoliosLoading} />
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-sm font-medium text-slate-950 transition-colors hover:bg-slate-200"
          >
            <PlusIcon className="size-3.5" />
            New Portfolio
          </button>
        </div>
      </div>

      {/* Portfolio fetch error */}
      {portfoliosError && (
        <p className="mb-6 text-sm text-rose-400">
          Could not load portfolios: {portfoliosError.message}
        </p>
      )}

      {/* Portfolio cards grid */}
      {portfoliosLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : portfolios.length === 0 ? (
        <div className="flex min-h-64 items-center justify-center rounded-3xl border border-white/10 bg-white/5">
          <div className="text-center">
            <p className="text-sm text-slate-500">No portfolios yet</p>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-3 text-sm text-slate-400 underline underline-offset-2 hover:text-slate-300"
            >
              Create your first portfolio
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {portfolios.map((portfolio, index) => (
            <PortfolioCard
              key={portfolio.id}
              portfolio={portfolio}
              color={DOT_COLORS[index % DOT_COLORS.length]}
            />
          ))}
        </div>
      )}

      <CreatePortfolioModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Start the dev server and test the full flow**

```bash
npm run dev
```

Test the following:
1. Dashboard loads → shows portfolio cards (or empty state if none exist)
2. Click "New Portfolio" → modal opens
3. Submit empty form → validation error appears
4. Enter a name, toggle favorite → "Create Portfolio"
5. Modal closes, new card appears in the grid
6. If marked favorite: star is filled amber on the new card
7. Click a different card's star → star moves to that card, previous loses its star
8. Click an active star → star clears (no favorite)
9. Click a card body → `PortfolioSelector` updates to show that portfolio

- [ ] **Step 4: Commit**

```bash
git -C path/to/Finvest-WEB add src/components/DashboardPage/DashboardPage.tsx
git -C path/to/Finvest-WEB commit -m "feat(dashboard): add portfolio cards grid, new portfolio button, and auto-select favorite"
```
