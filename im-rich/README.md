# IM RICH

A premium social platform for displaying digital wealth and status using **Rich Coin (RC)** — a
virtual, non-cashable social currency. Built with Next.js (App Router), TypeScript, Tailwind CSS,
Prisma, and PostgreSQL.

> **RC is not cryptocurrency, an investment, a security, or a bank balance.** RC can be purchased
> with real money and sent between users, but it cannot be withdrawn or redeemed for cash. This is
> enforced end-to-end: there is no API route, admin action, or database operation anywhere in this
> codebase that converts RC back into money.

---

## ⚠️ A note on how this was built

This project was generated in a sandboxed environment with **no internet access**, so it was never
possible to run `npm install`, start Postgres, or execute `next dev`/`next build` to get a live,
compiled confirmation that everything works. Every file was written and manually cross-checked
(imports, Prisma field names, route signatures, Next.js conventions like wrapping
`useSearchParams()` in `<Suspense>`), but a manual review is not a substitute for a real build.

**Before you rely on this in any serious way, run the install and build steps below and read any
error output.** If TypeScript or `next build` surfaces an issue, it's most likely one of:
a dependency version mismatch (see the Stripe note below), a typo, or a Prisma Client type that
drifted slightly from the schema. These are normal first-run issues for a hand-written project this
size, not signs of a fundamentally broken architecture — the data model, transaction safety, and
API design underneath are the parts that matter most and were the most carefully checked.

---

## Features

- **Auth**: email/username + password sign up, login, logout, forgot/reset password, suspended-account
  handling. Sessions via NextAuth (JWT).
- **Profiles**: generated avatar (no upload storage required for this build — see note below), bio,
  full name, join date, friend count, rank, and a glowing wealth card.
- **Friends**: search, send/accept/reject/cancel requests, remove friends, friends list.
- **Rich Coin transfers**: server-validated, atomic, idempotent (a retried request can never send
  twice), with full transaction history.
- **Buy RC**: six packages ($2.50–$100), a safe **test payment mode** by default (no real charge,
  simulates a webhook), and a production-ready Stripe Checkout + webhook path that activates the
  moment you add real Stripe keys.
- **Leaderboard**: ranked by RC balance, special styling for the top 3, "Your Rank" card.
- **Dashboard**: balance, rank, friend count, a 30-day balance history chart (Recharts), recent
  activity.
- **Notifications**: friend requests/accepts, RC received, purchases completed.
- **Rich Store**: disabled "Coming Soon" page — the architecture (a `Payment`-like ledger pattern) is
  ready to extend with a `StoreItem`/`StorePurchase` model when you're ready to launch it.
- **Admin panel**: user search, suspend/unsuspend, platform stats (circulation, purchases, transfers,
  revenue), and **audited** balance adjustments (every adjustment records admin id, target, amount,
  reason, and timestamp in `AuditLog` — there is no code path that edits a wallet balance without
  going through this).
- **Responsive**: desktop top nav, native-feeling mobile bottom nav, `prefers-reduced-motion` respected.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS (custom dark/gold design tokens) |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth (Credentials provider, JWT sessions) |
| Payments | Stripe Checkout + webhooks (production), local test-mode simulator (development) |
| Charts | Recharts |
| Icons | Lucide |

---

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Start PostgreSQL

The easiest path is the included Docker Compose file:

```bash
docker compose up -d
```

This starts Postgres on `localhost:5432` with user/password/db all set to `imrich` (see
`docker-compose.yml`). If you'd rather use a hosted Postgres (Neon, Supabase, Railway, RDS, etc.),
skip this and just point `DATABASE_URL` at it in step 3.

### 3. Configure environment variables

```bash
cp .env.example .env
```

Then edit `.env`:

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | Postgres connection string. Default matches `docker-compose.yml`. |
| `NEXTAUTH_SECRET` | Yes | Any long random string. Generate one with `openssl rand -base64 32`. |
| `NEXTAUTH_URL` | Yes | `http://localhost:3000` for local dev. |
| `USE_TEST_PAYMENTS` | No (default `true`) | Keep `true` until you have real Stripe keys. See below. |
| `STRIPE_SECRET_KEY` | Only in production | From your Stripe dashboard. |
| `STRIPE_WEBHOOK_SECRET` | Only in production | From `stripe listen` (dev) or your Stripe webhook endpoint config (prod). |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Only in production | Not currently used client-side (Checkout redirect is server-driven), reserved for future Stripe Elements use. |

### 4. Run migrations and seed data

```bash
npx prisma migrate dev --name init
npm run db:seed
```

The seed script creates:
- An **admin account**: `admin@imrich.app` / `password123`
- **15 regular users** (e.g. `brusk@imrich.app` / `password123`, `amara@imrich.app` / `password123`,
  etc. — see `prisma/seed.ts` for the full list), all password `password123`
- A realistic friend graph (accepted friendships + a few pending requests)
- ~30 days of RC transfers and purchases so the dashboard chart, wallet history, and leaderboard are
  populated immediately

### 5. Run the app

```bash
npm run dev
```

Visit `http://localhost:3000`.

---

## Payment modes explained

**Test mode (default, `USE_TEST_PAYMENTS=true`):** clicking "Buy Now" creates a real `Payment` row in
`PENDING` status, redirects to a confirmation screen that simulates the few seconds a real payment
takes, then calls a server route that looks up that exact pending payment and credits RC based on
what it recorded at checkout — never based on anything the browser claims. No card is charged, no
Stripe account is needed. This is safe to leave on through development and demos.

**Production mode:** set `USE_TEST_PAYMENTS=false` and provide real Stripe keys. The checkout route
then creates a real Stripe Checkout Session, and RC is only ever credited by
`/api/webhooks/stripe`, which verifies Stripe's signature before touching the database. To test this
locally with the Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret it prints into `STRIPE_WEBHOOK_SECRET`.

**Note on the Stripe SDK version:** `package.json` pins `stripe@^16.9.0` with API version
`"2024-06-20"`. If `npm install` or the build complains about the `apiVersion` string in
`src/lib/stripe.ts`, check `node_modules/stripe/types/lib.d.ts` for the version string that release
actually expects and update the literal there.

---

## Security notes

- **Nothing trusts the client for money.** Every RC balance change happens inside
  `src/lib/rc.ts`, inside a database transaction, and is guarded by a unique constraint
  (`clientRequestId` for transfers, `providerPaymentId` for purchases) so a retried or replayed
  request can never be applied twice. See the comments in that file for the reasoning behind each
  guard.
- **Server-side validation everywhere.** Every API route re-validates input with `zod` and
  re-checks authorization (`getServerSession`) even though the middleware also blocks unauthenticated
  requests at the edge — this is deliberate defense in depth, not redundancy to trim.
- **Admin actions are always audited.** `adminAdjustBalance` is the only function that can move RC
  without a sender, and it always writes an `AuditLog` row.
- **Rate limiting** is applied to registration, login-adjacent password reset requests, RC transfers,
  and checkout creation (`src/lib/rateLimit.ts`). It's a simple in-memory limiter — fine for a single
  instance, but swap it for a Redis-backed one (e.g. Upstash) before running multiple instances,
  since the in-memory map won't be shared across processes.
- **Passwords** are hashed with bcrypt (cost factor 12), never logged or returned by any API route.
- **Password reset tokens** are single-use, expire after 30 minutes, and the "forgot password"
  endpoint always returns the same response whether or not the email exists, so it can't be used to
  enumerate accounts. In development (no email provider configured), the reset link is returned
  directly in the API response so you can test the full flow — **wire up a real transactional email
  provider (Postmark, SES, Resend, etc.) before going to production**, and remove the `devResetUrl`
  field from `src/app/api/auth/forgot-password/route.ts` once you do.
- **RC is stored as an integer**, never a float, everywhere (schema and code). Money (payment
  amounts) is stored in cents, also as an integer.

### Things you should still do before a real launch

- Replace the in-memory rate limiter with a distributed one.
- Add CSRF protection for any state-changing route you expose outside of NextAuth's own CSRF-protected
  flows (NextAuth's credential sign-in already includes CSRF tokens; the custom `/api/*` routes here
  rely on being same-origin `fetch` calls from the app itself — add explicit CSRF tokens if you expose
  any of them to third parties).
- Add a real virus/content scan if you later let users upload profile photos instead of using
  generated avatars.
- Add structured logging/error monitoring (Sentry or similar) — `console.error` calls throughout are
  placeholders for that.
- Review the admin panel's access controls if you add more admin roles later (currently a single
  boolean `isAdmin` flag).

---

## Architecture notes

- **Avatars are generated, not uploaded.** To avoid needing S3/Cloudinary/etc. for this build,
  profile "photos" are deterministic images generated from a seed string (default: username) via
  DiceBear. `Profile.avatarSeed` is the field that drives this. Swapping in real photo uploads later
  means adding an `avatarUrl` field and a real upload endpoint — the UI (`src/components/Avatar.tsx`)
  is the only place that would need to change.
- **The Rich Store is intentionally unimplemented.** Per the product spec, it's a disabled
  "Coming Soon" page (`src/app/rich-store`). When you're ready to build it, the natural extension is
  a `StoreItem` model and a `StorePurchase` transaction type that debits RC through the same
  `sendRichCoin`-style atomic/idempotent pattern already used for transfers — don't build a separate,
  less-guarded code path for it.
- **Database**: see `prisma/schema.prisma` for the full entity list (User, Profile, Wallet,
  FriendRequest, Friendship, RichCoinTransaction, Payment, Notification, AuditLog,
  PasswordResetToken). Every RC-affecting entity keeps enough history to reconstruct a user's balance
  from scratch from their transaction log — the dashboard's 30-day chart actually does this rather
  than storing a separate time series.
- **Middleware** (`src/middleware.ts`) blocks unauthenticated requests to every protected route at the
  edge; each page's server component also re-checks the session, and every API route checks it again
  independently. This triple-check is deliberate, not accidental duplication.

---

## Useful scripts

```bash
npm run dev          # start the dev server
npm run build        # production build
npm run start         # run a production build
npm run db:migrate    # prisma migrate dev
npm run db:generate   # regenerate the Prisma client
npm run db:seed       # run prisma/seed.ts
npm run db:studio     # open Prisma Studio (visual DB browser)
```

## Deployment

Any Node hosting platform that supports Next.js (Vercel, Render, Fly.io, a plain VPS) works. You'll
need:

1. A production Postgres instance (`DATABASE_URL`)
2. `NEXTAUTH_SECRET` and `NEXTAUTH_URL` (your real domain)
3. `USE_TEST_PAYMENTS=false` plus real Stripe keys
4. Run `npx prisma migrate deploy` (not `migrate dev`) as part of your deploy step
5. Register your Stripe webhook endpoint (`/api/webhooks/stripe`) in the Stripe dashboard and put its
   signing secret in `STRIPE_WEBHOOK_SECRET`
