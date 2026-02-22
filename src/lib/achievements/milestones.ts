import type { ChallengeType } from '@prisma/client';

// Default round tiers for HR / no downs (20–100, 30% max step) when a map has no round config
export const BASE_ROUNDS = [20, 26, 34, 35, 44, 50, 57, 70, 74, 96, 100] as const;
export const BASE_XP = [50, 90, 150, 160, 260, 320, 400, 580, 640, 1000, 1000] as const;
export const CAP_XP_BONUS = 500;

export const NO_PERKS_ROUNDS = [10, 20, 30, 40, 50] as const;
export const NO_PACK_ROUNDS = [10, 20, 30, 40, 50] as const;
export const NO_PERKS_NO_PACK_MULTIPLIER = 2;

export const STARTING_ROOM_ROUNDS = [10, 15, 20, 30, 40, 50] as const;
export const STARTING_ROOM_MULTIPLIER = 3;

export const ONE_BOX_ROUND = 30;
export const ONE_BOX_XP = 600;

export const PISTOL_ONLY_ROUNDS = [5, 10, 15, 20, 25] as const;
export const PISTOL_ONLY_MULTIPLIER = 3;

export const NO_POWER_ROUNDS = [10, 15, 20, 30] as const;
export const NO_POWER_MULTIPLIER = 3;

export const EASTER_EGG_BASE_XP = 2500;

export function getMilestonesForChallengeType(
  challengeType: ChallengeType
): { rounds: readonly number[]; multiplier: number; flatXp?: number } | null {
  switch (challengeType) {
    case 'HIGHEST_ROUND':
    case 'NO_DOWNS':
      return { rounds: BASE_ROUNDS, multiplier: 1 };
    case 'NO_PERKS':
      return { rounds: NO_PERKS_ROUNDS, multiplier: NO_PERKS_NO_PACK_MULTIPLIER };
    case 'NO_PACK':
      return { rounds: NO_PACK_ROUNDS, multiplier: NO_PERKS_NO_PACK_MULTIPLIER };
    case 'STARTING_ROOM':
    case 'STARTING_ROOM_JUG_SIDE':
    case 'STARTING_ROOM_QUICK_SIDE':
      return { rounds: STARTING_ROOM_ROUNDS, multiplier: STARTING_ROOM_MULTIPLIER };
    case 'ONE_BOX':
      return { rounds: [ONE_BOX_ROUND], multiplier: 0, flatXp: ONE_BOX_XP };
    case 'PISTOL_ONLY':
      return { rounds: PISTOL_ONLY_ROUNDS, multiplier: PISTOL_ONLY_MULTIPLIER };
    case 'NO_POWER':
      return { rounds: NO_POWER_ROUNDS, multiplier: NO_POWER_MULTIPLIER };
    case 'NO_MAGIC':
      return { rounds: [10, 15, 20, 30, 40, 50], multiplier: NO_POWER_MULTIPLIER };
    default:
      return null;
  }
}

export function getCapXp(): number {
  const base = BASE_XP[BASE_XP.length - 1] ?? 1000;
  return base + CAP_XP_BONUS;
}

export function getBaseXpForRound(round: number, roundCap?: number | null): number {
  if (roundCap != null && round >= roundCap) return getCapXp();
  for (let i = BASE_ROUNDS.length - 1; i >= 0; i--) {
    if (round >= BASE_ROUNDS[i]!) return BASE_XP[i]!;
  }
  return 0;
}

export function getXpForChallengeRound(
  challengeType: ChallengeType,
  round: number,
  roundCap?: number | null
): number {
  const config = getMilestonesForChallengeType(challengeType);
  if (!config) return 0;
  if (config.flatXp != null) {
    return round >= config.rounds[0]! ? config.flatXp : 0;
  }
  let maxXp = 0;
  for (const r of config.rounds) {
    if (round >= r) {
      const baseEquivalent = getBaseXpForRound(r, roundCap);
      const xp = Math.floor(baseEquivalent * config.multiplier);
      maxXp = Math.max(maxXp, xp);
    }
  }
  return maxXp;
}
