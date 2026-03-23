# External Import + Placeholder Merge Plan

Owner: Raymie + agent  
Status: In progress (Phase 1 groundwork started)  
Last updated: 2026-03-05

## Goal

Import all ZWR and SRC player runs into CZT with safe dedupe, while supporting non-login placeholder users and admin-driven merges into real users.

## Confirmed Product Decisions

1. Placeholder users are non-login accounts (no email auth).
2. Placeholder display name/username should match source name as closely as possible.
3. If ZWR and SRC names match exactly, merge those imports into one placeholder user.
4. If names do not match, keep separate placeholder users.
5. Merge flow behavior:
   - copy/move logs from source user -> target user
   - recalculate target XP + verified XP
   - archive source user so it is hidden/publicly inactive
   - do not hard-delete source data
6. Admin UI should allow merges for:
   - placeholder -> real
   - real -> real
7. Duplicate runs can keep either record when truly identical.

## Inputs / Data Sources

- ZWR CSVs:
  - `saved player csv`
  - `top-178-csv`
- SRC CSVs:
  - `src_codzombies_player_csv`
- Existing ZWR mapping:
  - `scripts/import-skrine-csv/zwr-to-czt-users.ts`
- Existing id-key and SRC resolver inputs:
  - `src-csvs/src_codzombies_id_key.json`

## Existing “Already Imported” Signals

Primary candidates discovered:

- `scripts/import-skrine-csv/zwr-to-czt-users.ts`
  - current known imported user mappings (ZWR -> CZT).
- Existing logs in DB keyed by map/challenge/time/proof/user
  - should be treated as hard idempotency guard.
- Existing import reports (e.g. `import-report.json`)
  - helpful for audit/debug, not sufficient as only source of truth.

## Proposed Technical Design

### 1) Placeholder user model

Add durable source identity metadata so imports and merges are deterministic:

- `isPlaceholderExternal` (boolean)
- `externalSource` (`ZWR` | `SRC` | `BOTH`)
- `externalDisplayName` (string)
- `externalIdentityKey` (normalized source key)
- `archivedAt` (nullable date)

Also add audit metadata for merges:

- `mergedIntoUserId` (nullable string)
- `mergeReason` (nullable string)

### 2) Placeholder avatars

Reserved filenames (to be added to app assets by owner):

- `avatar-external-zwr.png`
- `avatar-external-src.png`

Behavior:

- placeholders default to source avatar
- real users keep current avatar behavior

### 3) Idempotent bulk import pipeline

Run in two stages:

1. ZWR full import
2. SRC full import

For each source row:

- resolve source player name
- check existing mapped CZT real user (from mapping + merge table)
- else resolve/create placeholder user
- insert log only if not duplicate by strong signature:
  - challenge logs: `(mapId, challengeId, completionTimeSeconds, roundReached, playerCount, proofUrls[0], sourceTag)`
  - ee logs: `(mapId, easterEggId, completionTimeSeconds, playerCount, proofUrls[0], sourceTag)`

### 4) Merge engine (admin action)

Input: `sourceUserId`, `targetUserId`

Steps:

1. Validate permissions (super admin only).
2. Dry-run counts:
   - challenge logs to move
   - easter egg logs to move
   - duplicates that would be skipped
3. Move rows in transaction:
   - challenge logs userId -> target
   - easter egg logs userId -> target
   - teammate arrays remap source -> target
4. Recompute target achievements + XP + verified XP.
5. Archive source user:
   - `archivedAt=now`
   - hidden from public queries.
6. Write audit entry.

### 5) Public visibility behavior

- Archived users do not appear in leaderboards, profile lists, user search.
- Their historical logs remain in DB for audit but belong to target after merge.

## Edge Cases To Handle

1. Same person has 5+ aliases across sources.
2. Same run appears in both source sets with slightly different proof URLs.
3. Teammate lists include source user being merged.
4. Merge source already archived.
5. Target user archived (should reject).
6. Real -> real merge with overlapping logs.
7. Placeholder imported from both ZWR and SRC over time.

## Rollout Plan (safe sequence)

1. Schema changes + indexes + archival filters.
2. Build placeholder creation utility and source identity resolver.
3. Build idempotent ZWR bulk importer command (dry-run first).
4. Build idempotent SRC bulk importer command.
5. Build merge backend API + audit table.
6. Build super-admin merge dashboard.
7. Run staged import in batches with progress logs.
8. Run verification scripts and leaderboard spot checks.

## Progress Log

### 2026-03-05 (Phase 1 groundwork)

- Added schema groundwork (not applied to DB yet):
  - `User` fields for archive + external placeholder metadata.
  - `ExternalAccountIdentity` model for source identity mapping.
  - `UserMergeAudit` model for merge traceability.
  - `ExternalSource` enum (`ZWR`, `SRC`).
- Added migration file:
  - `prisma/migrations/20260507000000_add_external_placeholder_and_merge_audit/migration.sql`
- Regenerated Prisma client locally only (`pnpm db:generate`).
- Added initial visibility guards in API code:
  - archived users excluded from rank leaderboards and user search.
  - archived profiles return 404 for non-admin viewers.

### 2026-03-05 (Phase 2 start: import user resolution utilities)

- Added shared import user resolver:
  - `scripts/external-users/import-user-resolution.ts`
  - supports:
    - explicit user resolution (`--czt-user`)
    - mapped ZWR user fallback (`zwr-to-czt-users.ts`)
    - external identity lookup (`ExternalAccountIdentity`) when table exists
    - auto-create placeholder users (`--auto-user`)
    - dry-run placeholder mode without writes
- Updated ZWR importer:
  - `scripts/import-skrine-csv/run.ts`
  - new CLI mode: `--auto-user` (use when no `--czt-user` is provided)
- Updated SRC importer:
  - `scripts/import-src-csv/run.ts`
  - new CLI mode: `--auto-user` (use when no `--czt-user` is provided)

Notes:
- Existing behavior remains unchanged when `--czt-user` is supplied.
- New identity-table logic is tolerant before migration: if the table is missing, import still works via explicit/mapped/placeholder paths.

### 2026-03-05 (Phase 2B: bulk orchestrators + deferred revalidation)

- Added `--skip-revalidate` to both import runners:
  - `scripts/import-skrine-csv/run.ts`
  - `scripts/import-src-csv/run.ts`
- Added ZWR bulk orchestrator:
  - `scripts/external-users/import-all-zwr.ts`
  - scans both `top-178-csv` and `saved player csv`
  - dedupes by normalized player name
  - skips mapped users by default (override: `--include-mapped`)
  - supports `--dry-run`, `--limit`, `--only-player`, `--stop-on-error`
  - optional `--revalidate-end` for targeted user revalidation batch
- Added SRC bulk orchestrator:
  - `scripts/external-users/import-all-src.ts`
  - scans `src_codzombies_player_csv`
  - supports `--dry-run`, `--limit`, `--only-player`, `--stop-on-error`
  - optional `--revalidate-end` for targeted user revalidation batch
- Added package scripts:
  - `db:import-all-zwr-external`
  - `db:import-all-src-external`

## Verification Checklist

- [ ] Placeholder users created with source avatar and no auth linkage.
- [ ] Existing imported users skipped.
- [ ] Duplicate logs skipped.
- [ ] Leaderboards include placeholders (before merge).
- [ ] Merge action moves logs and recalculates target XP correctly.
- [ ] Archived source users hidden from public.
- [ ] Audit rows written for each merge.
- [ ] Re-run imports are idempotent.

## Open Questions (still unresolved)

1. Exact username generation rule when source name is invalid/collides.
2. Whether exact-name matching between ZWR and SRC should be case-sensitive.
3. Whether we should store per-log provenance (`source: ZWR|SRC`) explicitly now.
4. Whether merge UI needs “preview sample rows” beyond counts.

## Crash Recovery Notes

If agent/session crashes, resume from this doc and continue in sequence:

1. Confirm schema state and migrations applied.
2. Confirm placeholder utility exists.
3. Confirm import command dry-run output.
4. Confirm admin merge API + UI state.
5. Continue checklist from first unchecked item.

