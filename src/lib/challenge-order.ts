/**
 * Challenge type display order for log view, leaderboards, and dropdowns.
 * Returns ordered types from map config so challenges appear meaningfully:
 * round-based first (Highest Round, No Downs, No Perks...), then speedruns (R5, R15, R30...), then EE/special.
 */

import { IW_CHALLENGE_TYPES_ORDER } from '@/lib/iw';
import { getWaWMapConfig } from '@/lib/waw/waw-map-config';
import { getBo1MapConfig } from '@/lib/bo1/bo1-map-config';
import { getBo2MapConfig } from '@/lib/bo2/bo2-map-config';
import { getBo3MapConfig } from '@/lib/bo3/bo3-map-config';
import { getBo4MapConfig } from '@/lib/bo4/bo4-map-config';
import { getBocwMapConfig } from '@/lib/bocw/bocw-map-config';
import { getBo6MapConfig } from '@/lib/bo6/bo6-map-config';
import { getBo7MapConfig } from '@/lib/bo7/bo7-map-config';
import { getWw2MapConfig } from '@/lib/ww2/ww2-map-config';
import { getVanguardMapConfig } from '@/lib/vanguard/vanguard-map-config';
import { getAwMapConfig } from '@/lib/aw/aw-map-config';

/** Get ordered challenge types for a map. Highest Round is always first; rest follow config order. */
export function getChallengeTypeOrderForMap(
  gameShortName: string | null | undefined,
  mapSlug: string | null | undefined
): string[] {
  if (!gameShortName || !mapSlug) return [];
  const rest =
    gameShortName === 'IW'
      ? IW_CHALLENGE_TYPES_ORDER.filter((t) => t !== 'HIGHEST_ROUND')
      : (() => {
          const cfg =
            gameShortName === 'WAW' ? getWaWMapConfig(mapSlug)
            : gameShortName === 'BO1' ? getBo1MapConfig(mapSlug)
            : gameShortName === 'BO2' ? getBo2MapConfig(mapSlug)
            : gameShortName === 'BO3' ? getBo3MapConfig(mapSlug)
            : gameShortName === 'BO4' ? getBo4MapConfig(mapSlug)
            : gameShortName === 'BOCW' ? getBocwMapConfig(mapSlug)
            : gameShortName === 'BO6' ? getBo6MapConfig(mapSlug)
            : gameShortName === 'BO7' ? getBo7MapConfig(mapSlug)
            : gameShortName === 'WW2' ? getWw2MapConfig(mapSlug)
            : gameShortName === 'VANGUARD' ? getVanguardMapConfig(mapSlug)
            : gameShortName === 'AW' ? getAwMapConfig(mapSlug)
            : null;
          if (!cfg?.challengeTypes) return [];
          return (cfg.challengeTypes as string[]).filter((t) => t !== 'HIGHEST_ROUND');
        })();
  return ['HIGHEST_ROUND', ...rest];
}

/** Sort challenges for log view / dropdowns using config order. Unknown types go at end. */
export function sortChallengesForDisplay<T extends { type: string; name?: string }>(
  challenges: T[],
  gameShortName: string | null | undefined,
  mapSlug: string | null | undefined
): T[] {
  const order = getChallengeTypeOrderForMap(gameShortName, mapSlug);
  if (order.length === 0) {
    return [...challenges].sort((a, b) => (a.name || a.type).localeCompare(b.name || b.type));
  }
  return [...challenges].sort((a, b) => {
    const ai = order.indexOf(a.type);
    const bi = order.indexOf(b.type);
    if (ai === -1 && bi === -1) return (a.name || a.type).localeCompare(b.name || b.type);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}
