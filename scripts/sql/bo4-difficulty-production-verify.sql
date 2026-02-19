-- BO4 Difficulty: Production verification and idempotent backfill
-- Run this AFTER deploying the migration that adds Bo4Difficulty and backfills existing data.
-- Use on a copy of production first if possible.

-- =============================================================================
-- 1. IDEMPOTENT BACKFILL: Set any remaining NULL difficulty to NORMAL for BO4
--    (Safe to run multiple times; only updates rows that are still NULL.)
-- =============================================================================

UPDATE "ChallengeLog"
SET "difficulty" = 'NORMAL'
WHERE "difficulty" IS NULL
  AND "mapId" IN (SELECT m.id FROM "Map" m JOIN "Game" g ON g.id = m."gameId" WHERE g."shortName" = 'BO4');

UPDATE "EasterEggLog"
SET "difficulty" = 'NORMAL'
WHERE "difficulty" IS NULL
  AND "mapId" IN (SELECT m.id FROM "Map" m JOIN "Game" g ON g.id = m."gameId" WHERE g."shortName" = 'BO4');

UPDATE "Achievement"
SET "difficulty" = 'NORMAL'
WHERE "difficulty" IS NULL
  AND "mapId" IN (SELECT m.id FROM "Map" m JOIN "Game" g ON g.id = m."gameId" WHERE g."shortName" = 'BO4');

-- =============================================================================
-- 2. VERIFICATION QUERIES (run and check; no changes)
-- =============================================================================

-- 2a. BO4 ChallengeLogs with NULL difficulty (expect 0)
SELECT 'ChallengeLog BO4 with NULL difficulty' AS check_name, COUNT(*) AS count
FROM "ChallengeLog" c
JOIN "Map" m ON m.id = c."mapId"
JOIN "Game" g ON g.id = m."gameId"
WHERE g."shortName" = 'BO4' AND c."difficulty" IS NULL;

-- 2b. BO4 EasterEggLogs with NULL difficulty (expect 0)
SELECT 'EasterEggLog BO4 with NULL difficulty' AS check_name, COUNT(*) AS count
FROM "EasterEggLog" e
JOIN "Map" m ON m.id = e."mapId"
JOIN "Game" g ON g.id = m."gameId"
WHERE g."shortName" = 'BO4' AND e."difficulty" IS NULL;

-- 2c. BO4 Achievements with NULL difficulty (expect 0)
SELECT 'Achievement BO4 with NULL difficulty' AS check_name, COUNT(*) AS count
FROM "Achievement" a
JOIN "Map" m ON m.id = a."mapId"
JOIN "Game" g ON g.id = m."gameId"
WHERE g."shortName" = 'BO4' AND a."difficulty" IS NULL;

-- 2d. BO4 ChallengeLogs by difficulty (sanity: all NORMAL for existing data)
SELECT 'ChallengeLog BO4 by difficulty' AS check_name, c."difficulty", COUNT(*) AS count
FROM "ChallengeLog" c
JOIN "Map" m ON m.id = c."mapId"
JOIN "Game" g ON g.id = m."gameId"
WHERE g."shortName" = 'BO4'
GROUP BY c."difficulty";

-- 2e. BO4 EasterEggLogs by difficulty
SELECT 'EasterEggLog BO4 by difficulty' AS check_name, e."difficulty", COUNT(*) AS count
FROM "EasterEggLog" e
JOIN "Map" m ON m.id = e."mapId"
JOIN "Game" g ON g.id = m."gameId"
WHERE g."shortName" = 'BO4'
GROUP BY e."difficulty";

-- 2f. BO4 Achievements by difficulty (existing should be NORMAL)
SELECT 'Achievement BO4 by difficulty' AS check_name, a."difficulty", COUNT(*) AS count
FROM "Achievement" a
JOIN "Map" m ON m.id = a."mapId"
JOIN "Game" g ON g.id = m."gameId"
WHERE g."shortName" = 'BO4'
GROUP BY a."difficulty";

-- 2g. Non-BO4 logs/achievements must have NULL difficulty (no impact)
SELECT 'ChallengeLog non-BO4 with non-NULL difficulty (expect 0)' AS check_name, COUNT(*) AS count
FROM "ChallengeLog" c
JOIN "Map" m ON m.id = c."mapId"
JOIN "Game" g ON g.id = m."gameId"
WHERE g."shortName" != 'BO4' AND c."difficulty" IS NOT NULL;

SELECT 'EasterEggLog non-BO4 with non-NULL difficulty (expect 0)' AS check_name, COUNT(*) AS count
FROM "EasterEggLog" e
JOIN "Map" m ON m.id = e."mapId"
JOIN "Game" g ON g.id = m."gameId"
WHERE g."shortName" != 'BO4' AND e."difficulty" IS NOT NULL;

SELECT 'Achievement non-BO4 with non-NULL difficulty (expect 0)' AS check_name, COUNT(*) AS count
FROM "Achievement" a
JOIN "Map" m ON m.id = a."mapId"
JOIN "Game" g ON g.id = m."gameId"
WHERE g."shortName" != 'BO4' AND a."difficulty" IS NOT NULL;

-- =============================================================================
-- Expected results after migration + this script:
-- - All three "NULL difficulty" counts for BO4 should be 0.
-- - BO4 logs/achievements should show NORMAL (and later CASUAL/HARDCORE/REALISTIC as users add them).
-- - Non-BO4 counts with non-NULL difficulty should be 0 (no cross-impact).
-- =============================================================================
