import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/** Compact XP for small screens: 140840 → "140.8k", max ~3 digits before suffix */
export function formatXpCompact(num: number): string {
  if (num >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(num);
}

export function formatRound(round: number): string {
  return round.toString().padStart(2, '0');
}

/** Format RUSH score for display (e.g. 1782651900 -> "1.78B"). */
export function formatRushScore(score: number): string {
  if (score >= 1e9) return (score / 1e9).toFixed(2).replace(/\.?0+$/, '') + 'B';
  if (score >= 1e6) return (score / 1e6).toFixed(2).replace(/\.?0+$/, '') + 'M';
  if (score >= 1e3) return (score / 1e3).toFixed(2).replace(/\.?0+$/, '') + 'K';
  return String(score);
}

export function getPlayerCountLabel(count: string): string {
  const labels: Record<string, string> = {
    SOLO: 'Solo',
    DUO: 'Duo',
    TRIO: 'Trio',
    SQUAD: 'Squad',
  };
  return labels[count] || count;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function getProofEmbedUrl(url: string): { type: 'youtube' | 'twitch' | 'image' | 'unknown'; embedUrl: string | null } {
  // YouTube
  const youtubeMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (youtubeMatch) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
    };
  }

  // Twitch VOD
  const twitchVodMatch = url.match(/twitch\.tv\/videos\/(\d+)/);
  if (twitchVodMatch) {
    return {
      type: 'twitch',
      embedUrl: `https://player.twitch.tv/?video=${twitchVodMatch[1]}&parent=${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}`,
    };
  }

  // Twitch Clip
  const twitchClipMatch = url.match(/twitch\.tv\/\w+\/clip\/([a-zA-Z0-9_-]+)/);
  if (twitchClipMatch) {
    return {
      type: 'twitch',
      embedUrl: `https://clips.twitch.tv/embed?clip=${twitchClipMatch[1]}&parent=${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}`,
    };
  }

  // Image URLs
  if (/\.(jpg|jpeg|png|gif|webp)$/i.test(url)) {
    return {
      type: 'image',
      embedUrl: url,
    };
  }

  return {
    type: 'unknown',
    embedUrl: null,
  };
}

/** Max number of proof URLs per run */
export const PROOF_URLS_MAX = 20;

/**
 * Allowed hostname suffixes for proof URLs (domain or subdomain match).
 * Only links from these trusted sites are accepted to reduce malicious links.
 */
const ALLOWED_PROOF_HOST_SUFFIXES = [
  'youtube.com',
  'youtu.be',
  'twitch.tv',
  'clips.twitch.tv',
  'imgur.com',
  'streamable.com',
  'gyazo.com',
  'imgbb.com',
  'twitter.com',
  'x.com',
  'flic.kr',
  'flickr.com',
  'cdn.discordapp.com',
  'media.discordapp.net',
  'zwr.gg',
] as const;

function isAllowedProofHost(hostname: string): boolean {
  const lower = hostname.toLowerCase().replace(/^\.+|\.+$/g, '');
  if (!lower) return false;
  return ALLOWED_PROOF_HOST_SUFFIXES.some(
    (suffix) => lower === suffix || lower.endsWith('.' + suffix)
  );
}

/** Validate a single proof URL. Returns error message or null if valid. */
export function validateProofUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null; // empty is allowed (will be filtered out)
  try {
    const u = new URL(trimmed);
    if (u.protocol !== 'https:') {
      return 'Proof links must use https:// for security.';
    }
    if (trimmed.length > 2048) return 'URL is too long.';
    if (!isAllowedProofHost(u.hostname)) {
      return `Proof links must be from a trusted site (e.g. YouTube, Twitch, Imgur, Streamable, zwr.gg). This domain is not allowed.`;
    }
    return null;
  } catch {
    return 'Enter a valid URL (e.g. YouTube, Twitch, or image link).';
  }
}

/** Normalize and filter proof URLs for storage. */
export function normalizeProofUrls(urls: string[]): string[] {
  const seen = new Set<string>();
  return urls
    .map((u) => u.trim())
    .filter((u) => u.length > 0)
    .filter((u) => {
      if (seen.has(u)) return false;
      seen.add(u);
      return true;
    })
    .slice(0, PROOF_URLS_MAX);
}

export const PROOF_URL_FORMAT_HELP =
  'Add one URL per line. Only links from trusted sites are allowed (YouTube, Twitch, Imgur, Streamable, zwr.gg). Use https://.';
