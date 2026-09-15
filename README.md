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
- `Business` — a stay/listing (belongs to a `Destination`, optionally owned by
  a `BusinessAccount`), with `Room`, `Amenity`, and `Host` children
- `BusinessAccount` — a partner's registration: login credentials, status
  (`PENDING`/`APPROVED`/`REJECTED`), and the single destination + category
  they're approved to publish under
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

Partner (`/api/partner/**`, cookie-gated in `src/proxy.ts`):

| Route | Description |
| --- | --- |
| `POST /api/partner/register` | Public — submit a registration request |
| `POST /api/partner/login` / `logout` | Public login / authenticated logout |
| `GET /api/partner/me` | Current account + approval status |
| `GET/POST /api/partner/businesses` | List / create own listings (destination + type are forced to the account's approved values, never taken from the request body) |
| `GET/PATCH/DELETE /api/partner/businesses/:id` | Manage an owned listing (404s if it belongs to someone else) |
| `GET /api/partner/leads` | Leads across the account's own listings |

Admin (`/api/admin/**`, cookie-gated):

| Route | Description |
| --- | --- |
| `GET /api/admin/business-accounts` | List all partner registrations |
| `PATCH /api/admin/business-accounts/:id` | Approve / reject / reset a registration |
| `.../states`, `.../destinations`, `.../businesses`, `.../leads` | Full CRUD, unrestricted |

## Pages

- `/` — interactive canvas globe → search & category filters
- `/india` — state grid
- `/state/[slug]` — destinations within a state (e.g. `/state/uttarakhand`)
- `/destination/[slug]` — destination overview, stays, map
- `/business/[slug]` — listing detail + booking actions
- `/partner/register` — business sign-up (destination + category picked here)
- `/partner/login`, `/partner` — partner login and dashboard (listings, leads)
- `/admin` — password-protected admin panel (see below)

## Business registration & approval workflow

1. A business submits `/partner/register` — business name, contact, email,
   password, and **one** destination + **one** category (Hotel/Resort/
   Homestay/Budget). Account is created with `status: PENDING`.
2. An admin reviews it at `/admin/registrations` and approves or rejects.
3. Once `APPROVED`, the partner can log into `/partner` and create listings —
   but every listing they create or edit is force-set to the destination and
   type captured at registration, enforced server-side in
   `/api/partner/businesses` (the client can't override it, even by sending
   different values in the request body — see the tamper check in that route).
   Partners can only see/edit/delete their own listings; the site admin can
   still manage everything regardless of ownership via `/admin/businesses`.

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
