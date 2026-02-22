-- Add BO3 AATs toggle, NO_JUG, NO_ATS, ROUND_255_SPEEDRUN, NO_MANS_LAND
-- AlterEnum for ChallengeType (PostgreSQL)
ALTER TYPE "ChallengeType" ADD VALUE 'NO_JUG';
ALTER TYPE "ChallengeType" ADD VALUE 'NO_ATS';
ALTER TYPE "ChallengeType" ADD VALUE 'ROUND_255_SPEEDRUN';
ALTER TYPE "ChallengeType" ADD VALUE 'NO_MANS_LAND';

-- Add bo3AatUsed and killsReached to ChallengeLog
ALTER TABLE "ChallengeLog" ADD COLUMN IF NOT EXISTS "bo3AatUsed" BOOLEAN;
ALTER TABLE "ChallengeLog" ADD COLUMN IF NOT EXISTS "killsReached" INTEGER;
