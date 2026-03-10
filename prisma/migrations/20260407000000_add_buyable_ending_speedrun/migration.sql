-- Add BUYABLE_ENDING_SPEEDRUN for BO3 Custom Zombies maps with buyable endings
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'ChallengeType' AND e.enumlabel = 'BUYABLE_ENDING_SPEEDRUN') THEN
    ALTER TYPE "ChallengeType" ADD VALUE 'BUYABLE_ENDING_SPEEDRUN';
  END IF;
END
$$;
