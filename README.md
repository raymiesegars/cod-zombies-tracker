# Aether Log

Track Treyarch Zombies progress: rounds, challenges, Easter eggs, and leaderboards. Sign in with Google, log your runs, and see how you stack up.

**Stack:** Next.js 14, TypeScript, Tailwind, Prisma, Supabase (Postgres + Auth).

## Quick start

1. Clone, then `pnpm install` (or npm/yarn).
2. Copy `.env.local.example` to `.env.local` and fill in Supabase + DB credentials.
3. `pnpm db:generate` and `pnpm db:push`, then `pnpm db:seed`.
4. `pnpm dev` and open http://localhost:3000.

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
