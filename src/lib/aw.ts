/**
 * Call of Duty: Advanced Warfare Exo Zombies.
 * Four maps: Outbreak, Infection, Carrier, Descent.
 * Challenge types: NO_EXO_SUIT, NO_EXO_HEALTH, DOUBLE_FEATURE (Descent only).
 */

export const GAME_SHORT_NAME_AW = 'AW';

export function isAwGame(shortName: string | null | undefined): boolean {
  return shortName === GAME_SHORT_NAME_AW;
}
