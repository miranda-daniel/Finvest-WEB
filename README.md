# Finvest WEB

Finvest frontend. Connects to a Node + Prisma + GraphQL (Apollo Server) backend.

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

## Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Production build
npm run build

# Preview the build
npm run preview

# Lint
npm run lint

# Format code
npm run format

# Generate types from the GraphQL schema
npm run codegen
```

The development server runs at `http://localhost:5173`.

## Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Home |
| `/login` | Public | Login |
| `/dashboard` | Authenticated | Dashboard (redirects to `/login` if no session) |

## Code Style

All code comments must be written in **English**.

## GraphQL / Codegen

The GraphQL schema lives in `schema.graphql` at the root. During initial development it contains a minimal stub. Once the backend is available:

1. Replace `schema.graphql` with the real schema, or point `codegen.ts` to the backend URL
2. Run `npm run codegen` to regenerate types in `src/graphql/generated/`
