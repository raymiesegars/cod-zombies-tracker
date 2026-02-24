/** Allowed profile dashboard stat block ids. User must choose exactly 4. */
export const PROFILE_STAT_BLOCK_IDS = [
  'maps-played',
  'easter-eggs',
  'avg-round',
  'achievements',
  'world-records',
  'verified-world-records',
  'total-runs',
  'verified-runs',
  'verified-rank',
  'rank',
  'highest-round',
  'speedruns',
  'mystery-box',
] as const;

export type ProfileStatBlockId = (typeof PROFILE_STAT_BLOCK_IDS)[number];

const SET = new Set<string>(PROFILE_STAT_BLOCK_IDS);

export function isProfileStatBlockId(id: unknown): id is ProfileStatBlockId {
  return typeof id === 'string' && SET.has(id);
}

export function parseProfileStatBlocks(value: unknown): ProfileStatBlockId[] | null {
  if (!value || !Array.isArray(value)) return null;
  const arr = value as unknown[];
  if (arr.length !== 4) return null;
  const out: ProfileStatBlockId[] = [];
  for (const item of arr) {
    if (!isProfileStatBlockId(item)) return null;
    if (out.includes(item)) return null;
    out.push(item);
  }
  return out;
}

export const DEFAULT_PROFILE_STAT_BLOCK_IDS: ProfileStatBlockId[] = [
  'maps-played',
  'easter-eggs',
  'avg-round',
  'achievements',
];
