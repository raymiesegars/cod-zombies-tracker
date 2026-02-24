/**
 * Call of Duty: Vanguard Zombies.
 * Void filter: Der Anfang & Terra Maledicta only — With Void (default) vs Without Void.
 * Rampage Inducer: Shi No Numa Reborn & The Archon only.
 */

export const GAME_SHORT_NAME_VANGUARD = 'VANGUARD';

/** Default: With Void (for der-anfang and terra-maledicta) */
export const VANGUARD_VOID_DEFAULT = true;

/** Map slugs that use vanguardVoidUsed filter */
export const VANGUARD_VOID_MAP_SLUGS = ['der-anfang', 'terra-maledicta'] as const;

/** Map slugs that use rampageInducerUsed filter */
export const VANGUARD_RAMPAGE_MAP_SLUGS = ['shi-no-numa-reborn', 'the-archon'] as const;

export function isVanguardGame(shortName: string | null | undefined): boolean {
  return shortName === GAME_SHORT_NAME_VANGUARD;
}

export function hasVanguardVoidFilter(mapSlug: string | null | undefined): boolean {
  return mapSlug != null && (VANGUARD_VOID_MAP_SLUGS as readonly string[]).includes(mapSlug);
}

export function hasVanguardRampageFilter(mapSlug: string | null | undefined): boolean {
  return mapSlug != null && (VANGUARD_RAMPAGE_MAP_SLUGS as readonly string[]).includes(mapSlug);
}

export function getVanguardVoidLabel(voidUsed: boolean | null | undefined): string {
  if (voidUsed === true) return 'With Void';
  if (voidUsed === false) return 'Without Void';
  return 'Any';
}
