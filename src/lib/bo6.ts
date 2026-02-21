/**
 * Black Ops 6 Zombies: GobbleGum mode + Support mode.
 * All BO6 logs require both bo6GobbleGumMode and bo6SupportMode.
 */

export const GAME_SHORT_NAME_BO6 = 'BO6';

export const BO6_GOBBLEGUM_MODES = ['WITH_GOBBLEGUMS', 'NO_GOBBLEGUMS'] as const;
export type Bo6GobbleGumMode = (typeof BO6_GOBBLEGUM_MODES)[number];

export const BO6_GOBBLEGUM_DEFAULT: Bo6GobbleGumMode = 'WITH_GOBBLEGUMS';

export const BO6_SUPPORT_MODES = ['WITH_SUPPORT', 'NO_SUPPORT'] as const;
export type Bo6SupportMode = (typeof BO6_SUPPORT_MODES)[number];

export const BO6_SUPPORT_DEFAULT: Bo6SupportMode = 'WITH_SUPPORT';

export function isBo6Game(shortName: string | null | undefined): boolean {
  return shortName === GAME_SHORT_NAME_BO6;
}

export function getBo6GobbleGumLabel(mode: string): string {
  switch (mode) {
    case 'WITH_GOBBLEGUMS': return 'With GobbleGums';
    case 'NO_GOBBLEGUMS': return 'No GobbleGums';
    default: return mode;
  }
}

export function getBo6SupportLabel(mode: string): string {
  switch (mode) {
    case 'WITH_SUPPORT': return 'With Support';
    case 'NO_SUPPORT': return 'No Support';
    default: return mode;
  }
}
