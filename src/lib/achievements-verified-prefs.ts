/** localStorage keys for verified-only achievements toggle (shared between map achievements tab and dashboard). */
export const ACHIEVEMENTS_VERIFIED_ONLY_STORAGE_KEY = 'achievements-show-verified-only';
export const ACHIEVEMENTS_VERIFIED_WARNING_SEEN_KEY = 'achievements-verified-warning-seen';

export function getAchievementsVerifiedOnlyKey(userId: string | undefined): string {
  return userId ? `${ACHIEVEMENTS_VERIFIED_ONLY_STORAGE_KEY}-${userId}` : ACHIEVEMENTS_VERIFIED_ONLY_STORAGE_KEY;
}

export function getAchievementsWarningSeenKey(userId: string | undefined): string {
  return userId ? `${ACHIEVEMENTS_VERIFIED_WARNING_SEEN_KEY}-${userId}` : ACHIEVEMENTS_VERIFIED_WARNING_SEEN_KEY;
}

export function getStoredVerifiedOnly(userId: string | undefined): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = localStorage.getItem(getAchievementsVerifiedOnlyKey(userId));
    if (raw === 'false') return false;
    return true;
  } catch {
    return true;
  }
}

export function getStoredVerifiedWarningSeen(userId: string | undefined): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(getAchievementsWarningSeenKey(userId)) === 'true';
  } catch {
    return false;
  }
}
