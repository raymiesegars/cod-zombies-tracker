/**
 * BO4 speedrun WR times from number_ones.json, per difficulty (NORMAL, HARDCORE, REALISTIC).
 * Used for correct tier generation - Normal/Hardcore/Realistic have very different WR times.
 */

import { loadNumberOnes, parseAchieved } from './number-ones-loader';

const NO_TO_CZT: Record<string, string> = {
  '30-speedrun': 'ROUND_30_SPEEDRUN',
  '50-speedrun': 'ROUND_50_SPEEDRUN',
  '70-speedrun': 'ROUND_70_SPEEDRUN',
  '100-speedrun': 'ROUND_100_SPEEDRUN',
  '200-speedrun': 'ROUND_200_SPEEDRUN',
  'ee-speedrun': 'EASTER_EGG_SPEEDRUN',
  'instakill-speedrun': 'INSTAKILL_ROUND_SPEEDRUN',
};

const BO4_MAPS = [
  'ix',
  'voyage-of-despair',
  'blood-of-the-dead',
  'classified',
  'dead-of-the-night',
  'ancient-evil',
  'alpha-omega',
  'tag-der-toten',
];

type Bo4Difficulty = 'NORMAL' | 'HARDCORE' | 'REALISTIC';

function parseTime(achieved: string): number | null {
  const parsed = parseAchieved(achieved);
  if (parsed && 'timeSeconds' in parsed) return parsed.timeSeconds;
  return null;
}

let cache: Record<string, Record<string, Record<Bo4Difficulty, { classic: number | null; all: number | null }>>> | null = null;

function buildCache(): typeof cache {
  if (cache) return cache;
  const data = loadNumberOnes();
  if (!data?.bo4) return null;

  const result: Record<string, Record<string, Record<Bo4Difficulty, { classic: number | null; all: number | null }>>> = {};

  for (const [noCat, catMaps] of Object.entries(data.bo4)) {
    const cztType = NO_TO_CZT[noCat];
    if (!cztType) continue;
    result[cztType] = result[cztType] ?? {};

    for (const map of BO4_MAPS) {
      const recs = (catMaps as Record<string, unknown[]>)[map];
      if (!Array.isArray(recs)) continue;

      const solo = recs.filter((r: unknown) => (r as { player_count?: number }).player_count === 1);
      const byDiff: Record<Bo4Difficulty, { classic: number | null; all: number | null }> = {
        NORMAL: { classic: null, all: null },
        HARDCORE: { classic: null, all: null },
        REALISTIC: { classic: null, all: null },
      };

      for (const r of solo) {
        const boardId = (r as { board_id?: string }).board_id ?? '';
        const sec = parseTime((r as { achieved?: string }).achieved ?? '');
        if (sec == null) continue;

        let diff: Bo4Difficulty = 'NORMAL';
        if (boardId.includes('-real-') || boardId.includes('-realistic-')) diff = 'REALISTIC';
        else if (boardId.includes('-hc-') || boardId.includes('-hardcore-')) diff = 'HARDCORE';

        const elix = boardId.includes('classic-elixirs') ? 'classic' : 'all';
        const cur = byDiff[diff][elix];
        if (cur == null || sec < cur) byDiff[diff][elix] = sec;
      }

      result[cztType][map] = byDiff;
    }
  }

  cache = result;
  return cache;
}

export function getBo4SpeedrunWRSeconds(
  mapSlug: string,
  challengeType: string,
  difficulty: Bo4Difficulty,
  elixirVariant: 'all' | 'classic'
): number | null {
  const c = buildCache();
  if (!c) return null;
  const byType = c[challengeType];
  if (!byType) return null;
  const byMap = byType[mapSlug];
  if (!byMap) return null;
  const val = byMap[difficulty]?.[elixirVariant];
  if (val != null) return val;
  if (difficulty === 'REALISTIC') {
    const hc = byMap.HARDCORE?.[elixirVariant];
    if (hc != null) return hc * 1.5;
    const norm = byMap.NORMAL?.[elixirVariant];
    if (norm != null) return norm * 2;
  }
  if (difficulty === 'HARDCORE') {
    const norm = byMap.NORMAL?.[elixirVariant];
    if (norm != null) return norm * 1.2;
  }
  if (elixirVariant === 'classic') {
    const allVal = byMap[difficulty]?.all;
    if (allVal != null) return allVal * 1.15;
  }
  return null;
}
