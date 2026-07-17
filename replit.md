# notha

A financial services mobile app for managing investments, loans, and account details.

## Stack

- **Mobile:** React Native + Expo (SDK 54) with Expo Router and TanStack Query
- **Backend:** Node.js + Express v5 with Drizzle ORM
- **Database:** PostgreSQL (via `DATABASE_URL`)
- **Shared libs:** `lib/db`, `lib/api-spec`, `lib/api-zod`, `lib/api-client-react`
- **Tooling:** pnpm workspace monorepo

## Running the project

Dependencies are installed via pnpm at the root:

```bash
pnpm install
```

### Workflows

- **API Server** (`artifacts/api-server`): builds with `esbuild` then starts Express on port 8080
- **Mobile** (`artifacts/mobile`): starts Expo Metro bundler; scan the QR code with Expo Go or open in web

### Required secrets

- `DATABASE_URL` — PostgreSQL connection string. Without it, the API server starts but database-dependent routes will fail.

## Project structure

```
artifacts/
  api-server/   # Express backend
  mobile/       # Expo mobile app
  mockup-sandbox/ # UI prototyping (Vite)
lib/
  db/           # Drizzle schema
  api-spec/     # OpenAPI definition
  api-zod/      # Generated Zod schemas
  api-client-react/ # Generated React Query hooks
```

## User preferences

_None recorded yet._
