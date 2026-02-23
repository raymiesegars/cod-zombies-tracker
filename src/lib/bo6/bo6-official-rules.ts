import type { RuleItem } from '@/lib/rules/types';
import type { Bo6MapSlug } from './bo6-map-config';

type RulesSection = { title: string; items: RuleItem[] };

/** Shared general rules for BO6/BO7. */
const BO6_BO7_SHARED_GENERAL: RulesSection[] = [
  {
    title: 'General',
    items: [
      'All games must be played on the most recent patch of the game.',
      'As Black Ops 6/7 is still in its life cycle, updates and patches have proven to introduce changes that affect the competitive balance of the leaderboard. Because of this, leaderboards may be reset or restored at any time. Removed runs will be backed up in case the leaderboard or specific records are reinstated at a later time.',
      'No gum games can NOT submit to both with gum and no gum sub-categories.',
      'No support games can NOT submit to both with support and without support sub-categories.',
      'Saving and quitting and/or force crashing your game to void/save a dying wish use, down, or game over is NOT ALLOWED.',
      'Build% EE runs are ALLOWED to submit to either build% EE or normal EE (box%) but, not both leaderboards.',
    ],
  },
  {
    title: 'Video Requirements',
    items: [
      'Full gameplay is required.',
      'Twitch: Make sure your footage is highlighted as past broadcasts will not be accepted.',
      'YouTube: Make sure your video is public or unlisted.',
      'Multi-pov is required for co-op.',
    ],
  },
];

/** Per-map challenge specifics. */
const TERMINUS_SPECIFICS: string[] = [
  'Reach the highest round you can.',
  'Every round must be played in full.',
  'Armor plates can be picked up or purchased at the wall buy.',
  'In solo, players can only use the Self-Revive that they start the game with.',
  'In coop, players are ALLOWED to purchase/use 3 Self-Revives MAXIMUM per player (obtained/dropped by zombies, not the workbench).',
  'Gums are NOT ALLOWED with the exception of "Anywhere But Here" to get unstuck from the map (please timestamp if used).',
  'We recommend using the 3 Whimsicals in case of a missclick. This will NOT void your run.',
  'Using Support is NOT ALLOWED.',
  'Try to avoid picking up scorestreaks.',
  'Purchasing items from the "Support" section in the crafting table is NOT ALLOWED.',
  'Players are NOT ALLOWED to buy armor in the workbench.',
  'Glitches or Exploits are NOT ALLOWED.',
  'Multi-Pov is UNCONDITIONALLY REQUIRED for co-op games.',
];

const LIBERTY_FALLS_AND_OTHERS_SPECIFICS: string[] = [
  'Reach the highest round you can.',
  'Every round must be played in full.',
  'Using Support is ALLOWED.',
  'Gums are NOT ALLOWED with the exception of "Anywhere But Here" to get unstuck from the map (please timestamp if used).',
  'We recommend using the 3 Whimsicals in case of a missclick. This will NOT void your run.',
  'Glitches or Exploits are NOT ALLOWED.',
  'Multi-Pov is UNCONDITIONALLY REQUIRED for co-op games.',
];

const MAP_SPECIFICS: Record<Bo6MapSlug, string[]> = {
  terminus: TERMINUS_SPECIFICS,
  'liberty-falls': LIBERTY_FALLS_AND_OTHERS_SPECIFICS,
  'citadelle-des-morts': LIBERTY_FALLS_AND_OTHERS_SPECIFICS,
  'the-tomb': LIBERTY_FALLS_AND_OTHERS_SPECIFICS,
  'shattered-veil': LIBERTY_FALLS_AND_OTHERS_SPECIFICS,
  reckoning: LIBERTY_FALLS_AND_OTHERS_SPECIFICS,
};

/** Challenge type -> rule description. Same for BO6/BO7. */
const BO6_CHALLENGE_RULES_BY_TYPE: Record<string, string> = {
  HIGHEST_ROUND: 'Reach the highest round you can. Every round must be played in full. See map-specific rules for Support/Gums.',
  NO_DOWNS: 'Reach the highest round you can without taking a down. Every round must be played in full. Multi-pov is required for co-op.',
  NO_PERKS: 'Reach the highest round you can without buying perks. Every round must be played in full. Multi-pov is required for co-op.',
  NO_PACK: 'Reach the highest round possible without pack-a-punching. Every round must be played in full. Glitches or Exploits are NOT ALLOWED. Multi-pov is required for co-op.',
  STARTING_ROOM: 'Reach the highest round you can without opening doors. Every round must be played in full. See map-specific rules. Multi-pov is required for co-op.',
  ONE_BOX: 'Reach the highest round possible by hitting the box one time per player. Buying a wall weapon is NOT ALLOWED. Pack-a-Punching is ALLOWED. Traps are NOT ALLOWED. Glitches or Exploits are NOT ALLOWED. Multi-pov is required for co-op.',
  PISTOL_ONLY: 'Reach the highest round possible only using any pistol on the map. Hitting the box is ALLOWED. Picking up weapons other than Pistols is NOT ALLOWED. Glitches or Exploits are NOT ALLOWED. Multi-pov is required for co-op.',
  NO_POWER: 'Reach the highest round you can without turning the power on. Every round must be played in full. Glitches or Exploits are NOT ALLOWED. Full gameplay is required. Multi-pov is required for co-op.',
  NO_JUG: 'Reach the highest round you can without purchasing Juggernog. Every round must be played in full. See map-specific rules. Multi-pov is required for co-op.',
  ROUND_30_SPEEDRUN: 'Reach round 30 as fast as possible. Timed from match start.',
  ROUND_50_SPEEDRUN: 'Reach round 50 as fast as possible. Timed from match start.',
  ROUND_70_SPEEDRUN: 'Reach round 70 as fast as possible. Timed from match start.',
  ROUND_100_SPEEDRUN: 'Reach round 100 as fast as possible. Timed from match start.',
  ROUND_200_SPEEDRUN: 'Reach round 200 as fast as possible. Timed from match start.',
  ROUND_999_SPEEDRUN: 'Reach round 999 as fast as possible. Timed from match start.',
  EXFIL_SPEEDRUN: 'Complete the exfil objective on round 11 as fast as possible.',
  EXFIL_R21_SPEEDRUN: 'Complete the exfil objective on round 21 as fast as possible.',
  BUILD_EE_SPEEDRUN: 'Complete the wonder weapon / key buildable Easter egg as fast as possible. Build% EE runs may submit to either Build% EE or normal EE, but not both.',
  EASTER_EGG_SPEEDRUN: 'Complete the main Easter egg as fast as possible. Full run from match start.',
};

/** Get BO6/BO7 official rules for a map. Used by edit page. */
export function getBo6OfficialRulesForMap(mapSlug: string): {
  generalRules: RulesSection[];
  challengeRulesByType: Record<string, string>;
} {
  const specifics = MAP_SPECIFICS[mapSlug as Bo6MapSlug] ?? LIBERTY_FALLS_AND_OTHERS_SPECIFICS;
  return {
    generalRules: [
      ...BO6_BO7_SHARED_GENERAL,
      {
        title: 'Challenge Specifics (this map)',
        items: specifics,
      },
    ],
    challengeRulesByType: BO6_CHALLENGE_RULES_BY_TYPE,
  };
}
