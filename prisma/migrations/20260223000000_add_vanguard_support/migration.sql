-- Vanguard Zombies: vanguardVoidUsed (Der Anfang, Terra Maledicta only), EXFIL_R5/R10/R20_SPEEDRUN challenge types.
-- vanguardVoidUsed: true = With Void (default), false = Without Void. Leaderboard filter for der-anfang and terra-maledicta only.
ALTER TABLE "ChallengeLog"
  ADD COLUMN IF NOT EXISTS "vanguardVoidUsed" BOOLEAN;

ALTER TABLE "EasterEggLog"
  ADD COLUMN IF NOT EXISTS "vanguardVoidUsed" BOOLEAN;

-- New challenge types for Vanguard exfil speedruns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'ChallengeType' AND e.enumlabel = 'EXFIL_R5_SPEEDRUN') THEN
    ALTER TYPE "ChallengeType" ADD VALUE 'EXFIL_R5_SPEEDRUN';
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'ChallengeType' AND e.enumlabel = 'EXFIL_R10_SPEEDRUN') THEN
    ALTER TYPE "ChallengeType" ADD VALUE 'EXFIL_R10_SPEEDRUN';
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'ChallengeType' AND e.enumlabel = 'EXFIL_R20_SPEEDRUN') THEN
    ALTER TYPE "ChallengeType" ADD VALUE 'EXFIL_R20_SPEEDRUN';
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'ChallengeType' AND e.enumlabel = 'NO_JUG_NO_ARMOR') THEN
    ALTER TYPE "ChallengeType" ADD VALUE 'NO_JUG_NO_ARMOR';
  END IF;
END $$;
