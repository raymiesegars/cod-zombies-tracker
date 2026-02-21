/**
 * Black Ops III Zombies: GobbleGum mode.
 * All BO3 logs require bo3GobbleGumMode (Classic Only is the default).
 */

export const GAME_SHORT_NAME_BO3 = 'BO3';

export const BO3_GOBBLEGUM_MODES = ['CLASSIC_ONLY', 'MEGA', 'NONE'] as const;
export type Bo3GobbleGumMode = (typeof BO3_GOBBLEGUM_MODES)[number];

export const BO3_GOBBLEGUM_DEFAULT: Bo3GobbleGumMode = 'CLASSIC_ONLY';

export function isBo3Game(shortName: string | null | undefined): boolean {
  return shortName === GAME_SHORT_NAME_BO3;
}

export function getBo3GobbleGumLabel(mode: string): string {
  switch (mode) {
    case 'CLASSIC_ONLY': return 'Classic GobbleGums Only';
    case 'MEGA': return 'Mega GobbleGums';
    case 'NONE': return 'No GobbleGums';
    default: return mode;
  }
}
