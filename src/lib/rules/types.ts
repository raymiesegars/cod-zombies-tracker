/**
 * Types for official rules. Items can be plain text or a link.
 */
export type RuleItem = string | { text: string; href: string };

export function isRuleLink(item: RuleItem): item is { text: string; href: string } {
  return typeof item === 'object' && item !== null && 'href' in item && typeof item.href === 'string';
}
