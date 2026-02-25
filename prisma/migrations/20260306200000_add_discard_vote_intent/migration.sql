-- AlterTable (idempotent: column may exist from old migration order)
ALTER TABLE "MysteryBoxDiscardVote" ADD COLUMN IF NOT EXISTS "intent" TEXT;
