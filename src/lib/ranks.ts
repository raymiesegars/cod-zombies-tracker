import { getAssetUrl } from '@/lib/assets';

// Ranks + XP thresholds. Icons live in public/images/ranks/ or on Supabase if ASSETS_BASE_URL is set.
export type RankDefinition = {
  level: number;
  name: string;
  xpRequired: number;
  icon: string;
};

export const RANKS: RankDefinition[] = [
  { level: 1, name: 'Outbreak Survivor', xpRequired: 0, icon: 'outbreak-survivor.png' },
  { level: 2, name: 'Knife Only', xpRequired: 2_500, icon: 'knife-only.png' },
  { level: 3, name: 'Monkey Bomber', xpRequired: 7_500, icon: 'monkey-bomber.png' },
  { level: 4, name: 'Carpenter', xpRequired: 17_000, icon: 'carpenter.png' },
  { level: 5, name: 'Ray Gunner', xpRequired: 32_000, icon: 'ray-gunner.png' },
  { level: 6, name: "Samantha's Bear", xpRequired: 55_000, icon: 'teddy.png' },
  { level: 7, name: 'Perkaholic', xpRequired: 85_000, icon: 'perkaholic.png' },
  { level: 8, name: 'Mystery Box Addict', xpRequired: 125_000, icon: 'mystery-box-addict.png' },
  { level: 9, name: 'Pack-a-Punch Initiate', xpRequired: 175_000, icon: 'pack-a-punch-initiate.png' },
  { level: 10, name: 'Hellhound Slayer', xpRequired: 235_000, icon: 'hellhound-slayer.png' },
  { level: 11, name: 'Nova Crawler', xpRequired: 305_000, icon: 'nova-crawler.png' },
  { level: 12, name: "Keeper's Mark", xpRequired: 385_000, icon: 'keepers-mark.png' },
  { level: 13, name: 'Elemental Shard', xpRequired: 480_000, icon: 'elemental-shard.png' },
  { level: 14, name: 'Staff Bearer', xpRequired: 590_000, icon: 'staff-bearer.png' },
  { level: 15, name: 'Aether Traveler', xpRequired: 720_000, icon: 'aether-traveler.png' },
  { level: 16, name: 'Apothicon Bane', xpRequired: 880_000, icon: 'apothicon-bane.png' },
  { level: 17, name: 'Primis Operative', xpRequired: 1_070_000, icon: 'primis-operative.png' },
  { level: 18, name: 'Shadowed One', xpRequired: 1_290_000, icon: 'shadowed-one.png' },
  { level: 19, name: 'Aether Ascendant', xpRequired: 1_550_000, icon: 'aether-ascendant.png' },
  { level: 20, name: 'Aether Overlord', xpRequired: 1_850_000, icon: 'aether-overlord.png' },
];

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
