# Overview — Travel MVP

A Next.js app (App Router + TypeScript + Tailwind v4) with a Prisma/Postgres backend.
All destination, stay, and dashboard data comes from the database via API routes —
nothing is hardcoded in the frontend.

## Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, lucide-react icons
- **Backend**: Next.js Route Handlers (`src/app/api/**`)
- **Database**: Postgres (Neon) via Prisma ORM (`prisma/schema.prisma`)

## Getting started

1. Copy `.env.example` to `.env` and fill in your Neon (or any Postgres) connection
   strings — `DATABASE_URL` (pooled) and `DIRECT_URL` (direct, used for migrations).
2. Install deps and set up the database:

```bash
npm install
npx prisma migrate deploy   # applies committed migrations
npm run db:seed             # seeds dummy data
npm run dev
```

Open http://localhost:3000.

## Deploying (Vercel + Neon)

The database (Neon Postgres project `overview-travel`) is already provisioned.
To ship the app:

1. **Push to GitHub** (Vercel deploys from a Git repo):
   ```bash
   git remote add origin <your-empty-github-repo-url>
   git branch -M main
   git commit -m "Initial commit"   # if not already committed
   git push -u origin main
   ```
2. **Log in to Vercel** (interactive — needs your browser):
   ```bash
   vercel login
   ```
3. **Link and deploy**:
   ```bash
   vercel link        # create/select the Vercel project
   vercel env add DATABASE_URL production   # paste the pooled Neon URL
   vercel env add DIRECT_URL production     # paste the direct Neon URL
   vercel --prod
   ```
   (Repeat `vercel env add ... preview` / `... development` if you want the
   same values for preview deployments.)

`postinstall` already runs `prisma generate` on every install, and
`prisma/migrations/` is committed, so Vercel's build will pick up the schema
automatically. Run `npx prisma migrate deploy` locally (pointed at the Neon
`DIRECT_URL`) whenever you add a new migration, before deploying.

## Data model

- `State` — India states shown on the `/india` grid
- `Destination` — hill stations / towns (belongs to a `State`)
- `Business` — a listing (belongs to a `Destination`, optionally owned by a
  `BusinessAccount` via an `AccountScope`), with a `category`
  (Stay/Package/Experience/Transport) and a `type` within it, plus `Room`,
  `Amenity`, and `Host` children
- `BusinessAccount` — a partner's login credentials (email/password)
- `AccountScope` — one (destination, category, type) combination a partner
  has requested, each with its own `PENDING`/`APPROVED`/`REJECTED` status. An
  account can hold several (e.g. a chain with branches in different towns, or
  offering both stays and packages)
- `AuditLog` — records admin edits to a partner-owned `Business` (field, old
  value, new value), shown to both the admin and the partner
- `RateLimitBucket` — backs fixed-window rate limiting on login/registration
- `Lead` — a WhatsApp/Call/Booking lead generated from the site

## API routes

Public:

| Route | Description |
| --- | --- |
| `GET /api/states` | List states with computed stay counts |
| `GET /api/states/:slug` | Single state detail |
| `GET /api/destinations` | List destinations (`?state=`, `?q=`, `?tag=`) |
| `GET /api/destinations/:slug` | Single destination detail |
| `GET /api/businesses` | List stays (`?destination=`, `?type=`) |
| `GET /api/businesses/:slug` | Single stay detail (rooms, amenities, host) |
| `POST /api/leads` | Create a lead (`businessSlug`, `channel`) |

Partner (`/api/partner/**`, cookie-gated in `src/proxy.ts` — register/login/destinations are the public exceptions):

| Route | Description |
| --- | --- |
| `GET /api/partner/destinations` | Public — real destination ids for the register/scope forms (`/api/destinations` substitutes slugs as ids for the rest of the public site, so this is a separate endpoint) |
| `POST /api/partner/register` | Public, rate-limited — create an account with one or more requested scopes |
| `POST /api/partner/login` / `logout` | Public rate-limited login / authenticated logout |
| `GET /api/partner/me` | Current account + all its scopes and their statuses |
| `POST /api/partner/scopes` | Request another (destination, category, type) after registration |
| `GET/POST /api/partner/businesses` | List / create own listings — `scopeId` must be one of the account's own **approved** scopes; category/type/destination are taken from that scope, never from the request body |
| `GET/PATCH/DELETE /api/partner/businesses/:id` | Manage an owned listing (404s if it belongs to someone else) |
| `GET /api/partner/leads` | Leads across the account's own listings |
| `GET /api/partner/summary` | Analytics: total views, leads (30d vs. previous 30d, with % change) |

Admin (`/api/admin/**`, cookie-gated, rate-limited on login):

| Route | Description |
| --- | --- |
| `GET /api/admin/business-accounts` | List all partner accounts with their scopes |
| `DELETE /api/admin/business-accounts/:id` | Remove an account (its owned listings are orphaned, not deleted) |
| `PATCH /api/admin/account-scopes/:id` | Approve / reject a single scope request — emails the partner (see below) |
| `.../states`, `.../destinations`, `.../businesses`, `.../leads` | Full CRUD, unrestricted. `PATCH .../businesses/:id` writes an `AuditLog` entry per changed field whenever the listing has a partner owner |

## Pages

- `/` — interactive canvas globe → search & category filters
- `/india` — state grid
- `/state/[slug]` — destinations within a state (e.g. `/state/uttarakhand`)
- `/destination/[slug]` — destination overview, stays, map
- `/business/[slug]` — listing detail + booking actions
- `/partner/register` — business sign-up (one or more destination/category rows)
- `/partner/login`, `/partner` — partner login and dashboard (analytics, scope
  statuses, listings)
- `/partner/scopes/new` — request another destination/category after signup
- `/admin` — password-protected admin panel (see below)

## Business registration & approval workflow

1. A business submits `/partner/register` — business name, contact, email,
   password, and **one or more** (destination, category, type) rows, e.g.
   `Ranikhet • Stay/Hotel` and `Dehradun • Package/Trek`. Each row becomes its
   own `AccountScope` with `status: PENDING`; categories are Stay, Package,
   Experience, or Transport (`src/lib/categories.ts`).
2. An admin reviews each scope independently at `/admin/registrations` and
   approves or rejects it — one account can have some scopes approved and
   others rejected. The partner gets an email on either outcome (see below).
3. A partner can only create a listing under a scope that is `APPROVED` and
   belongs to them (checked server-side in `POST /api/partner/businesses` —
   the destination/category/type come from the scope record, never from the
   request body, so a crafted request can't publish outside what was
   approved). They can request more scopes any time from `/partner`.
   Partners can only see/edit/delete their own listings; the site admin can
   still manage everything regardless of ownership via `/admin/businesses`
   (and every such override is written to that listing's `AuditLog`, visible
   to both the admin and the partner).

### Email notifications

`src/lib/email.ts` sends via SMTP (nodemailer) when a scope is approved or
rejected — defaults to Gmail (`smtp.gmail.com:465`). Without `SMTP_USER`/
`SMTP_PASS` set, it no-ops with a console log — the rest of the app works
fully without an email provider configured. To enable delivery, set
`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `EMAIL_FROM` in
`.env` / Vercel env vars. For Gmail, `SMTP_PASS` must be an
[App Password](https://myaccount.google.com/apppasswords), not the account's
regular password (Google blocks regular-password SMTP login for security).

### Rate limiting

`POST /api/partner/register`, `/api/partner/login`, and `/api/admin/login`
are rate-limited (`src/lib/rateLimit.ts`) using a DB-backed fixed window keyed
by IP + route — 5 registration attempts / 8 login attempts per 10 minutes,
returning `429` once exceeded. It's DB-backed rather than in-memory so it
works correctly across Vercel's serverless instances.

## Admin panel

`/admin` is a full CRUD control panel for States, Destinations, Businesses
(with their Rooms, Amenities, and Host), business Registrations, and Leads.

- Protected by a single shared password (`ADMIN_PASSWORD` env var). On login,
  a signed, stateless session cookie is set (`ADMIN_SESSION_SECRET` env var) —
  no session table needed. Enforced in `src/proxy.ts` for both `/admin/*`
  pages and `/api/admin/*` routes. Partner accounts use the same pattern with
  their own `PARTNER_SESSION_SECRET`, but a real per-account signed token
  (email/password checked against a scrypt hash) rather than a single shared
  password.
- Set env vars (random values) locally in `.env` and on Vercel
  (`vercel env add ADMIN_PASSWORD production`, same for `ADMIN_SESSION_SECRET`
  and `PARTNER_SESSION_SECRET`).
- Gradient fields (e.g. "Image gradient classes") accept Tailwind class names
  like `from-emerald-800 to-stone-900`. Tailwind only ships CSS for classes it
  can see in the source at build time, so brand-new gradient combinations
  typed into the admin panel won't render until they're added to
  `src/lib/tailwind-safelist.tsx` and the app is rebuilt. Stick to combinations
  already used elsewhere in the seed data to avoid this.
