-- Add RUSH, INSTAKILL_ROUND_SPEEDRUN to ChallengeType (PURIST is a difficulty, not challenge type)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'ChallengeType' AND e.enumlabel = 'RUSH') THEN
    ALTER TYPE "ChallengeType" ADD VALUE 'RUSH';
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'ChallengeType' AND e.enumlabel = 'INSTAKILL_ROUND_SPEEDRUN') THEN
    ALTER TYPE "ChallengeType" ADD VALUE 'INSTAKILL_ROUND_SPEEDRUN';
  END IF;
END $$;

-- Add PURIST to Bo4Difficulty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'Bo4Difficulty' AND e.enumlabel = 'PURIST') THEN
    ALTER TYPE "Bo4Difficulty" ADD VALUE 'PURIST';
  END IF;
END $$;

-- Add scoreReached to ChallengeLog (for RUSH challenge, like killsReached for NO_MANS_LAND)
ALTER TABLE "ChallengeLog" ADD COLUMN IF NOT EXISTS "scoreReached" INTEGER;
