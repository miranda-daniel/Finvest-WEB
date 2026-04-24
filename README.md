# Finvest WEB

Finvest frontend. Connects to the Finvest API backend via GraphQL (Apollo Client).

## Stack

| Layer             | Technology             | Version         |
| ----------------- | ---------------------- | --------------- |
| UI Framework      | React                  | 19              |
| Build             | Vite                   | 8               |
| Language          | TypeScript             | 6               |
| Styles            | Tailwind CSS           | v4              |
| Component library | shadcn/ui              | canary          |
| Icons             | Lucide React           | latest          |
| Notifications     | Sonner                 | v2              |
| Routing           | TanStack Router        | v1 (file-based) |
| GraphQL requests  | Apollo Client          | v4              |
| REST requests     | TanStack Query + Axios | v5 + v1         |
| Client/auth state | Zustand                | v5              |
| Validation        | Zod                    | v4              |
| Forms             | React Hook Form        | v7              |
| Date formatting   | date-fns               | v4              |
| Compiler          | React Compiler         | v1 (beta)       |
| GraphQL types     | graphql-codegen        | v5              |
| Linting           | ESLint                 | v9              |
| Formatting        | Prettier               | v3              |

## Getting started

### Prerequisites

- Node 24 LTS
- Finvest API running on `http://localhost:3001`

### Environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable       | Description          | Default                 |
| -------------- | -------------------- | ----------------------- |
| `VITE_API_URL` | Finvest API base URL | `http://localhost:3001` |

### Install and run

```bash
npm install
npm run dev
```

The development server runs at `http://localhost:5100`.

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

Generated files live in `src/api/generated/` — do not edit them manually.
