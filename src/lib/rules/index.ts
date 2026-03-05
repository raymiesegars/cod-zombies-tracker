import type { RuleItem } from '@/lib/rules/types';
import { WAW_OFFICIAL_RULES } from '@/lib/waw/waw-official-rules';
import { BO1_OFFICIAL_RULES } from '@/lib/bo1/bo1-official-rules';
import { BO2_OFFICIAL_RULES } from '@/lib/bo2/bo2-official-rules';
import { BO3_OFFICIAL_RULES } from '@/lib/bo3/bo3-official-rules';
import { BO4_OFFICIAL_RULES } from '@/lib/bo4/bo4-official-rules';
import { BOCW_OFFICIAL_RULES } from '@/lib/bocw/bocw-official-rules';
import { getBo6OfficialRulesForMap } from '@/lib/bo6/bo6-official-rules';
import { getBo7OfficialRulesForMap } from '@/lib/bo7/bo7-official-rules';
import { WW2_OFFICIAL_RULES } from '@/lib/ww2/ww2-official-rules';
import { VANGUARD_OFFICIAL_RULES } from '@/lib/vanguard/vanguard-official-rules';

export type RulesSection = { title: string; items: RuleItem[] };

const BO3_CHALLENGE_SECTION_TITLES = new Set([
  'No Downs', 'No Perks', 'No Pack-a-Punch', 'One Box Challenge', 'Pistol Only', 'No Power',
  'First Room - General', 'First Room - Shadows of Evil', 'First Room - Der Eisendrache',
  'First Room - Zetsubou No Shima', 'First Room - Gorod Krovi', 'First Room - Origins',
]);

function isBo2ChallengeSection(title: string): boolean {
  return title.startsWith('First Room') || title.startsWith('No Power -');
}

export const RULES_GAMES: { shortName: string; name: string }[] = [
  { shortName: 'WAW', name: 'World at War' },
  { shortName: 'BO1', name: 'Black Ops 1' },
  { shortName: 'BO2', name: 'Black Ops 2' },
  { shortName: 'BO3', name: 'Black Ops 3' },
  { shortName: 'BO4', name: 'Black Ops 4' },
  { shortName: 'BOCW', name: 'Black Ops Cold War' },
  { shortName: 'BO6', name: 'Black Ops 6' },
  { shortName: 'BO7', name: 'Black Ops 7' },
  { shortName: 'WW2', name: 'WWII Zombies' },
  { shortName: 'VANGUARD', name: 'Vanguard Zombies' },
];

export type UnifiedRules = {
  generalSections: RulesSection[];
  challengeSections: RulesSection[];
  challengeRulesByType: Record<string, string>;
  gameName: string;
};

function getRulesByShortName(shortName: string): { generalRules: RulesSection[]; challengeRulesByType: Record<string, string> } | null {
  switch (shortName) {
    case 'WAW':
      return WAW_OFFICIAL_RULES;
    case 'BO1':
      return BO1_OFFICIAL_RULES;
    case 'BO2':
      return BO2_OFFICIAL_RULES;
    case 'BO3':
      return BO3_OFFICIAL_RULES;
    case 'BO4':
      return BO4_OFFICIAL_RULES;
    case 'BOCW':
      return BOCW_OFFICIAL_RULES;
    case 'BO6':
      return getBo6OfficialRulesForMap('liberty-falls'); // default map for unified page
    case 'BO7':
      return getBo7OfficialRulesForMap('liberty-falls');
    case 'WW2':
      return WW2_OFFICIAL_RULES;
    case 'VANGUARD':
      return VANGUARD_OFFICIAL_RULES;
    default:
      return null;
  }
}

const CATEGORY_ORDER = [
  'EASTER_EGG', 'BASE_ROUNDS', 'HIGHEST_ROUND', 'NO_DOWNS', 'NO_PERKS', 'NO_PACK', 'STARTING_ROOM',
  'STARTING_ROOM_JUG_SIDE', 'STARTING_ROOM_QUICK_SIDE', 'ONE_BOX', 'PISTOL_ONLY', 'NO_POWER', 'NO_MAGIC',
  'NO_JUG', 'NO_ARMOR', 'NO_ATS', 'NO_MANS_LAND', 'ROUND_10_SPEEDRUN', 'ROUND_20_SPEEDRUN',
  'ROUND_30_SPEEDRUN', 'ROUND_50_SPEEDRUN', 'ROUND_70_SPEEDRUN', 'ROUND_100_SPEEDRUN', 'ROUND_200_SPEEDRUN',
  'ROUND_255_SPEEDRUN', 'ROUND_935_SPEEDRUN', 'ROUND_999_SPEEDRUN', 'EXFIL_SPEEDRUN', 'EXFIL_R21_SPEEDRUN', 'BUILD_EE_SPEEDRUN', 'INSTAKILL_ROUND_SPEEDRUN',
  'EASTER_EGG_SPEEDRUN', 'RUSH', 'PURIST', 'GHOST_AND_SKULLS', 'ALIENS_BOSS_FIGHT', 'CRYPTID_FIGHT', 'MEPHISTOPHELES', 'OTHER',
];

export function splitGeneralRules(
  shortName: string,
  generalRules: RulesSection[]
): { generalSections: RulesSection[]; challengeSections: RulesSection[] } {
  const isChallengeSection = (title: string): boolean => {
    if (shortName === 'BO3') return BO3_CHALLENGE_SECTION_TITLES.has(title);
    if (shortName === 'BO2') return isBo2ChallengeSection(title);
    return false;
  };
  const generalSections = generalRules.filter((s) => !isChallengeSection(s.title));
  const challengeSections = generalRules.filter((s) => isChallengeSection(s.title));
  return { generalSections, challengeSections };
}

export function getUnifiedRulesForGame(shortName: string): UnifiedRules | null {
  const rules = getRulesByShortName(shortName);
  if (!rules) return null;

  const gameName = RULES_GAMES.find((g) => g.shortName === shortName)?.name ?? shortName;
  const { generalRules, challengeRulesByType } = rules;
  const { generalSections, challengeSections } = splitGeneralRules(shortName, generalRules);

  const sortedChallengeByType = Object.keys(challengeRulesByType).sort((a, b) => {
    const ia = CATEGORY_ORDER.indexOf(a);
    const ib = CATEGORY_ORDER.indexOf(b);
    if (ia >= 0 && ib >= 0) return ia - ib;
    if (ia >= 0) return -1;
    if (ib >= 0) return 1;
    return a.localeCompare(b);
  });

  const orderedChallengeRulesByType: Record<string, string> = {};
  for (const k of sortedChallengeByType) {
    orderedChallengeRulesByType[k] = challengeRulesByType[k];
  }

  return {
    generalSections,
    challengeSections,
    challengeRulesByType: orderedChallengeRulesByType,
    gameName,
  };
}
