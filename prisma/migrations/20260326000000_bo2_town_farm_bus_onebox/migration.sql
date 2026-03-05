-- BO2 Town: set firstRoomVariant = 'CLASSIC' for existing STARTING_ROOM logs (new variants: Classic | Semtext Area)
UPDATE "ChallengeLog"
SET "firstRoomVariant" = 'CLASSIC'
WHERE "firstRoomVariant" IS NULL
  AND "mapId" IN (SELECT id FROM "Map" WHERE slug = 'town')
  AND "challengeId" IN (SELECT id FROM "Challenge" WHERE type = 'STARTING_ROOM');

-- BO2 Farm: no Pack-a-Punch on map — disable NO_PACK challenge and deactivate achievements (keeps UserAchievement FK intact)
UPDATE "Challenge" SET "isActive" = false
WHERE "mapId" IN (SELECT id FROM "Map" WHERE slug = 'farm') AND type = 'NO_PACK';

UPDATE "Achievement" SET "isActive" = false
WHERE "mapId" IN (SELECT id FROM "Map" WHERE slug = 'farm')
  AND (criteria->>'challengeType') = 'NO_PACK';

-- BO2 Bus Depot: no perks or Pack-a-Punch — disable NO_PERKS and NO_PACK challenges and deactivate achievements
UPDATE "Challenge" SET "isActive" = false
WHERE "mapId" IN (SELECT id FROM "Map" WHERE slug = 'bus-depot') AND type IN ('NO_PERKS', 'NO_PACK');

UPDATE "Achievement" SET "isActive" = false
WHERE "mapId" IN (SELECT id FROM "Map" WHERE slug = 'bus-depot')
  AND (criteria->>'challengeType') IN ('NO_PERKS', 'NO_PACK');
