-- WAW Balance Patch: Add new challenge types and run-modifier tags for WaW maps.
-- Safe: only adds new enum values and nullable columns; no data deletion.

-- Add new challenge types for Verruckt First Room variants (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'ChallengeType' AND e.enumlabel = 'STARTING_ROOM_JUG_SIDE') THEN
    ALTER TYPE "ChallengeType" ADD VALUE 'STARTING_ROOM_JUG_SIDE';
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'ChallengeType' AND e.enumlabel = 'STARTING_ROOM_QUICK_SIDE') THEN
    ALTER TYPE "ChallengeType" ADD VALUE 'STARTING_ROOM_QUICK_SIDE';
  END IF;
END $$;

-- Add WaW run-modifier tags (can be combined with any challenge; leaderboard filter support)
ALTER TABLE "ChallengeLog" ADD COLUMN IF NOT EXISTS "wawNoJug" BOOLEAN;
ALTER TABLE "ChallengeLog" ADD COLUMN IF NOT EXISTS "wawFixedWunderwaffe" BOOLEAN;
