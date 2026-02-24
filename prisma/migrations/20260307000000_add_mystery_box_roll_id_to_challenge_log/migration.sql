-- Add mysteryBoxRollId to ChallengeLog for co-op mystery box runs
ALTER TABLE "ChallengeLog" ADD COLUMN IF NOT EXISTS "mysteryBoxRollId" TEXT;
