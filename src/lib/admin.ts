/**
 * Admin and super-admin checks. Super admin IDs are set via env SUPER_ADMIN_USER_IDS (comma-separated).
 * Only super admins can demote other admins; any admin can promote.
 */

const SUPER_ADMIN_IDS = new Set(
  (process.env.SUPER_ADMIN_USER_IDS ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
);

export function isSuperAdmin(userId: string): boolean {
  return SUPER_ADMIN_IDS.has(userId);
}

export function getSuperAdminUserIds(): string[] {
  return Array.from(SUPER_ADMIN_IDS);
}
