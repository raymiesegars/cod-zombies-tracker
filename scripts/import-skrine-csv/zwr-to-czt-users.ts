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
