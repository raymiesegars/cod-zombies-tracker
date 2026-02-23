-- Add PURIST to ChallengeType (Purist is a challenge mode, not a difficulty)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'ChallengeType' AND e.enumlabel = 'PURIST') THEN
    ALTER TYPE "ChallengeType" ADD VALUE 'PURIST';
  END IF;
END $$;

-- Remove PURIST from Bo4Difficulty: create new enum, migrate tables, drop old
CREATE TYPE "Bo4Difficulty_new" AS ENUM ('CASUAL', 'NORMAL', 'HARDCORE', 'REALISTIC');

ALTER TABLE "ChallengeLog" ALTER COLUMN "difficulty" TYPE "Bo4Difficulty_new"
  USING (CASE WHEN difficulty::text = 'PURIST' THEN 'NORMAL'::"Bo4Difficulty_new" ELSE difficulty::text::"Bo4Difficulty_new" END);

ALTER TABLE "EasterEggLog" ALTER COLUMN "difficulty" TYPE "Bo4Difficulty_new"
  USING (CASE WHEN difficulty::text = 'PURIST' THEN 'NORMAL'::"Bo4Difficulty_new" ELSE difficulty::text::"Bo4Difficulty_new" END);

ALTER TABLE "Achievement" ALTER COLUMN "difficulty" TYPE "Bo4Difficulty_new"
  USING (CASE WHEN difficulty::text = 'PURIST' THEN 'NORMAL'::"Bo4Difficulty_new" ELSE difficulty::text::"Bo4Difficulty_new" END);

DROP TYPE "Bo4Difficulty";
ALTER TYPE "Bo4Difficulty_new" RENAME TO "Bo4Difficulty";
