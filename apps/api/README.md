# Kompanionki API

Express + Prisma + Supabase backend for the Kompanionki monorepo.

## Local setup

```bash
npm install           # from repo root
npm run db:migrate    # apply Prisma migrations
npm run db:seed       # seed the test user (id 00000000-…-0001, "Оксана")
npm run dev           # start API on http://localhost:3000
```

## Environment variables

The app reads from `apps/api/.env.development` (encrypted via [dotenvx](https://dotenvx.com)).
All required keys are already committed; team members with the dotenvx key in
`.env.keys` get them automatically.

### `DEV_JWT_SECRET` (optional, dev only)

Used by `POST /api/v1/dev/test-session` to mint an HS256 JWT for the seeded
test user (powers the mobile `skipOnboarding` dev flag).

- Defaults to `"dev-local-jwt-secret-kompanionki"` if unset, so a fresh clone
  works with zero configuration.
- Verified by `src/middleware/auth.ts` using the **same** value — if you
  override `DEV_JWT_SECRET` here, the API will keep accepting tokens it
  minted, no extra wiring needed.
- Never honored when `NODE_ENV === "production"`; the route itself is also
  unmounted in production builds (`src/index.ts`).

### `SUPABASE_JWT_SECRET` (legacy, optional)

Only needed if your Supabase project still issues HS256 tokens. Modern
Supabase projects use ES256 + JWKS, which the API verifies automatically via
`SUPABASE_URL`/auth/v1/.well-known/jwks.json — no shared secret required.
