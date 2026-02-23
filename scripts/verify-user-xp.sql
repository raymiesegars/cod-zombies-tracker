-- Verify XP for a user (e.g. displayName = 'Raymie')
-- Run: psql "$DATABASE_URL" -f scripts/verify-user-xp.sql
-- Or copy queries below and replace 'Raymie' in your DB client (TablePlus, pgAdmin, etc.)

-- ========== 1. User summary + run counts ==========
SELECT
  u.id,
  u.username,
  u."displayName",
  u."totalXp" AS stored_total_xp,
  u."verifiedTotalXp" AS stored_verified_xp,
  (SELECT COUNT(*) FROM "ChallengeLog" cl WHERE cl."userId" = u.id) AS challenge_runs,
  (SELECT COUNT(*) FROM "ChallengeLog" cl WHERE cl."userId" = u.id AND cl."isVerified" = true) AS verified_challenge_runs,
  (SELECT COUNT(*) FROM "EasterEggLog" eel WHERE eel."userId" = u.id) AS ee_runs,
  (SELECT COUNT(*) FROM "EasterEggLog" eel WHERE eel."userId" = u.id AND eel."isVerified" = true) AS verified_ee_runs
FROM "User" u
WHERE u."displayName" ILIKE 'Raymie'
   OR u.username ILIKE 'Raymie';

-- ========== 2. Computed XP (should match stored totalXp) ==========
WITH target AS (
  SELECT id FROM "User"
  WHERE "displayName" ILIKE 'Raymie' OR username ILIKE 'Raymie'
  LIMIT 1
)
SELECT
  COALESCE(SUM(a."xpReward"), 0) AS computed_total_xp,
  COUNT(*) AS achievement_count,
  COALESCE(SUM(CASE WHEN ua."verifiedAt" IS NOT NULL THEN a."xpReward" ELSE 0 END), 0) AS computed_verified_xp,
  COUNT(CASE WHEN ua."verifiedAt" IS NOT NULL THEN 1 END) AS verified_achievement_count
FROM "UserAchievement" ua
JOIN "Achievement" a ON a.id = ua."achievementId"
WHERE ua."userId" = (SELECT id FROM target)
  AND a."isActive" = true;

-- ========== 3. XP breakdown by map (top 15) ==========
WITH target AS (
  SELECT id FROM "User"
  WHERE "displayName" ILIKE 'Raymie' OR username ILIKE 'Raymie'
  LIMIT 1
)
SELECT
  COALESCE(m.name, '(global)') AS map_name,
  COUNT(*) AS achievements,
  SUM(a."xpReward") AS xp_from_map,
  COUNT(CASE WHEN ua."verifiedAt" IS NOT NULL THEN 1 END) AS verified_count
FROM "UserAchievement" ua
JOIN "Achievement" a ON a.id = ua."achievementId"
LEFT JOIN "Map" m ON m.id = a."mapId"
WHERE ua."userId" = (SELECT id FROM target)
  AND a."isActive" = true
GROUP BY m.id, m.name
ORDER BY SUM(a."xpReward") DESC
LIMIT 15;
