/**
 * Black Ops 7 Zombies: Support mode + optional Cursed Run with relics.
 * All BO7 logs require bo7SupportMode.
 * bo7IsCursedRun is optional; when true, bo7RelicsUsed holds the selected relic names.
 */

export const GAME_SHORT_NAME_BO7 = 'BO7';

export const BO7_SUPPORT_MODES = ['WITH_SUPPORT', 'NO_SUPPORT'] as const;
export type Bo7SupportMode = (typeof BO7_SUPPORT_MODES)[number];

export const BO7_SUPPORT_DEFAULT: Bo7SupportMode = 'WITH_SUPPORT';

export function isBo7Game(shortName: string | null | undefined): boolean {
  return shortName === GAME_SHORT_NAME_BO7;
}

export function getBo7SupportLabel(mode: string): string {
  switch (mode) {
    case 'WITH_SUPPORT': return 'With Support';
    case 'NO_SUPPORT': return 'No Support';
    default: return mode;
  }
}

/** All BO7 relics, alphabetical. Shared across every BO7 map. */
export const BO7_RELICS = [
  'Blood Vials',
  'Bus',
  'Civil Protector',
  'Dragon (Zombies)',
  'Dragon Wings',
  'Focusing Stone',
  'Golden Spork',
  'Gong',
  "Lawyer's Pen",
  'Matryoshka Doll',
  'Relic',
  "Samantha's Drawing",
  'Seed',
  'Spider Fang',
  'Teddy Bear',
  'Vril Sphere',
] as const;

export type Bo7Relic = (typeof BO7_RELICS)[number];
