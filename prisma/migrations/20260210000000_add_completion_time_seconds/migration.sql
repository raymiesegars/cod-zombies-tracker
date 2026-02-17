-- AlterTable
ALTER TABLE "ChallengeLog" ADD COLUMN IF NOT EXISTS "completionTimeSeconds" INTEGER;

-- AlterTable
ALTER TABLE "EasterEggLog" ADD COLUMN IF NOT EXISTS "completionTimeSeconds" INTEGER;
