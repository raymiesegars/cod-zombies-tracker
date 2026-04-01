/**
 * BO4-only: difficulty and game identification.
 * Use for maps where game.shortName === GAME_SHORT_NAME_BO4.
 */

export const GAME_SHORT_NAME_BO4 = 'BO4';

export type Bo4DifficultyType = 'CASUAL' | 'NORMAL' | 'HARDCORE' | 'REALISTIC';

export const BO4_DIFFICULTIES: Bo4DifficultyType[] = ['CASUAL', 'NORMAL', 'HARDCORE', 'REALISTIC'];
export const BO4_ELIXIR_MODES = ['CLASSIC_ONLY', 'ALL_ELIXIRS_TALISMANS', 'ANY_PERCENT'] as const;
export type Bo4ElixirMode = (typeof BO4_ELIXIR_MODES)[number];

/** Order for cascade: unlocking a higher difficulty also unlocks all lower difficulties. */
export const BO4_DIFFICULTY_ORDER: Record<Bo4DifficultyType, number> = {
  CASUAL: 0,
  NORMAL: 1,
  HARDCORE: 2,
  REALISTIC: 3,
};

/** XP multiplier per difficulty (Normal = 1x). */
export const BO4_DIFFICULTY_XP_MULTIPLIER: Record<Bo4DifficultyType, number> = {
  CASUAL: 0.5,
  NORMAL: 1,
  HARDCORE: 2,
  REALISTIC: 4,
};

/** Returns difficulties strictly below the given one (e.g. REALISTIC → [CASUAL, NORMAL, HARDCORE]). Used for cascade unlock. */
export function getBo4DifficultiesBelow(difficulty: Bo4DifficultyType | string): Bo4DifficultyType[] {
  const rank = BO4_DIFFICULTY_ORDER[difficulty as Bo4DifficultyType];
  if (rank == null) return [];
  return BO4_DIFFICULTIES.filter((d) => BO4_DIFFICULTY_ORDER[d] < rank);
}

export function isBo4Game(shortName: string | null | undefined): boolean {
  return shortName === GAME_SHORT_NAME_BO4;
}

export function getBo4DifficultyLabel(difficulty: Bo4DifficultyType | string | null | undefined): string {
  if (!difficulty) return '';
  return String(difficulty).charAt(0) + String(difficulty).slice(1).toLowerCase();
}

export function getBo4ElixirModeLabel(mode: Bo4ElixirMode | string | null | undefined): string {
  if (!mode) return '';
  switch (mode) {
    case 'CLASSIC_ONLY':
      return 'Classic Elixirs Only';
    case 'ALL_ELIXIRS_TALISMANS':
      return 'All Elixirs & Talismans';
    case 'ANY_PERCENT':
      return 'Any% (All Elixirs & Talismans)';
    default:
      return String(mode);
  }
}
