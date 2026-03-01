/**
 * World-record to achievement tiers. Uses number_ones.json for WR data, applies 4% rule,
 * and infers from same-game when data is missing. Used by seed-achievements only (Node).
 */

import {
  loadNumberOnes,
  getSoloWR,
  getAllSoloWRs,
  parseAchieved,
  roundWRToAchievementRound,
  timeWRToAchievementSeconds,
} from './number-ones-loader';

/** CZT map slug -> number_ones map slug per game (only where they differ). */
const CZT_TO_NO_MAP: Record<string, Record<string, string>> = {
  BO3: {
    'bo3-nacht-der-untoten': 'nacht-der-untoten',
    'bo3-verruckt': 'verruckt',
    'bo3-shi-no-numa': 'shi-no-numa',
    'bo3-kino-der-toten': 'kino-der-toten',
    'bo3-ascension': 'ascension',
    'bo3-shangri-la': 'shangri-la',
    'bo3-moon': 'moon',
    'bo3-origins': 'origins',
  },
  BOCW: {
    'firebase-z': 'firebase',
  },
  BO7: {
    'vandorn-farm': 'bo7-farm',
  },
  IW: {
    'zombies-in-spaceland': 'spaceland',
    'the-beast-from-beyond': 'beast-from-beyond',
  },
  VANGUARD: {
    'the-archon': 'van-archon',
    'shi-no-numa-reborn': 'shi-no-numa-van',
  },
};

/** number_ones map slug -> CZT map slug (reverse; only where we changed). */
function buildNoToCztMap(): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {};
  for (const [game, entries] of Object.entries(CZT_TO_NO_MAP)) {
    out[game] = {};
    for (const [czt, no] of Object.entries(entries)) {
      out[game][no] = czt;
    }
  }
  return out;
}
const NO_TO_CZT_MAP = buildNoToCztMap();

export function cztMapSlugToNo(gameShortName: string, cztMapSlug: string): string {
  const game = gameShortName.toUpperCase();
  const mapped = CZT_TO_NO_MAP[game]?.[cztMapSlug];
  return mapped ?? cztMapSlug;
}

export function noMapSlugToCzt(gameShortName: string, noMapSlug: string): string {
  const game = gameShortName.toUpperCase();
  const mapped = NO_TO_CZT_MAP[game]?.[noMapSlug];
  return mapped ?? noMapSlug;
}

/** number_ones category from our challenge type (round-based). */
const ROUND_CATEGORY: Record<string, string> = {
  HIGHEST_ROUND: 'high-round',
  NO_DOWNS: 'flawless',
  STARTING_ROOM: 'first-room',
  NO_POWER: 'no-power',
  NO_PERKS: 'no-perks',
  NO_JUG: 'no-jug',
  NO_ARMOR: 'no-armor',
  PURIST: 'purist-highrounds',
};

/** number_ones category from our speedrun challenge type. */
const SPEEDRUN_CATEGORY: Record<string, string> = {
  ROUND_5_SPEEDRUN: '5-speedrun',
  ROUND_15_SPEEDRUN: '15-speedrun',
  ROUND_30_SPEEDRUN: '30-speedrun',
  ROUND_50_SPEEDRUN: '50-speedrun',
  ROUND_70_SPEEDRUN: '70-speedrun',
  ROUND_100_SPEEDRUN: '100-speedrun',
  ROUND_200_SPEEDRUN: '200-speedrun',
  ROUND_255_SPEEDRUN: '255-speedrun',
  ROUND_935_SPEEDRUN: '935-speedrun',
  EASTER_EGG_SPEEDRUN: 'ee-speedrun',
  EXFIL_SPEEDRUN: 'exfil-speedrun',
  BUILD_EE_SPEEDRUN: 'build-speedrun',
};

/** Board variant substring for "megas/any" (with gums, support, all cards). */
export function getMegasVariant(gameShortName: string): string {
  const g = gameShortName.toUpperCase();
  if (g === 'BO3') return 'all-gobblegum';
  if (g === 'BO4') return 'all-elixirs';
  if (g === 'BOCW') return 'with-support';
  if (g === 'BO6') return 'w-support'; // all-gobblegum-w-support or w-support
  if (g === 'BO7') return 'w-support';
  if (g === 'IW') return 'all-cards';
  if (g === 'VANGUARD') return 'rampage'; // or with-rampage
  return '';
}

/** Board variant substring for "restricted" (no/classic gums, no support, fate only, no rampage). Used for ROUND-based lookups. */
export function getRestrictedVariant(gameShortName: string): string {
  const g = gameShortName.toUpperCase();
  if (g === 'BO3') return 'classic-gobblegum'; // or no-gobblegum
  if (g === 'BO4') return 'classic-elixirs';
  if (g === 'BOCW') return 'without-support';
  if (g === 'BO6') return 'n-support';
  if (g === 'BO7') return 'n-support';
  if (g === 'IW') return 'fate-cards';
  if (g === 'VANGUARD') return 'no-rampage';
  return '';
}

/** Board variant substring for SPEEDRUN "megas" band (with gums, rampage, etc.). number_ones board_id must include this. */
export function getMegasVariantForSpeedrun(gameShortName: string): string {
  const g = gameShortName.toUpperCase();
  if (g === 'BO3') return 'all-gobblegum';
  if (g === 'BO4') return 'all-elixirs';
  if (g === 'BOCW') return 'inducer'; // rampage
  if (g === 'BO6') return 'all-gobblegum'; // or rage-inducer
  if (g === 'BO7') return 'w-gums-rampage';
  if (g === 'IW') return 'all-cards';
  if (g === 'VANGUARD') return 'ALL'; // vanguard boards use "ALL"; no separate rampage board in number_ones
  return '';
}

/** Board variant substring for SPEEDRUN "restricted" band (no gums, no rampage, etc.). number_ones board_id must include this. */
export function getRestrictedVariantForSpeedrun(gameShortName: string): string {
  const g = gameShortName.toUpperCase();
  if (g === 'BO3') return 'classic-gobblegum';
  if (g === 'BO4') return 'classic-elixirs';
  if (g === 'BOCW') return 'non-inducer';
  if (g === 'BO6') return 'no-gobblegum';
  if (g === 'BO7') return 'n-gums-n-rampage';
  if (g === 'IW') return 'fate-cards';
  if (g === 'VANGUARD') return 'no-rampage'; // vanguard boards may use "ALL" only; then we rely on config fallback
  return '';
}

const GAME_TO_NO_KEY: Record<string, string> = {
  WAW: 'waw',
  BO3: 'bo3',
  BO4: 'bo4',
  BOCW: 'bocw',
  BO6: 'bo6',
  BO7: 'bo7',
  IW: 'iw',
  VANGUARD: 'vanguard',
};

function gameToNo(gameShortName: string): string {
  return GAME_TO_NO_KEY[gameShortName.toUpperCase()] ?? gameShortName.toLowerCase();
}

/** Get solo WR round from number_ones for (game, category, map, optional variant). */
export function getSoloWRRound(
  gameShortName: string,
  noCategory: string,
  cztMapSlug: string,
  variant?: string
): number | null {
  const noGame = gameToNo(gameShortName);
  const noMap = cztMapSlugToNo(gameShortName, cztMapSlug);
  const rec = getSoloWR(noGame, noCategory, noMap, variant);
  if (!rec) return null;
  const parsed = parseAchieved(rec.achieved);
  if (parsed && 'round' in parsed) return parsed.round;
  return null;
}

/** Get solo WR time (seconds) from number_ones. */
export function getSoloWRTimeSeconds(
  gameShortName: string,
  noCategory: string,
  cztMapSlug: string,
  variant?: string
): number | null {
  const noGame = gameToNo(gameShortName);
  const noMap = cztMapSlugToNo(gameShortName, cztMapSlug);
  const rec = getSoloWR(noGame, noCategory, noMap, variant);
  if (!rec) return null;
  const parsed = parseAchieved(rec.achieved);
  if (parsed && 'timeSeconds' in parsed) return parsed.timeSeconds;
  return null;
}

/** Infer WR round from other maps in same game/category (average of solo WRs). */
export function getInferredWRRound(
  gameShortName: string,
  noCategory: string,
  cztMapSlug: string,
  variant?: string
): number | null {
  const data = loadNumberOnes();
  if (!data) return null;
  const noGame = gameToNo(gameShortName);
  const byCat = data[noGame]?.[noCategory];
  if (!byCat || typeof byCat !== 'object') return null;
  const noMap = cztMapSlugToNo(gameShortName, cztMapSlug);
  const rounds: number[] = [];
  for (const [mapKey, records] of Object.entries(byCat)) {
    if (mapKey === noMap || !Array.isArray(records)) continue;
    const solo = records.filter((r: { player_count?: number }) => r.player_count === 1);
    const withVariant = variant
      ? solo.find((r: { board_id?: string }) => r.board_id?.includes(variant))
      : solo[0];
    const rec = withVariant ?? solo[0];
    if (!rec) continue;
    const parsed = parseAchieved(rec.achieved);
    if (parsed && 'round' in parsed) rounds.push(parsed.round);
  }
  if (rounds.length === 0) return null;
  return Math.floor(rounds.reduce((a, b) => a + b, 0) / rounds.length);
}

/** Infer WR time from other maps in same game/category. */
export function getInferredWRTimeSeconds(
  gameShortName: string,
  noCategory: string,
  cztMapSlug: string,
  variant?: string
): number | null {
  const data = loadNumberOnes();
  if (!data) return null;
  const noGame = gameToNo(gameShortName);
  const byCat = data[noGame]?.[noCategory];
  if (!byCat || typeof byCat !== 'object') return null;
  const noMap = cztMapSlugToNo(gameShortName, cztMapSlug);
  const times: number[] = [];
  for (const [mapKey, records] of Object.entries(byCat)) {
    if (mapKey === noMap || !Array.isArray(records)) continue;
    const solo = records.filter((r: { player_count?: number }) => r.player_count === 1);
    const withVariant = variant
      ? solo.find((r: { board_id?: string }) => r.board_id?.includes(variant))
      : solo[0];
    const rec = withVariant ?? solo[0];
    if (!rec) continue;
    const parsed = parseAchieved(rec.achieved);
    if (parsed && 'timeSeconds' in parsed) times.push(parsed.timeSeconds);
  }
  if (times.length === 0) return null;
  return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
}

/** Resolve WR round for seeding: number_ones (megas variant) -> config fallback -> inferred. */
export function getWRRoundForSeed(
  gameShortName: string,
  challengeType: string,
  cztMapSlug: string,
  configFallback: number | null | undefined,
  options?: { variant?: 'megas' | 'restricted' }
): number {
  const noCategory = ROUND_CATEGORY[challengeType] ?? challengeType.toLowerCase().replace(/_/g, '-');
  const variant = options?.variant === 'restricted'
    ? getRestrictedVariant(gameShortName)
    : options?.variant === 'megas'
      ? getMegasVariant(gameShortName)
      : undefined;
  const fromNo = getSoloWRRound(gameShortName, noCategory, cztMapSlug, variant);
  if (fromNo != null && fromNo > 0) return fromNo;
  if (configFallback != null && configFallback > 0) return configFallback;
  const inferred = getInferredWRRound(gameShortName, noCategory, cztMapSlug, variant);
  if (inferred != null && inferred > 0) return inferred;
  return configFallback ?? 50;
}

/** Resolve WR time (seconds) for seeding. Use useSpeedrunVariant: true for speedrun categories so number_ones board_id matches (e.g. inducer/non-inducer for BOCW). */
export function getWRTimeForSeed(
  gameShortName: string,
  noCategoryKey: string,
  cztMapSlug: string,
  configFallbackSeconds: number | null | undefined,
  options?: {
    variant?: 'megas' | 'restricted';
    useSpeedrunVariant?: boolean;
    configRestrictedFallbackSeconds?: number | null;
  }
): number | null {
  const noCategory = SPEEDRUN_CATEGORY[noCategoryKey] ?? noCategoryKey.toLowerCase().replace(/_/g, '-');
  const useSpeedrun = options?.useSpeedrunVariant === true;
  const variant = options?.variant === 'restricted'
    ? (useSpeedrun ? getRestrictedVariantForSpeedrun(gameShortName) : getRestrictedVariant(gameShortName))
    : options?.variant === 'megas'
      ? (useSpeedrun ? getMegasVariantForSpeedrun(gameShortName) : getMegasVariant(gameShortName))
      : undefined;
  const fromNo = getSoloWRTimeSeconds(gameShortName, noCategory, cztMapSlug, variant || undefined);
  if (fromNo != null && fromNo > 0) return fromNo;
  const fallback =
    options?.variant === 'restricted' &&
    typeof options?.configRestrictedFallbackSeconds === 'number' &&
    options.configRestrictedFallbackSeconds > 0
      ? options.configRestrictedFallbackSeconds
      : configFallbackSeconds;
  if (fallback != null && fallback > 0) return fallback;
  const inferred = getInferredWRTimeSeconds(gameShortName, noCategory, cztMapSlug, variant || undefined);
  return inferred ?? fallback ?? null;
}

export { roundWRToAchievementRound, timeWRToAchievementSeconds };

/** Build speedrun tiers from WR time (seconds). Hardest tier = 4% slower than WR. Returns 4 tiers. */
export function buildSpeedrunTiersFromWR(
  wrTimeSeconds: number,
  xpRewards: number[] = [100, 400, 1000, 2500]
): { maxTimeSeconds: number; xpReward: number }[] {
  const cap = timeWRToAchievementSeconds(wrTimeSeconds);
  const ratios = [2.0, 1.5, 1.2, 1.04];
  return ratios.map((r, i) => ({
    maxTimeSeconds: i === ratios.length - 1 ? cap : Math.round(wrTimeSeconds * r),
    xpReward: xpRewards[i] ?? 2500,
  }));
}

/** number_ones speedrun category key from our challenge type. */
export function getNoSpeedrunCategory(challengeType: string): string {
  return SPEEDRUN_CATEGORY[challengeType] ?? challengeType.toLowerCase().replace(/_/g, '-');
}
