# Run order: Skrine ZWR import (with rampage fix) + revalidate

User ID: `cmlvocpbj0006ar6ml9vz7hsm`  
CSV: `/Users/raymiesegars/Downloads/Skrine Records.csv`

Run these **in order** from the project root (with `.env.local` / `DIRECT_URL` set).

---

## 1. Re-run the import (speedruns default to WITH RAMPAGE; existing runs updated)

The import script now:
- Defaults **all speedrun** rows to **with rampage** when the CSV doesn’t specify.
- With `--skip-existing`, when it finds an existing matching log that is a speedrun and not already “with rampage”, it **updates** that log to `rampageInducerUsed: true` instead of skipping.

```bash
pnpm exec tsx scripts/import-skrine-csv/run.ts \
  --csv="/Users/raymiesegars/Downloads/Skrine Records.csv" \
  --source-player-id=17046 \
  --czt-user=cmlvocpbj0006ar6ml9vz7hsm \
  --skip-existing
```

Optional: add `--report=skrine-report.json` to write a report.  
Optional: run once with `--dry-run` to preview.

---

## 2. Fix existing speedrun logs (set all to with rampage)

This updates any speedrun `ChallengeLog` for this user that still has `rampageInducerUsed` not true (e.g. from a previous import before the fix).

```bash
pnpm exec tsx scripts/fix-skrine-user-speedrun-rampage.ts
```

Optional: run with `--dry-run` to list what would be updated.

---

## 3a. Re-unlock achievements (this user only)

Re-evaluates this user’s logs against all active achievements and creates/updates `UserAchievement`. Use after changing logs (e.g. rampage flag).

```bash
BACKFILL_USER_ID=cmlvocpbj0006ar6ml9vz7hsm pnpm db:reunlock-achievements
```

---

## 3b. Recompute verified XP (this user only)

Recalculates `verifiedTotalXp` and sets `verifiedAt` on `UserAchievement` only where the user has verified runs. Run after reunlock.

```bash
BACKFILL_USER_ID=cmlvocpbj0006ar6ml9vz7hsm pnpm db:recompute-verified-xp
```

---

**Summary:**  
1. Import CSV (with rampage default + update existing).  
2. Fix any remaining speedrun logs for this user to with rampage.  
3. Reunlock achievements for this user, then recompute verified XP for this user.
