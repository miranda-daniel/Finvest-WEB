# Finvest WEB

Finvest frontend. Connects to the Finvest API backend via GraphQL (Apollo Client).

## Stack

| Layer | Technology | Version |
|---|---|---|
| UI Framework | React | 19 |
| Build | Vite | 6 |
| Language | TypeScript | 5.8+ |
| Styles | Tailwind CSS | v4 |
| Custom styles | SCSS/Sass | latest |
| Routing | TanStack Router | v1 (file-based) |
| Data fetching | Apollo Client | v3 |
| Client/auth state | Zustand | v5 |
| Validation | Zod | v3 |
| Forms | React Hook Form | v7 |
| GraphQL types | graphql-codegen | v5 |
| Linting | ESLint | v9 |
| Formatting | Prettier | v3 |

## Getting started

### Prerequisites

- Node 20.13 / npm 10.5
- Finvest API running on `http://localhost:3001`

### Install and run

```bash
npm install
npm run dev
```

The development server runs at `http://localhost:5173`.

## Commands

```bash
# Start development server
npm run dev

# Generate/update TypeScript types from the GraphQL schema (requires API running)
npm run codegen

# Production build
npm run build

# Preview the build
npm run preview

# Lint
npm run lint

# Format code
npm run format
```

## GraphQL / Codegen

Types are auto-generated from the backend schema. Run `npm run codegen` whenever the API adds or changes GraphQL endpoints.

**Requires the Finvest API to be running** at `http://localhost:3001/graphql`.

Generated files live in `src/graphql/generated/` — do not edit them manually.

## Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Home |
| `/login` | Public | Login |
| `/dashboard` | Authenticated | Dashboard (redirects to `/login` if no session) |

## Code Style

All code comments must be written in **English**.
