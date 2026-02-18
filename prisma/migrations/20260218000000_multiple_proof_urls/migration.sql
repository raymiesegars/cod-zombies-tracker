-- Add proofUrls array to ChallengeLog and EasterEggLog; backfill from proofUrl; drop proofUrl and proofType.

-- ChallengeLog: add column, backfill, drop old columns
ALTER TABLE "ChallengeLog" ADD COLUMN IF NOT EXISTS "proofUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];

UPDATE "ChallengeLog"
SET "proofUrls" = ARRAY["proofUrl"]::TEXT[]
WHERE "proofUrl" IS NOT NULL AND "proofUrl" != '';

ALTER TABLE "ChallengeLog" DROP COLUMN IF EXISTS "proofUrl";
ALTER TABLE "ChallengeLog" DROP COLUMN IF EXISTS "proofType";

-- EasterEggLog: add column, backfill, drop old columns
ALTER TABLE "EasterEggLog" ADD COLUMN IF NOT EXISTS "proofUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];

UPDATE "EasterEggLog"
SET "proofUrls" = ARRAY["proofUrl"]::TEXT[]
WHERE "proofUrl" IS NOT NULL AND "proofUrl" != '';

ALTER TABLE "EasterEggLog" DROP COLUMN IF EXISTS "proofUrl";
ALTER TABLE "EasterEggLog" DROP COLUMN IF EXISTS "proofType";

-- Drop ProofType enum (no longer used)
DROP TYPE IF EXISTS "ProofType";
