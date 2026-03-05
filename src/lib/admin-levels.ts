import { getAssetUrl } from '@/lib/assets';

const ADMIN_LEVEL_ICONS: Record<number, string> = {
  1: 'quick-revive.png',
  2: 'primis-operative.png',
  3: 'perkaholic.png',
  4: 'pack-a-punch-initiate.png',
  5: 'outbreak-survivor.png',
  6: 'nova-crawler.png',
  7: 'mystery-box-addict.png',
  8: 'monkey-bomber.png',
  9: 'knife-only.png',
  10: 'keepers-mark.png',
  11: 'juggernaut.png',
  12: 'hellhound-slayer.png',
  13: 'elemental-shard.png',
  14: 'double-tap.png',
  15: 'carpenter.png',
  16: 'apothicon-bane.png',
  17: 'aether-traveler.png',
  18: 'aether-overlord.png',
  19: 'aether-ascendant.png',
  20: 'aether-ascendant.png',
};

const XP_THRESHOLDS = [
  0, 100, 250, 500, 900, 1500, 2400, 3600, 5200, 7300, 10000, 13500, 18000, 24000, 31500, 41000, 53000, 68000, 85000, 100000,
];

export const ADMIN_MAX_LEVEL = 20;

export function getAdminLevelFromXp(adminXp: number): {
  level: number;
  levelIcon: string;
  currentLevelXp: number;
  nextLevelXp: number;
  progress: number;
} {
  let level = 1;
  let currentLevelXp = 0;
  let nextLevelXp = XP_THRESHOLDS[1] ?? 0;

  for (let L = 1; L <= ADMIN_MAX_LEVEL; L++) {
    const thresh = XP_THRESHOLDS[L - 1] ?? 0;
    if (adminXp >= thresh) {
      level = L;
      currentLevelXp = thresh;
      nextLevelXp = XP_THRESHOLDS[L] ?? thresh;
    } else break;
  }

  const progress =
    nextLevelXp > currentLevelXp
      ? Math.min(100, ((adminXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100)
      : 100;

  const icon = ADMIN_LEVEL_ICONS[level] ?? 'quick-revive.png';
  return {
    level,
    levelIcon: getAssetUrl(`/images/ranks/${icon}`),
    currentLevelXp,
    nextLevelXp,
    progress,
  };
}

export function getAdminLevelIconPath(level: number): string {
  const icon = ADMIN_LEVEL_ICONS[Math.min(level, ADMIN_MAX_LEVEL)] ?? 'quick-revive.png';
  return getAssetUrl(`/images/ranks/${icon}`);
}

export function adminXpForRun(roundReached: number): number {
  if (roundReached <= 50) return roundReached * 1;
  if (roundReached <= 100) return 50 * 1 + (roundReached - 50) * 2;
  if (roundReached <= 200) return 50 * 1 + 50 * 2 + (roundReached - 100) * 3;
  return 50 * 1 + 50 * 2 + 100 * 3 + (roundReached - 200) * 4;
}
