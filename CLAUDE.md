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

## Git

Never commit automatically. Leave all changes in the working area and let the user decide when to commit.

## Code Style

### TypeScript

- Use strict TypeScript - no `any` types
- Prefer interfaces over type aliases for objects

### React

- Use functional components with hooks
- Keep components focused and single-purpose
- Props interfaces should be defined above the component

### Async Operations

- Use async/await for all async operations
- Always include try/catch with meaningful error messages

### Error Handling

- Always catch errors and provide user feedback
- Log errors to console for debugging
- Show user-friendly error messages in UI

## File Structure

### Components

- Location: `src/components/`
- One component per file
- Name files same as component (PascalCase)
- Export as named export

### API layer

- Location: `src/api/` — see `src/api/CLAUDE.md` for full conventions

## Patterns

### Data fetching

- Use Apollo hooks (`useQuery`, `useMutation`) — never fetch data in `useEffect`
- Components never import Apollo directly — always go through custom hooks in `src/api/hooks/`

### Caching strategy

The caching solution depends on the transport:

| Request type | Library | Cache |
|---|---|---|
| GraphQL (`POST /graphql`) | Apollo Client | `InMemoryCache` (already configured in `src/graphql/client.ts`) |
| REST (e.g. `POST /api/sessions`) | TanStack Query | `QueryClient` cache |

**GraphQL requests** — Apollo's `InMemoryCache` handles caching automatically. No extra setup needed per query.

**REST requests** — TanStack Query (`@tanstack/react-query`) + Axios (`axios`) are installed and configured. Use `useMutation` for write operations (login, create, update, delete) and `useQuery` for read operations. The shared Axios instance is at `src/api/client.ts` — always import from there, never instantiate Axios directly.

### State Management

- Local state: `useState`
- Global state: Zustand
