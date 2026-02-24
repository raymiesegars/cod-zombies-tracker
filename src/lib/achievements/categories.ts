import { getBo1MapConfig } from '@/lib/bo1/bo1-map-config';
import { getBo2MapConfig } from '@/lib/bo2/bo2-map-config';
import { getBo3MapConfig } from '@/lib/bo3/bo3-map-config';
import { getBo4MapConfig } from '@/lib/bo4/bo4-map-config';
import { getBocwMapConfig } from '@/lib/bocw/bocw-map-config';
import { getBo6MapConfig } from '@/lib/bo6/bo6-map-config';
import { getBo7MapConfig } from '@/lib/bo7/bo7-map-config';
import { getWw2MapConfig } from '@/lib/ww2/ww2-map-config';
import { getVanguardMapConfig } from '@/lib/vanguard/vanguard-map-config';

// How we group and order achievements on map detail and profile
export const ACHIEVEMENT_CATEGORY_LABELS: Record<string, string> = {
  BASE_ROUNDS: 'Base Rounds',
  NO_DOWNS: 'No Downs',
  NO_PERKS: 'No Perks',
  NO_PACK: 'No Pack-a-Punch',
  STARTING_ROOM: 'Starting Room Only',
  STARTING_ROOM_JUG_SIDE: 'First Room (Jug Side)',
  STARTING_ROOM_QUICK_SIDE: 'First Room (Quick Side)',
  ONE_BOX: 'One Box Challenge',
  PISTOL_ONLY: 'Pistol Only',
  NO_POWER: 'No Power',
  NO_MAGIC: 'No Magic',
  NO_JUG: 'No Jug',
  NO_ARMOR: 'No Armor',
  NO_JUG_NO_ARMOR: 'No Jug No Armor',
  NO_BLITZ: 'No Blitz',
  NO_ATS: 'No AATs',
  // IW/BO3 speedrun categories
  ROUND_30_SPEEDRUN: 'Round 30 Speedrun',
  ROUND_50_SPEEDRUN: 'Round 50 Speedrun',
  ROUND_70_SPEEDRUN: 'Round 70 Speedrun',
  ROUND_100_SPEEDRUN: 'Round 100 Speedrun',
  ROUND_200_SPEEDRUN: 'Round 200 Speedrun',
  ROUND_255_SPEEDRUN: 'Round 255 Speedrun',
  ROUND_935_SPEEDRUN: 'Round 935 Speedrun',
  ROUND_999_SPEEDRUN: 'Round 999 Speedrun',
  ROUND_10_SPEEDRUN: 'Round 10 Speedrun',
  ROUND_20_SPEEDRUN: 'Round 20 Speedrun',
  EXFIL_SPEEDRUN: 'Exfil Round 11',
  EXFIL_R21_SPEEDRUN: 'Exfil Round 21',
  EXFIL_R5_SPEEDRUN: 'Exfil Round 5 Speedrun',
  EXFIL_R10_SPEEDRUN: 'Exfil Round 10 Speedrun',
  EXFIL_R20_SPEEDRUN: 'Exfil Round 20 Speedrun',
  BUILD_EE_SPEEDRUN: 'Build% EE Speedrun',
  SUPER_30_SPEEDRUN: 'Super 30 Speedrun',
  INSTAKILL_ROUND_SPEEDRUN: 'Instakill Round Speedrun',
  EASTER_EGG_SPEEDRUN: 'Easter Egg Speedrun',
  NO_MANS_LAND: "No Man's Land",
  RUSH: 'Rush',
  PURIST: 'Purist',
  GHOST_AND_SKULLS: 'Ghost and Skulls',
  ALIENS_BOSS_FIGHT: 'Aliens Boss Fight',
  CRYPTID_FIGHT: 'Cryptid Fight',
  MEPHISTOPHELES: 'Mephistopheles',
  EASTER_EGG: 'Easter Egg',
  OTHER: 'Other',
};

/** Speedrun-only categories (IW and similar); used to split first filter = non-speedrun, second = Speedruns */
export const SPEEDRUN_CATEGORIES: string[] = [
  'ROUND_30_SPEEDRUN',
  'ROUND_50_SPEEDRUN',
  'ROUND_70_SPEEDRUN',
  'ROUND_100_SPEEDRUN',
  'ROUND_200_SPEEDRUN',
  'ROUND_255_SPEEDRUN',
  'ROUND_935_SPEEDRUN',
  'ROUND_999_SPEEDRUN',
  'ROUND_10_SPEEDRUN',
  'ROUND_20_SPEEDRUN',
  'EXFIL_SPEEDRUN',
  'EXFIL_R21_SPEEDRUN',
  'EXFIL_R5_SPEEDRUN',
  'EXFIL_R10_SPEEDRUN',
  'EXFIL_R20_SPEEDRUN',
  'BUILD_EE_SPEEDRUN',
  'SUPER_30_SPEEDRUN',
  'INSTAKILL_ROUND_SPEEDRUN',
  'EASTER_EGG_SPEEDRUN',
  'GHOST_AND_SKULLS',
  'ALIENS_BOSS_FIGHT',
  'CRYPTID_FIGHT',
  'MEPHISTOPHELES',
];

export function isSpeedrunCategory(cat: string): boolean {
  return SPEEDRUN_CATEGORIES.includes(cat);
}

const CATEGORY_ORDER = [
  'EASTER_EGG',
  'BASE_ROUNDS',
  'NO_DOWNS',
  'NO_PERKS',
  'NO_PACK',
  'STARTING_ROOM',
  'ONE_BOX',
  'PISTOL_ONLY',
  'NO_POWER',
  'NO_MAGIC',
  'NO_JUG',
  'NO_ARMOR',
  'NO_JUG_NO_ARMOR',
  'NO_BLITZ',
  'NO_ATS',
  'NO_MANS_LAND',
  'ROUND_30_SPEEDRUN',
  'ROUND_50_SPEEDRUN',
  'ROUND_70_SPEEDRUN',
  'ROUND_100_SPEEDRUN',
  'ROUND_200_SPEEDRUN',
  'ROUND_255_SPEEDRUN',
  'ROUND_935_SPEEDRUN',
  'ROUND_999_SPEEDRUN',
  'ROUND_10_SPEEDRUN',
  'ROUND_20_SPEEDRUN',
  'EXFIL_SPEEDRUN',
  'EXFIL_R21_SPEEDRUN',
  'EXFIL_R5_SPEEDRUN',
  'EXFIL_R10_SPEEDRUN',
  'EXFIL_R20_SPEEDRUN',
  'BUILD_EE_SPEEDRUN',
  'SUPER_30_SPEEDRUN',
  'INSTAKILL_ROUND_SPEEDRUN',
  'EASTER_EGG_SPEEDRUN',
  'RUSH',
  'PURIST',
  'GHOST_AND_SKULLS',
  'ALIENS_BOSS_FIGHT',
  'CRYPTID_FIGHT',
  'MEPHISTOPHELES',
  'OTHER',
];

export function getAchievementCategory(a: {
  type?: string;
  criteria?: { challengeType?: string };
  easterEggId?: string | null;
  easterEgg?: unknown;
}): string {
  if (a.type === 'EASTER_EGG_COMPLETE' || a.easterEggId || a.easterEgg) return 'EASTER_EGG';
  if (a.type === 'ROUND_MILESTONE') return 'BASE_ROUNDS';
  const ct = a.criteria?.challengeType;
  return ct ?? 'OTHER';
}

/** Options for achievement type/category dropdown (All + each category) */
export function getAchievementCategoryFilterOptions(): { value: string; label: string }[] {
  const categories = CATEGORY_ORDER.filter((c) => c !== 'OTHER');
  return [
    { value: '', label: 'All types' },
    ...categories.map((c) => ({ value: c, label: ACHIEVEMENT_CATEGORY_LABELS[c] ?? c })),
  ];
}

/**
 * Get allowed non-speedrun categories for a game/map. Prevents game-specific categories
 * (e.g. STARTING_ROOM_JUG_SIDE) from appearing on maps that don't support them.
 */
export function getAllowedNonSpeedrunCategoriesForMap(
  gameShortName: string | null | undefined,
  mapSlug: string | null | undefined
): string[] | null {
  if (!gameShortName || !mapSlug) return null;
  if (gameShortName === 'BO2') {
    const cfg = getBo2MapConfig(mapSlug);
    if (!cfg?.challengeTypes) return null;
    const fromConfig = cfg.challengeTypes.filter((c) => !isSpeedrunCategory(c) && c !== 'HIGHEST_ROUND');
    return Array.from(new Set([...fromConfig, 'BASE_ROUNDS', 'EASTER_EGG']));
  }
  if (gameShortName === 'BO1') {
    const cfg = getBo1MapConfig(mapSlug);
    if (!cfg?.challengeTypes) return null;
    const fromConfig = cfg.challengeTypes.filter(
      (c) => !isSpeedrunCategory(c) && c !== 'HIGHEST_ROUND' && (c as string) !== 'NO_MANS_LAND'
    );
    const hasNoMansLand =
      (cfg.challengeTypes as readonly string[]).includes('NO_MANS_LAND') &&
      (cfg as { noMansLandWR?: number }).noMansLandWR != null;
    return Array.from(
      new Set([...fromConfig, 'BASE_ROUNDS', 'EASTER_EGG', ...(hasNoMansLand ? ['NO_MANS_LAND'] : [])])
    );
  }
  if (gameShortName === 'BO3') {
    const cfg = getBo3MapConfig(mapSlug);
    if (!cfg?.challengeTypes) return null;
    const fromConfig = cfg.challengeTypes.filter(
      (c) => !isSpeedrunCategory(c) && c !== 'HIGHEST_ROUND' && (c as string) !== 'NO_MANS_LAND'
    );
    const hasNoMansLand =
      (cfg.challengeTypes as readonly string[]).includes('NO_MANS_LAND') &&
      (cfg as { noMansLandWR?: number }).noMansLandWR != null;
    return Array.from(
      new Set([...fromConfig, 'BASE_ROUNDS', 'EASTER_EGG', ...(hasNoMansLand ? ['NO_MANS_LAND'] : [])])
    );
  }
  if (gameShortName === 'BO4') {
    const cfg = getBo4MapConfig(mapSlug);
    if (!cfg?.challengeTypes) return null;
    const fromConfig = cfg.challengeTypes.filter(
      (c) => !isSpeedrunCategory(c) && c !== 'HIGHEST_ROUND' && (c as string) !== 'RUSH'
    );
    return Array.from(new Set([...fromConfig, 'BASE_ROUNDS', 'EASTER_EGG', 'RUSH']));
  }
  if (gameShortName === 'BOCW') {
    const cfg = getBocwMapConfig(mapSlug);
    if (!cfg?.challengeTypes) return null;
    const fromConfig = cfg.challengeTypes.filter(
      (c) => !isSpeedrunCategory(c) && c !== 'HIGHEST_ROUND'
    );
    return Array.from(new Set([...fromConfig, 'BASE_ROUNDS', 'EASTER_EGG']));
  }
  if (gameShortName === 'BO6') {
    const cfg = getBo6MapConfig(mapSlug);
    if (!cfg?.challengeTypes) return null;
    const fromConfig = cfg.challengeTypes.filter(
      (c) => !isSpeedrunCategory(c) && c !== 'HIGHEST_ROUND'
    );
    return Array.from(new Set([...fromConfig, 'BASE_ROUNDS', 'EASTER_EGG']));
  }
  if (gameShortName === 'BO7') {
    const cfg = getBo7MapConfig(mapSlug);
    if (!cfg?.challengeTypes) return null;
    const fromConfig = cfg.challengeTypes.filter(
      (c) => !isSpeedrunCategory(c) && c !== 'HIGHEST_ROUND'
    );
    return Array.from(new Set([...fromConfig, 'BASE_ROUNDS', 'EASTER_EGG']));
  }
  if (gameShortName === 'WW2') {
    const cfg = getWw2MapConfig(mapSlug);
    if (!cfg?.challengeTypes) return null;
    const fromConfig = cfg.challengeTypes.filter(
      (c) => !isSpeedrunCategory(c) && c !== 'HIGHEST_ROUND'
    );
    return Array.from(new Set([...fromConfig, 'BASE_ROUNDS', 'EASTER_EGG']));
  }
  if (gameShortName === 'VANGUARD') {
    const cfg = getVanguardMapConfig(mapSlug);
    if (!cfg?.challengeTypes) return null;
    const fromConfig = cfg.challengeTypes.filter(
      (c) => !isSpeedrunCategory(c) && c !== 'HIGHEST_ROUND'
    );
    return Array.from(new Set([...fromConfig, 'BASE_ROUNDS', 'EASTER_EGG']));
  }
  return null;
}

/** First filter: non-speedrun categories only (All types + Base Rounds, No Downs, etc.). Pass existing categories to restrict to those present. */
export function getNonSpeedrunCategoryFilterOptions(
  existingCategories?: string[],
  allowedCategories?: string[] | null
): { value: string; label: string }[] {
  let nonSpeedrun =
    existingCategories ?? CATEGORY_ORDER.filter((c) => c !== 'OTHER' && !isSpeedrunCategory(c));
  if (allowedCategories && allowedCategories.length > 0) {
    nonSpeedrun = nonSpeedrun.filter((c) => allowedCategories.includes(c));
  }
  return [
    { value: '', label: 'All types' },
    ...nonSpeedrun.map((c) => ({ value: c, label: ACHIEVEMENT_CATEGORY_LABELS[c] ?? c })),
  ];
}

/**
 * Get allowed speedrun categories for a game/map. Prevents IW-only categories (G&S, Aliens, etc.)
 * from appearing on BO2/other games.
 */
export function getAllowedSpeedrunCategoriesForMap(
  gameShortName: string | null | undefined,
  mapSlug: string | null | undefined
): string[] | null {
  if (!gameShortName || !mapSlug) return null;
  if (gameShortName === 'IW') return SPEEDRUN_CATEGORIES;
  // BO2 and others: only round/EE speedruns, no IW bosses
  const bo2Generic = [
    'ROUND_30_SPEEDRUN',
    'ROUND_50_SPEEDRUN',
    'ROUND_70_SPEEDRUN',
    'ROUND_100_SPEEDRUN',
    'ROUND_200_SPEEDRUN',
    'EASTER_EGG_SPEEDRUN',
  ];
  if (gameShortName === 'BO1') {
    const cfg = getBo1MapConfig(mapSlug);
    if (cfg?.challengeTypes) {
      return cfg.challengeTypes.filter((c) => isSpeedrunCategory(c));
    }
    return bo2Generic;
  }
  if (gameShortName === 'BO2') {
    const cfg = getBo2MapConfig(mapSlug);
    if (cfg?.challengeTypes) {
      return cfg.challengeTypes.filter((c) => isSpeedrunCategory(c));
    }
    return bo2Generic;
  }
  if (gameShortName === 'BO3') {
    const cfg = getBo3MapConfig(mapSlug);
    if (cfg?.challengeTypes) {
      return cfg.challengeTypes.filter((c) => isSpeedrunCategory(c));
    }
    return [...bo2Generic, 'ROUND_255_SPEEDRUN'];
  }
  if (gameShortName === 'BO4') {
    const cfg = getBo4MapConfig(mapSlug);
    if (cfg?.challengeTypes) {
      return cfg.challengeTypes.filter((c) => isSpeedrunCategory(c));
    }
    return [...bo2Generic, 'INSTAKILL_ROUND_SPEEDRUN'];
  }
  if (gameShortName === 'BOCW') {
    const cfg = getBocwMapConfig(mapSlug);
    if (cfg?.challengeTypes) {
      return cfg.challengeTypes.filter((c) => isSpeedrunCategory(c));
    }
  }
  if (gameShortName === 'BO6') {
    const cfg = getBo6MapConfig(mapSlug);
    if (cfg?.challengeTypes) {
      return cfg.challengeTypes.filter((c) => isSpeedrunCategory(c));
    }
  }
  if (gameShortName === 'BO7') {
    const cfg = getBo7MapConfig(mapSlug);
    if (cfg?.challengeTypes) {
      return cfg.challengeTypes.filter((c) => isSpeedrunCategory(c));
    }
  }
  if (gameShortName === 'WW2') {
    const cfg = getWw2MapConfig(mapSlug);
    if (cfg?.challengeTypes) {
      return cfg.challengeTypes.filter((c) => isSpeedrunCategory(c));
    }
    return [...bo2Generic, 'ROUND_10_SPEEDRUN', 'SUPER_30_SPEEDRUN'];
  }
  if (gameShortName === 'VANGUARD') {
    const cfg = getVanguardMapConfig(mapSlug);
    if (cfg?.challengeTypes) {
      return cfg.challengeTypes.filter((c) => isSpeedrunCategory(c));
    }
    return [...bo2Generic, 'ROUND_10_SPEEDRUN', 'ROUND_20_SPEEDRUN', 'EXFIL_R5_SPEEDRUN', 'EXFIL_R10_SPEEDRUN', 'EXFIL_R20_SPEEDRUN'];
  }
  return bo2Generic;
}

/** Second filter: Speedruns dropdown (All + each speedrun category in canonical order: 30/50/70/100, EE, G&S, bosses) */
export function getSpeedrunCategoryFilterOptions(
  existingCategories?: string[],
  allowedCategories?: string[] | null
): { value: string; label: string }[] {
  let list = existingCategories ?? SPEEDRUN_CATEGORIES;
  if (allowedCategories && allowedCategories.length > 0) {
    list = list.filter((c) => allowedCategories.includes(c));
  }
  const speedrunCats = list.filter((c) => isSpeedrunCategory(c));
  const ordered = [...speedrunCats].sort(
    (a, b) => SPEEDRUN_CATEGORIES.indexOf(a) - SPEEDRUN_CATEGORIES.indexOf(b)
  );
  return [
    { value: '', label: 'All' },
    ...ordered.map((c) => ({ value: c, label: ACHIEVEMENT_CATEGORY_LABELS[c] ?? c })),
  ];
}

export function getSortedCategoryKeys(categories: Record<string, unknown[]>): string[] {
  return CATEGORY_ORDER.filter((c) => categories[c]?.length);
}

export function sortAchievementsByXp<T extends { xpReward: number }>(achievements: T[]): T[] {
  return [...achievements].sort((a, b) => a.xpReward - b.xpReward);
}

/** Main quest completion (not timed) - should always appear first in its section. */
export function isMainEasterEggAchievement(a: { type?: string; criteria?: unknown }): boolean {
  return a.type === 'EASTER_EGG_COMPLETE' && typeof (a.criteria as { maxTimeSeconds?: number })?.maxTimeSeconds !== 'number';
}

/** Sort achievements within a category: main EE first, then by XP. Use when rendering a category block. */
export function sortAchievementsInCategory<T extends { type?: string; xpReward: number; slug: string; criteria?: unknown }>(
  achievements: T[]
): T[] {
  return [...achievements].sort((a, b) => {
    const aMain = isMainEasterEggAchievement(a);
    const bMain = isMainEasterEggAchievement(b);
    if (aMain && !bMain) return -1;
    if (!aMain && bMain) return 1;
    return a.xpReward - b.xpReward;
  });
}

/** Deduplicate achievements. For EASTER_EGG_COMPLETE, keep one per (mapId, name) preferring the one with easterEggId (the one that unlocks). */
export function deduplicateAchievementsById<T extends { id?: string; type?: string; mapId?: string | null; name?: string; easterEggId?: string | null }>(
  achievements: T[]
): T[] {
  const eeByKey = new Map<string, T[]>();
  const other: T[] = [];
  for (const a of achievements) {
    if (a.type === 'EASTER_EGG_COMPLETE') {
      const key = `${a.mapId ?? ''}::${a.name ?? ''}`;
      if (!eeByKey.has(key)) eeByKey.set(key, []);
      eeByKey.get(key)!.push(a);
    } else {
      other.push(a);
    }
  }
  const keptEe: T[] = [];
  for (const list of Array.from(eeByKey.values())) {
    const withEe = list.find((a: T) => a.easterEggId);
    keptEe.push(withEe ?? list[0]!);
  }
  return [...other, ...keptEe];
}

/** Sort achievements for display: main EE (not timed) first, then by type, speedrun tiers (fastest first), round, slug. */
export function sortAchievementsForDisplay<T extends { id?: string; type: string; slug: string; criteria?: unknown }>(
  achievements: T[]
): T[] {
  const deduped = deduplicateAchievementsById(achievements);
  return [...deduped].sort((a, b) => {
    const aMain = isMainEasterEggAchievement(a);
    const bMain = isMainEasterEggAchievement(b);
    if (aMain && !bMain) return -1;
    if (!aMain && bMain) return 1;
    if (a.type !== b.type) return a.type.localeCompare(b.type);
    const critA = a.criteria as { round?: number; maxTimeSeconds?: number } | undefined;
    const critB = b.criteria as { round?: number; maxTimeSeconds?: number } | undefined;
    // Speedrun tiers: fastest first (lowest maxTimeSeconds = hardest = show first)
    const timeA = typeof critA?.maxTimeSeconds === 'number' ? critA.maxTimeSeconds : -1;
    const timeB = typeof critB?.maxTimeSeconds === 'number' ? critB.maxTimeSeconds : -1;
    if (timeA >= 0 && timeB >= 0 && timeA !== timeB) return timeA - timeB;
    const roundA = typeof critA?.round === 'number' ? critA.round : 999999;
    const roundB = typeof critB?.round === 'number' ? critB.round : 999999;
    if (roundA !== roundB) return roundA - roundB;
    return a.slug.localeCompare(b.slug);
  });
}
