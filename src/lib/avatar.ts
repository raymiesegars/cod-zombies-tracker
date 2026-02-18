/**
 * Avatar preset options (gobble gum themed). When user.avatarPreset is set,
 * we show the preset image instead of avatarUrl (e.g. Google photo) everywhere.
 * Assets live in public/avatars/ (SVG or image files).
 */
export const AVATAR_PRESETS = ['perkaholic', 'vacuum', 'abh', 'antithesis'] as const;
export type AvatarPreset = (typeof AVATAR_PRESETS)[number];

/** Preset id → asset path in public/avatars/ */
export const AVATAR_PRESET_PATHS: Record<AvatarPreset, string> = {
  perkaholic: '/avatars/preset-perkaholic.svg',
  vacuum: '/avatars/power-vacuum.jpeg',
  abh: '/avatars/anywhere-but-here.jpg',
  antithesis: '/avatars/alchemical.png',
};

/** Preset id → display label in Settings */
export const AVATAR_PRESET_LABELS: Record<AvatarPreset, string> = {
  perkaholic: 'Perkaholic',
  vacuum: 'Vacuum',
  abh: 'ABH',
  antithesis: 'Antithesis',
};

export function isAvatarPreset(value: unknown): value is AvatarPreset {
  return typeof value === 'string' && AVATAR_PRESETS.includes(value as AvatarPreset);
}

export type UserWithAvatar = {
  avatarUrl?: string | null;
  avatarPreset?: string | null;
};

/**
 * Returns the URL to display for a user's avatar. If avatarPreset is set, returns
 * the preset asset path; otherwise returns avatarUrl (e.g. Google profile photo).
 * Use this everywhere we render an avatar so preset choice is respected.
 */
export function getDisplayAvatarUrl(user: UserWithAvatar | null | undefined): string | null {
  if (!user) return null;
  if (user.avatarPreset && isAvatarPreset(user.avatarPreset)) {
    return AVATAR_PRESET_PATHS[user.avatarPreset];
  }
  return user.avatarUrl ?? null;
}

/** Returns the asset URL for a preset (for use in Settings picker). */
export function getPresetAvatarUrl(preset: AvatarPreset): string {
  return AVATAR_PRESET_PATHS[preset];
}
