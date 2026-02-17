// Find Group platform options. Using emoji for icons for now.

export type PlatformOption = {
  value: string;
  label: string;
  icon: string;
  group: string;
};

export const FIND_GROUP_PLATFORMS: PlatformOption[] = [
  { value: 'PS3', label: 'PS3', icon: '🎮', group: 'PlayStation' },
  { value: 'PS4', label: 'PS4', icon: '🎮', group: 'PlayStation' },
  { value: 'PS5', label: 'PS5', icon: '🎮', group: 'PlayStation' },
  { value: 'Xbox 360', label: 'Xbox 360', icon: '🎮', group: 'Xbox' },
  { value: 'Xbox One', label: 'Xbox One', icon: '🎮', group: 'Xbox' },
  { value: 'Xbox Series X|S', label: 'Xbox Series X|S', icon: '🎮', group: 'Xbox' },
  { value: 'PC (Steam/Battle.net)', label: 'PC (Steam/Battle.net)', icon: '💻', group: 'PC' },
  { value: 'PC Game Pass', label: 'PC Game Pass', icon: '💻', group: 'PC' },
  { value: 'Xbox Cloud Gaming', label: 'Xbox Cloud Gaming', icon: '☁️', group: 'PC' },
];

export const PLATFORM_GROUPS = ['PlayStation', 'Xbox', 'PC'] as const;
