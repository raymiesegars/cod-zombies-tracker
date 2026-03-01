import {
  BASE_ROUNDS,
  BASE_XP,
  EASTER_EGG_BASE_XP,
  getMilestonesForChallengeType,
  getCapXp,
} from './milestones';

const MIN_ACHIEVEMENT_XP = 50;

/** Achievement types that must NEVER be deactivated by balance patches. Main quest completion achievements are created by seed-easter-eggs and are not in getMapAchievementDefinitions. */
export const ACHIEVEMENT_TYPES_NEVER_DEACTIVATE = ['EASTER_EGG_COMPLETE'] as const;
import { formatRushScore } from '@/lib/utils';
import {
  getRoundConfigForMap,
  getXpForRoundFromMilestones,
} from './map-round-config';
import { getWaWMapConfig, getWaWRoundMilestones, getWaWChallengeTypeLabel } from '@/lib/waw/waw-map-config';
import { getBo1MapConfig, getBo1RoundMilestones, getBo1ChallengeTypeLabel } from '@/lib/bo1/bo1-map-config';
import { getBo2MapConfig, getBo2RoundMilestones, getBo2ChallengeTypeLabel } from '@/lib/bo2/bo2-map-config';
import { getBo3MapConfig, getBo3RoundMilestones, getBo3ChallengeTypeLabel } from '@/lib/bo3/bo3-map-config';
import { getBo4MapConfig, getBo4RoundMilestones, getBo4ChallengeTypeLabel } from '@/lib/bo4/bo4-map-config';
import { getBocwMapConfig, getBocwRoundMilestones, getBocwChallengeTypeLabel } from '@/lib/bocw/bocw-map-config';
import { getBo6MapConfig, getBo6RoundMilestones, getBo6ChallengeTypeLabel } from '@/lib/bo6/bo6-map-config';
import { getBo7MapConfig, getBo7RoundMilestones, getBo7ChallengeTypeLabel } from '@/lib/bo7/bo7-map-config';
import { getWw2MapConfig, getWw2RoundMilestones, getWw2ChallengeTypeLabel } from '@/lib/ww2/ww2-map-config';
import { getVanguardMapConfig, getVanguardRoundMilestones, getVanguardChallengeTypeLabel } from '@/lib/vanguard/vanguard-map-config';
import { getAwMapConfig, getAwRoundMilestones, getAwChallengeTypeLabel } from '@/lib/aw/aw-map-config';
import { isBo4Game, BO4_DIFFICULTIES, BO4_DIFFICULTY_XP_MULTIPLIER, type Bo4DifficultyType } from '../bo4';

/** BO4 difficulties that have achievement/leaderboard WRs (excludes CASUAL). */
const BO4_ACHIEVEMENT_DIFFICULTIES: Bo4DifficultyType[] = ['NORMAL', 'HARDCORE', 'REALISTIC'];
import { isBocwGame } from '../bocw';
import { IW_ZIS_SPEEDRUN_TIERS, IW_RAVE_SPEEDRUN_TIERS, IW_SHAOLIN_SPEEDRUN_TIERS, IW_AOTRT_SPEEDRUN_TIERS, IW_BEAST_SPEEDRUN_TIERS, WAW_SPEEDRUN_TIERS_BY_MAP, BO1_SPEEDRUN_TIERS_BY_MAP, BO2_SPEEDRUN_TIERS_BY_MAP, BO3_SPEEDRUN_TIERS_BY_MAP, BO4_SPEEDRUN_TIERS_BY_MAP, BOCW_SPEEDRUN_TIERS_BY_MAP, BO6_SPEEDRUN_TIERS_BY_MAP, BO7_SPEEDRUN_TIERS_BY_MAP, WW2_SPEEDRUN_TIERS_BY_MAP, VANGUARD_SPEEDRUN_TIERS_BY_MAP, AW_SPEEDRUN_TIERS_BY_MAP, BO1_COTD_STAND_IN_EE_TIERS, BO1_COTD_ENSEMBLE_CAST_EE_TIERS, BO2_TRANZIT_RICHTOFEN_EE_TIERS, BO2_TRANZIT_MAXIS_EE_TIERS, BO2_DIE_RISE_RICHTOFEN_EE_TIERS, BO2_DIE_RISE_MAXIS_EE_TIERS, BO2_BURIED_RICHTOFEN_EE_TIERS, BO2_BURIED_MAXIS_EE_TIERS, formatSpeedrunTime, type SpeedrunTiersByType } from './speedrun-tiers';
import { getR5R15TiersForMap, getR5R15WRSeconds } from './round-5-15-wr-data';
import {
  getWRRoundForSeed,
  roundWRToAchievementRound,
  getWRTimeForSeed,
  timeWRToAchievementSeconds,
  buildSpeedrunTiersFromWR,
  getNoSpeedrunCategory,
} from './wr-to-tiers';
import { hasFirstRoomGumMachineBo3 } from '@/lib/first-room-variants';

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

/** IW Zombies in Spaceland: custom rounds per challenge (WR-based). */
const IW_ZIS_CHALLENGE_ROUNDS: Partial<Record<string, readonly number[]>> = {
  NO_PERKS: [10, 20, 30, 40, 50, 70, 100], // WR 100
  STARTING_ROOM: [10, 15, 20, 30, 40, 50, 54], // WR 54
  ONE_BOX: [30], // WR 30
  PISTOL_ONLY: [5, 10, 15, 20, 25, 30, 40, 50, 60], // WR 60
  NO_POWER: [10, 15, 20, 30, 50, 75, 100, 125, 150], // WR 150
};

/** IW Rave in the Redwoods: custom rounds per challenge (WR-based). */
const IW_RAVE_CHALLENGE_ROUNDS: Partial<Record<string, readonly number[]>> = {
  NO_PERKS: [10, 20, 30, 50, 70, 100, 150, 190], // WR 190
  NO_PACK: [10, 20, 30, 40, 50], // WR 50
  STARTING_ROOM: [10, 15, 20, 25, 30, 37], // WR 37
  ONE_BOX: [10, 20, 30], // WR 30
  PISTOL_ONLY: [10, 20, 30, 40, 50, 60, 70], // WR 70
  NO_POWER: [10, 20, 30, 50, 75, 100, 125, 170], // WR 170
};

/** IW Shaolin Shuffle: custom rounds per challenge (WR-based). */
const IW_SHAOLIN_CHALLENGE_ROUNDS: Partial<Record<string, readonly number[]>> = {
  NO_PERKS: [10, 20, 30, 50, 83], // WR 83
  NO_PACK: [10, 20, 30, 40, 50, 70], // WR 70
  STARTING_ROOM: [10, 15, 20, 30, 40, 51], // WR 51
  ONE_BOX: [10, 20, 30], // WR 30
  PISTOL_ONLY: [10, 20, 30, 40, 50, 70], // WR 70
  NO_POWER: [10, 20, 30, 50, 71], // WR 71
};

/** IW Attack of the Radioactive Thing: custom rounds per challenge (WR-based). */
const IW_AOTRT_CHALLENGE_ROUNDS: Partial<Record<string, readonly number[]>> = {
  NO_PERKS: [10, 20, 30, 50, 70, 90], // WR 90
  NO_PACK: [10, 20, 30, 40, 50, 70], // WR 70
  STARTING_ROOM: [10, 15, 20, 24], // WR 24
  ONE_BOX: [10, 20, 30], // WR 30
  PISTOL_ONLY: [10, 20, 30, 40, 50, 70], // WR 70
  NO_POWER: [10, 20, 30, 50, 75, 100, 125, 170], // WR 170
};

/** IW The Beast From Beyond: no Starting Room on this map. */
const IW_BEAST_CHALLENGE_ROUNDS: Partial<Record<string, readonly number[]>> = {
  NO_PERKS: [10, 20, 30, 50, 52], // WR 52
  NO_PACK: [10, 20, 30, 40, 50, 70], // WR 70
  ONE_BOX: [10, 20, 30], // WR 30
  PISTOL_ONLY: [10, 20, 30, 40, 50, 70], // WR 70
  NO_POWER: [10, 20, 30, 40], // WR 40
};

export type AchievementSeedRow = {
  slug: string;
  name: string;
  type: 'ROUND_MILESTONE' | 'CHALLENGE_COMPLETE' | 'EASTER_EGG_COMPLETE';
  criteria: {
    round?: number;
    kills?: number;
    /** For RUSH challenge: qualify if scoreReached >= this */
    score?: number;
    challengeType?: string;
    isCap?: boolean;
    difficulty?: Bo4DifficultyType;
    /** Speedrun tier: qualify if completionTimeSeconds <= this */
    maxTimeSeconds?: number;
    /** For STARTING_ROOM on Verrückt/Buried/AW Carrier: variant (e.g. JUG_SIDE, QUICK_SIDE) */
    firstRoomVariant?: string;
    /** Modifier filters: only logs matching these count (e.g. CLASSIC_ONLY, NONE for classics/NG; omit for "any run") */
    bo3GobbleGumMode?: string;
    bo4ElixirMode?: string;
    bocwSupportMode?: string;
    bo6GobbleGumMode?: string;
    bo6SupportMode?: string;
    bo7SupportMode?: string;
    useFortuneCards?: boolean;
    useDirectorsCut?: boolean;
  };
  xpReward: number;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  challengeId?: string;
  easterEggId?: string;
  /** For EE speedrun achievements: resolve slug to easterEggId when creating (e.g. Call of the Dead Stand-in vs Ensemble Cast) */
  easterEggSlug?: string;
  /** BO4 only: which difficulty this achievement is for */
  difficulty?: Bo4DifficultyType;
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

/** For BO4 maps: expand one row into four (one per difficulty) with scaled XP and criteria. */
function expandBo4Difficulties(row: AchievementSeedRow): AchievementSeedRow[] {
  return BO4_DIFFICULTIES.map((d) => ({
    ...row,
    name: `${row.name} (${d.charAt(0) + d.slice(1).toLowerCase()})`,
    xpReward: Math.max(MIN_ACHIEVEMENT_XP, Math.floor(row.xpReward * BO4_DIFFICULTY_XP_MULTIPLIER[d])),
    criteria: { ...row.criteria, difficulty: d },
    difficulty: d,
  }));
}

/** BO4 speedruns and other non-high-round: expand to NORMAL, HARDCORE, REALISTIC only (4% rule per difficulty). */
function expandBo4AchievementDifficulties(row: AchievementSeedRow): AchievementSeedRow[] {
  return BO4_ACHIEVEMENT_DIFFICULTIES.map((d) => ({
    ...row,
    name: `${row.name} (${d.charAt(0) + d.slice(1).toLowerCase()})`,
    xpReward: Math.max(MIN_ACHIEVEMENT_XP, Math.floor(row.xpReward * BO4_DIFFICULTY_XP_MULTIPLIER[d])),
    criteria: { ...row.criteria, difficulty: d },
    difficulty: d,
  }));
}

export function getMapAchievementDefinitions(
  mapSlug: string,
  roundCap: number | null | undefined,
  gameShortName?: string
): AchievementSeedRow[] {
  const rows: AchievementSeedRow[] = [];

  // WAW: 4% rule applied; No Jug achievements for maps with no jug selectable
  if (gameShortName === 'WAW') {
    const wawCfg = getWaWMapConfig(mapSlug);
    if (wawCfg) {
      const hrWr = getWRRoundForSeed('WAW', 'HIGHEST_ROUND', mapSlug, wawCfg.highRoundWR);
      const cap = roundWRToAchievementRound(hrWr);
      const milestones = getWaWRoundMilestones(cap);
      const maxRound = cap;
      for (const { round, xp } of milestones) {
        rows.push({
          slug: `round-${round}`,
          name: `Round ${round}`,
          type: 'ROUND_MILESTONE',
          criteria: { round, challengeType: 'HIGHEST_ROUND' },
          xpReward: xp,
          rarity: rarityForRound(round, maxRound),
        });
      }
      if (wawCfg.noDownsAvailable) {
        for (const { round, xp } of milestones) {
          rows.push({
            slug: `no-downs-${round}`,
            name: `No Downs Round ${round}`,
            type: 'CHALLENGE_COMPLETE',
            criteria: { round, challengeType: 'NO_DOWNS' },
            xpReward: xp,
            rarity: rarityForRound(round, maxRound),
          });
        }
      }
      for (const cType of wawCfg.challengeTypes) {
        if (cType === 'HIGHEST_ROUND' || cType === 'NO_DOWNS') continue;
        if (mapSlug === 'verruckt' && cType === 'STARTING_ROOM') {
          const maxWr = Math.max(wawCfg.firstRoomJugWR ?? 0, wawCfg.firstRoomQuickWR ?? 0);
          if (maxWr > 0) {
            const wrCap = roundWRToAchievementRound(maxWr);
            const cMilestones = getWaWRoundMilestones(wrCap);
            for (const { round, xp } of cMilestones) {
              if (round > wrCap) continue;
              rows.push({
                slug: `starting-room-${round}`,
                name: `First Room Round ${round}`,
                type: 'CHALLENGE_COMPLETE',
                criteria: { round, challengeType: 'STARTING_ROOM' },
                xpReward: Math.max(MIN_ACHIEVEMENT_XP, xp),
                rarity: rarityForRound(round, wrCap),
              });
            }
          }
          continue;
        }
        const configWr = (cType as string) === 'STARTING_ROOM' ? wawCfg.firstRoomWR
          : (cType as string) === 'NO_POWER' ? wawCfg.noPowerWR
          : (cType as string) === 'NO_PERKS' ? wawCfg.noPerksWR
          : undefined;
        if (configWr == null) continue;
        const wr = getWRRoundForSeed('WAW', cType as string, mapSlug, configWr);
        const wrCap = roundWRToAchievementRound(wr);
        const cMilestones = getWaWRoundMilestones(wrCap);
        const slugPrefix = cType.toLowerCase().replace(/_/g, '-');
        for (const { round, xp } of cMilestones) {
          if (round > wrCap) continue;
          rows.push({
            slug: `${slugPrefix}-${round}`,
            name: `${getWaWChallengeTypeLabel(cType)} Round ${round}`,
            type: 'CHALLENGE_COMPLETE',
            criteria: { round, challengeType: cType },
            xpReward: Math.max(MIN_ACHIEVEMENT_XP, xp),
            rarity: rarityForRound(round, wrCap),
          });
        }
      }
      const wawNoJugWR = (wawCfg as { noJugWR?: number }).noJugWR;
      if (wawNoJugWR != null && wawNoJugWR > 0) {
        const noJugWr = getWRRoundForSeed('WAW', 'NO_JUG', mapSlug, wawNoJugWR);
        const noJugCap = roundWRToAchievementRound(noJugWr);
        const noJugMilestones = getWaWRoundMilestones(noJugCap);
        for (const { round, xp } of noJugMilestones) {
          if (round > noJugCap) continue;
          rows.push({
            slug: `no-jug-${round}`,
            name: `No Jug Round ${round}`,
            type: 'CHALLENGE_COMPLETE',
            criteria: { round, challengeType: 'NO_JUG' },
            xpReward: Math.max(MIN_ACHIEVEMENT_XP, xp),
            rarity: rarityForRound(round, noJugCap),
          });
        }
      }
      if (wawCfg.challengeTypes.includes('ONE_BOX')) {
        rows.push({
          slug: 'one-box-30',
          name: 'One Box Round 30',
          type: 'CHALLENGE_COMPLETE',
          criteria: { round: 30, challengeType: 'ONE_BOX' },
          xpReward: 600,
          rarity: 'RARE',
        });
      }
      if (wawCfg.challengeTypes.includes('PISTOL_ONLY')) {
        const pistolCap = roundWRToAchievementRound(Math.min(hrWr, 100));
        const pistolMilestones = getWaWRoundMilestones(pistolCap, 5);
        for (const { round, xp } of pistolMilestones) {
          rows.push({
            slug: `pistol-only-${round}`,
            name: `Pistol Only Round ${round}`,
            type: 'CHALLENGE_COMPLETE',
            criteria: { round, challengeType: 'PISTOL_ONLY' },
            xpReward: Math.max(MIN_ACHIEVEMENT_XP, Math.floor(xp * 3)),
            rarity: rarityForRound(round, pistolCap),
          });
        }
      }
      return rows;
    }
  }

  // BO1: per-map config with WR-based achievements
  if (gameShortName === 'BO1') {
    const bo1Cfg = getBo1MapConfig(mapSlug);
    if (bo1Cfg) {
      const milestones = getBo1RoundMilestones(bo1Cfg.highRoundWR);
      const maxRound = bo1Cfg.highRoundWR;
      for (const { round, xp } of milestones) {
        rows.push({
          slug: `round-${round}`,
          name: `Round ${round}`,
          type: 'ROUND_MILESTONE',
          criteria: { round, challengeType: 'HIGHEST_ROUND' },
          xpReward: xp,
          rarity: rarityForRound(round, maxRound),
        });
      }
      if (bo1Cfg.noDownsAvailable) {
        for (const { round, xp } of milestones) {
          rows.push({
            slug: `no-downs-${round}`,
            name: `No Downs Round ${round}`,
            type: 'CHALLENGE_COMPLETE',
            criteria: { round, challengeType: 'NO_DOWNS' },
            xpReward: xp,
            rarity: rarityForRound(round, maxRound),
          });
        }
      }
      for (const cType of bo1Cfg.challengeTypes) {
        if (['HIGHEST_ROUND', 'NO_DOWNS', 'NO_MANS_LAND'].includes(cType as string) || (cType as string).startsWith('ROUND_')) continue;
        // BO1 Verrückt: one "First Room Round X" per round (accepts either variant)
        if (mapSlug === 'bo1-verruckt' && cType === 'STARTING_ROOM') {
          const maxWr = Math.max(bo1Cfg.firstRoomJugWR ?? 0, bo1Cfg.firstRoomQuickWR ?? 0);
          if (maxWr > 0) {
            const cMilestones = getBo1RoundMilestones(maxWr);
            for (const { round, xp } of cMilestones) {
              if (round > maxWr) continue;
              rows.push({
                slug: `starting-room-${round}`,
                name: `First Room Round ${round}`,
                type: 'CHALLENGE_COMPLETE',
                criteria: { round, challengeType: 'STARTING_ROOM' },
                xpReward: Math.max(MIN_ACHIEVEMENT_XP, xp),
                rarity: rarityForRound(round, maxWr),
              });
            }
          }
          continue;
        }
        const wr = (cType as string) === 'STARTING_ROOM' ? bo1Cfg.firstRoomWR
          : (cType as string) === 'NO_POWER' ? bo1Cfg.noPowerWR
          : (cType as string) === 'NO_PERKS' ? bo1Cfg.noPerksWR
          : (cType as string) === 'NO_JUG' ? (bo1Cfg as { noJugWR?: number }).noJugWR
          : undefined;
        if (wr == null) continue;
        const cMilestones = getBo1RoundMilestones(wr);
        const slugPrefix = cType.toLowerCase().replace(/_/g, '-');
        for (const { round, xp } of cMilestones) {
          if (round > wr) continue;
          rows.push({
            slug: `${slugPrefix}-${round}`,
            name: `${getBo1ChallengeTypeLabel(cType)} Round ${round}`,
            type: 'CHALLENGE_COMPLETE',
            criteria: { round, challengeType: cType },
            xpReward: Math.max(MIN_ACHIEVEMENT_XP, xp),
            rarity: rarityForRound(round, wr),
          });
        }
      }
      if (bo1Cfg.challengeTypes.includes('ONE_BOX')) {
        rows.push({
          slug: 'one-box-30',
          name: 'One Box Round 30',
          type: 'CHALLENGE_COMPLETE',
          criteria: { round: 30, challengeType: 'ONE_BOX' },
          xpReward: 600,
          rarity: 'RARE',
        });
      }
      if (bo1Cfg.challengeTypes.includes('PISTOL_ONLY')) {
        const pistolWR = maxRound;
        const pistolMilestones = getBo1RoundMilestones(Math.min(pistolWR, 100), 5);
        for (const { round, xp } of pistolMilestones) {
          rows.push({
            slug: `pistol-only-${round}`,
            name: `Pistol Only Round ${round}`,
            type: 'CHALLENGE_COMPLETE',
            criteria: { round, challengeType: 'PISTOL_ONLY' },
            xpReward: Math.max(MIN_ACHIEVEMENT_XP, Math.floor(xp * 3)),
            rarity: rarityForRound(round, pistolWR),
          });
        }
      }
      if (bo1Cfg.noMansLandWR != null) {
        // Cap at 400 when WR<=400 to avoid duplicate 400 tier; otherwise add WR as final tier
        const killsMilestones = bo1Cfg.noMansLandWR <= 400
          ? [100, 200, 300, 400]
          : [100, 200, 300, 400, bo1Cfg.noMansLandWR];
        const killsXp = [100, 300, 600, 1000, 2000];
        for (let i = 0; i < killsMilestones.length; i++) {
          const kills = killsMilestones[i]!;
          const xp = killsXp[i] ?? 2000;
          rows.push({
            slug: `no-mans-land-${kills}`,
            name: `No Man's Land ${kills} kills`,
            type: 'CHALLENGE_COMPLETE',
            criteria: { kills, challengeType: 'NO_MANS_LAND' },
            xpReward: Math.max(MIN_ACHIEVEMENT_XP, xp),
            rarity: kills >= 400 ? 'LEGENDARY' : kills >= 300 ? 'EPIC' : kills >= 200 ? 'RARE' : 'UNCOMMON',
          });
        }
      }
      return rows;
    }
  }

  // BO2: per-map config with WR-based achievements, NO_MAGIC, bank, EE variants
  if (gameShortName === 'BO2') {
    const bo2Cfg = getBo2MapConfig(mapSlug);
    if (bo2Cfg) {
      const milestones = getBo2RoundMilestones(bo2Cfg.highRoundWR);
      const maxRound = bo2Cfg.highRoundWR;
      for (const { round, xp } of milestones) {
        rows.push({
          slug: `round-${round}`,
          name: `Round ${round}`,
          type: 'ROUND_MILESTONE',
          criteria: { round, challengeType: 'HIGHEST_ROUND' },
          xpReward: xp,
          rarity: rarityForRound(round, maxRound),
        });
      }
      if (bo2Cfg.noDownsAvailable) {
        for (const { round, xp } of milestones) {
          rows.push({
            slug: `no-downs-${round}`,
            name: `No Downs Round ${round}`,
            type: 'CHALLENGE_COMPLETE',
            criteria: { round, challengeType: 'NO_DOWNS' },
            xpReward: xp,
            rarity: rarityForRound(round, maxRound),
          });
        }
      }
      for (const cType of bo2Cfg.challengeTypes) {
        if (cType === 'HIGHEST_ROUND' || cType === 'NO_DOWNS') continue;
        // Buried: STARTING_ROOM has Processing, Quick Side, Processing (with Raygun) variants
        if (mapSlug === 'buried' && cType === 'STARTING_ROOM') {
          const buriedCfg = bo2Cfg as { firstRoomProcessingWR?: number; firstRoomQuickWR?: number; firstRoomWR?: number };
          for (const [variant, wr] of [
            ['PROCESSING', buriedCfg.firstRoomProcessingWR ?? bo2Cfg.firstRoomWR] as const,
            ['QUICK_SIDE', buriedCfg.firstRoomQuickWR ?? bo2Cfg.firstRoomWR] as const,
            ['PROCESSING_WITH_RAYGUN', bo2Cfg.firstRoomWR] as const,
          ]) {
            if (wr == null) continue;
            const cMilestones = getBo2RoundMilestones(wr);
            const label = variant === 'PROCESSING' ? 'First Room (Processing)' : variant === 'QUICK_SIDE' ? 'First Room (Quick Side)' : 'First Room (Processing with Raygun)';
            const slugPrefix = `starting-room-${variant.toLowerCase().replace(/_/g, '-')}`;
            for (const { round, xp } of cMilestones) {
              if (round > wr) continue;
              rows.push({
                slug: `${slugPrefix}-${round}`,
                name: `${label} Round ${round}`,
                type: 'CHALLENGE_COMPLETE',
                criteria: { round, challengeType: 'STARTING_ROOM', firstRoomVariant: variant },
                xpReward: Math.max(MIN_ACHIEVEMENT_XP, xp),
                rarity: rarityForRound(round, wr),
              });
            }
          }
          continue;
        }
        const wr = (cType as string) === 'STARTING_ROOM' ? bo2Cfg.firstRoomWR
          : (cType as string) === 'NO_POWER' ? bo2Cfg.noPowerWR
          : (cType as string) === 'NO_PERKS' ? bo2Cfg.noPerksWR
          : (cType as string) === 'NO_JUG' ? bo2Cfg.noJugWR
          : (cType as string) === 'NO_MAGIC' ? bo2Cfg.noMagicWR
          : undefined;
        if (wr == null) continue;
        const cMilestones = getBo2RoundMilestones(wr);
        const slugPrefix = cType.toLowerCase().replace(/_/g, '-');
        for (const { round, xp } of cMilestones) {
          if (round > wr) continue;
          rows.push({
            slug: `${slugPrefix}-${round}`,
            name: `${getBo2ChallengeTypeLabel(cType)} Round ${round}`,
            type: 'CHALLENGE_COMPLETE',
            criteria: { round, challengeType: cType },
            xpReward: Math.max(MIN_ACHIEVEMENT_XP, xp),
            rarity: rarityForRound(round, wr),
          });
        }
      }
      if (bo2Cfg.challengeTypes.includes('ONE_BOX')) {
        rows.push({
          slug: 'one-box-30',
          name: 'One Box Round 30',
          type: 'CHALLENGE_COMPLETE',
          criteria: { round: 30, challengeType: 'ONE_BOX' },
          xpReward: 600,
          rarity: 'RARE',
        });
      }
      if (bo2Cfg.challengeTypes.includes('PISTOL_ONLY')) {
        const pistolWR = maxRound;
        const pistolMilestones = getBo2RoundMilestones(Math.min(pistolWR, 100), 5);
        for (const { round, xp } of pistolMilestones) {
          rows.push({
            slug: `pistol-only-${round}`,
            name: `Pistol Only Round ${round}`,
            type: 'CHALLENGE_COMPLETE',
            criteria: { round, challengeType: 'PISTOL_ONLY' },
            xpReward: Math.max(MIN_ACHIEVEMENT_XP, Math.floor(xp * 3)),
            rarity: rarityForRound(round, pistolWR),
          });
        }
      }
      return rows;
    }
  }

  // BO3: 4% rule. SoE & Giant: no gum in first room → no classic/megas split for first room or no power.
  // Nacht, Verrückt, SNN: all high-round categories split classics/NG vs megas.
  const BO3_ALL_CATEGORIES_CLASSIC_SPLIT = ['bo3-nacht-der-untoten', 'bo3-verruckt', 'bo3-shi-no-numa'];
  if (gameShortName === 'BO3') {
    const bo3Cfg = getBo3MapConfig(mapSlug);
    if (bo3Cfg) {
      const hrWr = getWRRoundForSeed('BO3', 'HIGHEST_ROUND', mapSlug, bo3Cfg.highRoundWR, { variant: 'megas' });
      const capRound = roundWRToAchievementRound(hrWr);
      const milestones = getBo3RoundMilestones(capRound);
      const maxRound = capRound;
      for (const { round, xp } of milestones) {
        rows.push({
          slug: `round-${round}`,
          name: `Round ${round}`,
          type: 'ROUND_MILESTONE',
          criteria: { round, challengeType: 'HIGHEST_ROUND' },
          xpReward: xp,
          rarity: rarityForRound(round, maxRound),
        });
      }
      const ndWr = getWRRoundForSeed('BO3', 'NO_DOWNS', mapSlug, bo3Cfg.noDownsWR, { variant: 'megas' });
      const ndCap = roundWRToAchievementRound(ndWr);
      const ndMilestones = getBo3RoundMilestones(ndCap);
      if (bo3Cfg.noDownsWR != null) {
        for (const { round, xp } of ndMilestones) {
          if (round <= ndCap) {
            rows.push({
              slug: `no-downs-${round}`,
              name: `No Downs Round ${round}`,
              type: 'CHALLENGE_COMPLETE',
              criteria: { round, challengeType: 'NO_DOWNS' },
              xpReward: xp,
              rarity: rarityForRound(round, ndCap),
            });
          }
        }
      }
      // Nacht, Verrückt, SNN: classic band for high round and no downs (CHALLENGE_COMPLETE so modifier is applied)
      if (BO3_ALL_CATEGORIES_CLASSIC_SPLIT.includes(mapSlug)) {
        const classicHrWr = getWRRoundForSeed('BO3', 'HIGHEST_ROUND', mapSlug, bo3Cfg.highRoundWR, { variant: 'restricted' });
        const classicHrCap = roundWRToAchievementRound(classicHrWr);
        const classicHrMilestones = getBo3RoundMilestones(classicHrCap);
        for (const { round, xp } of classicHrMilestones) {
          if (round > classicHrCap) continue;
          rows.push({
            slug: `round-${round}-classic`,
            name: `Round ${round} (Classic/No Megas)`,
            type: 'CHALLENGE_COMPLETE',
            criteria: { round, challengeType: 'HIGHEST_ROUND', bo3GobbleGumMode: 'CLASSIC_ONLY' },
            xpReward: Math.max(MIN_ACHIEVEMENT_XP, xp * 2),
            rarity: rarityForRound(round, classicHrCap),
          });
        }
        const classicNdWr = getWRRoundForSeed('BO3', 'NO_DOWNS', mapSlug, bo3Cfg.noDownsWR ?? 0, { variant: 'restricted' });
        if (classicNdWr > 0) {
          const classicNdCap = roundWRToAchievementRound(classicNdWr);
          const classicNdMilestones = getBo3RoundMilestones(classicNdCap);
          for (const { round, xp } of classicNdMilestones) {
            if (round > classicNdCap) continue;
            rows.push({
              slug: `no-downs-${round}-classic`,
              name: `No Downs Round ${round} (Classic/No Megas)`,
              type: 'CHALLENGE_COMPLETE',
              criteria: { round, challengeType: 'NO_DOWNS', bo3GobbleGumMode: 'CLASSIC_ONLY' },
              xpReward: Math.max(MIN_ACHIEVEMENT_XP, xp * 2),
              rarity: rarityForRound(round, classicNdCap),
            });
          }
        }
      }
      for (const cType of bo3Cfg.challengeTypes) {
        const cTypeStr = cType as string;
        if (cTypeStr === 'HIGHEST_ROUND' || cTypeStr === 'NO_DOWNS' || cTypeStr === 'NO_MANS_LAND') continue;
        if (mapSlug === 'bo3-verruckt' && cTypeStr === 'STARTING_ROOM') {
          const maxWr = Math.max(bo3Cfg.firstRoomJugWR ?? 0, bo3Cfg.firstRoomQuickWR ?? 0);
          if (maxWr > 0) {
            const wrCap = roundWRToAchievementRound(maxWr);
            const cMilestones = getBo3RoundMilestones(wrCap);
            for (const { round, xp } of cMilestones) {
              if (round > wrCap) continue;
              rows.push({
                slug: `starting-room-${round}`,
                name: `First Room Round ${round}`,
                type: 'CHALLENGE_COMPLETE',
                criteria: { round, challengeType: 'STARTING_ROOM' },
                xpReward: Math.max(MIN_ACHIEVEMENT_XP, xp),
                rarity: rarityForRound(round, wrCap),
              });
            }
            if (hasFirstRoomGumMachineBo3(mapSlug)) {
              const classicWr = getWRRoundForSeed('BO3', 'STARTING_ROOM', mapSlug, maxWr, { variant: 'restricted' });
              const classicCap = roundWRToAchievementRound(classicWr);
              const classicMilestones = getBo3RoundMilestones(classicCap);
              for (const { round, xp } of classicMilestones) {
                if (round > classicCap) continue;
                rows.push({
                  slug: `starting-room-${round}-classic`,
                  name: `First Room Round ${round} (Classic/No Megas)`,
                  type: 'CHALLENGE_COMPLETE',
                  criteria: { round, challengeType: 'STARTING_ROOM', bo3GobbleGumMode: 'CLASSIC_ONLY' },
                  xpReward: Math.max(MIN_ACHIEVEMENT_XP, xp * 2),
                  rarity: rarityForRound(round, classicCap),
                });
              }
            }
          }
          continue;
        }
        const configWr =
          cTypeStr === 'STARTING_ROOM' ? bo3Cfg.firstRoomWR
          : cTypeStr === 'NO_POWER' ? bo3Cfg.noPowerWR
          : cTypeStr === 'NO_PERKS' ? bo3Cfg.noPerksWR
          : cTypeStr === 'NO_JUG' ? bo3Cfg.noJugWR
          : cTypeStr === 'NO_ATS' ? (bo3Cfg as { noAtsWR?: number }).noAtsWR ?? bo3Cfg.noJugWR
          : undefined;
        if (configWr == null) continue;
        const wr = getWRRoundForSeed('BO3', cTypeStr, mapSlug, configWr, { variant: 'megas' });
        const wrCap = roundWRToAchievementRound(wr);
        const cMilestones = getBo3RoundMilestones(wrCap);
        const slugPrefix = cTypeStr.toLowerCase().replace(/_/g, '-');
        for (const { round, xp } of cMilestones) {
          if (round > wrCap) continue;
          rows.push({
            slug: `${slugPrefix}-${round}`,
            name: `${getBo3ChallengeTypeLabel(cTypeStr)} Round ${round}`,
            type: 'CHALLENGE_COMPLETE',
            criteria: { round, challengeType: cType },
            xpReward: Math.max(MIN_ACHIEVEMENT_XP, xp),
            rarity: rarityForRound(round, wrCap),
          });
        }
        const addClassicBand = ((cTypeStr === 'STARTING_ROOM' || cTypeStr === 'NO_POWER') && hasFirstRoomGumMachineBo3(mapSlug)) || BO3_ALL_CATEGORIES_CLASSIC_SPLIT.includes(mapSlug);
        if (addClassicBand && configWr > 0) {
          const classicWr = getWRRoundForSeed('BO3', cTypeStr, mapSlug, configWr, { variant: 'restricted' });
          const classicCap = roundWRToAchievementRound(classicWr);
          const classicMilestones = getBo3RoundMilestones(classicCap);
          for (const { round, xp } of classicMilestones) {
            if (round > classicCap) continue;
            rows.push({
              slug: `${slugPrefix}-${round}-classic`,
              name: `${getBo3ChallengeTypeLabel(cTypeStr)} Round ${round} (Classic/No Megas)`,
              type: 'CHALLENGE_COMPLETE',
              criteria: { round, challengeType: cType, bo3GobbleGumMode: 'CLASSIC_ONLY' },
              xpReward: Math.max(MIN_ACHIEVEMENT_XP, xp * 2),
              rarity: rarityForRound(round, classicCap),
            });
          }
        }
      }
      if (bo3Cfg.challengeTypes.includes('ONE_BOX')) {
        rows.push({
          slug: 'one-box-30',
          name: 'One Box Round 30',
          type: 'CHALLENGE_COMPLETE',
          criteria: { round: 30, challengeType: 'ONE_BOX' },
          xpReward: 600,
          rarity: 'RARE',
        });
      }
      if (bo3Cfg.challengeTypes.includes('PISTOL_ONLY')) {
        const pistolWR = Math.min(hrWr, 100);
        const pistolCap = roundWRToAchievementRound(pistolWR);
        const pistolMilestones = getBo3RoundMilestones(pistolCap, 5);
        for (const { round, xp } of pistolMilestones) {
          rows.push({
            slug: `pistol-only-${round}`,
            name: `Pistol Only Round ${round}`,
            type: 'CHALLENGE_COMPLETE',
            criteria: { round, challengeType: 'PISTOL_ONLY' },
            xpReward: Math.max(MIN_ACHIEVEMENT_XP, Math.floor(xp * 3)),
            rarity: rarityForRound(round, pistolCap),
          });
        }
      }
      if (bo3Cfg.noMansLandWR != null) {
        // Cap at 400 when WR<=400 to avoid duplicate 400 tier; otherwise add WR as final tier
        const killsMilestones = bo3Cfg.noMansLandWR <= 400
          ? [100, 200, 300, 400]
          : [100, 200, 300, 400, bo3Cfg.noMansLandWR];
        const killsXp = [100, 300, 600, 1000, 2000];
        for (let i = 0; i < killsMilestones.length; i++) {
          const kills = killsMilestones[i]!;
          const xp = killsXp[i] ?? 2000;
          rows.push({
            slug: `no-mans-land-${kills}`,
            name: `No Man's Land ${kills} kills`,
            type: 'CHALLENGE_COMPLETE',
            criteria: { kills, challengeType: 'NO_MANS_LAND' },
            xpReward: Math.max(MIN_ACHIEVEMENT_XP, xp),
            rarity: kills >= 400 ? 'LEGENDARY' : kills >= 300 ? 'EPIC' : kills >= 200 ? 'RARE' : 'UNCOMMON',
          });
        }
      }
      return rows;
    }
  }

  // BO4: 4% rule applied to all round-based achievements
  if (gameShortName === 'BO4') {
    const bo4Cfg = getBo4MapConfig(mapSlug);
    if (bo4Cfg) {
      const difficulties = BO4_DIFFICULTIES.filter((d) => bo4Cfg.highRoundWR[d] > 0);
      for (const diff of difficulties) {
        const hrWr = getWRRoundForSeed('BO4', 'HIGHEST_ROUND', mapSlug, bo4Cfg.highRoundWR[diff], { variant: 'megas' });
        const cap = roundWRToAchievementRound(hrWr);
        const milestones = getBo4RoundMilestones(cap);
        for (const { round, xp } of milestones) {
          if (round > cap) continue;
          const baseXp = Math.max(MIN_ACHIEVEMENT_XP, Math.floor(xp * BO4_DIFFICULTY_XP_MULTIPLIER[diff]));
          rows.push({
            slug: `round-${round}-${diff.toLowerCase()}`,
            name: `Round ${round} (${diff.charAt(0) + diff.slice(1).toLowerCase()})`,
            type: 'ROUND_MILESTONE',
            criteria: { round, challengeType: 'HIGHEST_ROUND', difficulty: diff },
            xpReward: baseXp,
            rarity: rarityForRound(round, cap),
            difficulty: diff,
          });
        }
        const ndWr = getWRRoundForSeed('BO4', 'NO_DOWNS', mapSlug, bo4Cfg.noDownsWR[diff], { variant: 'megas' });
        if (ndWr > 0) {
          const ndCap = roundWRToAchievementRound(ndWr);
          const ndMilestones = getBo4RoundMilestones(ndCap);
          for (const { round, xp } of ndMilestones) {
            if (round > ndCap) continue;
            const baseXp = Math.max(MIN_ACHIEVEMENT_XP, Math.floor(xp * BO4_DIFFICULTY_XP_MULTIPLIER[diff]));
            rows.push({
              slug: `no-downs-${round}-${diff.toLowerCase()}`,
              name: `No Downs Round ${round} (${diff.charAt(0) + diff.slice(1).toLowerCase()})`,
              type: 'CHALLENGE_COMPLETE',
              criteria: { round, challengeType: 'NO_DOWNS', difficulty: diff },
              xpReward: baseXp,
              rarity: rarityForRound(round, ndCap),
              difficulty: diff,
            });
          }
        }
        // Classic elixirs band for high round and no downs (all BO4 maps)
        const classicHrWr = getWRRoundForSeed('BO4', 'HIGHEST_ROUND', mapSlug, bo4Cfg.highRoundWR[diff], { variant: 'restricted' });
        const classicHrCap = roundWRToAchievementRound(classicHrWr);
        const classicHrMilestones = getBo4RoundMilestones(classicHrCap);
        for (const { round, xp } of classicHrMilestones) {
          if (round > classicHrCap) continue;
          const baseXp = Math.max(MIN_ACHIEVEMENT_XP, Math.floor(xp * 2 * BO4_DIFFICULTY_XP_MULTIPLIER[diff]));
          rows.push({
            slug: `round-${round}-${diff.toLowerCase()}-classic`,
            name: `Round ${round} (${diff.charAt(0) + diff.slice(1).toLowerCase()}) (Classic Elixirs)`,
            type: 'CHALLENGE_COMPLETE',
            criteria: { round, challengeType: 'HIGHEST_ROUND', difficulty: diff, bo4ElixirMode: 'CLASSIC_ONLY' },
            xpReward: baseXp,
            rarity: rarityForRound(round, classicHrCap),
            difficulty: diff,
          });
        }
        const classicNdWr = getWRRoundForSeed('BO4', 'NO_DOWNS', mapSlug, bo4Cfg.noDownsWR[diff], { variant: 'restricted' });
        if (classicNdWr > 0) {
          const classicNdCap = roundWRToAchievementRound(classicNdWr);
          const classicNdMilestones = getBo4RoundMilestones(classicNdCap);
          for (const { round, xp } of classicNdMilestones) {
            if (round > classicNdCap) continue;
            const baseXp = Math.max(MIN_ACHIEVEMENT_XP, Math.floor(xp * 2 * BO4_DIFFICULTY_XP_MULTIPLIER[diff]));
            rows.push({
              slug: `no-downs-${round}-${diff.toLowerCase()}-classic`,
              name: `No Downs Round ${round} (${diff.charAt(0) + diff.slice(1).toLowerCase()}) (Classic Elixirs)`,
              type: 'CHALLENGE_COMPLETE',
              criteria: { round, challengeType: 'NO_DOWNS', difficulty: diff, bo4ElixirMode: 'CLASSIC_ONLY' },
              xpReward: baseXp,
              rarity: rarityForRound(round, classicNdCap),
              difficulty: diff,
            });
          }
        }
      }
      for (const cType of bo4Cfg.challengeTypes) {
        const ct = cType as string;
        if (ct === 'HIGHEST_ROUND' || ct === 'NO_DOWNS' || ct === 'RUSH' || ct.startsWith('ROUND_') || ct === 'EASTER_EGG_SPEEDRUN' || ct === 'INSTAKILL_ROUND_SPEEDRUN') continue;
        const configWr = ct === 'STARTING_ROOM' ? bo4Cfg.firstRoomWR
          : ct === 'NO_POWER' ? bo4Cfg.noPowerWR
          : ct === 'NO_PERKS' ? bo4Cfg.noPerksWR
          : ct === 'PURIST' ? bo4Cfg.puristWR
          : undefined;
        if (configWr == null) continue;
        const wr = getWRRoundForSeed('BO4', ct, mapSlug, configWr, { variant: 'megas' });
        const wrCap = roundWRToAchievementRound(wr);
        const cMilestones = getBo4RoundMilestones(wrCap);
        const slugPrefix = ct.toLowerCase().replace(/_/g, '-');
        for (const diff of BO4_ACHIEVEMENT_DIFFICULTIES) {
          const diffLabel = diff.charAt(0) + diff.slice(1).toLowerCase();
          for (const { round, xp } of cMilestones) {
            if (round > wrCap) continue;
            const baseXp = Math.max(MIN_ACHIEVEMENT_XP, Math.floor(xp * BO4_DIFFICULTY_XP_MULTIPLIER[diff]));
            rows.push({
              slug: `${slugPrefix}-${round}-${diff.toLowerCase()}`,
              name: `${getBo4ChallengeTypeLabel(ct)} Round ${round} (${diffLabel})`,
              type: 'CHALLENGE_COMPLETE',
              criteria: { round, challengeType: cType, difficulty: diff },
              xpReward: baseXp,
              rarity: rarityForRound(round, wrCap),
              difficulty: diff,
            });
          }
          if (configWr > 0) {
            const classicWr = getWRRoundForSeed('BO4', ct, mapSlug, configWr, { variant: 'restricted' });
            const classicCap = roundWRToAchievementRound(classicWr);
            const classicMilestones = getBo4RoundMilestones(classicCap);
            for (const { round, xp } of classicMilestones) {
              if (round > classicCap) continue;
              const classicXp = Math.max(MIN_ACHIEVEMENT_XP, Math.floor(xp * 2 * BO4_DIFFICULTY_XP_MULTIPLIER[diff]));
              rows.push({
                slug: `${slugPrefix}-${round}-${diff.toLowerCase()}-classic`,
                name: `${getBo4ChallengeTypeLabel(ct)} Round ${round} (${diffLabel}) (Classic Elixirs)`,
                type: 'CHALLENGE_COMPLETE',
                criteria: { round, challengeType: cType, difficulty: diff, bo4ElixirMode: 'CLASSIC_ONLY' },
                xpReward: classicXp,
                rarity: rarityForRound(round, classicCap),
                difficulty: diff,
              });
            }
          }
        }
      }
      if (bo4Cfg.rushWR != null && bo4Cfg.rushWR > 0) {
        const rushWr = bo4Cfg.rushWR;
        const scoreMilestones = [Math.floor(rushWr * 0.1), Math.floor(rushWr * 0.25), Math.floor(rushWr * 0.5), Math.floor(rushWr * 0.75), rushWr];
        const scoreXp = [100, 300, 600, 1000, 2000];
        for (const diff of BO4_ACHIEVEMENT_DIFFICULTIES) {
          const diffLabel = diff.charAt(0) + diff.slice(1).toLowerCase();
          for (let i = 0; i < scoreMilestones.length; i++) {
            const score = scoreMilestones[i]!;
            const xp = scoreXp[i] ?? 2000;
            const baseXp = Math.max(MIN_ACHIEVEMENT_XP, Math.floor(xp * BO4_DIFFICULTY_XP_MULTIPLIER[diff]));
            rows.push({
              slug: `rush-${score}-${diff.toLowerCase()}`,
              name: `Rush ${formatRushScore(score)} (${diffLabel})`,
              type: 'CHALLENGE_COMPLETE',
              criteria: { score, challengeType: 'RUSH', difficulty: diff },
              xpReward: baseXp,
              rarity: score >= rushWr * 0.75 ? 'LEGENDARY' : score >= rushWr * 0.5 ? 'EPIC' : score >= rushWr * 0.25 ? 'RARE' : 'UNCOMMON',
              difficulty: diff,
            });
          }
        }
      }
      return rows;
    }
  }

  // BOCW: 4% rule; with-support (base) + no-support (2x XP)
  if (gameShortName === 'BOCW') {
    const bocwCfg = getBocwMapConfig(mapSlug);
    if (bocwCfg) {
      const hrWr = getWRRoundForSeed('BOCW', 'HIGHEST_ROUND', mapSlug, bocwCfg.highRoundWR, { variant: 'megas' });
      const cap = roundWRToAchievementRound(hrWr);
      const milestones = getBocwRoundMilestones(cap);
      for (const { round, xp } of milestones) {
        if (round > cap) continue;
        rows.push({
          slug: `round-${round}`,
          name: `Round ${round}`,
          type: 'ROUND_MILESTONE',
          criteria: { round, challengeType: 'HIGHEST_ROUND' },
          xpReward: xp,
          rarity: rarityForRound(round, cap),
        });
      }
      const ndWr = getWRRoundForSeed('BOCW', 'NO_DOWNS', mapSlug, bocwCfg.noDownsWR, { variant: 'megas' });
      const ndCap = roundWRToAchievementRound(ndWr);
      const ndMilestones = getBocwRoundMilestones(ndCap);
      for (const { round, xp } of ndMilestones) {
        if (round > ndCap) continue;
        rows.push({
          slug: `no-downs-${round}`,
          name: `No Downs Round ${round}`,
          type: 'CHALLENGE_COMPLETE',
          criteria: { round, challengeType: 'NO_DOWNS' },
          xpReward: xp,
          rarity: rarityForRound(round, ndCap),
        });
      }
      for (const cType of bocwCfg.challengeTypes) {
        const ct = cType as string;
        if (ct === 'HIGHEST_ROUND' || ct === 'NO_DOWNS' || ct.startsWith('ROUND_') || ct === 'EASTER_EGG_SPEEDRUN' || ct === 'EXFIL_SPEEDRUN' || ct === 'EXFIL_R21_SPEEDRUN' || ct === 'BUILD_EE_SPEEDRUN') continue;
        const configWr = ct === 'STARTING_ROOM' ? bocwCfg.firstRoomWR
          : ct === 'NO_POWER' ? bocwCfg.noPowerWR
          : ct === 'NO_PERKS' ? bocwCfg.noPerksWR
          : ct === 'PURIST' ? bocwCfg.puristWR
          : ct === 'NO_ARMOR' ? bocwCfg.noArmorWR
          : ct === 'NO_JUG' ? bocwCfg.noJugWR
          : undefined;
        if (configWr == null || configWr <= 0) continue;
        const wr = getWRRoundForSeed('BOCW', ct, mapSlug, configWr, { variant: 'megas' });
        const wrCap = roundWRToAchievementRound(wr);
        const cMilestones = getBocwRoundMilestones(wrCap);
        const slugPrefix = ct.toLowerCase().replace(/_/g, '-');
        for (const { round, xp } of cMilestones) {
          if (round > wrCap) continue;
          rows.push({
            slug: `${slugPrefix}-${round}`,
            name: `${getBocwChallengeTypeLabel(ct)} Round ${round}`,
            type: 'CHALLENGE_COMPLETE',
            criteria: { round, challengeType: cType },
            xpReward: Math.max(MIN_ACHIEVEMENT_XP, xp),
            rarity: rarityForRound(round, wrCap),
          });
        }
        const noSupportWr = getWRRoundForSeed('BOCW', ct, mapSlug, configWr, { variant: 'restricted' });
        const noSupportCap = roundWRToAchievementRound(noSupportWr);
        const noSupportMilestones = getBocwRoundMilestones(noSupportCap);
        for (const { round, xp } of noSupportMilestones) {
          if (round > noSupportCap) continue;
          rows.push({
            slug: `${slugPrefix}-${round}-no-support`,
            name: `${getBocwChallengeTypeLabel(ct)} Round ${round} (No Support)`,
            type: 'CHALLENGE_COMPLETE',
            criteria: { round, challengeType: cType, bocwSupportMode: 'WITHOUT_SUPPORT' },
            xpReward: Math.max(MIN_ACHIEVEMENT_XP, xp * 2),
            rarity: rarityForRound(round, noSupportCap),
          });
        }
      }
      return rows;
    }
  }

  // BO6: 4% rule; with-support (base) + no-support (2x XP). No no-power on BO6.
  if (gameShortName === 'BO6') {
    const bo6Cfg = getBo6MapConfig(mapSlug);
    if (bo6Cfg) {
      const hrWr = getWRRoundForSeed('BO6', 'HIGHEST_ROUND', mapSlug, bo6Cfg.highRoundWR, { variant: 'megas' });
      const cap = roundWRToAchievementRound(hrWr);
      const milestones = getBo6RoundMilestones(cap);
      for (const { round, xp } of milestones) {
        if (round > cap) continue;
        rows.push({
          slug: `round-${round}`,
          name: `Round ${round}`,
          type: 'ROUND_MILESTONE',
          criteria: { round, challengeType: 'HIGHEST_ROUND' },
          xpReward: xp,
          rarity: rarityForRound(round, cap),
        });
      }
      const ndWr = getWRRoundForSeed('BO6', 'NO_DOWNS', mapSlug, bo6Cfg.noDownsWR, { variant: 'megas' });
      const ndCap = roundWRToAchievementRound(ndWr);
      const ndMilestones = getBo6RoundMilestones(ndCap);
      for (const { round, xp } of ndMilestones) {
        if (round > ndCap) continue;
        rows.push({
          slug: `no-downs-${round}`,
          name: `No Downs Round ${round}`,
          type: 'CHALLENGE_COMPLETE',
          criteria: { round, challengeType: 'NO_DOWNS' },
          xpReward: xp,
          rarity: rarityForRound(round, ndCap),
        });
      }
      for (const cType of bo6Cfg.challengeTypes) {
        const ct = cType as string;
        if (ct === 'HIGHEST_ROUND' || ct === 'NO_DOWNS' || ct.startsWith('ROUND_') || ct === 'EASTER_EGG_SPEEDRUN' || ct === 'EXFIL_SPEEDRUN' || ct === 'EXFIL_R21_SPEEDRUN' || ct === 'BUILD_EE_SPEEDRUN') continue;
        const configWr = ct === 'STARTING_ROOM' ? bo6Cfg.firstRoomWR
          : ct === 'NO_PERKS' ? bo6Cfg.noPerksWR
          : ct === 'NO_JUG' ? bo6Cfg.noJugWR
          : undefined;
        if (configWr == null || configWr <= 0) continue;
        const slugPrefix = ct.toLowerCase().replace(/_/g, '-');
        // BO6 first room only: split "with gum with support" (1x) and "no gum no support" (2x)
        if (ct === 'STARTING_ROOM') {
          const withGumWr = getWRRoundForSeed('BO6', ct, mapSlug, configWr, { variant: 'megas' });
          const withGumCap = roundWRToAchievementRound(withGumWr);
          const withGumMilestones = getBo6RoundMilestones(withGumCap);
          for (const { round, xp } of withGumMilestones) {
            if (round > withGumCap) continue;
            rows.push({
              slug: `${slugPrefix}-${round}-with-gum-support`,
              name: `${getBo6ChallengeTypeLabel(ct)} Round ${round} (With Gum / With Support)`,
              type: 'CHALLENGE_COMPLETE',
              criteria: { round, challengeType: cType, bo6GobbleGumMode: 'WITH_GOBBLEGUMS', bo6SupportMode: 'WITH_SUPPORT' },
              xpReward: Math.max(MIN_ACHIEVEMENT_XP, xp),
              rarity: rarityForRound(round, withGumCap),
            });
          }
          const noGumNoSupportWr = getWRRoundForSeed('BO6', ct, mapSlug, configWr, { variant: 'restricted' });
          const noGumNoSupportCap = roundWRToAchievementRound(noGumNoSupportWr);
          const noGumNoSupportMilestones = getBo6RoundMilestones(noGumNoSupportCap);
          for (const { round, xp } of noGumNoSupportMilestones) {
            if (round > noGumNoSupportCap) continue;
            rows.push({
              slug: `${slugPrefix}-${round}-no-gum-no-support`,
              name: `${getBo6ChallengeTypeLabel(ct)} Round ${round} (No Gum / No Support)`,
              type: 'CHALLENGE_COMPLETE',
              criteria: { round, challengeType: cType, bo6GobbleGumMode: 'NO_GOBBLEGUMS', bo6SupportMode: 'NO_SUPPORT' },
              xpReward: Math.max(MIN_ACHIEVEMENT_XP, xp * 2),
              rarity: rarityForRound(round, noGumNoSupportCap),
            });
          }
          continue;
        }
        const wr = getWRRoundForSeed('BO6', ct, mapSlug, configWr, { variant: 'megas' });
        const wrCap = roundWRToAchievementRound(wr);
        const cMilestones = getBo6RoundMilestones(wrCap);
        for (const { round, xp } of cMilestones) {
          if (round > wrCap) continue;
          rows.push({
            slug: `${slugPrefix}-${round}`,
            name: `${getBo6ChallengeTypeLabel(ct)} Round ${round}`,
            type: 'CHALLENGE_COMPLETE',
            criteria: { round, challengeType: cType },
            xpReward: Math.max(MIN_ACHIEVEMENT_XP, xp),
            rarity: rarityForRound(round, wrCap),
          });
        }
        const noSupportWr = getWRRoundForSeed('BO6', ct, mapSlug, configWr, { variant: 'restricted' });
        const noSupportCap = roundWRToAchievementRound(noSupportWr);
        const noSupportMilestones = getBo6RoundMilestones(noSupportCap);
        for (const { round, xp } of noSupportMilestones) {
          if (round > noSupportCap) continue;
          rows.push({
            slug: `${slugPrefix}-${round}-no-support`,
            name: `${getBo6ChallengeTypeLabel(ct)} Round ${round} (No Support)`,
            type: 'CHALLENGE_COMPLETE',
            criteria: { round, challengeType: cType, bo6SupportMode: 'NO_SUPPORT' },
            xpReward: Math.max(MIN_ACHIEVEMENT_XP, xp * 2),
            rarity: rarityForRound(round, noSupportCap),
          });
        }
      }
      return rows;
    }
  }

  // WW2: per-map config with WRs, First Room, No Power, No Armor, No Blitz, speedruns, EE
  if (gameShortName === 'WW2') {
    const ww2Cfg = getWw2MapConfig(mapSlug);
    if (ww2Cfg) {
      const milestones = getWw2RoundMilestones(ww2Cfg.highRoundWR);
      for (const { round, xp } of milestones) {
        if (round > ww2Cfg.highRoundWR) continue;
        rows.push({
          slug: `round-${round}`,
          name: `Round ${round}`,
          type: 'ROUND_MILESTONE',
          criteria: { round, challengeType: 'HIGHEST_ROUND' },
          xpReward: xp,
          rarity: rarityForRound(round, ww2Cfg.highRoundWR),
        });
      }
      const ndMilestones = getWw2RoundMilestones(ww2Cfg.noDownsWR);
      for (const { round, xp } of ndMilestones) {
        if (round > ww2Cfg.noDownsWR) continue;
        rows.push({
          slug: `no-downs-${round}`,
          name: `No Downs Round ${round}`,
          type: 'CHALLENGE_COMPLETE',
          criteria: { round, challengeType: 'NO_DOWNS' },
          xpReward: xp,
          rarity: rarityForRound(round, ww2Cfg.noDownsWR),
        });
      }
      for (const cType of ww2Cfg.challengeTypes) {
        const ct = cType as string;
        if (ct === 'HIGHEST_ROUND' || ct === 'NO_DOWNS' || ct.startsWith('ROUND_') || ct === 'SUPER_30_SPEEDRUN' || ct === 'EASTER_EGG_SPEEDRUN') continue;
        const wr = ct === 'STARTING_ROOM' ? ww2Cfg.firstRoomWR
          : ct === 'NO_POWER' ? ww2Cfg.noPowerWR
          : ct === 'NO_ARMOR' ? ww2Cfg.noArmorWR
          : ct === 'NO_BLITZ' ? ww2Cfg.noBlitzWR
          : undefined;
        if (wr == null || wr <= 0) continue;
        const cMilestones = getWw2RoundMilestones(wr);
        const slugPrefix = ct.toLowerCase().replace(/_/g, '-');
        for (const { round, xp } of cMilestones) {
          if (round > wr) continue;
          rows.push({
            slug: `${slugPrefix}-${round}`,
            name: `${getWw2ChallengeTypeLabel(ct)} Round ${round}`,
            type: 'CHALLENGE_COMPLETE',
            criteria: { round, challengeType: cType },
            xpReward: Math.max(MIN_ACHIEVEMENT_XP, xp),
            rarity: rarityForRound(round, wr),
          });
        }
      }
      return rows;
    }
  }

  // Vanguard: per-map config with WRs, First Room, No Perks, No Armor, No Jug, No Jug No Armor, speedruns, exfil, EE
  if (gameShortName === 'VANGUARD') {
    const vgCfg = getVanguardMapConfig(mapSlug);
    if (vgCfg) {
      const milestones = getVanguardRoundMilestones(vgCfg.highRoundWR);
      for (const { round, xp } of milestones) {
        if (round > vgCfg.highRoundWR) continue;
        rows.push({
          slug: `round-${round}`,
          name: `Round ${round}`,
          type: 'ROUND_MILESTONE',
          criteria: { round, challengeType: 'HIGHEST_ROUND' },
          xpReward: xp,
          rarity: rarityForRound(round, vgCfg.highRoundWR),
        });
      }
      const ndMilestones = getVanguardRoundMilestones(vgCfg.noDownsWR);
      for (const { round, xp } of ndMilestones) {
        if (round > vgCfg.noDownsWR) continue;
        rows.push({
          slug: `no-downs-${round}`,
          name: `No Downs Round ${round}`,
          type: 'CHALLENGE_COMPLETE',
          criteria: { round, challengeType: 'NO_DOWNS' },
          xpReward: xp,
          rarity: rarityForRound(round, vgCfg.noDownsWR),
        });
      }
      for (const cType of vgCfg.challengeTypes) {
        const ct = cType as string;
        if (ct === 'HIGHEST_ROUND' || ct === 'NO_DOWNS' || ct.startsWith('ROUND_') || ct === 'EASTER_EGG_SPEEDRUN' || ct === 'EXFIL_R5_SPEEDRUN' || ct === 'EXFIL_R10_SPEEDRUN' || ct === 'EXFIL_R20_SPEEDRUN' || ct === 'BUILD_EE_SPEEDRUN') continue;
        const wr = ct === 'STARTING_ROOM' ? vgCfg.firstRoomWR
          : ct === 'NO_PERKS' ? vgCfg.noPerksWR
          : ct === 'NO_ARMOR' ? vgCfg.noArmorWR
          : ct === 'NO_JUG' ? vgCfg.noJugWR
          : undefined;
        if (wr == null || wr <= 0) continue;
        const cMilestones = getVanguardRoundMilestones(wr);
        const slugPrefix = ct.toLowerCase().replace(/_/g, '-');
        for (const { round, xp } of cMilestones) {
          if (round > wr) continue;
          rows.push({
            slug: `${slugPrefix}-${round}`,
            name: `${getVanguardChallengeTypeLabel(ct)} Round ${round}`,
            type: 'CHALLENGE_COMPLETE',
            criteria: { round, challengeType: cType },
            xpReward: Math.max(MIN_ACHIEVEMENT_XP, xp),
            rarity: rarityForRound(round, wr),
          });
        }
      }
      return rows;
    }
  }

  // AW Exo Zombies: per-map config with WRs, First Room, No Power, No Exo Suit, No Exo Health, Double Feature (Descent only)
  if (gameShortName === 'AW') {
    const awCfg = getAwMapConfig(mapSlug);
    if (awCfg) {
      const milestones = getAwRoundMilestones(awCfg.highRoundWR);
      for (const { round, xp } of milestones) {
        if (round > awCfg.highRoundWR) continue;
        rows.push({
          slug: `round-${round}`,
          name: `Round ${round}`,
          type: 'ROUND_MILESTONE',
          criteria: { round, challengeType: 'HIGHEST_ROUND' },
          xpReward: xp,
          rarity: rarityForRound(round, awCfg.highRoundWR),
        });
      }
      const ndMilestones = getAwRoundMilestones(awCfg.noDownsWR);
      for (const { round, xp } of ndMilestones) {
        if (round > awCfg.noDownsWR) continue;
        rows.push({
          slug: `no-downs-${round}`,
          name: `No Downs Round ${round}`,
          type: 'CHALLENGE_COMPLETE',
          criteria: { round, challengeType: 'NO_DOWNS' },
          xpReward: xp,
          rarity: rarityForRound(round, awCfg.noDownsWR),
        });
      }
      for (const cType of awCfg.challengeTypes) {
        const ct = cType as string;
        if (ct === 'HIGHEST_ROUND' || ct === 'NO_DOWNS' || ct.startsWith('ROUND_') || ct === 'EASTER_EGG_SPEEDRUN') continue;
        // AW Carrier: STARTING_ROOM has MK14_SIDE, BULLDOG_SIDE, MIXED variants
        if (mapSlug === 'aw-carrier' && ct === 'STARTING_ROOM') {
          const wr = awCfg.firstRoomWR;
          if (wr == null || wr <= 0) continue;
          for (const variant of ['MK14_SIDE', 'BULLDOG_SIDE', 'MIXED'] as const) {
            const label = variant === 'MK14_SIDE' ? 'First Room (MK14 Side)' : variant === 'BULLDOG_SIDE' ? 'First Room (Bulldog Side)' : 'First Room (Mixed)';
            const cMilestones = getAwRoundMilestones(wr);
            const slugPrefix = `starting-room-${variant.toLowerCase().replace(/_/g, '-')}`;
            for (const { round, xp } of cMilestones) {
              if (round > wr) continue;
              rows.push({
                slug: `${slugPrefix}-${round}`,
                name: `${label} Round ${round}`,
                type: 'CHALLENGE_COMPLETE',
                criteria: { round, challengeType: 'STARTING_ROOM', firstRoomVariant: variant },
                xpReward: Math.max(MIN_ACHIEVEMENT_XP, xp),
                rarity: rarityForRound(round, wr),
              });
            }
          }
          continue;
        }
        const wr = ct === 'STARTING_ROOM' ? awCfg.firstRoomWR
          : ct === 'NO_POWER' ? awCfg.noPowerWR
          : ct === 'NO_EXO_SUIT' ? awCfg.noExoSuitWR
          : ct === 'NO_EXO_HEALTH' ? awCfg.noExoHealthWR
          : ct === 'DOUBLE_FEATURE' ? awCfg.doubleFeatureWR
          : undefined;
        if (wr == null || wr <= 0) continue;
        const cMilestones = getAwRoundMilestones(wr);
        const slugPrefix = ct.toLowerCase().replace(/_/g, '-');
        for (const { round, xp } of cMilestones) {
          if (round > wr) continue;
          rows.push({
            slug: `${slugPrefix}-${round}`,
            name: `${getAwChallengeTypeLabel(ct)} Round ${round}`,
            type: 'CHALLENGE_COMPLETE',
            criteria: { round, challengeType: cType },
            xpReward: Math.max(MIN_ACHIEVEMENT_XP, xp),
            rarity: rarityForRound(round, wr),
          });
        }
      }
      return rows;
    }
  }

  // BO7: 4% rule; with-support (base) + no-support (2x XP). Has no-power.
  if (gameShortName === 'BO7') {
    const bo7Cfg = getBo7MapConfig(mapSlug);
    if (bo7Cfg) {
      const hrWr = getWRRoundForSeed('BO7', 'HIGHEST_ROUND', mapSlug, bo7Cfg.highRoundWR, { variant: 'megas' });
      const cap = roundWRToAchievementRound(hrWr);
      const milestones = getBo7RoundMilestones(cap);
      for (const { round, xp } of milestones) {
        if (round > cap) continue;
        rows.push({
          slug: `round-${round}`,
          name: `Round ${round}`,
          type: 'ROUND_MILESTONE',
          criteria: { round, challengeType: 'HIGHEST_ROUND' },
          xpReward: xp,
          rarity: rarityForRound(round, cap),
        });
      }
      const ndWr = getWRRoundForSeed('BO7', 'NO_DOWNS', mapSlug, bo7Cfg.noDownsWR, { variant: 'megas' });
      const ndCap = roundWRToAchievementRound(ndWr);
      const ndMilestones = getBo7RoundMilestones(ndCap);
      for (const { round, xp } of ndMilestones) {
        if (round > ndCap) continue;
        rows.push({
          slug: `no-downs-${round}`,
          name: `No Downs Round ${round}`,
          type: 'CHALLENGE_COMPLETE',
          criteria: { round, challengeType: 'NO_DOWNS' },
          xpReward: xp,
          rarity: rarityForRound(round, ndCap),
        });
      }
      for (const cType of bo7Cfg.challengeTypes) {
        const ct = cType as string;
        if (ct === 'HIGHEST_ROUND' || ct === 'NO_DOWNS' || ct.startsWith('ROUND_') || ct === 'EASTER_EGG_SPEEDRUN' || ct === 'EXFIL_SPEEDRUN' || ct === 'EXFIL_R21_SPEEDRUN' || ct === 'BUILD_EE_SPEEDRUN') continue;
        const configWr = ct === 'STARTING_ROOM' ? bo7Cfg.firstRoomWR
          : ct === 'NO_PERKS' ? bo7Cfg.noPerksWR
          : ct === 'NO_JUG' ? bo7Cfg.noJugWR
          : ct === 'NO_POWER' ? bo7Cfg.noPowerWR
          : undefined;
        if (configWr == null || configWr <= 0) continue;
        const wr = getWRRoundForSeed('BO7', ct, mapSlug, configWr, { variant: 'megas' });
        const wrCap = roundWRToAchievementRound(wr);
        const cMilestones = getBo7RoundMilestones(wrCap);
        const slugPrefix = ct.toLowerCase().replace(/_/g, '-');
        for (const { round, xp } of cMilestones) {
          if (round > wrCap) continue;
          rows.push({
            slug: `${slugPrefix}-${round}`,
            name: `${getBo7ChallengeTypeLabel(ct)} Round ${round}`,
            type: 'CHALLENGE_COMPLETE',
            criteria: { round, challengeType: cType },
            xpReward: Math.max(MIN_ACHIEVEMENT_XP, xp),
            rarity: rarityForRound(round, wrCap),
          });
        }
        const noSupportWr = getWRRoundForSeed('BO7', ct, mapSlug, configWr, { variant: 'restricted' });
        const noSupportCap = roundWRToAchievementRound(noSupportWr);
        const noSupportMilestones = getBo7RoundMilestones(noSupportCap);
        for (const { round, xp } of noSupportMilestones) {
          if (round > noSupportCap) continue;
          const supportLabel = ct === 'STARTING_ROOM' || ct === 'NO_POWER' ? 'No Support, No Gums' : 'No Support';
          rows.push({
            slug: `${slugPrefix}-${round}-no-support`,
            name: `${getBo7ChallengeTypeLabel(ct)} Round ${round} (${supportLabel})`,
            type: 'CHALLENGE_COMPLETE',
            criteria: { round, challengeType: cType, bo7SupportMode: 'NO_SUPPORT' },
            xpReward: Math.max(MIN_ACHIEVEMENT_XP, xp * 2),
            rarity: rarityForRound(round, noSupportCap),
          });
        }
      }
      return rows;
    }
  }

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
        name: `Round ${round}`,
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
        name: `No Downs Round ${round}`,
        type: 'CHALLENGE_COMPLETE',
        criteria: { round, challengeType: 'NO_DOWNS', ...(isCap ? { isCap: true } : {}) },
        xpReward: xp,
        rarity: isCap ? 'LEGENDARY' : rarityForRound(round, maxRound),
      });
    }
    // Other types: rounds <= maxRound, XP from map milestones × multiplier
    const isIwZis = mapSlug === 'zombies-in-spaceland' && gameShortName === 'IW';
    const isIwRave = mapSlug === 'rave-in-the-redwoods' && gameShortName === 'IW';
    const isIwShaolin = mapSlug === 'shaolin-shuffle' && gameShortName === 'IW';
    const isIwAotrt = mapSlug === 'attack-of-the-radioactive-thing' && gameShortName === 'IW';
    const isIwBeast = mapSlug === 'the-beast-from-beyond' && gameShortName === 'IW';
    const iwOverrideRounds = isIwZis ? IW_ZIS_CHALLENGE_ROUNDS : isIwRave ? IW_RAVE_CHALLENGE_ROUNDS : isIwShaolin ? IW_SHAOLIN_CHALLENGE_ROUNDS : isIwAotrt ? IW_AOTRT_CHALLENGE_ROUNDS : isIwBeast ? IW_BEAST_CHALLENGE_ROUNDS : undefined;
    for (const cType of CHALLENGE_TYPES) {
      if (cType === 'HIGHEST_ROUND' || cType === 'NO_DOWNS') continue;
      if (cType === 'STARTING_ROOM' && isIwBeast) continue; // Beast From Beyond has no starting room challenge
      const defaultConfig = getMilestonesForChallengeType(cType as any);
      if (!defaultConfig) continue;
      const slugPrefix = cType.toLowerCase().replace(/_/g, '-');
      const overrideRounds = iwOverrideRounds?.[cType];
      const effectiveRounds = overrideRounds ?? (defaultConfig.rounds as number[]);
      const effectiveMax = overrideRounds ? Math.max(...overrideRounds) : maxRound;
      const rounds =
        defaultConfig.flatXp != null
          ? (effectiveRounds[0]! <= effectiveMax ? [effectiveRounds[0]!] : [])
          : effectiveRounds.filter((r) => r <= effectiveMax);
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
        // Phase 7: IW first room & no power – Fate only (no DC) 2x XP, Director's Cut 1x XP
        const isIw = isIwZis || isIwRave || isIwShaolin || isIwAotrt || isIwBeast;
        if (isIw && (cType === 'STARTING_ROOM' || cType === 'NO_POWER')) {
          rows.push({
            slug: `${slugPrefix}-${round}-fate`,
            name: `${cType.replace(/_/g, ' ')} Round ${round} (Fate Only)`,
            type: 'CHALLENGE_COMPLETE',
            criteria: { round, challengeType: cType, useDirectorsCut: false },
            xpReward: Math.max(MIN_ACHIEVEMENT_XP, xp * 2),
            rarity: rarityForRound(round, maxRound),
          });
          rows.push({
            slug: `${slugPrefix}-${round}-dc`,
            name: `${cType.replace(/_/g, ' ')} Round ${round} (Director's Cut)`,
            type: 'CHALLENGE_COMPLETE',
            criteria: { round, challengeType: cType, useDirectorsCut: true },
            xpReward: Math.max(MIN_ACHIEVEMENT_XP, xp),
            rarity: rarityForRound(round, maxRound),
          });
        }
      }
    }
    if (isBo4Game(gameShortName)) {
      return rows.flatMap((r) => expandBo4Difficulties(r));
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
      name: `Round ${roundCap}`,
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
      name: `No Downs Round ${roundCap}`,
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

  if (isBo4Game(gameShortName)) {
    return rows.flatMap((r) => expandBo4Difficulties(r));
  }
  return rows;
}

const SPEEDRUN_TYPE_LABELS: Record<string, string> = {
  ROUND_5_SPEEDRUN: 'Round 5',
  ROUND_15_SPEEDRUN: 'Round 15',
  ROUND_10_SPEEDRUN: 'Round 10',
  ROUND_20_SPEEDRUN: 'Round 20',
  ROUND_30_SPEEDRUN: 'Round 30',
  ROUND_50_SPEEDRUN: 'Round 50',
  ROUND_70_SPEEDRUN: 'Round 70',
  ROUND_100_SPEEDRUN: 'Round 100',
  ROUND_200_SPEEDRUN: 'Round 200',
  ROUND_255_SPEEDRUN: 'Round 255',
  ROUND_935_SPEEDRUN: 'Round 935',
  ROUND_999_SPEEDRUN: 'Round 999',
  EXFIL_SPEEDRUN: 'Exfil Round 11',
  EXFIL_R21_SPEEDRUN: 'Exfil Round 21',
  EXFIL_R5_SPEEDRUN: 'Exfil Round 5',
  EXFIL_R10_SPEEDRUN: 'Exfil Round 10',
  EXFIL_R20_SPEEDRUN: 'Exfil Round 20',
  BUILD_EE_SPEEDRUN: 'Build% EE',
  SUPER_30_SPEEDRUN: 'Super 30 Speedrun',
  INSTAKILL_ROUND_SPEEDRUN: 'Instakill Round',
  EASTER_EGG_SPEEDRUN: 'Easter Egg',
  GHOST_AND_SKULLS: 'Ghost and Skulls',
  ALIENS_BOSS_FIGHT: 'Aliens Boss Fight',
  CRYPTID_FIGHT: 'Cryptid Fight',
  MEPHISTOPHELES: 'Mephistopheles',
};

const IW_SPEEDRUN_TIERS_BY_MAP: Record<string, SpeedrunTiersByType> = {
  'zombies-in-spaceland': IW_ZIS_SPEEDRUN_TIERS,
  'rave-in-the-redwoods': IW_RAVE_SPEEDRUN_TIERS,
  'shaolin-shuffle': IW_SHAOLIN_SPEEDRUN_TIERS,
  'attack-of-the-radioactive-thing': IW_AOTRT_SPEEDRUN_TIERS,
  'the-beast-from-beyond': IW_BEAST_SPEEDRUN_TIERS,
};

/** Resolve speedrun WR time (seconds) from game map config for 4% rule fallback. Base = megas/with rampage. */
function getSpeedrunWRSecondsFromConfig(
  gameShortName: string,
  mapSlug: string,
  challengeType: string
): number | null {
  if (challengeType === 'ROUND_5_SPEEDRUN' || challengeType === 'ROUND_15_SPEEDRUN') {
    const type = challengeType === 'ROUND_5_SPEEDRUN' ? 'r5' : 'r15';
    return getR5R15WRSeconds(gameShortName, mapSlug, type, 'megas');
  }
  const key = challengeType === 'ROUND_30_SPEEDRUN' ? 'r30' : challengeType === 'ROUND_50_SPEEDRUN' ? 'r50' : challengeType === 'ROUND_70_SPEEDRUN' ? 'r70' : challengeType === 'ROUND_100_SPEEDRUN' ? 'r100' : challengeType === 'ROUND_200_SPEEDRUN' ? 'r200' : challengeType === 'ROUND_255_SPEEDRUN' ? 'r255' : challengeType === 'ROUND_935_SPEEDRUN' ? 'r935' : challengeType === 'EXFIL_SPEEDRUN' ? 'exfilSpeedrunWR' : challengeType === 'EXFIL_R21_SPEEDRUN' ? 'exfilR21SpeedrunWR' : challengeType === 'BUILD_EE_SPEEDRUN' ? 'buildEeSpeedrunWR' : '';
  if (gameShortName === 'BO3') {
    const c = getBo3MapConfig(mapSlug);
    if (challengeType === 'EASTER_EGG_SPEEDRUN') return c?.eeSpeedrunWR ?? null;
    const s = c?.speedrunWRs;
    return (s && key && key in s ? (s as Record<string, number>)[key] : null) ?? null;
  }
  if (gameShortName === 'BO4') {
    const c = getBo4MapConfig(mapSlug);
    const s = c?.speedrunWRs;
    if (challengeType === 'EASTER_EGG_SPEEDRUN') return (s && 'eeSpeedrunWR' in s ? (s as Record<string, number>).eeSpeedrunWR : null) ?? null;
    return (s && key && key in s ? (s as Record<string, number>)[key] : null) ?? null;
  }
  if (gameShortName === 'BOCW') {
    const c = getBocwMapConfig(mapSlug);
    const s = c?.speedrunWRs;
    if (challengeType === 'EASTER_EGG_SPEEDRUN') return (s && 'eeSpeedrunWR' in s ? (s as Record<string, number>).eeSpeedrunWR : null) ?? null;
    return (s && key && key in s ? (s as Record<string, number>)[key] : null) ?? null;
  }
  if (gameShortName === 'BO6') {
    const c = getBo6MapConfig(mapSlug);
    const s = c?.speedrunWRs;
    if (challengeType === 'EASTER_EGG_SPEEDRUN') return (s && 'eeSpeedrunWR' in s ? (s as Record<string, number>).eeSpeedrunWR : null) ?? null;
    return (s && key && key in s ? (s as Record<string, number>)[key] : null) ?? null;
  }
  if (gameShortName === 'BO7') {
    const c = getBo7MapConfig(mapSlug);
    const s = c?.speedrunWRs;
    if (challengeType === 'EASTER_EGG_SPEEDRUN') return (s && 'eeSpeedrunWR' in s ? (s as Record<string, number>).eeSpeedrunWR : null) ?? null;
    return (s && key && key in s ? (s as Record<string, number>)[key] : null) ?? null;
  }
  if (gameShortName === 'WAW') {
    const c = getWaWMapConfig(mapSlug);
    if (challengeType === 'EASTER_EGG_SPEEDRUN') return (c as { eeSpeedrunWR?: number } | null)?.eeSpeedrunWR ?? null;
    const s = c?.speedrunWRs;
    return (s && key && key in s ? (s as Record<string, number>)[key] : null) ?? null;
  }
  if (gameShortName === 'BO1' || gameShortName === 'BO2' || gameShortName === 'WW2' || gameShortName === 'VANGUARD' || gameShortName === 'AW') {
    const getCfg = gameShortName === 'BO1' ? getBo1MapConfig : gameShortName === 'BO2' ? getBo2MapConfig : gameShortName === 'WW2' ? getWw2MapConfig : gameShortName === 'VANGUARD' ? getVanguardMapConfig : getAwMapConfig;
    const c = getCfg(mapSlug) as { speedrunWRs?: Record<string, number>; eeSpeedrunWR?: number } | null;
    const s = c?.speedrunWRs;
    if (challengeType === 'EASTER_EGG_SPEEDRUN') return c?.eeSpeedrunWR ?? (s && 'eeSpeedrunWR' in s ? (s as Record<string, number>).eeSpeedrunWR : null) ?? null;
    return (s && key && key in s ? (s as Record<string, number>)[key] : null) ?? null;
  }
  return null;
}

/** Config fallback for restricted (no rampage / no gums) speedrun WR seconds. */
function getSpeedrunWRSecondsFromConfigRestricted(
  gameShortName: string,
  mapSlug: string,
  challengeType: string
): number | null {
  if (challengeType === 'ROUND_5_SPEEDRUN' || challengeType === 'ROUND_15_SPEEDRUN') {
    const type = challengeType === 'ROUND_5_SPEEDRUN' ? 'r5' : 'r15';
    if (['BO3', 'BO4', 'BO7', 'BO6', 'BOCW', 'VANGUARD'].includes(gameShortName)) {
      return getR5R15WRSeconds(gameShortName, mapSlug, type, 'restricted');
    }
    return null;
  }
  const key = challengeType === 'ROUND_30_SPEEDRUN' ? 'r30' : challengeType === 'ROUND_50_SPEEDRUN' ? 'r50' : challengeType === 'ROUND_70_SPEEDRUN' ? 'r70' : challengeType === 'ROUND_100_SPEEDRUN' ? 'r100' : challengeType === 'ROUND_200_SPEEDRUN' ? 'r200' : challengeType === 'EXFIL_SPEEDRUN' ? 'exfilSpeedrunWR' : challengeType === 'EXFIL_R10_SPEEDRUN' ? 'exfilR10WR' : challengeType === 'EXFIL_R20_SPEEDRUN' ? 'exfilR20WR' : challengeType === 'EASTER_EGG_SPEEDRUN' ? 'eeSpeedrunWR' : challengeType === 'BUILD_EE_SPEEDRUN' ? 'buildEeSpeedrunWR' : '';
  if (gameShortName === 'VANGUARD') {
    const c = getVanguardMapConfig(mapSlug) as { speedrunWRsNoRampage?: Record<string, number> } | null;
    const s = c?.speedrunWRsNoRampage;
    if (!s || !key) return null;
    return (key in s ? (s as Record<string, number>)[key] : null) ?? null;
  }
  return null;
}

/** Speedrun tier achievements for IW, WAW, and BO1 maps. Fastest = most XP. */
export function getSpeedrunAchievementDefinitions(
  mapSlug: string,
  gameShortName: string
): AchievementSeedRow[] {
  const tiersByType = gameShortName === 'IW' ? IW_SPEEDRUN_TIERS_BY_MAP[mapSlug]
    : gameShortName === 'WAW' ? WAW_SPEEDRUN_TIERS_BY_MAP[mapSlug]
    : gameShortName === 'BO1' ? BO1_SPEEDRUN_TIERS_BY_MAP[mapSlug]
    : gameShortName === 'BO2' ? BO2_SPEEDRUN_TIERS_BY_MAP[mapSlug]
    : gameShortName === 'BO3' ? BO3_SPEEDRUN_TIERS_BY_MAP[mapSlug]
    : gameShortName === 'BO4' ? BO4_SPEEDRUN_TIERS_BY_MAP[mapSlug]
    : gameShortName === 'BOCW' ? BOCW_SPEEDRUN_TIERS_BY_MAP[mapSlug]
    : gameShortName === 'BO6' ? BO6_SPEEDRUN_TIERS_BY_MAP[mapSlug]
    : gameShortName === 'BO7' ? BO7_SPEEDRUN_TIERS_BY_MAP[mapSlug]
    : gameShortName === 'WW2' ? WW2_SPEEDRUN_TIERS_BY_MAP[mapSlug]
    : gameShortName === 'VANGUARD' ? VANGUARD_SPEEDRUN_TIERS_BY_MAP[mapSlug]
    : gameShortName === 'AW' ? AW_SPEEDRUN_TIERS_BY_MAP[mapSlug]
    : undefined;
  if (!tiersByType) return [];
  const r5r15Tiers = getR5R15TiersForMap(gameShortName, mapSlug);
  const mergedTiers: SpeedrunTiersByType = { ...tiersByType, ...r5r15Tiers };
  const rows: AchievementSeedRow[] = [];
  // Speedrun splits: BO3/BO4 classic vs megas; BOCW/Vanguard/BO6/BO7 no rampage vs rampage; IW fate-only vs dcut
  const restrictedModifier: Record<string, unknown> =
    gameShortName === 'BO3' ? { bo3GobbleGumMode: 'CLASSIC_ONLY' }
    : gameShortName === 'BO4' ? { bo4ElixirMode: 'CLASSIC_ONLY' }
    : gameShortName === 'BOCW' ? { rampageInducerUsed: false }
    : gameShortName === 'BO6' ? { bo6GobbleGumMode: 'NO_GOBBLEGUMS', rampageInducerUsed: false }
    : gameShortName === 'BO7' ? { rampageInducerUsed: false }
    : gameShortName === 'IW' ? { useDirectorsCut: false }
    : gameShortName === 'VANGUARD' ? { rampageInducerUsed: false }
    : {};
  const hasRestricted = Object.keys(restrictedModifier).length > 0;
  const restrictedLabelSuffix =
    gameShortName === 'BO3' || gameShortName === 'BO4' ? ' (Classic)'
    : gameShortName === 'BO7' ? ' (No Rampage, No Gums)'
    : gameShortName === 'BO6' ? ' (No Gum / No Rampage)'
    : gameShortName === 'BOCW' || gameShortName === 'VANGUARD' ? ' (No Rampage)'
    : gameShortName === 'IW' ? ' (Fate Only)'
    : '';

  const noCategory = getNoSpeedrunCategory;
  for (const [challengeType, tiers] of Object.entries(mergedTiers)) {
    const label = SPEEDRUN_TYPE_LABELS[challengeType] ?? challengeType.replace(/_/g, ' ');
    const configWrSec = getSpeedrunWRSecondsFromConfig(gameShortName, mapSlug, challengeType);
    const configRestrictedSec = getSpeedrunWRSecondsFromConfigRestricted(gameShortName, mapSlug, challengeType);
    const categoryKey = noCategory(challengeType);
    const wrTimeMegas = getWRTimeForSeed(gameShortName, categoryKey, mapSlug, configWrSec ?? undefined, { variant: 'megas', useSpeedrunVariant: true });
    const wrTimeRestricted = hasRestricted
      ? getWRTimeForSeed(gameShortName, categoryKey, mapSlug, configWrSec ?? undefined, {
          variant: 'restricted',
          useSpeedrunVariant: true,
          configRestrictedFallbackSeconds: configRestrictedSec ?? undefined,
        })
      : null;
    const baseXpRewards = tiers.map((t) => t.xpReward);
    const restrictedXpRewards = baseXpRewards.map((x) => x * 2);
    const baseTiers = wrTimeMegas != null ? buildSpeedrunTiersFromWR(wrTimeMegas, baseXpRewards) : tiers;
    const restrictedTiers = hasRestricted && wrTimeRestricted != null ? buildSpeedrunTiersFromWR(wrTimeRestricted, restrictedXpRewards) : null;
    const isBo4 = gameShortName === 'BO4';
    for (let i = 0; i < baseTiers.length; i++) {
      const { maxTimeSeconds, xpReward } = baseTiers[i]!;
      const timeStr = formatSpeedrunTime(maxTimeSeconds).replace(/:/g, '-');
      const slug = `${challengeType.toLowerCase().replace(/_/g, '-')}-under-${timeStr}`.replace(/\s/g, '-');
      const rarity = i === baseTiers.length - 1 ? 'LEGENDARY' : i >= baseTiers.length - 2 ? 'EPIC' : i >= baseTiers.length - 3 ? 'RARE' : 'UNCOMMON';
      const baseRow: AchievementSeedRow = {
        slug,
        name: `${label} in under ${formatSpeedrunTime(maxTimeSeconds)}`,
        type: 'CHALLENGE_COMPLETE',
        criteria: { challengeType, maxTimeSeconds },
        xpReward,
        rarity,
      };
      if (isBo4) {
        rows.push(...expandBo4AchievementDifficulties(baseRow));
      } else {
        rows.push(baseRow);
      }
      if (hasRestricted) {
        const resTier = restrictedTiers?.[i] ?? { maxTimeSeconds, xpReward: xpReward * 2 };
        const restrictedMaxTime = resTier.maxTimeSeconds;
        const restrictedXp = resTier.xpReward;
        const restrictedRow: AchievementSeedRow = {
          slug: `${slug}-restricted`,
          name: `${label} in under ${formatSpeedrunTime(restrictedMaxTime)}${restrictedLabelSuffix}`,
          type: 'CHALLENGE_COMPLETE',
          criteria: { challengeType, maxTimeSeconds: restrictedMaxTime, ...restrictedModifier },
          xpReward: restrictedXp,
          rarity,
        };
        if (isBo4) {
          rows.push(...expandBo4AchievementDifficulties(restrictedRow));
        } else {
          rows.push(restrictedRow);
        }
      }
    }
  }
  return rows;
}

/** Call of the Dead: two EE speedruns (Stand-in Solo, Ensemble Cast 2+). Balance patch resolves easterEggSlug to easterEggId. */
/** BO2 EE speedruns: Tranzit, Die Rise, Buried have Richtofen vs Maxis variants. Balance patch resolves easterEggSlug. */
export function getBo2EeSpeedrunDefinitions(mapSlug: string): AchievementSeedRow[] {
  const rows: AchievementSeedRow[] = [];
  const variants: [string, string, import('./speedrun-tiers').SpeedrunTier[]][] = (() => {
    if (mapSlug === 'tranzit') return [['tower-of-babble-richtofen', 'Richtofen', BO2_TRANZIT_RICHTOFEN_EE_TIERS], ['tower-of-babble-maxis', 'Maxis', BO2_TRANZIT_MAXIS_EE_TIERS]];
    if (mapSlug === 'die-rise') return [['high-maintenance-richtofen', 'Richtofen', BO2_DIE_RISE_RICHTOFEN_EE_TIERS], ['high-maintenance-maxis', 'Maxis', BO2_DIE_RISE_MAXIS_EE_TIERS]];
    if (mapSlug === 'buried') return [['mined-games-richtofen', 'Richtofen', BO2_BURIED_RICHTOFEN_EE_TIERS], ['mined-games-maxis', 'Maxis', BO2_BURIED_MAXIS_EE_TIERS]];
    return [];
  })();
  for (const [eeSlug, variantLabel, tiers] of variants) {
    for (let i = 0; i < tiers.length; i++) {
      const { maxTimeSeconds, xpReward } = tiers[i]!;
      const timeStr = formatSpeedrunTime(maxTimeSeconds).replace(/:/g, '-');
      const slug = `easter-egg-speedrun-${eeSlug}-under-${timeStr}`.replace(/\s/g, '-');
      const rarity = i === tiers.length - 1 ? 'LEGENDARY' : i >= tiers.length - 2 ? 'EPIC' : i >= tiers.length - 3 ? 'RARE' : 'UNCOMMON';
      rows.push({
        slug,
        name: `${variantLabel} EE in under ${formatSpeedrunTime(maxTimeSeconds)}`,
        type: 'CHALLENGE_COMPLETE',
        criteria: { challengeType: 'EASTER_EGG_SPEEDRUN', maxTimeSeconds },
        xpReward,
        rarity,
        easterEggSlug: eeSlug,
      });
    }
  }
  return rows;
}

export function getBo1CallOfTheDeadEeSpeedrunDefinitions(): AchievementSeedRow[] {
  const rows: AchievementSeedRow[] = [];
  for (const [eeSlug, eeLabel, tiers] of [
    ['stand-in', 'Stand-in (Solo)', BO1_COTD_STAND_IN_EE_TIERS],
    ['ensemble-cast', 'Ensemble Cast (2+)', BO1_COTD_ENSEMBLE_CAST_EE_TIERS],
  ] as const) {
    for (let i = 0; i < tiers.length; i++) {
      const { maxTimeSeconds, xpReward } = tiers[i]!;
      const timeStr = formatSpeedrunTime(maxTimeSeconds).replace(/:/g, '-');
      const slug = `easter-egg-speedrun-${eeSlug}-under-${timeStr}`.replace(/\s/g, '-');
      const rarity = i === tiers.length - 1 ? 'LEGENDARY' : i >= tiers.length - 2 ? 'EPIC' : i >= tiers.length - 3 ? 'RARE' : 'UNCOMMON';
      rows.push({
        slug,
        name: `${eeLabel} EE in under ${formatSpeedrunTime(maxTimeSeconds)}`,
        type: 'CHALLENGE_COMPLETE',
        criteria: { challengeType: 'EASTER_EGG_SPEEDRUN', maxTimeSeconds },
        xpReward,
        rarity,
        easterEggSlug: eeSlug,
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
