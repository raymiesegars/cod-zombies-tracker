# CoD Zombies Tracker

Track Treyarch Zombies progress: rounds, challenges, Easter eggs, and leaderboards. Sign in with Google, log your runs, and see how you stack up.

**Stack:** Next.js 14, TypeScript, Tailwind, Prisma, Supabase (Postgres + Auth).

## Quick start

1. Clone, then `pnpm install` (or npm/yarn).
2. Copy `.env.local.example` to `.env.local` and fill in Supabase + DB credentials.
3. `pnpm db:generate` and `pnpm db:push`, then `pnpm db:seed`.
4. `pnpm dev` and open http://localhost:3000.

**Vercel:** Set `DATABASE_URL` with the Supabase pooler URL (port 6543). Minimum required: `?pgbouncer=true` (disables prepared statements for Supavisor transaction mode). Example:
`postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
Optional: add `&connection_limit=1` to cap connections per instance (helps if pool exhausts under high load) and `&pool_timeout=45` to wait longer before failing. Set `CI=true` in Vercel build env so the sitemap skips DB during build.

Supabase: create a project, get the API keys and DB URLs from project settings, and turn on Google OAuth under Authentication. Use the direct DB URL for Prisma (or add `?pgbouncer=true` to the pooled URL so prepared statements are disabled). There’s a longer setup guide in `SETUP.md` if you need step-by-step.

## Scripts

- `pnpm dev` / `build` / `start` — dev server, production build, run production
- `pnpm lint` — ESLint
- `pnpm db:generate` — generate Prisma client
- `pnpm db:push` — push schema to DB (no migration files)
- `pnpm db:migrate` — run migrations
- `pnpm db:seed` — seed games, maps, challenges, achievements
- `pnpm db:studio` — open Prisma Studio

## Layout

- `src/app` — App Router pages and API routes
- `src/components` — UI, game-specific, layout
- `src/context` — auth, XP toasts
- `src/lib` — Prisma, Supabase, achievements, ranks, utils

Not affiliated with Activision or Treyarch. Call of Duty and related marks are property of their owners.
