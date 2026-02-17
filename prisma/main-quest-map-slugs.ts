/**
 * Map slugs that have a real main Easter Egg quest and get a Main Quest placeholder.
 * Maps with only side/musical EEs (e.g. Kino der Toten, Five) are NOT included.
 * Used by seed.ts and seed-easter-eggs.ts.
 */
export const MAIN_QUEST_MAP_SLUGS = new Set([
  // die-rise: no generic placeholder; only High Maintenance (Richtofen) and (Dr. Maxis) show
  // mob-of-the-dead: no generic placeholder; only Pop Goes the Weasel shows
  // buried: no generic placeholder; only Mined Games (Richtofen) and (Maxis) show
  // origins: no generic placeholder; only Little Lost Girl shows
  'shadows-of-evil',
  'der-eisendrache',
  'zetsubou-no-shima',
  'gorod-krovi',
  'revelations',
  'bo3-origins',
  'voyage-of-despair',
  'ix',
  'blood-of-the-dead',
  'classified',
  'dead-of-the-night',
  'ancient-evil',
  'alpha-omega',
  'tag-der-toten',
  'die-maschine',
  'firebase-z',
  'outbreak',
  'mauer-der-toten',
  'forsaken',
  'terminus',
  'liberty-falls',
  'citadelle-des-morts',
  'the-tomb',
  'shattered-veil',
  'reckoning',
  'ashes-of-the-damned',
  'astra-malorum',
  'vandorn-farm',
  'exit-115',
  'zarya-cosmodrome',
]);
