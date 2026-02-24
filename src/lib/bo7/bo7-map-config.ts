/**
 * BO7 map configuration: challenge types, WRs, speedruns, exfil, EE.
 * Same pattern as BO6. All BO7 maps have round cap 999.
 * BO7: Gums ALLOWED, Support ALLOWED, Timed out gobblegum NOT ALLOWED.
 */

import type { ChallengeType } from '@prisma/client';

export type Bo7MapSlug =
  | 'ashes-of-the-damned'
  | 'astra-malorum'
  | 'mars'
  | 'vandorn-farm'
  | 'exit-115'
  | 'zarya-cosmodrome';

function min(s: number) {
  return s * 60;
}
function hms(h: number, m: number, s: number) {
  return h * 3600 + m * 60 + s;
}
function h(hours: number) {
  return hours * 3600;
}

export type Bo7MapConfig = {
  challengeTypes: ChallengeType[];
  highRoundWR: number;
  noDownsWR: number;
  firstRoomWR?: number;
  noPerksWR?: number;
  noJugWR?: number;
  noPowerWR?: number;
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
  } | null;
};

export const BO7_MAP_CONFIG: Record<Bo7MapSlug, Bo7MapConfig> = {
  'ashes-of-the-damned': {
    challengeTypes: [
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
      'ROUND_999_SPEEDRUN',
      'EXFIL_SPEEDRUN',
      'EXFIL_R21_SPEEDRUN',
      'EASTER_EGG_SPEEDRUN',
    ],
    highRoundWR: 999,
    noDownsWR: 999,
    firstRoomWR: 241,
    noPerksWR: 120,
    noJugWR: 258,
    noPowerWR: 241,
    speedrunWRs: {
      r30: min(13) + 24,
      r50: min(24) + 27,
      r70: min(34) + 49,
      r100: min(52) + 36,
      r200: h(4),
      r999: h(80),
      exfilSpeedrunWR: min(4) + 20,
      exfilR21SpeedrunWR: min(10),
      eeSpeedrunWR: min(30),
    },
  },
  'vandorn-farm': {
    challengeTypes: [
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
      'ROUND_999_SPEEDRUN',
      'EXFIL_SPEEDRUN',
      'EXFIL_R21_SPEEDRUN',
    ],
    highRoundWR: 999,
    noDownsWR: 999,
    firstRoomWR: 144,
    noPerksWR: 106,
    noJugWR: 106,
    noPowerWR: 529,
    speedrunWRs: {
      r30: min(14) + 50,
      r50: min(29),
      r70: min(52),
      r100: hms(1, 34, 40),
      r200: hms(7, 45, 20),
      r999: h(130),
      exfilSpeedrunWR: min(4) + 20,
      exfilR21SpeedrunWR: min(9) + 40,
    },
  },
  'astra-malorum': {
    challengeTypes: [
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
      'ROUND_999_SPEEDRUN',
      'EXFIL_SPEEDRUN',
      'EXFIL_R21_SPEEDRUN',
      'EASTER_EGG_SPEEDRUN',
    ],
    highRoundWR: 999,
    noDownsWR: 999,
    firstRoomWR: 58,
    noPerksWR: 58,
    noJugWR: 72,
    noPowerWR: 999,
    speedrunWRs: {
      r30: min(16),
      r50: min(30),
      r70: hms(1, 20, 40),
      r100: hms(2, 10, 40),
      r200: h(8),
      r999: h(115),
      exfilSpeedrunWR: min(4) + 50,
      exfilR21SpeedrunWR: min(11),
      eeSpeedrunWR: min(30),
    },
  },
  'exit-115': {
    challengeTypes: [
      'HIGHEST_ROUND',
      'NO_DOWNS',
      'NO_PERKS',
      'NO_PACK',
      'STARTING_ROOM',
      'ONE_BOX',
      'PISTOL_ONLY',
      'ROUND_30_SPEEDRUN',
      'ROUND_50_SPEEDRUN',
      'ROUND_70_SPEEDRUN',
      'ROUND_100_SPEEDRUN',
      'ROUND_200_SPEEDRUN',
      'ROUND_999_SPEEDRUN',
      'EXFIL_SPEEDRUN',
      'EXFIL_R21_SPEEDRUN',
    ],
    highRoundWR: 999,
    noDownsWR: 999,
    firstRoomWR: 130,
    noPerksWR: 50,
    noJugWR: 64,
    speedrunWRs: {
      r30: min(15),
      r50: min(35),
      r70: min(60),
      r100: hms(1, 40, 40),
      r200: h(10),
      r999: h(130),
      exfilSpeedrunWR: min(4) + 23,
      exfilR21SpeedrunWR: min(9) + 30,
    },
  },
  'zarya-cosmodrome': {
    challengeTypes: [
      'HIGHEST_ROUND',
      'NO_DOWNS',
      'NO_PERKS',
      'NO_PACK',
      'STARTING_ROOM',
      'ONE_BOX',
      'PISTOL_ONLY',
      'ROUND_30_SPEEDRUN',
      'ROUND_50_SPEEDRUN',
      'ROUND_70_SPEEDRUN',
      'ROUND_100_SPEEDRUN',
      'ROUND_200_SPEEDRUN',
      'ROUND_999_SPEEDRUN',
      'EXFIL_SPEEDRUN',
      'EXFIL_R21_SPEEDRUN',
    ],
    highRoundWR: 999,
    noDownsWR: 999,
    firstRoomWR: 610,
    noPerksWR: 70,
    noJugWR: 100,
    speedrunWRs: {
      r30: min(14) + 30,
      r50: min(34) + 20,
      r70: min(54),
      r100: hms(1, 50, 40),
      r200: hms(8, 30, 0),
      r999: h(120),
      exfilSpeedrunWR: min(4),
      exfilR21SpeedrunWR: min(9),
    },
  },
  mars: {
    challengeTypes: [
      'HIGHEST_ROUND',
      'NO_DOWNS',
      'NO_PERKS',
      'NO_PACK',
      'STARTING_ROOM',
      'ONE_BOX',
      'PISTOL_ONLY',
      'ROUND_30_SPEEDRUN',
      'ROUND_50_SPEEDRUN',
      'ROUND_70_SPEEDRUN',
      'ROUND_100_SPEEDRUN',
      'ROUND_200_SPEEDRUN',
      'ROUND_999_SPEEDRUN',
      'EXFIL_SPEEDRUN',
      'EXFIL_R21_SPEEDRUN',
    ],
    highRoundWR: 999,
    noDownsWR: 999,
    firstRoomWR: 610,
    noPerksWR: 70,
    noJugWR: 100,
    speedrunWRs: {
      r30: min(14) + 30,
      r50: min(34) + 20,
      r70: min(54),
      r100: hms(1, 50, 40),
      r200: hms(8, 30, 0),
      r999: h(120),
      exfilSpeedrunWR: min(4),
      exfilR21SpeedrunWR: min(9),
    },
  },
};

export const BO7_CHALLENGE_TYPE_LABELS: Record<string, string> = {
  NO_JUG: 'No Jug',
  EXFIL_SPEEDRUN: 'Exfil Round 11',
  EXFIL_R21_SPEEDRUN: 'Exfil Round 21',
  ROUND_999_SPEEDRUN: 'Round 999 Speedrun',
};

export function getBo7ChallengeTypeLabel(type: string): string {
  return BO7_CHALLENGE_TYPE_LABELS[type] ?? type.replace(/_/g, ' ');
}

export function getBo7MapConfig(slug: string): Bo7MapConfig | null {
  return (BO7_MAP_CONFIG as Record<string, Bo7MapConfig | undefined>)[slug] ?? null;
}

export function isBo7Map(slug: string): slug is Bo7MapSlug {
  return slug in BO7_MAP_CONFIG;
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

export function getBo7RoundMilestones(wr: number, tierCount?: number): { round: number; xp: number }[] {
  return buildWrBasedRounds(wr, tierCount ?? 6);
}
