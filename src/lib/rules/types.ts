/**
 * Types for official rules. Items can be:
 * - Plain string
 * - Full-item link (legacy: whole text is clickable)
 * - Inline links: only specific words (e.g. "here") are clickable within the sentence
 */
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
