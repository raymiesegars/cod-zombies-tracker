-- CreateEnum
CREATE TYPE "Bo4Difficulty" AS ENUM ('CASUAL', 'NORMAL', 'HARDCORE', 'REALISTIC');

-- AlterTable ChallengeLog: add difficulty (nullable)
ALTER TABLE "ChallengeLog" ADD COLUMN "difficulty" "Bo4Difficulty";

-- AlterTable EasterEggLog: add difficulty (nullable)
ALTER TABLE "EasterEggLog" ADD COLUMN "difficulty" "Bo4Difficulty";

-- AlterTable Achievement: add difficulty and change unique constraint
ALTER TABLE "Achievement" ADD COLUMN "difficulty" "Bo4Difficulty";

-- Drop existing unique on Achievement (mapId, slug)
DROP INDEX IF EXISTS "Achievement_mapId_slug_key";

-- Create new unique (mapId, slug, difficulty)
CREATE UNIQUE INDEX "Achievement_mapId_slug_difficulty_key" ON "Achievement"("mapId", "slug", "difficulty");

-- Create indexes for difficulty on ChallengeLog and EasterEggLog
CREATE INDEX "ChallengeLog_difficulty_idx" ON "ChallengeLog"("difficulty");
CREATE INDEX "EasterEggLog_difficulty_idx" ON "EasterEggLog"("difficulty");
CREATE INDEX "Achievement_difficulty_idx" ON "Achievement"("difficulty");

-- Backfill: set BO4 logs and achievements to NORMAL (existing data = Normal difficulty)
UPDATE "ChallengeLog"
SET "difficulty" = 'NORMAL'
WHERE "mapId" IN (SELECT m.id FROM "Map" m JOIN "Game" g ON g.id = m."gameId" WHERE g."shortName" = 'BO4');

UPDATE "EasterEggLog"
SET "difficulty" = 'NORMAL'
WHERE "mapId" IN (SELECT m.id FROM "Map" m JOIN "Game" g ON g.id = m."gameId" WHERE g."shortName" = 'BO4');

UPDATE "Achievement"
SET "difficulty" = 'NORMAL'
WHERE "mapId" IN (SELECT m.id FROM "Map" m JOIN "Game" g ON g.id = m."gameId" WHERE g."shortName" = 'BO4');
