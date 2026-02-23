/**
 * BOCW map configuration: challenge types, WRs, speedruns, exfil, build% EE.
 */

import type { ChallengeType } from '@prisma/client';

export type BocwMapSlug = 'die-maschine' | 'firebase-z' | 'outbreak' | 'mauer-der-toten' | 'forsaken';

function min(s: number) { return s * 60; }
function hms(h: number, m: number, s: number) { return h * 3600 + m * 60 + s; }
function h(hours: number) { return hours * 3600; }

export type BocwMapConfig = {
  challengeTypes: ChallengeType[];
  highRoundWR: number;
  noDownsWR: number;
  puristWR?: number;
  firstRoomWR?: number;
  noPowerWR?: number;
  noPerksWR?: number;
  noArmorWR?: number;
  noJugWR?: number;
  speedrunWRs: {
    r10?: number;
    r20?: number;
    r30?: number;
    r50?: number;
    r70?: number;
    r100?: number;
    r200?: number;
    r935?: number;
    exfilSpeedrunWR?: number;
    exfilR21SpeedrunWR?: number;
    eeSpeedrunWR?: number;
    buildEeSpeedrunWR?: number;
    /** Outbreak 2nd main EE */
    ee2SpeedrunWR?: number;
  } | null;
};

export const BOCW_MAP_CONFIG: Record<BocwMapSlug, BocwMapConfig> = {
  'die-maschine': {
    challengeTypes: ['HIGHEST_ROUND', 'NO_DOWNS', 'NO_PERKS', 'NO_POWER', 'STARTING_ROOM', 'PURIST', 'NO_ARMOR', 'NO_JUG', 'ONE_BOX', 'PISTOL_ONLY', 'NO_PACK', 'ROUND_30_SPEEDRUN', 'ROUND_50_SPEEDRUN', 'ROUND_70_SPEEDRUN', 'ROUND_100_SPEEDRUN', 'ROUND_200_SPEEDRUN', 'ROUND_935_SPEEDRUN', 'EXFIL_SPEEDRUN', 'EXFIL_R21_SPEEDRUN', 'EASTER_EGG_SPEEDRUN'],
    highRoundWR: 935,
    noDownsWR: 935,
    puristWR: 358,
    firstRoomWR: 935,
    noPowerWR: 275,
    noPerksWR: 935,
    noArmorWR: 608,
    noJugWR: 935,
    speedrunWRs: {
      r30: min(21),
      r50: min(39),
      r70: min(54),
      r100: hms(1, 20, 40),
      r200: hms(3, 11, 40),
      r935: h(87),
      exfilSpeedrunWR: min(6) + 40,
      exfilR21SpeedrunWR: min(16),
      eeSpeedrunWR: min(20) + 22,
    },
  },
  'firebase-z': {
    challengeTypes: ['HIGHEST_ROUND', 'NO_DOWNS', 'NO_PERKS', 'NO_POWER', 'STARTING_ROOM', 'PURIST', 'NO_ARMOR', 'NO_JUG', 'ONE_BOX', 'PISTOL_ONLY', 'NO_PACK', 'ROUND_30_SPEEDRUN', 'ROUND_50_SPEEDRUN', 'ROUND_70_SPEEDRUN', 'ROUND_100_SPEEDRUN', 'ROUND_200_SPEEDRUN', 'ROUND_935_SPEEDRUN', 'EXFIL_SPEEDRUN', 'EXFIL_R21_SPEEDRUN', 'EASTER_EGG_SPEEDRUN', 'BUILD_EE_SPEEDRUN'],
    highRoundWR: 935,
    noDownsWR: 935,
    puristWR: 295,
    firstRoomWR: 476,
    noPowerWR: 382,
    noPerksWR: 935,
    noArmorWR: 495,
    noJugWR: 935,
    speedrunWRs: {
      r30: min(28),
      r50: min(53),
      r70: hms(1, 17, 40),
      r100: h(2),
      r200: hms(5, 39, 40),
      r935: h(88),
      exfilSpeedrunWR: min(7) + 30,
      exfilR21SpeedrunWR: min(18),
      eeSpeedrunWR: min(20) + 22,
      buildEeSpeedrunWR: min(21) + 20,
    },
  },
  'mauer-der-toten': {
    challengeTypes: ['HIGHEST_ROUND', 'NO_DOWNS', 'NO_PERKS', 'NO_POWER', 'STARTING_ROOM', 'PURIST', 'NO_ARMOR', 'NO_JUG', 'ONE_BOX', 'PISTOL_ONLY', 'NO_PACK', 'ROUND_30_SPEEDRUN', 'ROUND_50_SPEEDRUN', 'ROUND_70_SPEEDRUN', 'ROUND_100_SPEEDRUN', 'ROUND_200_SPEEDRUN', 'ROUND_935_SPEEDRUN', 'EXFIL_SPEEDRUN', 'EXFIL_R21_SPEEDRUN', 'EASTER_EGG_SPEEDRUN'],
    highRoundWR: 935,
    noDownsWR: 935,
    puristWR: 261,
    firstRoomWR: 265,
    noPowerWR: 121,
    noPerksWR: 276,
    noArmorWR: 785,
    noJugWR: 935,
    speedrunWRs: {
      r30: min(22),
      r50: min(41),
      r70: min(58) + 30,
      r100: hms(1, 27, 40),
      r200: hms(3, 48, 40),
      r935: h(56),
      exfilSpeedrunWR: min(7) + 20,
      exfilR21SpeedrunWR: min(16) + 30,
      eeSpeedrunWR: min(23),
    },
  },
  outbreak: {
    challengeTypes: ['HIGHEST_ROUND', 'NO_DOWNS', 'NO_PERKS', 'NO_ARMOR', 'NO_JUG', 'ROUND_10_SPEEDRUN', 'ROUND_20_SPEEDRUN', 'ROUND_30_SPEEDRUN', 'ROUND_50_SPEEDRUN', 'EASTER_EGG_SPEEDRUN'],
    highRoundWR: 2159,
    noDownsWR: 510,
    firstRoomWR: undefined,
    noPowerWR: undefined,
    noPerksWR: 259,
    noArmorWR: 400,
    noJugWR: 1250,
    speedrunWRs: {
      r10: min(32) + 38,
      r20: hms(1, 9, 18),
      r30: hms(1, 44, 24),
      r50: hms(3, 8, 40),
      eeSpeedrunWR: min(20),
      ee2SpeedrunWR: min(15) + 30,
    },
  },
  forsaken: {
    challengeTypes: ['HIGHEST_ROUND', 'NO_DOWNS', 'NO_PERKS', 'NO_POWER', 'STARTING_ROOM', 'PURIST', 'NO_ARMOR', 'NO_JUG', 'ONE_BOX', 'PISTOL_ONLY', 'NO_PACK', 'ROUND_30_SPEEDRUN', 'ROUND_50_SPEEDRUN', 'ROUND_70_SPEEDRUN', 'ROUND_100_SPEEDRUN', 'ROUND_200_SPEEDRUN', 'ROUND_935_SPEEDRUN', 'EXFIL_SPEEDRUN', 'EXFIL_R21_SPEEDRUN', 'EASTER_EGG_SPEEDRUN', 'BUILD_EE_SPEEDRUN'],
    highRoundWR: 935,
    noDownsWR: 935,
    puristWR: 401,
    firstRoomWR: 935,
    noPowerWR: 306,
    noPerksWR: 900,
    noArmorWR: 332,
    noJugWR: 935,
    speedrunWRs: {
      r30: min(16),
      r50: min(37),
      r70: min(55),
      r100: hms(1, 24, 30),
      r200: h(4),
      r935: h(102),
      exfilSpeedrunWR: min(4) + 30,
      exfilR21SpeedrunWR: min(10),
      eeSpeedrunWR: min(12) + 30,
      buildEeSpeedrunWR: min(14) + 30,
    },
  },
};

export const BOCW_CHALLENGE_TYPE_LABELS: Record<string, string> = {
  PURIST: 'Purist',
  NO_ARMOR: 'No Armor',
  NO_JUG: 'No Jug',
  EXFIL_SPEEDRUN: 'Exfil Round 11',
  EXFIL_R21_SPEEDRUN: 'Exfil Round 21',
  BUILD_EE_SPEEDRUN: 'Build% EE Speedrun',
  ROUND_10_SPEEDRUN: 'Round 10 Speedrun',
  ROUND_20_SPEEDRUN: 'Round 20 Speedrun',
  ROUND_935_SPEEDRUN: 'Round 935 Speedrun',
};

export function getBocwChallengeTypeLabel(type: string): string {
  return BOCW_CHALLENGE_TYPE_LABELS[type] ?? type.replace(/_/g, ' ');
}

export function getBocwMapConfig(slug: string): BocwMapConfig | null {
  return (BOCW_MAP_CONFIG as Record<string, BocwMapConfig | undefined>)[slug] ?? null;
}

export function isBocwMap(slug: string): slug is BocwMapSlug {
  return slug in BOCW_MAP_CONFIG;
}

const BASE_REQUIRED_ROUNDS = [10, 20, 30, 50, 70, 100] as const;
const BASE_XP_BY_ROUND: Record<number, number> = {
  10: 50, 20: 90, 30: 150, 50: 320, 70: 580, 100: 1000,
};

function buildWrBasedRounds(wr: number, tierCount = 6): { round: number; xp: number }[] {
  if (wr <= 0) return [];
  const baseEntries = (BASE_REQUIRED_ROUNDS as readonly number[]).filter((r) => r <= wr).map((r) => ({ round: r, xp: BASE_XP_BY_ROUND[r] ?? 50 }));
  const minRound = Math.min(20, Math.floor(wr * 0.02));
  const rounds: number[] = [];
  for (let i = 0; i < tierCount; i++) {
    const ratio = (i + 1) / (tierCount + 1);
    rounds.push(Math.min(Math.round(minRound + (wr - minRound) * Math.pow(ratio, 1.2)), wr));
  }
  const wrBased = Array.from(new Set(rounds)).sort((a, b) => a - b);
  const wrEntries = wrBased.filter((r) => r > 100).map((round) => {
    const ratio = round / wr;
    const xp = Math.round(50 + 2450 * Math.pow(ratio, 2));
    return { round, xp: Math.min(xp, 2500) };
  });
  const combined = [...baseEntries, ...wrEntries].sort((a, b) => a.round - b.round);
  return combined;
}

export function getBocwRoundMilestones(wr: number, tierCount?: number): { round: number; xp: number }[] {
  return buildWrBasedRounds(wr, tierCount ?? 6);
}
