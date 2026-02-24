-- Add Round 5 and Round 15 speedrun categories (SRC Round 5 15 WR data).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'ChallengeType' AND e.enumlabel = 'ROUND_5_SPEEDRUN') THEN
    ALTER TYPE "ChallengeType" ADD VALUE 'ROUND_5_SPEEDRUN';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'ChallengeType' AND e.enumlabel = 'ROUND_15_SPEEDRUN') THEN
    ALTER TYPE "ChallengeType" ADD VALUE 'ROUND_15_SPEEDRUN';
  END IF;
END $$;
