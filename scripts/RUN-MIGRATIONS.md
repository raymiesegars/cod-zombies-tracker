# Migration and Script Run Order

Use this order for local testing and production. All steps are **safe**—none delete data.

## 1. Prisma migrations

```bash
pnpm prisma migrate deploy
```

Applies any pending schema migrations.

## 2. Verrückt Starting Room fix (RECOMMENDED – fixes WAW/BO1 log page + achievement filter)

```bash
pnpm exec tsx scripts/fix-verruckt-starting-room-only.ts
```

**Use this** if WAW or BO1 Verrückt are missing "Starting Room Only" on the log page or achievement filter. It:
- **Activates** `STARTING_ROOM` challenge for verruckt, bo1-verruckt (core fix – they were inactive)
- Creates `STARTING_ROOM` challenge if missing
- Migrates JUG_SIDE/QUICK_SIDE logs → `STARTING_ROOM` + `firstRoomVariant`
- Migrates achievements, consolidates duplicates, fixes names
- Creates first room achievements for WAW/BO1 if missing

Does NOT touch achievements/XP on other maps. Safe to run. Use `--dry-run` to preview, `--verbose` to inspect current state.

## 3. Verrückt first room consolidation (alternative – full migration)

```bash
pnpm exec tsx scripts/run-first-room-migration.ts
```

Run this if you have Verrückt maps with legacy JUG_SIDE/QUICK_SIDE data. It also handles Buried. Does not activate inactive STARTING_ROOM challenges – use fix-verruckt-starting-room-only for that.

## 4. First room setup (STARTING_ROOM challenges + Buried variant)

```bash
pnpm exec tsx scripts/add-missing-starting-room-challenges.ts
```

- Creates `STARTING_ROOM` challenges for maps that have it in config but not in the DB
- Sets `firstRoomVariant='PROCESSING'` for existing Buried STARTING_ROOM logs that don't have a variant
- Fixes achievement names (ALL CAPS → proper case) for any remaining

## 5. No Jug toggle migration

```bash
pnpm exec tsx scripts/migrate-no-jug-to-toggle.ts
```

- Converts existing `NO_JUG` challenge logs to `HIGHEST_ROUND` + `wawNoJug=true`
- Deactivates `NO_JUG` challenges (they are no longer in dropdowns; No Jug is now a toggle)
