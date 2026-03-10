export const BO3_CUSTOM_GAME_SHORT_NAME = 'BO3_CUSTOM';

export function isBo3CustomGame(shortName: string | null | undefined): boolean {
  return shortName === BO3_CUSTOM_GAME_SHORT_NAME;
}

/** Display label for BO3 Custom when showing game name to users (shortName is "BO3_CUSTOM" internally). */
export function getGameDisplayShortName(shortName: string | null | undefined, gameName?: string | null): string {
  if (shortName === BO3_CUSTOM_GAME_SHORT_NAME) return 'BO3 Custom';
  return gameName ?? shortName ?? '';
}

export const BO3_CUSTOM_CHALLENGE_TYPES = [
  'HIGHEST_ROUND',
  'NO_DOWNS',
  'NO_PERKS',
  'NO_PACK',
  'STARTING_ROOM',
  'ONE_BOX',
  'PISTOL_ONLY',
  'NO_POWER',
  'NO_ATS',
  'ROUND_5_SPEEDRUN',
  'ROUND_15_SPEEDRUN',
  'ROUND_30_SPEEDRUN',
  'ROUND_50_SPEEDRUN',
  'ROUND_70_SPEEDRUN',
  'ROUND_100_SPEEDRUN',
  'ROUND_255_SPEEDRUN',
  'EASTER_EGG_SPEEDRUN',
  'BUYABLE_ENDING_SPEEDRUN',
] as const;

/** Default achievement rounds/times for BO3 custom maps (from The Giant as baseline). Override with suggested values. Round challenges use round numbers; speedruns use seconds. BUYABLE_ENDING_SPEEDRUN has no default (optional per map). */
export const BO3_CUSTOM_DEFAULT_ROUNDS: Record<string, number> = {
  HIGHEST_ROUND: 255,
  NO_DOWNS: 255,
  NO_PERKS: 124,
  NO_PACK: 50,
  STARTING_ROOM: 54,
  ONE_BOX: 30,
  PISTOL_ONLY: 50,
  NO_POWER: 84,
  NO_ATS: 207,
  ROUND_5_SPEEDRUN: 159,
  ROUND_15_SPEEDRUN: 803,
  ROUND_30_SPEEDRUN: 1675,
  ROUND_50_SPEEDRUN: 3120,
  ROUND_70_SPEEDRUN: 5740,
  ROUND_100_SPEEDRUN: 13360,
  ROUND_255_SPEEDRUN: 198000,
  EASTER_EGG_SPEEDRUN: 3900,
  BUYABLE_ENDING_SPEEDRUN: 1800,
};

export function isBo3CustomSpeedrunType(type: string): boolean {
  return type.includes('SPEEDRUN');
}

/** XP tiers [easiest, ..., hardest] for 4-speedrun-tier spread. Based on The Giant / BO3. BUYABLE_ENDING_SPEEDRUN has highest top tier for custom achievements. */
const BO3_CUSTOM_SPEEDRUN_XP_TIERS: Record<string, [number, number, number, number]> = {
  ROUND_5_SPEEDRUN: [50, 100, 250, 600],
  ROUND_15_SPEEDRUN: [60, 150, 350, 800],
  ROUND_30_SPEEDRUN: [80, 200, 500, 1200],
  ROUND_50_SPEEDRUN: [120, 300, 700, 1500],
  ROUND_70_SPEEDRUN: [150, 400, 900, 2000],
  ROUND_100_SPEEDRUN: [200, 500, 1200, 2500],
  ROUND_255_SPEEDRUN: [300, 800, 1800, 3500],
  EASTER_EGG_SPEEDRUN: [200, 600, 1500, 2500],
  BUYABLE_ENDING_SPEEDRUN: [250, 600, 1500, 3000],
};

export type SpeedrunTier = { maxTimeSeconds: number; xpReward: number };

/** Build 4 tiers from a target WR time (seconds). Same spread pattern as BO3 maps. */
export function buildBo3CustomSpeedrunTiers(
  wrSeconds: number,
  challengeType: string
): SpeedrunTier[] {
  const buf = 1.2;
  const xp = BO3_CUSTOM_SPEEDRUN_XP_TIERS[challengeType] ?? [80, 200, 500, 1200];
  return [
    { maxTimeSeconds: Math.round(wrSeconds * buf * 1.5), xpReward: xp[0]! },
    { maxTimeSeconds: Math.round(wrSeconds * buf * 1.2), xpReward: xp[1]! },
    { maxTimeSeconds: Math.round(wrSeconds * buf), xpReward: xp[2]! },
    { maxTimeSeconds: Math.round(wrSeconds * 1.05), xpReward: xp[3]! },
  ];
}
