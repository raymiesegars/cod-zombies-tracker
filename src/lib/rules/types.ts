export type RuleItem =
  | string
  | { text: string; href: string }
  | { parts: (string | { text: string; href: string })[] };

export function isRuleLink(item: RuleItem): item is { text: string; href: string } {
  return typeof item === 'object' && item !== null && 'href' in item && !('parts' in item);
}

export function isRuleInlineLinks(item: RuleItem): item is { parts: (string | { text: string; href: string })[] } {
  return typeof item === 'object' && item !== null && 'parts' in item && Array.isArray((item as any).parts);
}

export function getRuleItemText(item: RuleItem): string {
  if (typeof item === 'string') return item;
  if (isRuleLink(item)) return item.text;
  if (isRuleInlineLinks(item)) return item.parts.map((p) => (typeof p === 'string' ? p : p.text)).join('');
  return '';
}
