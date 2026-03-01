import { getAssetUrl } from '@/lib/assets';

// Ranks + XP thresholds. Icons: rank1.webp .. rank99.webp, rank100.png in public/images/ranks/
export type RankDefinition = {
  level: number;
  name: string;
  xpRequired: number;
  icon: string;
};

/** Total XP from all active achievements on the site. Run: pnpm exec tsx scripts/compute-total-obtainable-xp.ts to get current value. */
export const TOTAL_OBTAINABLE_XP = 15_950_235;

/** XP required to reach rank 100 (93% of total obtainable). */
const RANK_100_XP = Math.floor(TOTAL_OBTAINABLE_XP * 0.93);

/** Original 20-level curve (scaled to levels 1–80). */
const OLD_20_XP = [
  0, 2_500, 7_500, 17_000, 32_000, 55_000, 85_000, 125_000, 175_000, 235_000,
  305_000, 385_000, 480_000, 590_000, 720_000, 880_000, 1_070_000, 1_290_000,
  1_550_000, 1_850_000,
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Build XP threshold for level L (1–100). Level 1 = 0, levels 2–80 scaled from old curve, 81–100 curve to 93% total. */
function xpForLevel(L: number): number {
  if (L <= 1) return 0;
  if (L <= 80) {
    const t = (L - 1) / 79;
    const oldIndex = t * 19;
    const i0 = Math.floor(oldIndex);
    const i1 = Math.min(i0 + 1, 19);
    const frac = oldIndex - i0;
    return Math.round(lerp(OLD_20_XP[i0]!, OLD_20_XP[i1]!, frac));
  }
  const t = (L - 80) / 20;
  const power = 1.6;
  const x = Math.pow(t, power);
  return Math.round(1_850_000 + (RANK_100_XP - 1_850_000) * x);
}

function buildRanks(): RankDefinition[] {
  const ranks: RankDefinition[] = [];
  for (let L = 1; L <= 100; L++) {
    const xp = xpForLevel(L);
    const icon = L <= 99 ? `rank${L}.webp` : 'rank100.png';
    ranks.push({
      level: L,
      name: `Rank ${L}`,
      xpRequired: xp,
      icon,
    });
  }
  return ranks;
}

export const RANKS: RankDefinition[] = buildRanks();

export const MAX_LEVEL = RANKS.length;
export const MAX_XP = RANKS[RANKS.length - 1]!.xpRequired;

export function getRankIconPath(icon: string): string {
  return getAssetUrl(`/images/ranks/${icon}`);
}

export function getRankForLevel(level: number): RankDefinition | undefined {
  return RANKS.find((r) => r.level === level);
}

export function getLevelFromXp(totalXp: number): {
  level: number;
  rankName: string;
  rankIcon: string;
  currentLevelXp: number;
  nextLevelXp: number;
  progress: number;
} {
  let level = 1;
  let currentLevelXp = 0;
  let nextLevelXp = RANKS[0]!.xpRequired;

  for (let i = 0; i < RANKS.length; i++) {
    if (totalXp >= RANKS[i]!.xpRequired) {
      level = RANKS[i]!.level;
      currentLevelXp = RANKS[i]!.xpRequired;
      nextLevelXp = RANKS[i + 1]?.xpRequired ?? RANKS[i]!.xpRequired;
    } else break;
  }

  const next = RANKS.find((r) => r.level === level + 1);
  const nextXp = next?.xpRequired ?? currentLevelXp;
  const progress =
    nextXp > currentLevelXp
      ? ((totalXp - currentLevelXp) / (nextXp - currentLevelXp)) * 100
      : 100;

  const rank = getRankForLevel(level) ?? RANKS[0]!;
  return {
    level,
    rankName: rank.name,
    rankIcon: getRankIconPath(rank.icon),
    currentLevelXp,
    nextLevelXp: nextXp,
    progress: Math.min(progress, 100),
  };
}
