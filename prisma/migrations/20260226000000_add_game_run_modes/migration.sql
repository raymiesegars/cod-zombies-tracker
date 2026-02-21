-- AlterTable: add game-specific run-mode fields to ChallengeLog
ALTER TABLE "ChallengeLog"
  ADD COLUMN IF NOT EXISTS "bo3GobbleGumMode"   TEXT,
  ADD COLUMN IF NOT EXISTS "bo4ElixirMode"       TEXT,
  ADD COLUMN IF NOT EXISTS "bocwSupportMode"     TEXT,
  ADD COLUMN IF NOT EXISTS "bo6GobbleGumMode"    TEXT,
  ADD COLUMN IF NOT EXISTS "bo6SupportMode"      TEXT,
  ADD COLUMN IF NOT EXISTS "bo7SupportMode"      TEXT,
  ADD COLUMN IF NOT EXISTS "bo7IsCursedRun"      BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "bo7RelicsUsed"       TEXT[]  DEFAULT '{}';
