-- Main-quest Easter eggs by XP reward (highest to lowest)
SELECT
  ee.name AS easter_egg,
  m.name AS map_name,
  ee."xpReward" AS xp
FROM "EasterEgg" ee
JOIN "Map" m ON m.id = ee."mapId"
WHERE ee.type = 'MAIN_QUEST'
  AND ee."isActive" = true
ORDER BY ee."xpReward" DESC;
