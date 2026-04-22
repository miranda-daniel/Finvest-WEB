# Spec: Create Portfolio + Favorite System

**Date:** 2026-04-22
**Repos:** Finvest-API + Finvest-WEB

---

## Overview

Add the ability to create portfolios from the dashboard via a modal, and introduce a favorite portfolio system that auto-selects a portfolio on login. The dashboard main content changes from a placeholder to a grid of portfolio cards.

---

## Data Model (Finvest-API)

### Prisma schema changes

Add two fields to the `User` model:

```prisma
favoritePortfolioId  Int?
favoritePortfolio    Portfolio? @relation("UserFavoritePortfolio", fields: [favoritePortfolioId], references: [id])
```

Add the back-relation to `Portfolio`:

```prisma
favoritedBy  User[] @relation("UserFavoritePortfolio")
```

Only one portfolio can be favorite at a time — enforced at the service layer (not a unique constraint, since multiple users each have their own favorite).

A new Prisma migration is required.

---

## API (Finvest-API)

### GraphQL schema changes

**Updated `Portfolio` type:**
```graphql
type Portfolio {
  id: Int!
  name: String!
  createdAt: String!
  isFavorite: Boolean!
}
```

`isFavorite` is computed in the resolver — not stored on the Portfolio row — by comparing `portfolio.id === context.user.favoritePortfolioId`.

**New `Mutation` type:**
```graphql
type Mutation {
  createPortfolio(name: String!, isFavorite: Boolean): Portfolio!
  setFavoritePortfolio(portfolioId: Int): Portfolio
}
```

- `createPortfolio`: creates the portfolio; if `isFavorite: true`, also sets `user.favoritePortfolioId`.
- `setFavoritePortfolio`: updates `user.favoritePortfolioId`. Pass `null` to remove the favorite. Returns the updated portfolio (or null if unsetting).

### New resolver file: `resolvers/Mutation.ts`

Thin layer — calls service, returns result. Requires authenticated user (throws `UNAUTHENTICATED` if no context.user).

### Updated `resolvers/Query.ts`

`portfolios` resolver passes `context.user.favoritePortfolioId` to the service so it can compute `isFavorite` on each portfolio.

### Service changes: `PortfolioService`

- `createPortfolio(userId, name, isFavorite?)`: calls `PortfolioRepository.create`, then conditionally calls `UserRepository.setFavoritePortfolio`.
- `setFavoritePortfolio(userId, portfolioId | null)`: calls `UserRepository.setFavoritePortfolio`.
- `getPortfoliosByUserId(userId)`: updated to also receive `favoritePortfolioId` and annotate each portfolio with `isFavorite`.

### Repository changes

**`PortfolioRepository`** — new method:
- `create(userId, name): Portfolio`

**`UserRepository`** — new method:
- `setFavoritePortfolio(userId, portfolioId: number | null): User`

---

## Frontend (Finvest-WEB)

### GraphQL operations

**Modified:** `operations/portfolios/getPortfolios.query.graphql`
- Add `isFavorite` field to the selection set.

**New:** `operations/portfolios/createPortfolio.mutation.graphql`
```graphql
mutation CreatePortfolio($name: String!, $isFavorite: Boolean) {
  createPortfolio(name: $name, isFavorite: $isFavorite) {
    id
    name
    isFavorite
    createdAt
  }
}
```

**New:** `operations/portfolios/setFavoritePortfolio.mutation.graphql`
```graphql
mutation SetFavoritePortfolio($portfolioId: Int) {
  setFavoritePortfolio(portfolioId: $portfolioId) {
    id
    isFavorite
  }
}
```

Run `npm run codegen` after adding operations.

### New hooks

**`hooks/portfolios/useCreatePortfolio.ts`**
- Wraps `useMutation(CreatePortfolioDocument)`.
- On success: refetches `GetPortfoliosDocument` (so the new card appears) and closes the modal.
- Exposes: `submit(name, isFavorite)`, `loading`, `error`.

**`hooks/portfolios/useSetFavoritePortfolio.ts`**
- Wraps `useMutation(SetFavoritePortfolioDocument)`.
- On success: refetches `GetPortfoliosDocument` (so `isFavorite` updates across all cards).
- Exposes: `setFavorite(portfolioId | null)`, `loading`.

### New components

**`components/DashboardPage/CreatePortfolioModal.tsx`**
- Uses existing `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle` from `ui/dialog.tsx`.
- Props: `open: boolean`, `onClose: () => void`.
- Form fields:
  - Name: text input, required, validated with Zod (non-empty, max 50 chars).
  - Favorite: toggle switch row (icon + label + description + toggle). Default: off.
- Submit calls `useCreatePortfolio`. Disabled while loading.
- On success: `onClose()` is called (modal closes, user stays on dashboard).
- Error: shown inline below the form.

**`components/DashboardPage/PortfolioCard.tsx`**
- Props: `portfolio: { id, name, isFavorite, createdAt }`, `color: string` (dot color from the same `DOT_COLORS` palette used in `PortfolioSelector`).
- Shows: colored dot + name, star button (top-right corner), placeholder stats ("Total Value — coming soon").
- Star button: filled yellow (`text-amber-400`) if favorite, gray (`text-slate-600`) if not. Clicking calls `useSetFavoritePortfolio`.
- Clicking the card body sets `selectedPortfolioId` in the dashboard store.

### Changes to existing components

**`DashboardPage.tsx`**
- Header: adds "New Portfolio" button (white/primary style) next to `PortfolioSelector`. Opens `CreatePortfolioModal`.
- Replaces placeholder `div` with a grid of `PortfolioCard` components (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`).
- Auto-select favorite on load: a `useEffect` watching `portfolios` — when portfolios load and `selectedPortfolioId` is `null`, finds the portfolio with `isFavorite: true` and calls `setSelectedPortfolio`. This is state derivation, not data fetching.
- Modal state managed locally with `useState<boolean>`.

---

## Behavior

### Creating a portfolio
1. User clicks "New Portfolio" → modal opens.
2. User types a name and optionally toggles "Mark as favorite".
3. User clicks "Create Portfolio" → `createPortfolio` mutation fires.
4. On success: modal closes, portfolio list refetches, new card appears in the grid.
5. If marked as favorite: the new portfolio's star is filled; previously-favorite portfolio loses its star.

### Toggling favorite from a card
1. User clicks the star on any card → `setFavoritePortfolio` fires with that portfolio's id.
2. On success: portfolio list refetches, stars update across all cards.
3. Clicking the star of the already-favorite portfolio → `setFavoritePortfolio(null)` to unset.

### Auto-select on login
- On `DashboardPage` mount, after portfolios load: if no portfolio is selected and one has `isFavorite: true`, it is auto-selected in the Zustand store. This also updates the `PortfolioSelector` dropdown.

---

## Out of scope

- Portfolio editing (rename) and deletion.
- Portfolio card stats (value, P&L) — placeholder text only for now.
- Animations on card appearance after creation.
