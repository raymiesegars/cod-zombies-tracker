// How we group and order achievements on map detail and profile
export const ACHIEVEMENT_CATEGORY_LABELS: Record<string, string> = {
  BASE_ROUNDS: 'Base Rounds',
  NO_DOWNS: 'No Downs',
  NO_PERKS: 'No Perks',
  NO_PACK: 'No Pack-a-Punch',
  STARTING_ROOM: 'Starting Room Only',
  ONE_BOX: 'One Box Challenge',
  PISTOL_ONLY: 'Pistol Only',
  NO_POWER: 'No Power',
  // IW speedrun categories
  ROUND_30_SPEEDRUN: 'Round 30 Speedrun',
  ROUND_50_SPEEDRUN: 'Round 50 Speedrun',
  ROUND_70_SPEEDRUN: 'Round 70 Speedrun',
  ROUND_100_SPEEDRUN: 'Round 100 Speedrun',
  EASTER_EGG_SPEEDRUN: 'Easter Egg Speedrun',
  GHOST_AND_SKULLS: 'Ghost and Skulls',
  ALIENS_BOSS_FIGHT: 'Aliens Boss Fight',
  EASTER_EGG: 'Easter Egg',
  OTHER: 'Other',
};

/** Speedrun-only categories (IW and similar); used to split first filter = non-speedrun, second = Speedruns */
export const SPEEDRUN_CATEGORIES: string[] = [
  'ROUND_30_SPEEDRUN',
  'ROUND_50_SPEEDRUN',
  'ROUND_70_SPEEDRUN',
  'ROUND_100_SPEEDRUN',
  'EASTER_EGG_SPEEDRUN',
  'GHOST_AND_SKULLS',
  'ALIENS_BOSS_FIGHT',
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
  'ROUND_30_SPEEDRUN',
  'ROUND_50_SPEEDRUN',
  'ROUND_70_SPEEDRUN',
  'ROUND_100_SPEEDRUN',
  'EASTER_EGG_SPEEDRUN',
  'GHOST_AND_SKULLS',
  'ALIENS_BOSS_FIGHT',
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

/** First filter: non-speedrun categories only (All types + Base Rounds, No Downs, etc.). Pass existing categories to restrict to those present. */
export function getNonSpeedrunCategoryFilterOptions(
  existingCategories?: string[]
): { value: string; label: string }[] {
  const nonSpeedrun =
    existingCategories ?? CATEGORY_ORDER.filter((c) => c !== 'OTHER' && !isSpeedrunCategory(c));
  return [
    { value: '', label: 'All types' },
    ...nonSpeedrun.map((c) => ({ value: c, label: ACHIEVEMENT_CATEGORY_LABELS[c] ?? c })),
  ];
}

/** Second filter: Speedruns dropdown (All + each speedrun category present) */
export function getSpeedrunCategoryFilterOptions(
  existingCategories?: string[]
): { value: string; label: string }[] {
  const list = existingCategories ?? SPEEDRUN_CATEGORIES;
  const speedrunCats = list.filter((c) => isSpeedrunCategory(c));
  return [
    { value: '', label: 'All' },
    ...speedrunCats.map((c) => ({ value: c, label: ACHIEVEMENT_CATEGORY_LABELS[c] ?? c })),
  ];
}

export function getSortedCategoryKeys(categories: Record<string, unknown[]>): string[] {
  return CATEGORY_ORDER.filter((c) => categories[c]?.length);
}

export function sortAchievementsByXp<T extends { xpReward: number }>(achievements: T[]): T[] {
  return [...achievements].sort((a, b) => a.xpReward - b.xpReward);
}

/** Sort achievements for display: by type, then by round (numeric) when criteria.round exists, then slug. */
export function sortAchievementsForDisplay<T extends { type: string; slug: string; criteria?: unknown }>(
  achievements: T[]
): T[] {
  return [...achievements].sort((a, b) => {
    if (a.type !== b.type) return a.type.localeCompare(b.type);
    const roundA =
      typeof (a.criteria as { round?: number })?.round === 'number'
        ? (a.criteria as { round: number }).round
        : 999999;
    const roundB =
      typeof (b.criteria as { round?: number })?.round === 'number'
        ? (b.criteria as { round: number }).round
        : 999999;
    if (roundA !== roundB) return roundA - roundB;
    return a.slug.localeCompare(b.slug);
  });
}
