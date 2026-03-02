/**
 * ZWR (source site) player ID → CZT (this project) user ID mapping.
 *
 * PURPOSE
 * - CSV data uses player IDs from the source leaderboard (e.g. ZWR/Skrine: numeric IDs in player_1..player_4).
 * - This file maps those source IDs to CZT User IDs so we can:
 *   1. Know which CZT user to use for --czt-user when importing (reference only; you still pass it on the CLI).
 *   2. In future: resolve teammates — when a teammate's ZWR ID is in this map, we can add them to
 *      teammateUserIds (site user) instead of teammateNonUserNames (placeholder). That links real
 *      CZT accounts to co-op runs.
 *
 * USAGE
 * - When you add a new ZWR user who has a CZT account: add an entry here.
 * - When running the import script, use the CZT user ID/username for --czt-user (this file is for
 *   reference and for future teammate resolution, not for selecting the primary import target).
 * - Script: run.ts can import ZWR_TO_CZT_USERS to resolve teammate ZWR IDs to CZT user IDs when
 *   building logs, so teammates show as site users instead of "Player 12345".
 *
 * SOURCE
 * - Data comes from ZWR/Skrine-style CSV exports. There will be more CSVs; each may have different
 *   source player IDs. Add every ZWR player who has a CZT account to this mapping.
 */

export type ZwrToCztEntry = {
  /** CZT User id (cuid). */
  cztUserId: string;
  /** Display name or username on CZT (for reference only). */
  displayName: string;
  /** Optional note (e.g. "First user we imported", "Skrine's account"). */
  note?: string;
};

/**
 * Map: ZWR/source player ID (as it appears in CSV player_1..player_4) → CZT user info.
 * Keys are strings so "17046" and 17046 both work when looked up.
 */
export const ZWR_TO_CZT_USERS: Record<string, ZwrToCztEntry> = {
  // Skrine — first user we imported; production CZT account
  '17046': {
    cztUserId: 'cmlvocpbj0006ar6ml9vz7hsm',
    displayName: 'Skrine',
    note: 'First ZWR→CZT import. Use this CZT user when importing CSVs where source player ID is 17046.',
  },
  // SM0k3Y — top-178 import; CSV uses display names in player_1..player_4
  'SM0k3Y': {
    cztUserId: 'cmlyp3llo000020vwc0ucyu88',
    displayName: 'SM0k3Y',
    note: 'Import from top-178-csv/SM0k3Y.csv with --source-player-id=SM0k3Y --czt-user=cmlyp3llo000020vwc0ucyu88.',
  },
  // LeBron James — top-178 import
  'LeBron James': {
    cztUserId: 'cmlvocpbj0006ar6ml9vz7hsm',
    displayName: 'LeBron James',
    note: 'Import from top-178-csv/LeBron James.csv with --source-player-id="LeBron James" --czt-user=cmlvocpbj0006ar6ml9vz7hsm.',
  },
  // Bradley0104 — top-178 import
  'Bradley0104': {
    cztUserId: 'cmlqtmbgx00059uzbkloqjiyi',
    displayName: 'Bradley0104',
    note: 'Import from top-178-csv/Bradley0104.csv with --source-player-id=Bradley0104 --czt-user=cmlqtmbgx00059uzbkloqjiyi.',
  },
  // Gardningtools — top-178 import
  'Gardningtools': {
    cztUserId: 'cmlvf1ikw000097igho2zsb3d',
    displayName: 'Gardningtools',
    note: 'Import from top-178-csv/Gardningtools.csv with --source-player-id=Gardningtools --czt-user=cmlvf1ikw000097igho2zsb3d.',
  },
  // THAT GUY — top-178 import
  'THAT GUY': {
    cztUserId: 'cmlqtjqng000cu994seq1kii3',
    displayName: 'THAT GUY',
    note: 'Import from top-178-csv/THAT GUY.csv with --source-player-id="THAT GUY" --czt-user=cmlqtjqng000cu994seq1kii3.',
  },
  // FnLizardKing — top-178 import
  'FnLizardKing': {
    cztUserId: 'cmlshnpj800009tz5vszjegw7',
    displayName: 'FnLizardKing',
    note: 'Import from top-178-csv/FnLizardKing.csv with --source-player-id=FnLizardKing --czt-user=cmlshnpj800009tz5vszjegw7.',
  },
  // drainbb — top-178 import
  'drainbb': {
    cztUserId: 'cmlr2i8cu0000kzag9nem5br8',
    displayName: 'drainbb',
    note: 'Import from top-178-csv/drainbb.csv with --source-player-id=drainbb --czt-user=cmlr2i8cu0000kzag9nem5br8.',
  },
  // grimoire — top-178 import
  'grimoire': {
    cztUserId: 'cmlqsbyyn000165x6j5zxcm0z',
    displayName: 'grimoire',
    note: 'Import from top-178-csv/grimoire.csv with --source-player-id=grimoire --czt-user=cmlqsbyyn000165x6j5zxcm0z.',
  },
  // LostFeeling — top-178 import
  'LostFeeling': {
    cztUserId: 'cmm2bpdwj0003ca7mqne4vmqf',
    displayName: 'LostFeeling',
    note: 'Import from top-178-csv/LostFeeling.csv with --source-player-id=LostFeeling --czt-user=cmm2bpdwj0003ca7mqne4vmqf.',
  },
  // rde — top-178 import
  'rde': {
    cztUserId: 'cmm8kxhkv0000142wfjoz8hxf',
    displayName: 'rde',
    note: 'Import from top-178-csv/rde.csv with --source-player-id=rde --czt-user=cmm8kxhkv0000142wfjoz8hxf.',
  },
};

/**
 * Get CZT user ID for a ZWR/source player ID, if we have a mapping.
 * Use when building teammateUserIds so teammates who are on CZT show as site users.
 */
export function getCztUserIdForZwrId(zwrPlayerId: string): string | null {
  const id = String(zwrPlayerId).trim();
  if (!id) return null;
  const entry = ZWR_TO_CZT_USERS[id];
  return entry?.cztUserId ?? null;
}
