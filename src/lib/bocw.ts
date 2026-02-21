/**
 * Black Ops Cold War Zombies: Support mode.
 * All BOCW logs require bocwSupportMode.
 */

export const GAME_SHORT_NAME_BOCW = 'BOCW';

export const BOCW_SUPPORT_MODES = ['WITH_SUPPORT', 'WITHOUT_SUPPORT'] as const;
export type BocwSupportMode = (typeof BOCW_SUPPORT_MODES)[number];

export const BOCW_SUPPORT_DEFAULT: BocwSupportMode = 'WITH_SUPPORT';

export function isBocwGame(shortName: string | null | undefined): boolean {
  return shortName === GAME_SHORT_NAME_BOCW;
}

export function getBocwSupportLabel(mode: string): string {
  switch (mode) {
    case 'WITH_SUPPORT': return 'With Support';
    case 'WITHOUT_SUPPORT': return 'Without Support';
    default: return mode;
  }
}
