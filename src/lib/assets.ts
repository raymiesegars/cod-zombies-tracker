// Turns relative paths into full URLs when we're using Supabase (or similar). Leaves http(s) URLs alone; with no base set, returns path as-is for local public/.
export function getAssetUrl(path: string | null | undefined): string {
  if (path == null || path === '') return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_ASSETS_BASE_URL : '';
  if (base) {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${base.replace(/\/$/, '')}${normalized}`;
  }
  return path;
}
