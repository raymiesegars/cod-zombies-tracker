export type PrizeRulesScope = 'current' | 'next';

export type PrizeRulesPayload = {
  title: string;
  items: string[];
  tipNote: string;
};

export const PRIZE_RULES_KEYS: Record<PrizeRulesScope, string> = {
  current: 'tournament_prize_rules_current',
  next: 'tournament_prize_rules_next',
};

export const DEFAULT_PRIZE_RULES: PrizeRulesPayload = {
  title: 'Tournament Prize Pool & Tips Policy',
  items: [
    'This tournament is 100% free to enter.',
    'Tips to the prize pool are completely optional.',
    'Tipping does not increase your chances of winning.',
    'Tipping does not grant special advantages.',
    '95% of tips go to the tournament prize pool; 5% is held back for tax purposes.',
    'Of the 95% that goes to the prize pool: 1st place receives 65%, 2nd place 25%, and 3rd place 10%.',
    'All tips are posted in Discord for full transparency.',
    'This is a skill-based competition - no element of chance determines outcomes.',
    'By participating, you confirm you meet your local legal requirements for skill-based competitions.',
    'The organizers reserve the right to verify runs and disqualify submissions that do not follow official rules.',
  ],
  tipNote:
    'Please include the tournament number (e.g. "Tournament 1" or "CZT Tournament 2") and something about the tournament in your tip comment so we can track it easily and add it to the right prize pool.',
};

export function parsePrizeRulesItems(value: unknown): string[] {
  if (!Array.isArray(value)) return DEFAULT_PRIZE_RULES.items;
  const items = value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
  return items.length > 0 ? items : DEFAULT_PRIZE_RULES.items;
}

export function normalizePrizeRulesPayload(
  title: unknown,
  itemsValue: unknown
): PrizeRulesPayload {
  const normalizedTitle = typeof title === 'string' && title.trim() ? title.trim() : DEFAULT_PRIZE_RULES.title;

  if (itemsValue && typeof itemsValue === 'object' && !Array.isArray(itemsValue)) {
    const obj = itemsValue as { items?: unknown; tipNote?: unknown };
    const items = parsePrizeRulesItems(obj.items);
    const tipNote =
      typeof obj.tipNote === 'string' && obj.tipNote.trim()
        ? obj.tipNote.trim()
        : DEFAULT_PRIZE_RULES.tipNote;
    return { title: normalizedTitle, items, tipNote };
  }

  const legacyItems = parsePrizeRulesItems(itemsValue);
  return {
    title: normalizedTitle,
    items: legacyItems,
    tipNote: DEFAULT_PRIZE_RULES.tipNote,
  };
}

export function resolvePrizeRulesScope(raw: string | null | undefined): PrizeRulesScope {
  return raw === 'next' ? 'next' : 'current';
}

