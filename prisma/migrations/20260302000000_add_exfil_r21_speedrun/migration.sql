-- BOCW: Exfil Round 11 (EXFIL_SPEEDRUN) and Exfil Round 21 (EXFIL_R21_SPEEDRUN) as separate categories.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'ChallengeType' AND e.enumlabel = 'EXFIL_R21_SPEEDRUN') THEN
    ALTER TYPE "ChallengeType" ADD VALUE 'EXFIL_R21_SPEEDRUN';
  END IF;
END $$;
