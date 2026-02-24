/**
 * BO6 map configuration: challenge types, WRs, speedruns, exfil, build% EE.
 * Same pattern as BOCW. All BO6 maps have round cap 999.
 */

import type { ChallengeType } from '@prisma/client';

export type Bo6MapSlug =
  | 'terminus'
  | 'liberty-falls'
  | 'citadelle-des-morts'
  | 'the-tomb'
  | 'shattered-veil'
  | 'reckoning';

function min(s: number) {
  return s * 60;
}
function hms(h: number, m: number, s: number) {
  return h * 3600 + m * 60 + s;
}
function h(hours: number) {
  return hours * 3600;
}

export type Bo6MapConfig = {
  challengeTypes: ChallengeType[];
  highRoundWR: number;
  noDownsWR: number;
  firstRoomWR?: number;
  noPerksWR?: number;
  noJugWR?: number;
  speedrunWRs: {
    r30?: number;
    r50?: number;
    r70?: number;
    r100?: number;
    r200?: number;
    r999?: number;
    exfilSpeedrunWR?: number;
    exfilR21SpeedrunWR?: number;
    eeSpeedrunWR?: number;
    buildEeSpeedrunWR?: number;
  } | null;
};

export const BO6_MAP_CONFIG: Record<Bo6MapSlug, Bo6MapConfig> = {
  terminus: {
    challengeTypes: [
      'HIGHEST_ROUND',
      'NO_DOWNS',
      'NO_PERKS',
      'NO_PACK',
      'STARTING_ROOM',
      'ONE_BOX',
      'PISTOL_ONLY',
      'NO_POWER',
      'ROUND_5_SPEEDRUN',
      'ROUND_15_SPEEDRUN',
      'ROUND_30_SPEEDRUN',
      'ROUND_50_SPEEDRUN',
      'ROUND_70_SPEEDRUN',
      'ROUND_100_SPEEDRUN',
      'ROUND_200_SPEEDRUN',
      'ROUND_999_SPEEDRUN',
      'EXFIL_SPEEDRUN',
      'EXFIL_R21_SPEEDRUN',
      'EASTER_EGG_SPEEDRUN',
      'BUILD_EE_SPEEDRUN',
    ],
    highRoundWR: 999,
    noDownsWR: 999,
    firstRoomWR: 45,
    noPerksWR: 201,
    noJugWR: 351,
    speedrunWRs: {
      r30: min(24),
      r50: min(44),
      r70: hms(1, 9, 40),
      r100: hms(1, 50, 40),
      r200: hms(4, 54, 40),
      r999: h(107),
      exfilSpeedrunWR: min(6) + 20,
      exfilR21SpeedrunWR: min(13) + 30,
      eeSpeedrunWR: min(19),
      buildEeSpeedrunWR: min(21),
    },
  },
  'liberty-falls': {
    challengeTypes: [
      'HIGHEST_ROUND',
      'NO_DOWNS',
      'NO_PERKS',
      'NO_PACK',
      'STARTING_ROOM',
      'ONE_BOX',
      'PISTOL_ONLY',
      'NO_POWER',
      'ROUND_5_SPEEDRUN',
      'ROUND_15_SPEEDRUN',
      'ROUND_30_SPEEDRUN',
      'ROUND_50_SPEEDRUN',
      'ROUND_70_SPEEDRUN',
      'ROUND_100_SPEEDRUN',
      'ROUND_200_SPEEDRUN',
      'ROUND_999_SPEEDRUN',
      'EXFIL_SPEEDRUN',
      'EXFIL_R21_SPEEDRUN',
      'EASTER_EGG_SPEEDRUN',
      'BUILD_EE_SPEEDRUN',
    ],
    highRoundWR: 999,
    noDownsWR: 999,
    firstRoomWR: 212,
    noPerksWR: 247,
    noJugWR: 443,
    speedrunWRs: {
      r30: min(22),
      r50: min(42),
      r70: hms(1, 5, 40),
      r100: hms(1, 40, 40),
      r200: hms(4, 30, 40),
      r999: h(171),
      exfilSpeedrunWR: min(5) + 30,
      exfilR21SpeedrunWR: min(12) + 30,
      eeSpeedrunWR: min(12),
      buildEeSpeedrunWR: min(12),
    },
  },
  'citadelle-des-morts': {
    challengeTypes: [
      'HIGHEST_ROUND',
      'NO_DOWNS',
      'NO_PERKS',
      'NO_PACK',
      'STARTING_ROOM',
      'ONE_BOX',
      'PISTOL_ONLY',
      'NO_POWER',
      'ROUND_5_SPEEDRUN',
      'ROUND_15_SPEEDRUN',
      'ROUND_30_SPEEDRUN',
      'ROUND_50_SPEEDRUN',
      'ROUND_70_SPEEDRUN',
      'ROUND_100_SPEEDRUN',
      'ROUND_200_SPEEDRUN',
      'ROUND_999_SPEEDRUN',
      'EXFIL_SPEEDRUN',
      'EXFIL_R21_SPEEDRUN',
      'EASTER_EGG_SPEEDRUN',
    ],
    highRoundWR: 999,
    noDownsWR: 999,
    firstRoomWR: 999,
    noPerksWR: 200,
    noJugWR: 259,
    speedrunWRs: {
      r30: min(24),
      r50: min(42) + 30,
      r70: min(59),
      r100: hms(1, 32, 40),
      r200: hms(3, 52, 40),
      r999: h(94),
      exfilSpeedrunWR: min(6) + 50,
      exfilR21SpeedrunWR: min(16),
      eeSpeedrunWR: min(23),
    },
  },
  'the-tomb': {
    challengeTypes: [
      'HIGHEST_ROUND',
      'NO_DOWNS',
      'NO_PERKS',
      'NO_PACK',
      'STARTING_ROOM',
      'ONE_BOX',
      'PISTOL_ONLY',
      'NO_POWER',
      'ROUND_5_SPEEDRUN',
      'ROUND_15_SPEEDRUN',
      'ROUND_30_SPEEDRUN',
      'ROUND_50_SPEEDRUN',
      'ROUND_70_SPEEDRUN',
      'ROUND_100_SPEEDRUN',
      'ROUND_200_SPEEDRUN',
      'ROUND_999_SPEEDRUN',
      'EXFIL_SPEEDRUN',
      'EXFIL_R21_SPEEDRUN',
      'EASTER_EGG_SPEEDRUN',
      'BUILD_EE_SPEEDRUN',
    ],
    highRoundWR: 999,
    noDownsWR: 999,
    firstRoomWR: 67,
    noPerksWR: 402,
    noJugWR: 999,
    speedrunWRs: {
      r30: min(21),
      r50: min(38),
      r70: min(54),
      r100: hms(1, 21, 40),
      r200: hms(3, 8, 40),
      r999: h(55),
      exfilSpeedrunWR: min(6),
      exfilR21SpeedrunWR: min(13) + 37,
      eeSpeedrunWR: min(29),
      buildEeSpeedrunWR: min(23),
    },
  },
  'shattered-veil': {
    challengeTypes: [
      'HIGHEST_ROUND',
      'NO_DOWNS',
      'NO_PERKS',
      'NO_PACK',
      'STARTING_ROOM',
      'ONE_BOX',
      'PISTOL_ONLY',
      'NO_POWER',
      'ROUND_5_SPEEDRUN',
      'ROUND_15_SPEEDRUN',
      'ROUND_30_SPEEDRUN',
      'ROUND_50_SPEEDRUN',
      'ROUND_70_SPEEDRUN',
      'ROUND_100_SPEEDRUN',
      'ROUND_200_SPEEDRUN',
      'ROUND_999_SPEEDRUN',
      'EXFIL_SPEEDRUN',
      'EXFIL_R21_SPEEDRUN',
      'EASTER_EGG_SPEEDRUN',
      'BUILD_EE_SPEEDRUN',
    ],
    highRoundWR: 999,
    noDownsWR: 999,
    firstRoomWR: 86,
    noPerksWR: 310,
    noJugWR: 999,
    speedrunWRs: {
      r30: min(20) + 42,
      r50: min(42),
      r70: min(59),
      r100: hms(1, 30, 40),
      r200: hms(3, 35, 40),
      r999: h(68),
      exfilSpeedrunWR: min(6),
      exfilR21SpeedrunWR: min(12) + 30,
      eeSpeedrunWR: min(35),
      buildEeSpeedrunWR: min(22),
    },
  },
  reckoning: {
    challengeTypes: [
      'HIGHEST_ROUND',
      'NO_DOWNS',
      'NO_PERKS',
      'NO_PACK',
      'STARTING_ROOM',
      'ONE_BOX',
      'PISTOL_ONLY',
      'NO_POWER',
      'ROUND_5_SPEEDRUN',
      'ROUND_15_SPEEDRUN',
      'ROUND_30_SPEEDRUN',
      'ROUND_50_SPEEDRUN',
      'ROUND_70_SPEEDRUN',
      'ROUND_100_SPEEDRUN',
      'ROUND_200_SPEEDRUN',
      'ROUND_999_SPEEDRUN',
      'EXFIL_SPEEDRUN',
      'EXFIL_R21_SPEEDRUN',
      'EASTER_EGG_SPEEDRUN',
    ],
    highRoundWR: 999,
    noDownsWR: 999,
    firstRoomWR: 62,
    noPerksWR: 54,
    noJugWR: 100,
    speedrunWRs: {
      r30: min(23),
      r50: min(47),
      r70: hms(1, 21, 40),
      r100: hms(2, 2, 40),
      r200: hms(4, 42, 40),
      r999: h(89),
      exfilSpeedrunWR: min(6) + 20,
      exfilR21SpeedrunWR: min(14),
      eeSpeedrunWR: min(22),
    },
  },
};

export const BO6_CHALLENGE_TYPE_LABELS: Record<string, string> = {
  NO_JUG: 'No Jug',
  EXFIL_SPEEDRUN: 'Exfil Round 11',
  EXFIL_R21_SPEEDRUN: 'Exfil Round 21',
  BUILD_EE_SPEEDRUN: 'Build% EE Speedrun',
  ROUND_999_SPEEDRUN: 'Round 999 Speedrun',
};

export function getBo6ChallengeTypeLabel(type: string): string {
  return BO6_CHALLENGE_TYPE_LABELS[type] ?? type.replace(/_/g, ' ');
}

export function getBo6MapConfig(slug: string): Bo6MapConfig | null {
  return (BO6_MAP_CONFIG as Record<string, Bo6MapConfig | undefined>)[slug] ?? null;
}

export function isBo6Map(slug: string): slug is Bo6MapSlug {
  return slug in BO6_MAP_CONFIG;
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

export function getBo6RoundMilestones(wr: number, tierCount?: number): { round: number; xp: number }[] {
  return buildWrBasedRounds(wr, tierCount ?? 6);
}
