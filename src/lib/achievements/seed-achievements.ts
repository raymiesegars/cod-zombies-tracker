import {
  BASE_ROUNDS,
  BASE_XP,
  EASTER_EGG_BASE_XP,
  getMilestonesForChallengeType,
  getCapXp,
} from './milestones';

const MIN_ACHIEVEMENT_XP = 50;
import {
  getRoundConfigForMap,
  getXpForRoundFromMilestones,
} from './map-round-config';

const CHALLENGE_TYPES = [
  'HIGHEST_ROUND',
  'NO_DOWNS',
  'NO_PERKS',
  'NO_PACK',
  'STARTING_ROOM',
  'ONE_BOX',
  'PISTOL_ONLY',
  'NO_POWER',
] as const;

export type AchievementSeedRow = {
  slug: string;
  name: string;
  type: 'ROUND_MILESTONE' | 'CHALLENGE_COMPLETE' | 'EASTER_EGG_COMPLETE';
  criteria: { round?: number; challengeType?: string; isCap?: boolean };
  xpReward: number;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  challengeId?: string;
  easterEggId?: string;
};

function rarityForRound(round: number, maxRound: number): AchievementSeedRow['rarity'] {
  if (maxRound <= 0) return 'COMMON';
  const ratio = round / maxRound;
  if (ratio >= 0.9) return 'LEGENDARY';
  if (ratio >= 0.6) return 'EPIC';
  if (ratio >= 0.35) return 'RARE';
  if (ratio >= 0.15) return 'UNCOMMON';
  return 'COMMON';
}

export function getMapAchievementDefinitions(
  mapSlug: string,
  roundCap: number | null | undefined,
  gameShortName?: string
): AchievementSeedRow[] {
  const rows: AchievementSeedRow[] = [];
  const mapConfig = gameShortName ? getRoundConfigForMap(mapSlug, gameShortName) : null;
  const maxRound =
    mapConfig?.roundCap ??
    (mapConfig?.roundMilestones.length
      ? Math.max(...mapConfig.roundMilestones.map((m) => m.round))
      : null) ??
    roundCap ??
    (BASE_ROUNDS as readonly number[])[BASE_ROUNDS.length - 1]!;

  if (mapConfig) {
    // HR custom milestones
    for (let i = 0; i < mapConfig.roundMilestones.length; i++) {
      const { round, xp } = mapConfig.roundMilestones[i]!;
      const isCap = mapConfig.roundCap != null && round === mapConfig.roundCap;
      rows.push({
        slug: isCap ? 'round-cap' : `round-${round}`,
        name: isCap ? `Round ${round} (Cap)` : `Round ${round}`,
        type: 'ROUND_MILESTONE',
        criteria: { round, challengeType: 'HIGHEST_ROUND', ...(isCap ? { isCap: true } : {}) },
        xpReward: xp,
        rarity: isCap ? 'LEGENDARY' : rarityForRound(round, maxRound),
      });
    }
    // No Downs – same tiers
    for (let i = 0; i < mapConfig.roundMilestones.length; i++) {
      const { round, xp } = mapConfig.roundMilestones[i]!;
      const isCap = mapConfig.roundCap != null && round === mapConfig.roundCap;
      rows.push({
        slug: isCap ? 'no-downs-cap' : `no-downs-${round}`,
        name: isCap ? `No Downs Round ${round} (Cap)` : `No Downs Round ${round}`,
        type: 'CHALLENGE_COMPLETE',
        criteria: { round, challengeType: 'NO_DOWNS', ...(isCap ? { isCap: true } : {}) },
        xpReward: xp,
        rarity: isCap ? 'LEGENDARY' : rarityForRound(round, maxRound),
      });
    }
    // Other types: rounds <= maxRound, XP from map milestones × multiplier
    for (const cType of CHALLENGE_TYPES) {
      if (cType === 'HIGHEST_ROUND' || cType === 'NO_DOWNS') continue;
      const defaultConfig = getMilestonesForChallengeType(cType as any);
      if (!defaultConfig) continue;
      const slugPrefix = cType.toLowerCase().replace(/_/g, '-');
      const rounds =
        defaultConfig.flatXp != null
          ? (defaultConfig.rounds[0]! <= maxRound ? [defaultConfig.rounds[0]!] : [])
          : (defaultConfig.rounds as number[]).filter((r) => r <= maxRound);
      for (const round of rounds) {
        let xp: number;
        if (defaultConfig.flatXp != null) {
          xp = defaultConfig.flatXp;
        } else {
          const tierXp = getXpForRoundFromMilestones(round, mapConfig.roundMilestones);
          xp = Math.floor(tierXp * defaultConfig.multiplier);
        }
        rows.push({
          slug: `${slugPrefix}-${round}`,
          name: `${cType.replace(/_/g, ' ')} Round ${round}`,
          type: 'CHALLENGE_COMPLETE',
          criteria: { round, challengeType: cType },
          xpReward: Math.max(MIN_ACHIEVEMENT_XP, xp),
          rarity: rarityForRound(round, maxRound),
        });
      }
    }
    return rows;
  }

  // BASE_ROUNDS + optional cap
  for (let i = 0; i < BASE_ROUNDS.length; i++) {
    const round = BASE_ROUNDS[i]!;
    const xp = BASE_XP[i]!;
    rows.push({
      slug: `round-${round}`,
      name: `Round ${round}`,
      type: 'ROUND_MILESTONE',
      criteria: { round, challengeType: 'HIGHEST_ROUND' },
      xpReward: xp,
      rarity: round >= 70 ? 'EPIC' : round >= 40 ? 'RARE' : round >= 20 ? 'UNCOMMON' : 'COMMON',
    });
  }
  if (roundCap != null) {
    rows.push({
      slug: 'round-cap',
      name: `Round ${roundCap} (Cap)`,
      type: 'ROUND_MILESTONE',
      criteria: { round: roundCap, challengeType: 'HIGHEST_ROUND', isCap: true },
      xpReward: getCapXp(),
      rarity: 'LEGENDARY',
    });
  }

  for (let i = 0; i < BASE_ROUNDS.length; i++) {
    const round = BASE_ROUNDS[i]!;
    const xp = BASE_XP[i]!;
    rows.push({
      slug: `no-downs-${round}`,
      name: `No Downs Round ${round}`,
      type: 'CHALLENGE_COMPLETE',
      criteria: { round, challengeType: 'NO_DOWNS' },
      xpReward: xp,
      rarity: round >= 70 ? 'EPIC' : round >= 40 ? 'RARE' : 'UNCOMMON',
    });
  }
  if (roundCap != null) {
    rows.push({
      slug: 'no-downs-cap',
      name: `No Downs Round ${roundCap} (Cap)`,
      type: 'CHALLENGE_COMPLETE',
      criteria: { round: roundCap, challengeType: 'NO_DOWNS', isCap: true },
      xpReward: getCapXp(),
      rarity: 'LEGENDARY',
    });
  }

  const effectiveMax = roundCap ?? 100;
  for (const cType of CHALLENGE_TYPES) {
    if (cType === 'HIGHEST_ROUND' || cType === 'NO_DOWNS') continue;
    const config = getMilestonesForChallengeType(cType as any);
    if (!config) continue;
    const slugPrefix = cType.toLowerCase().replace(/_/g, '-');
    const rounds = (config.rounds as number[]).filter((r) => r <= effectiveMax);
    for (const round of rounds) {
      let xp: number;
      if (config.flatXp != null) {
        xp = config.flatXp;
      } else {
        const baseXp = BASE_XP[BASE_ROUNDS.indexOf(round as any)] ?? MIN_ACHIEVEMENT_XP;
        xp = Math.floor(baseXp * config.multiplier);
      }
      rows.push({
        slug: `${slugPrefix}-${round}`,
        name: `${cType.replace(/_/g, ' ')} Round ${round}`,
        type: 'CHALLENGE_COMPLETE',
        criteria: { round, challengeType: cType },
        xpReward: Math.max(MIN_ACHIEVEMENT_XP, xp),
        rarity: round >= 40 ? 'EPIC' : round >= 20 ? 'RARE' : 'UNCOMMON',
      });
    }
  }

  return rows;
}

export function getEasterEggAchievementDefinition(): Omit<AchievementSeedRow, 'challengeId'> & {
  slug: string;
  easterEggId?: string;
} {
  return {
    slug: 'main-quest',
    name: 'Main Quest',
    type: 'EASTER_EGG_COMPLETE',
    criteria: {},
    xpReward: EASTER_EGG_BASE_XP,
    rarity: 'LEGENDARY',
  };
}
