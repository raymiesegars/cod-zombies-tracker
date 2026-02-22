-- Add NO_MAGIC challenge type (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'ChallengeType' AND e.enumlabel = 'NO_MAGIC') THEN
    ALTER TYPE "ChallengeType" ADD VALUE 'NO_MAGIC';
  END IF;
END $$;

-- Add BO2 bank/storage toggle for maps with bank (Tranzit, Die Rise, Buried)
ALTER TABLE "ChallengeLog" ADD COLUMN IF NOT EXISTS "bo2BankUsed" BOOLEAN;
