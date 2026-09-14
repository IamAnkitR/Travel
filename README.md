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
- `Business` — a stay/listing (belongs to a `Destination`), with `Room`,
  `Amenity`, and `Host` children
- `Lead` — a WhatsApp/Call/Booking lead generated from the site, aggregated
  on `/dashboard`

## API routes

| Route | Description |
| --- | --- |
| `GET /api/states` | List states with computed stay counts |
| `GET /api/states/:slug` | Single state detail |
| `GET /api/destinations` | List destinations (`?state=`, `?q=`, `?tag=`) |
| `GET /api/destinations/:slug` | Single destination detail |
| `GET /api/businesses` | List stays (`?destination=`, `?type=`) |
| `GET /api/businesses/:slug` | Single stay detail (rooms, amenities, host) |
| `PATCH /api/businesses/:slug` | Update a listing (used by `/dashboard`) |
| `POST /api/leads` | Create a lead (`businessSlug`, `channel`) |
| `GET /api/dashboard` | Aggregated stats + recent leads for a business |

## Pages

- `/` — interactive canvas globe → search & category filters
- `/india` — state grid
- `/state/[slug]` — destinations within a state (e.g. `/state/uttarakhand`)
- `/destination/[slug]` — destination overview, stays, map
- `/business/[slug]` — listing detail + booking actions
- `/dashboard` — business owner dashboard (stats, listing editor, leads)
- `/admin` — password-protected admin panel (see below)

## Admin panel

`/admin` is a full CRUD control panel for States, Destinations, Businesses
(with their Rooms, Amenities, and Host), and Leads.

- Protected by a single shared password (`ADMIN_PASSWORD` env var). On login,
  a signed, stateless session cookie is set (`ADMIN_SESSION_SECRET` env var) —
  no session table needed. Enforced in `src/proxy.ts` for both `/admin/*`
  pages and `/api/admin/*` routes.
- Set both env vars (random values) locally in `.env` and on Vercel
  (`vercel env add ADMIN_PASSWORD production`, same for `ADMIN_SESSION_SECRET`).
- Gradient fields (e.g. "Image gradient classes") accept Tailwind class names
  like `from-emerald-800 to-stone-900`. Tailwind only ships CSS for classes it
  can see in the source at build time, so brand-new gradient combinations
  typed into the admin panel won't render until they're added to
  `src/lib/tailwind-safelist.tsx` and the app is rebuilt. Stick to combinations
  already used elsewhere in the seed data to avoid this.
