-- Safe backfill: grant ROUND_MILESTONE and CHALLENGE_COMPLETE achievements based on max round
-- from ANY challenge type (not just HIGHEST_ROUND). Run in Supabase SQL Editor against production.
-- Idempotent: only inserts missing UserAchievement rows, never deletes.

BEGIN;

-- 1. Insert new achievements and update totalXp in one statement
WITH challenge_rounds AS (
  SELECT "userId", "mapId", "roundReached" AS r FROM "ChallengeLog"
),
ee_rounds AS (
  SELECT "userId", "mapId", "roundCompleted"::int AS r
  FROM "EasterEggLog"
  WHERE "roundCompleted" IS NOT NULL
),
all_rounds AS (
  SELECT * FROM challenge_rounds
  UNION ALL
  SELECT * FROM ee_rounds
),
user_map_max AS (
  SELECT "userId", "mapId", MAX(r) AS max_round
  FROM all_rounds
  GROUP BY "userId", "mapId"
),

round_milestone_to_insert AS (
  SELECT DISTINCT u."userId", a.id AS "achievementId", a."xpReward"
  FROM user_map_max u
  JOIN "Achievement" a ON a."mapId" = u."mapId"
    AND a.type = 'ROUND_MILESTONE'
    AND a."isActive" = true
  LEFT JOIN "Map" m ON m.id = u."mapId"
  WHERE (
    ((a.criteria->>'isCap') IS NOT NULL AND (a.criteria->>'isCap')::text = 'true' AND m."roundCap" IS NOT NULL
      AND u.max_round >= COALESCE((m."roundCap")::int, 0))
    OR
    ((a.criteria->>'isCap') IS NULL OR (a.criteria->>'isCap')::text != 'true')
      AND (a.criteria->>'round') IS NOT NULL
      AND (a.criteria->>'round') ~ '^\d+$'
      AND u.max_round >= (a.criteria->>'round')::int
  )
  AND NOT EXISTS (
    SELECT 1 FROM "UserAchievement" ua
    WHERE ua."userId" = u."userId" AND ua."achievementId" = a.id
  )
),

challenge_complete_to_insert AS (
  SELECT DISTINCT cl."userId", a.id AS "achievementId", a."xpReward"
  FROM "ChallengeLog" cl
  JOIN "Challenge" c ON c.id = cl."challengeId"
  JOIN "Achievement" a ON a."mapId" = cl."mapId"
    AND a.type = 'CHALLENGE_COMPLETE'
    AND a."isActive" = true
    AND (a.criteria->>'challengeType') = c.type::text
  LEFT JOIN "Map" m ON m.id = cl."mapId"
  WHERE (
    ((a.criteria->>'isCap') IS NOT NULL AND (a.criteria->>'isCap')::text = 'true' AND m."roundCap" IS NOT NULL
      AND cl."roundReached" >= COALESCE((m."roundCap")::int, 0))
    OR
    ((a.criteria->>'round') IS NOT NULL AND (a.criteria->>'round') ~ '^\d+$'
      AND (COALESCE((a.criteria->>'isCap')::text, '') != 'true')
      AND cl."roundReached" >= (a.criteria->>'round')::int)
  )
  AND NOT EXISTS (
    SELECT 1 FROM "UserAchievement" ua
    WHERE ua."userId" = cl."userId" AND ua."achievementId" = a.id
  )
),

all_to_insert AS (
  SELECT * FROM round_milestone_to_insert
  UNION
  SELECT * FROM challenge_complete_to_insert
),

ins AS (
  INSERT INTO "UserAchievement" (id, "userId", "achievementId")
  SELECT gen_random_uuid()::text, "userId", "achievementId"
  FROM all_to_insert
  RETURNING "userId", "achievementId"
),

xp_to_add AS (
  SELECT ins."userId", SUM(a."xpReward")::int AS total_xp
  FROM ins
  JOIN "Achievement" a ON a.id = ins."achievementId"
  GROUP BY ins."userId"
)

UPDATE "User" u
SET "totalXp" = u."totalXp" + x.total_xp
FROM xp_to_add x
WHERE u.id = x."userId";

-- 2. Recalculate level for all users (safe; mirrors getLevelFromXp)
UPDATE "User"
SET level = CASE
  WHEN "totalXp" >= 1850000 THEN 20
  WHEN "totalXp" >= 1550000 THEN 19
  WHEN "totalXp" >= 1290000 THEN 18
  WHEN "totalXp" >= 1070000 THEN 17
  WHEN "totalXp" >= 880000 THEN 16
  WHEN "totalXp" >= 720000 THEN 15
  WHEN "totalXp" >= 590000 THEN 14
  WHEN "totalXp" >= 480000 THEN 13
  WHEN "totalXp" >= 385000 THEN 12
  WHEN "totalXp" >= 305000 THEN 11
  WHEN "totalXp" >= 235000 THEN 10
  WHEN "totalXp" >= 175000 THEN 9
  WHEN "totalXp" >= 125000 THEN 8
  WHEN "totalXp" >= 85000 THEN 7
  WHEN "totalXp" >= 55000 THEN 6
  WHEN "totalXp" >= 32000 THEN 5
  WHEN "totalXp" >= 17000 THEN 4
  WHEN "totalXp" >= 7500 THEN 3
  WHEN "totalXp" >= 2500 THEN 2
  ELSE 1
END;

COMMIT;
