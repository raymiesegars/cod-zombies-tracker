-- First room variant, game order, AW DLC, speedrun seconds
-- Safe: adds column, updates existing data; no truncation.

-- 1. Add firstRoomVariant to ChallengeLog (for Verrückt, Buried, AW Carrier)
ALTER TABLE "ChallengeLog" ADD COLUMN IF NOT EXISTS "firstRoomVariant" TEXT;

-- 2. Standardize game order: WAW, BO1, BO2, AW, BO3, IW, WW2, BO4, BOCW, VG, BO6, BO7
UPDATE "Game" SET "order" = 1 WHERE "shortName" = 'WAW';
UPDATE "Game" SET "order" = 2 WHERE "shortName" = 'BO1';
UPDATE "Game" SET "order" = 3 WHERE "shortName" = 'BO2';
UPDATE "Game" SET "order" = 4 WHERE "shortName" = 'AW';
UPDATE "Game" SET "order" = 5 WHERE "shortName" = 'BO3';
UPDATE "Game" SET "order" = 6 WHERE "shortName" = 'IW';
UPDATE "Game" SET "order" = 7 WHERE "shortName" = 'WW2';
UPDATE "Game" SET "order" = 8 WHERE "shortName" = 'BO4';
UPDATE "Game" SET "order" = 9 WHERE "shortName" = 'BOCW';
UPDATE "Game" SET "order" = 10 WHERE "shortName" = 'VANGUARD';
UPDATE "Game" SET "order" = 11 WHERE "shortName" = 'BO6';
UPDATE "Game" SET "order" = 12 WHERE "shortName" = 'BO7';

-- 3. All AW maps are DLC
UPDATE "Map" SET "isDlc" = true
WHERE slug IN ('aw-outbreak', 'aw-infection', 'aw-carrier', 'aw-descent');
