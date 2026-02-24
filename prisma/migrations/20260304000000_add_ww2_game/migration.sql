-- WW2 Zombies: NO_BLITZ, SUPER_30_SPEEDRUN challenge types; ww2ConsumablesUsed on ChallengeLog and EasterEggLog.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'ChallengeType' AND e.enumlabel = 'NO_BLITZ') THEN
    ALTER TYPE "ChallengeType" ADD VALUE 'NO_BLITZ';
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'ChallengeType' AND e.enumlabel = 'SUPER_30_SPEEDRUN') THEN
    ALTER TYPE "ChallengeType" ADD VALUE 'SUPER_30_SPEEDRUN';
  END IF;
END $$;

ALTER TABLE "ChallengeLog" ADD COLUMN IF NOT EXISTS "ww2ConsumablesUsed" BOOLEAN;
ALTER TABLE "EasterEggLog" ADD COLUMN IF NOT EXISTS "ww2ConsumablesUsed" BOOLEAN;
