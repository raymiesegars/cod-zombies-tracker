-- BO6/BO7: Round 999 cap speedrun category.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'ChallengeType' AND e.enumlabel = 'ROUND_999_SPEEDRUN') THEN
    ALTER TYPE "ChallengeType" ADD VALUE 'ROUND_999_SPEEDRUN';
  END IF;
END $$;
