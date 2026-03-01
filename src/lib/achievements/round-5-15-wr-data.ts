/**
 * Round 5 and Round 15 world record times (seconds) from SRC.
 * CSV source: SRC Round 5 15 WR COD Zombie
 * Format: Record<gameShortName, Record<mapSlug, { r5: number | null; r15: number | null }>>
 * Hardest tier uses 4% rule (4% slower than WR). Inlined here so this file stays browser-safe
 * (number-ones-loader uses Node fs and is only for seed/scripts).
 */
const min = (m: number, s: number = 0) => m * 60 + s;

/** 4% rule: achievement time = WR * 1.04 (same as number-ones-loader, inlined for browser). */
function timeWRToAchievementSeconds(sec: number): number {
  return Math.round(sec * 1.04);
}

/** Megas = with gums/rampage; Restricted = classic gums (BO3), classic elixirs (BO4), or no rampage (BOCW/BO6/BO7/Vanguard). */
export const ROUND_5_15_WR_BY_GAME_MAP: Record<
  string,
  Record<string, { r5: number | null; r15: number | null; r5NoRampage?: number | null; r15NoRampage?: number | null; r5Restricted?: number | null; r15Restricted?: number | null }>
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
    'shadows-of-evil': { r5: min(2, 28), r15: min(13, 26), r5Restricted: Math.round(min(2, 28) * 1.12), r15Restricted: Math.round(min(13, 26) * 1.12) },
    'the-giant': { r5: min(2, 39), r15: min(13, 23), r5Restricted: Math.round(min(2, 39) * 1.12), r15Restricted: Math.round(min(13, 23) * 1.12) },
    'der-eisendrache': { r5: min(2, 30), r15: min(12, 52), r5Restricted: Math.round(min(2, 30) * 1.12), r15Restricted: Math.round(min(12, 52) * 1.12) },
    'zetsubou-no-shima': { r5: min(2, 11), r15: min(12, 28), r5Restricted: Math.round(min(2, 11) * 1.12), r15Restricted: Math.round(min(12, 28) * 1.12) },
    'gorod-krovi': { r5: min(2, 45), r15: min(12, 26), r5Restricted: Math.round(min(2, 45) * 1.12), r15Restricted: Math.round(min(12, 26) * 1.12) },
    revelations: { r5: min(2, 33), r15: min(12, 36), r5Restricted: Math.round(min(2, 33) * 1.12), r15Restricted: Math.round(min(12, 36) * 1.12) },
    'bo3-nacht-der-untoten': { r5: min(3, 42), r15: min(18, 8), r5Restricted: Math.round(min(3, 42) * 1.12), r15Restricted: Math.round(min(18, 8) * 1.12) },
    'bo3-verruckt': { r5: min(2, 13), r15: min(12, 41), r5Restricted: Math.round(min(2, 13) * 1.12), r15Restricted: Math.round(min(12, 41) * 1.12) },
    'bo3-shi-no-numa': { r5: min(2, 36), r15: min(13, 43), r5Restricted: Math.round(min(2, 36) * 1.12), r15Restricted: Math.round(min(13, 43) * 1.12) },
    'bo3-kino-der-toten': { r5: min(2, 35), r15: min(12, 38), r5Restricted: Math.round(min(2, 35) * 1.12), r15Restricted: Math.round(min(12, 38) * 1.12) },
    'bo3-ascension': { r5: min(2, 36), r15: min(13, 30), r5Restricted: Math.round(min(2, 36) * 1.12), r15Restricted: Math.round(min(13, 30) * 1.12) },
    'bo3-shangri-la': { r5: min(2, 30), r15: min(13, 45), r5Restricted: Math.round(min(2, 30) * 1.12), r15Restricted: Math.round(min(13, 45) * 1.12) },
    'bo3-moon': { r5: min(2, 38), r15: min(12, 42), r5Restricted: Math.round(min(2, 38) * 1.12), r15Restricted: Math.round(min(12, 42) * 1.12) },
    'bo3-origins': { r5: min(2, 28), r15: min(14, 55), r5Restricted: Math.round(min(2, 28) * 1.12), r15Restricted: Math.round(min(14, 55) * 1.12) },
  },
  IW: {
    'zombies-in-spaceland': { r5: min(2, 49), r15: min(14, 0) },
    'rave-in-the-redwoods': { r5: min(2, 29), r15: min(11, 59) },
    'shaolin-shuffle': { r5: min(2, 44), r15: min(18, 24) },
    'attack-of-the-radioactive-thing': { r5: min(2, 35), r15: min(12, 50) }, // WR 12:50
    'the-beast-from-beyond': { r5: min(4, 18), r15: min(16, 59) },
  },
  WW2: {
    'the-final-reich': { r5: min(3, 15), r15: min(13, 42) },
    'the-darkest-shore': { r5: min(3, 37), r15: min(14, 9) },
    'the-shadowed-throne': { r5: min(3, 17), r15: min(13, 40) },
    'the-frozen-dawn': { r5: min(1, 15), r15: min(7, 42) },
    'groesten-haus': { r5: min(2, 33), r15: min(11, 6) }, // WR 2:33, 11:06
    'bodega-cervantes': { r5: min(2, 28), r15: min(11, 54) },
    'uss-mount-olympus': { r5: min(2, 36), r15: min(12, 55) },
    'altar-of-blood': { r5: min(2, 37), r15: min(12, 20) },
  },
  BO4: {
    'voyage-of-despair': { r5: min(2, 33), r15: min(14, 35), r5Restricted: Math.round(min(2, 33) * 1.12), r15Restricted: Math.round(min(14, 35) * 1.12) },
    ix: { r5: min(2, 0), r15: min(10, 32), r5Restricted: Math.round(min(2, 0) * 1.12), r15Restricted: Math.round(min(10, 32) * 1.12) },
    'blood-of-the-dead': { r5: min(2, 22), r15: min(13, 51), r5Restricted: Math.round(min(2, 22) * 1.12), r15Restricted: Math.round(min(13, 51) * 1.12) },
    classified: { r5: min(2, 26), r15: min(11, 58), r5Restricted: Math.round(min(2, 26) * 1.12), r15Restricted: Math.round(min(11, 58) * 1.12) },
    'dead-of-the-night': { r5: min(1, 43), r15: min(10, 46), r5Restricted: Math.round(min(1, 43) * 1.12), r15Restricted: Math.round(min(10, 46) * 1.12) },
    'ancient-evil': { r5: min(1, 56), r15: min(12, 11), r5Restricted: Math.round(min(1, 56) * 1.12), r15Restricted: Math.round(min(12, 11) * 1.12) },
    'alpha-omega': { r5: min(2, 14), r15: min(12, 57), r5Restricted: Math.round(min(2, 14) * 1.12), r15Restricted: Math.round(min(12, 57) * 1.12) },
    'tag-der-toten': { r5: min(2, 9), r15: min(10, 57), r5Restricted: Math.round(min(2, 9) * 1.12), r15Restricted: Math.round(min(10, 57) * 1.12) },
  },
  BOCW: {
    'die-maschine': { r5: min(1, 37), r15: min(9, 55), r5NoRampage: Math.round(min(1, 37) * 1.12), r15NoRampage: Math.round(min(9, 55) * 1.12) },
    'firebase-z': { r5: min(2, 2), r15: min(11, 42), r5NoRampage: Math.round(min(2, 2) * 1.12), r15NoRampage: Math.round(min(11, 42) * 1.12) },
    'mauer-der-toten': { r5: min(1, 58), r15: min(9, 31), r5NoRampage: Math.round(min(1, 58) * 1.12), r15NoRampage: Math.round(min(9, 31) * 1.12) },
    forsaken: { r5: min(0, 56), r15: min(5, 9), r5NoRampage: Math.round(min(0, 56) * 1.12), r15NoRampage: Math.round(min(5, 9) * 1.12) },
  },
  VANGUARD: {
    'shi-no-numa-reborn': { r5: min(3, 18), r15: min(14, 43), r5NoRampage: Math.round(min(3, 18) * 1.12), r15NoRampage: Math.round(min(14, 43) * 1.12) },
    'the-archon': { r5: min(2, 54), r15: min(5, 53), r5NoRampage: Math.round(min(2, 54) * 1.12), r15NoRampage: Math.round(min(5, 53) * 1.12) }, // WR 5:53 megas
  },
  BO6: {
    'liberty-falls': { r5: min(2, 25), r15: min(14, 11), r5NoRampage: Math.round(min(2, 25) * 1.12), r15NoRampage: Math.round(min(14, 11) * 1.12) },
    terminus: { r5: min(2, 37), r15: min(19, 38), r5NoRampage: Math.round(min(2, 37) * 1.12), r15NoRampage: Math.round(min(19, 38) * 1.12) },
    'citadelle-des-morts': { r5: min(2, 49), r15: min(9, 48), r5NoRampage: Math.round(min(2, 49) * 1.12), r15NoRampage: Math.round(min(9, 48) * 1.12) },
    'the-tomb': { r5: min(3, 39), r15: min(10, 3), r5NoRampage: Math.round(min(3, 39) * 1.12), r15NoRampage: Math.round(min(10, 3) * 1.12) },
    'shattered-veil': { r5: min(3, 42), r15: min(9, 15), r5NoRampage: Math.round(min(3, 42) * 1.12), r15NoRampage: Math.round(min(9, 15) * 1.12) },
    reckoning: { r5: min(3, 1), r15: min(9, 42), r5NoRampage: Math.round(min(3, 1) * 1.12), r15NoRampage: Math.round(min(9, 42) * 1.12) },
  },
  BO7: {
    'ashes-of-the-damned': { r5: min(3, 6), r15: min(10, 44), r5NoRampage: Math.round(min(3, 6) * 1.15), r15NoRampage: Math.round(min(10, 44) * 1.15) },   // WR 10:44 megas; no-rampage ~15% slower
    'astra-malorum': { r5: min(2, 19), r15: min(11, 45), r5NoRampage: Math.round(min(2, 19) * 1.15), r15NoRampage: Math.round(min(11, 45) * 1.15) },
    'vandorn-farm': { r5: min(2, 54), r15: min(10, 35), r5NoRampage: Math.round(min(2, 54) * 1.15), r15NoRampage: Math.round(min(10, 35) * 1.15) },
    'exit-115': { r5: min(2, 51), r15: min(11, 35), r5NoRampage: Math.round(min(2, 51) * 1.15), r15NoRampage: Math.round(min(11, 35) * 1.15) },
    'zarya-cosmodrome': { r5: min(3, 22), r15: min(10, 38), r5NoRampage: Math.round(min(3, 22) * 1.15), r15NoRampage: Math.round(min(10, 38) * 1.15) },
    mars: { r5: min(2, 20), r15: min(11, 50), r5NoRampage: Math.round(min(2, 20) * 1.15), r15NoRampage: Math.round(min(11, 50) * 1.15) },
  },
};

/** Get R5 or R15 WR time in seconds for speedrun config. variant 'megas' = all elixirs/gums/rampage; 'restricted' = classic (BO3/BO4) or no rampage (BOCW/BO6/BO7/Vanguard). */
export function getR5R15WRSeconds(
  gameShortName: string,
  mapSlug: string,
  type: 'r5' | 'r15',
  variant: 'megas' | 'restricted'
): number | null {
  const byGame = ROUND_5_15_WR_BY_GAME_MAP[gameShortName];
  if (!byGame) return null;
  const wr = byGame[mapSlug];
  if (!wr) return null;
  if (variant === 'restricted') {
    const restricted = type === 'r5' ? wr.r5Restricted : wr.r15Restricted;
    if (restricted != null && restricted > 0) return restricted;
    const noRamp = type === 'r5' ? wr.r5NoRampage : wr.r15NoRampage;
    if (noRamp != null && noRamp > 0) return noRamp;
  }
  const val = type === 'r5' ? wr.r5 : wr.r15;
  return val != null && val > 0 ? val : null;
}

/** Build R5/R15 speedrun tiers from WR data. Hardest tier = 4% slower than WR. Returns empty object if no WR for this map. */
export function getR5R15TiersForMap(
  gameShortName: string,
  mapSlug: string
): { ROUND_5_SPEEDRUN?: { maxTimeSeconds: number; xpReward: number }[]; ROUND_15_SPEEDRUN?: { maxTimeSeconds: number; xpReward: number }[] } {
  const buf = 1.2;
  const tier = (sec: number, xpScale: number = 1) => [
    { maxTimeSeconds: Math.round(sec * buf * 1.5), xpReward: Math.round(60 * xpScale) },
    { maxTimeSeconds: Math.round(sec * buf * 1.2), xpReward: Math.round(150 * xpScale) },
    { maxTimeSeconds: Math.round(sec * buf), xpReward: Math.round(400 * xpScale) },
    { maxTimeSeconds: timeWRToAchievementSeconds(sec), xpReward: Math.round(1000 * xpScale) },
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
