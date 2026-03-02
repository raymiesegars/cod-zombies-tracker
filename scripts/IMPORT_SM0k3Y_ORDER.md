# SM0k3Y full transfer (ZWR → CZT)

One-command full transfer for user **SM0k3Y** into CZT user **cmlyp3llo000020vwc0ucyu88**.

## Safety

- **Single user only**: All steps only affect CZT user `cmlyp3llo000020vwc0ucyu88`. No other users’ data is deleted or overwritten.
- **Import**: Creates/updates only `ChallengeLog` and `EasterEggLog` rows for this user (and optionally updates existing speedrun logs’ rampage flag). Uses `--skip-existing` so existing logs are not duplicated; new rows from the CSV are added.
- **Reunlock**: `BACKFILL_USER_ID` limits achievement re-evaluation to this user. Other users’ `UserAchievement` rows are untouched.
- **Recompute verified XP**: Same `BACKFILL_USER_ID` limits recompute to this user’s `verifiedTotalXp` / `verifiedAt`. No global wipe.

## Prerequisites

1. **CSV in repo**: Ensure `top-178-csv/SM0k3Y.csv` exists (path from project root).
2. **Env**: `DIRECT_URL` or `DATABASE_URL` set in `.env` / `.env.local` (same as other DB scripts).
3. **CZT user**: User with id `cmlyp3llo000020vwc0ucyu88` must exist (e.g. already signed up on the site).

## Run (recommended)

From project root:

```bash
pnpm db:import-user-sm0k3y
```

This runs in order:

1. **Import** – `scripts/import-skrine-csv/run.ts` with:
   - `--csv=top-178-csv/SM0k3Y.csv`
   - `--source-player-id=SM0k3Y` (CSV uses display names in `player_1`..`player_4`)
   - `--czt-user=cmlyp3llo000020vwc0ucyu88`
   - `--skip-existing`
2. **Reunlock achievements** – `BACKFILL_USER_ID=cmlyp3llo000020vwc0ucyu88 pnpm db:reunlock-achievements`
3. **Recompute verified XP** – `BACKFILL_USER_ID=cmlyp3llo000020vwc0ucyu88 pnpm db:recompute-verified-xp`

## Dry run (no DB writes)

To only simulate the import (no inserts/updates, and no reunlock/recompute):

```bash
pnpm exec tsx scripts/import-user-sm0k3y.ts --dry-run
```

## Manual step-by-step (optional)

If you prefer to run each step yourself:

```bash
# 1) Import
pnpm exec tsx scripts/import-skrine-csv/run.ts --csv=top-178-csv/SM0k3Y.csv --source-player-id=SM0k3Y --czt-user=cmlyp3llo000020vwc0ucyu88 --skip-existing

# 2) Reunlock achievements for this user only
BACKFILL_USER_ID=cmlyp3llo000020vwc0ucyu88 pnpm db:reunlock-achievements

# 3) Recompute verified XP for this user only
BACKFILL_USER_ID=cmlyp3llo000020vwc0ucyu88 pnpm db:recompute-verified-xp
```

## Mapping

- **ZWR/source**: `SM0k3Y` (as in CSV `player_1`..`player_4`).
- **CZT**: User id `cmlyp3llo000020vwc0ucyu88` (see `scripts/import-skrine-csv/zwr-to-czt-users.ts`).
