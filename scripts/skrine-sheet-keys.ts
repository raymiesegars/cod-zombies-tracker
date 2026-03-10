/**
 * Column keys for Skrine Zombies Info sheets.
 * Used to ensure chunk titles and descriptions match what the tables actually represent.
 *
 * Format: sheet number (1–11) -> array of { label, range } where range is Excel-style (e.g. "A-W").
 */

export interface SheetColumnKey {
  label: string;
  range: string;
}

export const SKRINE_SHEET_KEYS: Record<number, SheetColumnKey[]> = {
  1: [{ label: 'Map Reset Times', range: 'A–Z' }],
  2: [
    { label: 'Round Times', range: 'A–W' },
    { label: 'Instakill Rounds', range: 'Y–AT' },
    { label: 'Reset and Entities', range: 'AW–BH' },
    { label: 'Nacht Barrel Lineups', range: 'BJ–BO' },
  ],
  3: [
    { label: 'Wonder weapons needed per round (1p)', range: 'B–U' },
    { label: 'Wonder weapons needed per round (2p)', range: 'W–AR' },
    { label: 'Wonder weapons needed per round (3p)', range: 'AT–BK' },
    { label: 'Wonder weapons needed per round (4p)', range: 'BM–CD' },
    { label: 'Astro Health', range: 'CF–CS' },
    { label: '600 kills/Wave', range: 'CU–DC' },
    { label: 'Waffe shots per horde', range: 'DE–DH' },
    { label: 'Point Drops', range: 'DJ–DN' },
    { label: 'Drop Chances', range: 'DP–DW' },
    { label: 'Round Times', range: 'DY–EI' },
  ],
  4: [{ label: 'Round Times', range: 'A–K' }],
  5: [
    { label: 'Perfect round times', range: 'A–Y' },
    { label: 'Expected round times', range: 'F–J' },
    { label: 'Best possible times', range: 'L–P' },
    { label: 'Grenade throw times', range: 'Q–U' },
    { label: 'Moon round times', range: 'W–AH' },
    { label: 'SoE Symbol Guide', range: 'AI–AN' },
    { label: 'AAT info', range: 'AO–AR' },
  ],
  6: [
    { label: 'Round Times', range: 'A–K' },
    { label: 'HC Instakill rounds', range: 'M–W' },
    { label: 'EE Cheat Sheet', range: 'Y–AH' },
    { label: 'Weapon Rarities', range: 'AK–AS' },
  ],
  7: [
    { label: 'General Info', range: 'A–H' },
    { label: 'Easter Egg Sheets', range: 'K–P' },
    { label: 'Round Times', range: 'S–W' },
  ],
  8: [
    { label: 'Skullhop Calculator', range: 'A–Y' },
    { label: 'Round Times', range: 'AA–AJ' },
    { label: 'Seticom sheet', range: 'AL–AT' },
    { label: 'Shaolin Morse', range: 'AU–AW' },
  ],
  9: [
    { label: 'Rampage Rounds', range: 'A' },
    { label: 'FBZ Time Saves', range: 'C–I' },
    { label: 'Outbreak Maps', range: 'K–O' },
  ],
  10: [
    { label: 'Round Times', range: 'A–E' },
    { label: 'Optimal Upgrades', range: 'F–G' },
    { label: 'Bomb Timers', range: 'H–K' },
    { label: 'Solo Round Stats', range: 'L–O' },
    { label: 'Miscellaneous', range: 'P' },
  ],
  11: [
    { label: 'Rampage Rounds', range: 'A–B' },
    { label: 'Objective Facts', range: 'C–G' },
  ],
};
