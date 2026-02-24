-- Add lifetime mystery box completions counter (persists when rolls are discarded)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mysteryBoxCompletionsLifetime" INTEGER NOT NULL DEFAULT 0;

-- Backfill from current MysteryBoxCompletion count for existing users
UPDATE "User" u
SET "mysteryBoxCompletionsLifetime" = COALESCE((
  SELECT COUNT(*) FROM "MysteryBoxCompletion" mbc
  WHERE mbc."userId" = u."id"
), 0)
WHERE u."mysteryBoxCompletionsLifetime" = 0;
