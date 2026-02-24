/**
 * Round 5 and Round 15 world record times (seconds) from SRC.
 * CSV source: SRC Round 5 15 WR COD Zombie
 * Format: Record<gameShortName, Record<mapSlug, { r5: number | null; r15: number | null }>>
 */

const min = (m: number, s: number = 0) => m * 60 + s;

export const ROUND_5_15_WR_BY_GAME_MAP: Record<
  string,
  Record<string, { r5: number | null; r15: number | null }>
> = {
  WAW: {
    'nacht-der-untoten': { r5: min(3, 28), r15: min(15, 24) },
    verruckt: { r5: min(2, 54), r15: min(14, 6) },
    'shi-no-numa': { r5: min(3, 16), r15: min(13, 4) },
    'der-riese': { r5: min(2, 51), r15: min(12, 59) },
  },
  BO1: {
    'kino-der-toten': { r5: min(2, 39), r15: min(12, 35) },
    five: { r5: min(2, 54), r15: min(12, 10) },
    ascension: { r5: min(2, 38), r15: min(13, 23) },
    'call-of-the-dead': { r5: min(2, 36), r15: min(18, 53) },
    'shangri-la': { r5: min(2, 51), r15: min(15, 13) },
    moon: { r5: min(3, 23), r15: min(16, 44) },
    'bo1-nacht-der-untoten': { r5: min(3, 10), r15: min(15, 10) },
    'bo1-verruckt': { r5: min(2, 32), r15: min(12, 59) },
    'bo1-shi-no-numa': { r5: min(2, 54), r15: min(14, 24) },
    'bo1-der-riese': { r5: min(2, 36), r15: min(12, 43) },
  },
  BO2: {
    tranzit: { r5: min(2, 31), r15: min(12, 52) },
    'die-rise': { r5: min(2, 25), r15: min(10, 52) },
    'mob-of-the-dead': { r5: min(3, 7), r15: min(14, 52) },
    buried: { r5: min(2, 14), r15: min(11, 50) },
    origins: { r5: min(2, 27), r15: min(13, 12) },
    town: { r5: min(2, 31), r15: min(12, 51) },
    farm: { r5: min(2, 40), r15: min(14, 22) },
    'bus-depot': { r5: min(2, 34), r15: min(14, 9) },
    'nuketown-zombies': { r5: min(2, 59), r15: min(15, 11) },
  },
  AW: {
    'aw-outbreak': { r5: min(2, 38), r15: min(13, 28) },
    'aw-infection': { r5: min(3, 10), r15: min(18, 25) },
    'aw-carrier': { r5: min(2, 40), r15: min(15, 0) },
    'aw-descent': { r5: min(2, 35), r15: min(20, 7) },
  },
  BO3: {
    'shadows-of-evil': { r5: min(2, 28), r15: min(13, 26) },
    'the-giant': { r5: min(2, 39), r15: min(13, 23) },
    'der-eisendrache': { r5: min(2, 30), r15: min(12, 52) },
    'zetsubou-no-shima': { r5: min(2, 11), r15: min(12, 28) },
    'gorod-krovi': { r5: min(2, 45), r15: min(12, 26) },
    revelations: { r5: min(2, 33), r15: min(12, 36) },
    'bo3-nacht-der-untoten': { r5: min(3, 42), r15: min(18, 8) },
    'bo3-verruckt': { r5: min(2, 13), r15: min(12, 41) },
    'bo3-shi-no-numa': { r5: min(2, 36), r15: min(13, 43) },
    'bo3-kino-der-toten': { r5: min(2, 35), r15: min(12, 38) },
    'bo3-ascension': { r5: min(2, 36), r15: min(13, 30) },
    'bo3-shangri-la': { r5: min(2, 30), r15: min(13, 45) },
    'bo3-moon': { r5: min(2, 38), r15: min(12, 42) },
    'bo3-origins': { r5: min(2, 28), r15: min(14, 55) },
  },
  IW: {
    'zombies-in-spaceland': { r5: min(2, 49), r15: min(14, 0) },
    'rave-in-the-redwoods': { r5: min(2, 29), r15: min(11, 59) },
    'shaolin-shuffle': { r5: min(2, 44), r15: min(18, 24) },
    'attack-of-the-radioactive-thing': { r5: min(2, 35), r15: null },
    'the-beast-from-beyond': { r5: min(4, 18), r15: min(16, 59) },
  },
  WW2: {
    'the-final-reich': { r5: min(3, 15), r15: min(13, 42) },
    'the-darkest-shore': { r5: min(3, 37), r15: min(14, 9) },
    'the-shadowed-throne': { r5: min(3, 17), r15: min(13, 40) },
    'the-frozen-dawn': { r5: min(1, 15), r15: min(7, 42) },
    'groesten-haus': { r5: min(2, 49), r15: min(12, 37) },
    'bodega-cervantes': { r5: min(2, 28), r15: min(11, 54) },
    'uss-mount-olympus': { r5: min(2, 36), r15: min(12, 55) },
    'altar-of-blood': { r5: min(2, 37), r15: min(12, 20) },
  },
  BO4: {
    'voyage-of-despair': { r5: min(2, 33), r15: min(14, 35) },
    ix: { r5: min(2, 0), r15: min(10, 32) },
    'blood-of-the-dead': { r5: min(2, 22), r15: min(13, 51) },
    classified: { r5: min(2, 26), r15: min(11, 58) },
    'dead-of-the-night': { r5: min(1, 43), r15: min(10, 46) },
    'ancient-evil': { r5: min(1, 56), r15: min(12, 11) },
    'alpha-omega': { r5: min(2, 14), r15: min(12, 57) },
    'tag-der-toten': { r5: min(2, 9), r15: min(10, 57) },
  },
  BOCW: {
    'die-maschine': { r5: min(1, 37), r15: min(9, 55) },
    'firebase-z': { r5: min(2, 2), r15: min(11, 42) },
    'mauer-der-toten': { r5: min(1, 58), r15: min(9, 31) },
    forsaken: { r5: min(0, 56), r15: min(5, 9) },
  },
  VANGUARD: {
    'shi-no-numa-reborn': { r5: min(3, 18), r15: min(14, 43) },
    'the-archon': { r5: min(2, 54), r15: null },
  },
  BO6: {
    'liberty-falls': { r5: min(2, 25), r15: min(14, 11) },
    terminus: { r5: min(2, 37), r15: min(19, 38) },
    'citadelle-des-morts': { r5: min(2, 49), r15: null },
    'the-tomb': { r5: min(3, 39), r15: null },
    'shattered-veil': { r5: min(3, 42), r15: null },
    reckoning: { r5: min(3, 1), r15: null },
  },
  BO7: {
    'ashes-of-the-damned': { r5: min(3, 6), r15: null },
    'astra-malorum': { r5: null, r15: null },
    'vandorn-farm': { r5: min(2, 54), r15: null },
    'exit-115': { r5: min(2, 51), r15: null },
    'zarya-cosmodrome': { r5: min(3, 22), r15: min(10, 38) },
    mars: { r5: null, r15: null },
  },
};

/** Build R5/R15 speedrun tiers from WR data. Returns empty object if no WR for this map. */
export function getR5R15TiersForMap(
  gameShortName: string,
  mapSlug: string
): { ROUND_5_SPEEDRUN?: { maxTimeSeconds: number; xpReward: number }[]; ROUND_15_SPEEDRUN?: { maxTimeSeconds: number; xpReward: number }[] } {
  const buf = 1.2;
  const tier = (sec: number, xpScale: number = 1) => [
    { maxTimeSeconds: Math.round(sec * buf * 1.5), xpReward: Math.round(60 * xpScale) },
    { maxTimeSeconds: Math.round(sec * buf * 1.2), xpReward: Math.round(150 * xpScale) },
    { maxTimeSeconds: Math.round(sec * buf), xpReward: Math.round(400 * xpScale) },
    { maxTimeSeconds: Math.round(sec * 1.05), xpReward: Math.round(1000 * xpScale) },
  ];
  const byGame = ROUND_5_15_WR_BY_GAME_MAP[gameShortName];
  if (!byGame) return {};
  const wr = byGame[mapSlug];
  if (!wr) return {};
  const result: { ROUND_5_SPEEDRUN?: { maxTimeSeconds: number; xpReward: number }[]; ROUND_15_SPEEDRUN?: { maxTimeSeconds: number; xpReward: number }[] } = {};
  if (wr.r5 != null) result.ROUND_5_SPEEDRUN = tier(wr.r5);
  if (wr.r15 != null) result.ROUND_15_SPEEDRUN = tier(wr.r15);
  return result;
}
