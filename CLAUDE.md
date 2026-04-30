# Claude Code Guidelines — Finvest WEB

## About me

I'm a developer building a personal investment management app called **Finvest**.
I manage my own stock portfolio (equities, ETFs) and want a custom tool to track holdings,
operations, and performance. All amounts are in USD — including non-US stocks, which are
tracked via their ADR listings on US exchanges.

## Finvest — Project Overview

A full-stack personal finance app for managing stock investments.

## GitHub Access Restriction

Only interact with these two GitHub repositories via `gh` CLI or any GitHub tool:

- `miranda-daniel/Finvest-WEB`
- `miranda-daniel/Finvest-API`

Never access, clone, or interact with any other GitHub repository.

## Code Comments

All code comments (inline comments, block comments, JSDoc) must be written in **English**.

Never delete existing comments unless the code they describe is also being removed. If the surrounding code changes, update the comment to match — but preserve it. Only add new comments when the WHY is non-obvious.

## Git

Never commit automatically. Leave all changes in the working area and let the user decide when to commit.

Always work on a feature branch — never commit directly to `main`.

1. Create a branch from `main`: `git checkout -b feat/my-feature`
2. Commit your changes on that branch
3. Push the branch and open a Pull Request to `main`
4. CI must pass before merging

Branch naming follows the same types as commit messages: `feat/`, `fix/`, `refactor/`, `chore/`, etc.

## Commit messages

Follow the **Conventional Commits** spec. Format:

```
<type>(<optional scope>): <short description>
```

**Types:**

| Type | When to use |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code change that neither adds nor fixes anything |
| `chore` | Maintenance (deps, config, build tooling) |
| `docs` | Documentation only |
| `test` | Tests only |
| `perf` | Performance improvement |

**Rules:**
- Description in English, imperative mood ("add", not "added")
- Max ~72 characters on the first line
- No trailing period

**Examples:**
```
feat(portfolio): add create portfolio modal
fix(auth): redirect to sign-in on token expiry
refactor(dashboard): extract holding row into separate component
chore: upgrade Vite to v6
```

## Code Style

### TypeScript

- Use strict TypeScript - no `any` types
- Prefer interfaces over type aliases for objects
- Always use arrow functions (`const foo = () => {}`) — never `function` declarations
- **Exception:** route files (`src/routes/`) use `function` declarations for page components so the `Route` export stays at the top of the file (function declarations hoist, arrow functions don't)
- Never use raw string literals as discriminated values. When a variable, prop, or state can only take a fixed set of string values (e.g. tabs, sections, modes, sides), define a `enum` and use its members everywhere — in `useState` defaults, conditionals, arrays, and `switch` cases. If a matching enum already exists (e.g. a GraphQL-generated one like `OperationSide`), use that instead of defining a new one.

### React

- Use functional components with hooks
- Keep components focused and single-purpose
- Props interfaces should be defined above the component
- When subscribing to React Hook Form field values inside a component, always use `useWatch({ control, name })` instead of `watch()`.
- Never use `console.error`, `console.warn`, or `console.log` directly. Always use the logger from `src/lib/logger.ts` (`logger.error`, `logger.warn`, `logger.info`, `logger.debug`). It is the single integration point for external monitoring tools. The `watch()` function cannot be memoized safely and causes the React Compiler to skip optimization of the entire component.
- Break down complex `return` blocks into small `render*` helper functions defined inside the component (e.g. `renderHeader()`, `renderSkeletonRows()`, `renderActions()`). The top-level `return` should read like a table of contents, not a wall of JSX. When a section grows large or needs to be reused elsewhere, extract it into its own React component instead.

### Async Operations

- Use async/await for all async operations
- Always include try/catch with meaningful error messages

### Error Handling

- Always catch errors and provide user feedback
- Log errors to console for debugging
- Show user-friendly error messages in UI

## File Structure

### Naming conventions

| File type            | Convention   | Example                        |
| -------------------- | ------------ | ------------------------------ |
| React components     | `PascalCase` | `SignInForm.tsx`               |
| Hooks, stores, utils | `camelCase`  | `useLogin.ts`, `auth.store.ts` |
| Route files          | `kebab-case` | `sign-up.tsx` → `/sign-up`     |
| Style files          | `kebab-case` | `text-styles.scss`             |

Route files use kebab-case because the filename becomes the URL segment. Component files use PascalCase so the filename matches the exported component name.

### Components

- Location: `src/components/`
- One component per file
- Name files same as component (PascalCase)
- Export as named export

### API layer

- Location: `src/api/` — see `src/api/CLAUDE.md` for full conventions

#### REST type naming (mirrors Finvest-API convention)

- `*Request` — body/input shapes sent to the API (e.g. `LoginRequest`, `ChangePasswordRequest`)
- `*Response` — shapes received from the API that have no domain equivalent (e.g. `QuoteResponse`, `InstrumentSearchResponse`)
- No suffix — domain entities used as-is (e.g. `ActiveSession`, `User`)
- Never use `*Payload`, `*Credentials`, `*Input`, or `*Result` for REST types

## Patterns

### Data fetching

The library to use depends on the transport. Never use `fetch` directly, never fetch in `useEffect`, and never import Apollo or Axios directly in components — always go through custom hooks in `src/api/hooks/`.

#### GraphQL → Apollo Client

- Hooks: `useQuery` / `useMutation` from `@apollo/client/react`
- Caching: `InMemoryCache` — automatic, no extra setup per query
- Client configured in `src/graphql/client.ts`
- Types come from `src/api/generated/graphql.ts` (auto-generated by codegen)

```ts
// src/api/hooks/portfolios/usePortfolios.ts
import { useQuery } from '@apollo/client/react';
import { GetPortfoliosDocument } from '@/api/generated/graphql';

export function usePortfolios() {
  const { data, loading, error } = useQuery(GetPortfoliosDocument);
  return { portfolios: data?.portfolios ?? [], loading, error };
}
```

#### REST → TanStack Query + Axios

- Hooks: `useQuery` / `useMutation` from `@tanstack/react-query`
- HTTP client: `apiClient` from `src/api/client.ts` (shared Axios instance — never instantiate Axios directly)
- Error extraction: `getApiError()` from `src/api/client.ts`
- Use `useMutation` for writes (POST, PUT, DELETE), `useQuery` for reads (GET)

```ts
// src/api/hooks/auth/useLogin.ts
import { useMutation } from '@tanstack/react-query';
import { apiClient, getApiError } from '@/api/client';

export function useLogin() {
  const { mutate, isPending, error } = useMutation({
    mutationFn: (credentials) => apiClient.post('/session/login', credentials),
    onSuccess: ({ data }) => {
      /* store in Zustand, navigate */
    },
  });
  return { submit: mutate, loading: isPending, error: error ? getApiError(error) : null };
}
```

### State Management

- Local state: `useState`
- Global state: Zustand

## Design System

Finvest uses a **dark-first** design. There is no light mode. All components are built around the dark theme.

A full UI mockup is at [`docs/design/portfolio-dashboard-mockup.jsx`](docs/design/portfolio-dashboard-mockup.jsx) — use it as the visual reference for layout, spacing, and component patterns.

### Theme

The font is **Geist Variable** (configured in `@theme` in `index.css`). shadcn CSS variables are set to dark values in `:root` — there is no `.dark` class toggle.

**Always use Tailwind CSS classes for styling new components.** Never use inline `style={{}}` objects — they bypass the design system, are harder to read, and inconsistent with the rest of the codebase. The only exception is for dynamic values that cannot be expressed as static Tailwind classes (e.g. a calculated pixel width from a JS variable).

Never use raw hex codes for surfaces or semantic colors. Use the Tailwind tokens defined in `@theme` in `index.css`:

| Token                   | Usage                                  |
| ----------------------- | -------------------------------------- |
| `bg-surface-base`       | App background (`#0a0b10`)             |
| `bg-surface-raised`     | Chart / table inner panels (`#0d1017`) |
| `bg-surface-overlay`    | Tooltips, popovers (`#0f131b`)         |
| `text-gain` / `bg-gain` | Positive P&L, gains                    |
| `text-loss` / `bg-loss` | Negative P&L, losses                   |
| `text-dividend`         | Dividend operations                    |
| `text-fee`              | Fee operations                         |

### Card pattern

All cards follow this Tailwind class pattern:

```
rounded-3xl border border-white/10 bg-white/5 backdrop-blur shadow-2xl shadow-black/20
```

- Inner panels / chart containers: `rounded-2xl border border-white/5 bg-[#0d1017]`
- Stat cards (summary metrics): `bg-gradient-to-b from-white/10 to-white/5`
- Badges / pills: `rounded-xl`
- Pill labels (e.g. breadcrumb tags): `rounded-full border border-white/10 bg-white/5`

### Typography

Use the utility classes defined in `src/index.css` — never write raw Tailwind typography classes directly:

| Class             | Role                                                                |
| ----------------- | ------------------------------------------------------------------- |
| `.text-heading-1` | Page title (`text-3xl font-semibold tracking-tight text-slate-100`) |
| `.text-heading-2` | Section title (`text-lg font-semibold text-slate-100`)              |
| `.text-heading-3` | Sub-section title (`text-base font-semibold text-slate-100`)        |
| `.text-body`      | Body / value text (`text-sm text-slate-300`)                        |
| `.text-subtle`    | Secondary / muted text (`text-sm text-slate-400`)                   |
| `.text-label`     | Field labels, tiny meta (`text-xs font-medium text-slate-400`)      |

### Semantic colors

These colors carry fixed meaning across the app — always use them consistently:

| Meaning             | Color                                                     |
| ------------------- | --------------------------------------------------------- |
| Gain / positive P&L | `text-emerald-400` / `bg-emerald-400/15 text-emerald-300` |
| Loss / negative P&L | `text-rose-400` / `bg-rose-400/15 text-rose-300`          |
| Dividend            | `bg-sky-400/15 text-sky-300`                              |
| Fee                 | `bg-amber-400/15 text-amber-300`                          |
| Daily gainers bar   | `#14b8a6` (teal-500)                                      |
| Daily losers bar    | `#f43f5e` (rose-500)                                      |

### Icons

Always use **Lucide React** (`lucide-react`) for icons. Never use emojis as icons. Never use other icon libraries.

### UI Components

For common UI primitives (buttons, inputs, checkboxes, selects, switches, dialogs, badges, tabs, tooltips, etc.), always use the shadcn/ui component from `src/components/ui/` if one exists. If the component doesn't exist yet, add it via `npx shadcn@latest add <component>` before building a custom one.

Only build a custom component when:

- No shadcn equivalent exists, or
- The use case is so specific that adapting a shadcn component would require more complexity than writing from scratch.

### Modals

Always use `Dialog` + `DialogContent` from `src/components/ui/dialog.tsx` for any modal. Never build a custom overlay with `fixed inset-0`. Key usage notes:

- Pass `showCloseButton={false}` if the modal has its own close button.
- Override the default shadcn width with both `max-w-{size}` **and** `sm:max-w-{size}` — the component default `sm:max-w-sm` will win at `sm+` breakpoints unless overridden at the same breakpoint.
- Override `ring-0 gap-0` to remove the default ring and grid gap when not needed.
- Control open state via `open` + `onOpenChange`: `<Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>`.

### Buttons

Always use the `<Button>` component from `src/components/ui/button.tsx` for interactive buttons. Native `<button>` elements are only acceptable when the button has highly custom styling that maps to none of the available variants (e.g. the star toggle in `PortfolioCard`, avatar circles, menu items with fully custom layout).

Available variants:

| Variant             | Usage                                                  |
| ------------------- | ------------------------------------------------------ |
| `primary` (default) | Main CTA — white background, dark text                 |
| `secondary`         | Secondary action — subtle border and tinted background |
| `ghost`             | Tertiary / inline action — no background until hover   |
| `danger`            | Destructive action — rose tint                         |

Available sizes: `default`, `sm`, `lg`, `icon`, `icon-sm`.

### Charts and tables

- Charts: **Recharts** (`AreaChart`, `LineChart`, `BarChart`, `PieChart`)
- Tables: **TanStack Table** (`@tanstack/react-table`)
- Chart grid lines: `stroke="rgba(255,255,255,0.08)"` with `strokeDasharray="4 6"`
- Axis ticks: `fill="rgba(148,163,184,0.95)"` (slate-400), `fontSize: 11`
- Chart tooltip container: `rounded-2xl border border-white/10 bg-[#0f131b]/95 backdrop-blur`
- Pie chart colors: use the `pieColors` array from the mockup (blue/cyan/orange/purple palette)
- Allocation bar tracks: `bg-white/10 rounded-full`, fill: `bg-white`

## Deferred Improvements

These are intentionally not implemented yet. Add them when the trigger condition is met.

| What | When to add | Notes |
|---|---|---|
| Sentry / PostHog / Datadog | Before going to production | Frontend error monitoring and analytics. The logger at `src/lib/logger.ts` is already the single integration point — add the SDK call inside `logger.error()` (and optionally `logger.warn()`). For Sentry: `@sentry/react` with an `ErrorBoundary` wrapper in `main.tsx`. |

## Dependencies — Known Constraints

- **`rxjs`** must remain in `dependencies`. It is not imported directly by app code, but `@apollo/client` uses it internally at runtime. Removing it breaks the dev server and production build.
