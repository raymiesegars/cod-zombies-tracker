/**
 * Infinite Warfare Zombies: fortune cards and directors cut.
 * All IW logs require useFortuneCards (true = fate + fortune cards, false = fate only).
 * useDirectorsCut is optional (default off).
 */

export const GAME_SHORT_NAME_IW = 'IW';

const IW_SPEEDRUN_TYPES = [
  'ROUND_30_SPEEDRUN',
  'ROUND_50_SPEEDRUN',
  'ROUND_70_SPEEDRUN',
  'ROUND_100_SPEEDRUN',
  'ROUND_200_SPEEDRUN',
  'EASTER_EGG_SPEEDRUN',
  'GHOST_AND_SKULLS',
  'ALIENS_BOSS_FIGHT',
  'CRYPTID_FIGHT',
  'MEPHISTOPHELES',
] as const;

export function isIwGame(shortName: string | null | undefined): boolean {
  return shortName === GAME_SHORT_NAME_IW;
}

export function isIwSpeedrunChallengeType(type: string): boolean {
  return (IW_SPEEDRUN_TYPES as readonly string[]).includes(type);
}

const BOCW_SPEEDRUN_TYPES = [
  'ROUND_10_SPEEDRUN', 'ROUND_20_SPEEDRUN', 'ROUND_30_SPEEDRUN', 'ROUND_50_SPEEDRUN',
  'ROUND_70_SPEEDRUN', 'ROUND_100_SPEEDRUN', 'ROUND_200_SPEEDRUN', 'ROUND_935_SPEEDRUN',
  'EXFIL_SPEEDRUN', 'EXFIL_R21_SPEEDRUN', 'BUILD_EE_SPEEDRUN', 'EASTER_EGG_SPEEDRUN',
] as const;

/** All speedrun types across games. Used for form/validation. */
export function isSpeedrunChallengeType(type: string): boolean {
  return isIwSpeedrunChallengeType(type)
    || type === 'ROUND_255_SPEEDRUN'
    || type === 'INSTAKILL_ROUND_SPEEDRUN'
    || (BOCW_SPEEDRUN_TYPES as readonly string[]).includes(type);
}

/** Minimum round required when logging this speedrun type. Non-round speedruns (EE, exfil, etc.) return 1. */
export function getMinRoundForSpeedrunChallengeType(type: string): number {
  switch (type) {
    case 'ROUND_10_SPEEDRUN': return 10;
    case 'ROUND_20_SPEEDRUN': return 20;
    case 'EXFIL_SPEEDRUN': return 11;
    case 'EXFIL_R21_SPEEDRUN': return 21;
    case 'ROUND_30_SPEEDRUN': return 30;
    case 'ROUND_50_SPEEDRUN': return 50;
    case 'ROUND_70_SPEEDRUN': return 70;
    case 'ROUND_100_SPEEDRUN': return 100;
    case 'ROUND_200_SPEEDRUN': return 200;
    case 'ROUND_255_SPEEDRUN': return 255;
    case 'ROUND_935_SPEEDRUN': return 935;
    default: return 1;
  }
}

/** Display order for IW challenge types in leaderboard/map dropdowns (same on all IW maps and main leaderboard). */
export const IW_CHALLENGE_TYPES_ORDER: string[] = [
  'HIGHEST_ROUND',
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
  'ROUND_200_SPEEDRUN',
  'EASTER_EGG_SPEEDRUN',
  'GHOST_AND_SKULLS',
  'ALIENS_BOSS_FIGHT',
  'CRYPTID_FIGHT',
  'MEPHISTOPHELES',
];
