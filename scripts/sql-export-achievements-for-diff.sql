-- Export only achievements that have at least one MODIFIER (any game).
-- Run in Supabase SQL Editor (backup and production), export as CSV, then:
--   pnpm exec tsx scripts/diff-achievement-exports.ts backup.csv production.csv
--
-- Modifier keys (from app): firstRoomVariant, bo3GobbleGumMode, bo4ElixirMode,
-- bocwSupportMode, bo6GobbleGumMode, bo6SupportMode, bo7GobbleGumMode, bo7SupportMode,
-- useFortuneCards, useDirectorsCut, rampageInducerUsed, vanguardVoidUsed.
-- BO4 also uses the difficulty column (NORMAL/HARDCORE/REALISTIC).

SELECT
  a.id,
  a."mapId",
  m.slug AS map_slug,
  g."shortName" AS game,
  a.slug,
  a.name,
  a.type,
  a."isActive",
  a.difficulty,
  a.criteria,
  -- All modifier keys (so we can diff backup vs prod)
  a.criteria->>'firstRoomVariant'    AS first_room_variant,
  a.criteria->>'bo3GobbleGumMode'    AS bo3_gum,
  a.criteria->>'bo4ElixirMode'       AS bo4_elixir,
  a.criteria->>'bocwSupportMode'     AS bocw_support,
  a.criteria->>'bo6GobbleGumMode'    AS bo6_gum,
  a.criteria->>'bo6SupportMode'      AS bo6_support,
  a.criteria->>'bo7GobbleGumMode'    AS bo7_gum,
  a.criteria->>'bo7SupportMode'      AS bo7_support,
  a.criteria->>'useFortuneCards'     AS use_fortune_cards,
  a.criteria->>'useDirectorsCut'     AS use_directors_cut,
  a.criteria->>'rampageInducerUsed'  AS rampage_inducer_used,
  a.criteria->>'vanguardVoidUsed'    AS vanguard_void_used,
  -- Context
  a.criteria->>'challengeType'       AS challenge_type,
  (a.criteria->>'round')::text       AS round,
  (a.criteria->>'maxTimeSeconds')::text AS max_time_seconds
FROM "Achievement" a
LEFT JOIN "Map" m ON m.id = a."mapId"
LEFT JOIN "Game" g ON g.id = m."gameId"
WHERE
  (a.criteria::jsonb) ?| ARRAY[
    'firstRoomVariant', 'bo3GobbleGumMode', 'bo4ElixirMode', 'bocwSupportMode',
    'bo6GobbleGumMode', 'bo6SupportMode', 'bo7GobbleGumMode', 'bo7SupportMode',
    'useFortuneCards', 'useDirectorsCut', 'rampageInducerUsed', 'vanguardVoidUsed'
  ]
  OR a.difficulty IS NOT NULL
ORDER BY g."shortName", m.slug, a.type, a.slug, a.difficulty NULLS LAST;
