import prisma from '@/lib/prisma';
import {
  CATEGORY_ORDER,
  getUnifiedRulesForGame,
  type UnifiedRules,
  type RulesSection,
} from '@/lib/rules/index';

export type RulesPageSectionData = { key: string; title: string; items: unknown[] };

export async function getUnifiedRulesForGameFromDb(
  shortName: string
): Promise<UnifiedRules | null> {
  const dbRow = await prisma.gameRules.findUnique({
    where: { gameShortName: shortName },
  });

  const staticRules = getUnifiedRulesForGame(shortName);
  if (!staticRules) return null;

  if (!dbRow) return staticRules;

  const generalSections = (dbRow.generalSections as RulesSection[]) ?? staticRules.generalSections;
  const challengeSections = (dbRow.challengeSections as RulesSection[]) ?? staticRules.challengeSections;
  const challengeRulesByType = (dbRow.challengeRulesByType as Record<string, string>) ?? staticRules.challengeRulesByType;

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
    gameName: staticRules.gameName,
  };
}

export async function getRulesPageSections(): Promise<RulesPageSectionData[]> {
  const rows = await prisma.rulesPageSection.findMany({
    orderBy: { sortOrder: 'asc' },
  });
  return rows.map((r) => ({
    key: r.key,
    title: r.title,
    items: (r.items as unknown[]) ?? [],
  }));
}

export async function getRulesPageSection(key: string): Promise<RulesPageSectionData | null> {
  const row = await prisma.rulesPageSection.findUnique({
    where: { key },
  });
  if (!row) return null;
  return { key: row.key, title: row.title, items: (row.items as unknown[]) ?? [] };
}
