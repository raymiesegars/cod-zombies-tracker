/**
 * Call of Duty: WWII Zombies.
 * Consumables = WW2's version of GobbleGums. With Consumables (default) vs No Consumables.
 */

export const GAME_SHORT_NAME_WW2 = 'WW2';

export const WW2_CONSUMABLES_MODES = ['WITH_CONSUMABLES', 'NO_CONSUMABLES'] as const;
export type Ww2ConsumablesMode = (typeof WW2_CONSUMABLES_MODES)[number];

/** Default: With Consumables */
export const WW2_CONSUMABLES_DEFAULT: Ww2ConsumablesMode = 'WITH_CONSUMABLES';

export function isWw2Game(shortName: string | null | undefined): boolean {
  return shortName === GAME_SHORT_NAME_WW2;
}

export function getWw2ConsumablesLabel(consumablesUsed: boolean | null | undefined): string {
  if (consumablesUsed === true) return 'With Consumables';
  if (consumablesUsed === false) return 'No Consumables';
  return 'Any';
}
