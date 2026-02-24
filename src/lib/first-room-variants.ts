/**
 * Maps that have a required first-room variant when logging STARTING_ROOM challenge.
 * Used in logging form, leaderboard filters, and API validation.
 */

export const FIRST_ROOM_VARIANT_MAP_SLUGS = [
  'verruckt',
  'bo1-verruckt',
  'bo3-verruckt',
  'buried',
  'aw-carrier',
] as const;

export type FirstRoomVariantMapSlug = (typeof FIRST_ROOM_VARIANT_MAP_SLUGS)[number];

/** Variant value stored in DB; label for UI */
export type FirstRoomVariantOption = { value: string; label: string };

/** Map slug -> variant options. Value is stored in firstRoomVariant column. */
export const FIRST_ROOM_VARIANTS_BY_MAP: Record<FirstRoomVariantMapSlug, FirstRoomVariantOption[]> = {
  verruckt: [
    { value: 'JUG_SIDE', label: 'Jug Side' },
    { value: 'QUICK_SIDE', label: 'Quick Side' },
  ],
  'bo1-verruckt': [
    { value: 'JUG_SIDE', label: 'Jug Side' },
    { value: 'QUICK_SIDE', label: 'Quick Side' },
  ],
  'bo3-verruckt': [
    { value: 'JUG_SIDE', label: 'Jug Side' },
    { value: 'QUICK_SIDE', label: 'Quick Side' },
  ],
  buried: [
    { value: 'PROCESSING', label: 'Processing' },
    { value: 'QUICK_SIDE', label: 'Quick Side' },
    { value: 'PROCESSING_WITH_RAYGUN', label: 'Processing (with Raygun)' },
  ],
  'aw-carrier': [
    { value: 'MK14_SIDE', label: 'MK14 Side' },
    { value: 'BULLDOG_SIDE', label: 'Bulldog Side' },
    { value: 'MIXED', label: 'Mixed' },
  ],
};

export function getFirstRoomVariantsForMap(mapSlug: string): FirstRoomVariantOption[] | null {
  return (FIRST_ROOM_VARIANTS_BY_MAP as Record<string, FirstRoomVariantOption[]>)[mapSlug] ?? null;
}

export function hasFirstRoomVariantFilter(mapSlug: string): boolean {
  return FIRST_ROOM_VARIANT_MAP_SLUGS.includes(mapSlug as FirstRoomVariantMapSlug);
}

export function getFirstRoomVariantLabel(mapSlug: string, value: string): string {
  const options = getFirstRoomVariantsForMap(mapSlug);
  return options?.find((o) => o.value === value)?.label ?? value;
}
