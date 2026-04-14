#!/usr/bin/env bash
set -euo pipefail

GAMES="${GAMES:-WAW,BO1,BO2,WW2}"
TS="$(date +%Y%m%d-%H%M%S)"
LOG_DIR="${LOG_DIR:-scripts/logs}"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/speedrun-xp-doubling-$TS.log"

echo "Starting speedrun XP doubling backfill..."
echo "Games: $GAMES"
echo "Log: $LOG_FILE"

{
  echo "=== $(date) :: DRY RUN PRECHECK ==="
  pnpm exec tsx scripts/double-speedrun-xp-selected-games.ts --dry-run --games="$GAMES"

  echo
  echo "=== $(date) :: APPLY XP DOUBLING ==="
  pnpm exec tsx scripts/double-speedrun-xp-selected-games.ts --apply --games="$GAMES"

  echo
  echo "=== $(date) :: REUNLOCK ACHIEVEMENTS (SCOPED GAMES) ==="
  BACKFILL_GAMES="$GAMES" pnpm db:reunlock-achievements

  echo
  echo "=== $(date) :: RECOMPUTE VERIFIED XP (SCOPED GAMES) ==="
  BACKFILL_GAMES="$GAMES" pnpm db:recompute-verified-xp

  echo
  echo "=== $(date) :: POST-RUN DRY CHECK ==="
  pnpm exec tsx scripts/double-speedrun-xp-selected-games.ts --dry-run --games="$GAMES" --sample-limit=5
} | tee "$LOG_FILE"

echo "Completed. Full output: $LOG_FILE"
