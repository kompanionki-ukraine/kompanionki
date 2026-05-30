# Kompanionki (Компаньйонки) — Monorepo

Women-only social network for platonic life partnerships (co-living, co-parenting, co-business, mentorship, friendship, support). Ukraine MVP.

## Structure

```
kompanionki/
├── apps/
│   ├── mobile/          React Native (bare, 0.85), Metro, iOS + Android
│   └── api/             Express + Prisma → Supabase Postgres
├── packages/
│   └── shared/          TypeScript types, Zod schemas, i18n JSON (uk/ru)
├── turbo.json
└── package.json         npm workspaces root
```

## Stack

| Layer | Choice |
|-------|--------|
| Mobile | React Native 0.85 (bare), Metro |
| Navigation | React Navigation v7 (native stack + bottom tabs) |
| State / cache | Redux Toolkit + RTK Query |
| Secure storage | react-native-keychain |
| i18n | i18next + react-i18next |
| API | Express 4, Prisma 5 |
| DB | Supabase Postgres (free tier) |
| Auth | Supabase Auth (phone OTP) → JWT verified in Express |
| Schema validation | Zod (shared package) |
| Monorepo | Turborepo |

---

## Setup

### Prerequisites
- Node 22+, npm 10+
- **iOS:** Full **Xcode** in `/Applications` (not Command Line Tools only). If `npm run ios` fails with a Command Line Tools / `xcodebuild` error: `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer` (see **`apps/mobile/README.md`**).
- Android Studio (Android)
- A [Supabase](https://supabase.com) project (free tier)

**Typical command order:** Start with **`npm install`** at the repo root to pull dependencies for every workspace. On **macOS / iOS**, run **`npm run pod-install`** once (or after native dependency changes) to install CocoaPods for the Xcode project. Configure **API env / dotenvx** (see §2), then run **`npm run db:migrate`** to align the database with Prisma (add **`npm run db:seed`** only if you want starter rows). For day-to-day development, **`npm run api`** serves the Express API with reload; **`npm start`** starts the Metro bundler for the mobile app (port **9087**); then **`npm run ios`** or **`npm run android`** opens the simulator or emulator against that bundler. Use **`npm run dev`** when you want the API and Metro started together in one shot. For release-style checks, **`npm run build`** compiles packages; **`npm run lint`** and **`npm run format`** keep TypeScript and style consistent across the monorepo.

### 1. Install dependencies
```bash
npm install
```

### 2. Configure dotenvx (API + mobile)

Scripts load **`apps/api/.env.development`** and **`apps/mobile/.env.development`** via [**dotenvx**](https://github.com/dotenvx/dotenvx). Use **one** gitignored key file at the **repository root** so developers do not maintain separate keys per app:

**`.env.keys`** (never commit) — same directory as **`package.json`** at the repo root.

```bash
# From the repository root — one file for the whole monorepo
echo 'DOTENV_PRIVATE_KEY_DEVELOPMENT="paste-key-here"' > .env.keys
```

Add **`DOTENV_PRIVATE_KEY_PRODUCTION`** to the same file when you deploy with **`.env.production`**. NPM scripts pass **`-fk ../../.env.keys`** from **`apps/api`** and **`apps/mobile`** so both resolve this file.

**Important:** `apps/api/.env.development` and **`apps/mobile/.env.development`** must be encrypted with that **same** development key. If one file was encrypted with another keypair, re-encrypt it after **`dotenvx set`** / **`dotenvx encrypt`** using this root **`.env.keys`**, or share one team key from the start.

**Migrations and `DIRECT_URL`:** Prisma runs `migrate dev` / `migrate deploy` against `DIRECT_URL` (see `apps/api/prisma/schema.prisma`). If you see `P1001` and the message mentions `db.[project-ref].supabase.co:5432`, your network cannot reach Supabase’s direct host. In the Supabase dashboard open **Settings → Database → Connection string**, choose **Session pooler** (host like `aws-0-….pooler.supabase.com`, port **5432**, user `postgres.[project-ref]`), append `?sslmode=require` if needed, and set that full URI as **`DIRECT_URL`**. Keep **`DATABASE_URL`** as the **Transaction pooler** URI (port **6543**) for normal API queries.

### 3. Run DB migrations
```bash
npm run db:migrate
npm run db:seed      # optional dev data
```

### 4. Run the API
```bash
npm run api
```

For a production-style local run (build then `node dist`): `npm run api:prod`.

### 5. Run the mobile app

Create **`apps/mobile/.env.development`** with Supabase / Google values (see **`apps/mobile/README.md`** — Environment variables). **`npm start`**, **`npm run ios`**, and **`npm run android`** load that file via **`dotenvx`** using the **repo-root** **`.env.keys`** (§2 above), same as the API.

**iOS:**
```bash
npm run pod-install   # CocoaPods / native iOS deps (first clone or after native changes)
npm run ios
```

**Android:**
```bash
npm run android
```

---

## Supabase Free Tier — Operational Limits

| Resource | Limit | Mitigation |
|----------|-------|-----------|
| Postgres | 500 MB | Store URLs not blobs; clean up soft-deleted rows periodically |
| Storage | 1 GB | Compress images to ≤ 1200px / ≤ 5 MB client-side before upload |
| Auth MAU | 50,000 | MVP scope (Ukraine); reachable at scale but safe for launch |
| Realtime | 200 concurrent, 2M msgs/mo | Chat uses HTTP polling at MVP; Realtime optional upgrade |
| Bandwidth | 5 GB egress/mo | Paginate all lists (20 items default); use CDN URLs for images |
| DB connections | 10 direct | Use Supabase pooler URL (`?pgbouncer=true`) for `DATABASE_URL` |
| Edge Functions | 500k/mo | Not used in current arch (API on Express) |

**Connection string guidance:**
- `DATABASE_URL` → transaction pooler URL (port 6543) with `?pgbouncer=true`
- `DIRECT_URL` → direct connection (port 5432) for `prisma migrate deploy`

---

## Navigation Map

```
RootNavigator
├── AuthStack (unauthenticated / onboarding incomplete)
│   ├── Welcome
│   ├── PhoneInput
│   ├── OtpVerify
│   └── OnboardingStep1–5
└── MainTabs (authenticated + onboarding complete)
    ├── DiscoverTab → Discovery → ProfileDetail, Filters
    ├── GroupsTab  → GroupsList → GroupDetail → PostThread; CreateGroup
    ├── MessagesTab → ConversationList → ChatThread
    ├── EventsTab  → EventsList → EventDetail; CreateEvent
    └── ProfileTab → MyProfile → EditProfile, Settings, Connections
```

## API Routes

```
POST /api/v1/auth/send-otp
POST /api/v1/auth/verify-otp
POST /api/v1/auth/refresh

GET/POST        /api/v1/profiles
GET/PATCH       /api/v1/profiles/me
GET             /api/v1/profiles/discovery
GET             /api/v1/profiles/:id

GET/POST        /api/v1/connections
GET             /api/v1/connections/requests
PATCH/DELETE    /api/v1/connections/:id
POST            /api/v1/connections/block

GET/POST        /api/v1/conversations
GET/POST        /api/v1/conversations/:id/messages
DELETE          /api/v1/conversations/:id/messages/:msgId

GET/POST        /api/v1/groups
GET             /api/v1/groups/:id
POST            /api/v1/groups/:id/join
DELETE          /api/v1/groups/:id/leave
GET/POST        /api/v1/groups/:id/posts
POST            /api/v1/groups/:id/posts/:postId/reactions
GET/POST        /api/v1/groups/:id/posts/:postId/replies

GET/POST        /api/v1/events
GET             /api/v1/events/:id
POST/DELETE     /api/v1/events/:id/attend

POST            /api/v1/uploads/presign
POST            /api/v1/reports

GET             /health
```

## Security Principles

- All routes except `/auth/*` require `Authorization: Bearer <JWT>`
- Express verifies Supabase-issued JWTs; service-role key never leaves the server
- Row-level authorization enforced in route handlers (membership checks, block checks)
- No secrets in mobile bundle — only `API_BASE_URL`
- Uploads go directly to Supabase Storage via short-lived presigned URLs
- Rate limiting: 300 req/15 min global, 10 req/5 min for auth endpoints

## Development Workflow

```bash
npm run dev          # start API only (turbo watches)
npm run lint         # typecheck all workspaces
npm run db:studio    # open Prisma Studio
```
