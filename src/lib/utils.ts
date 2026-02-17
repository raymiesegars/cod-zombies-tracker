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

export function formatRound(round: number): string {
  return round.toString().padStart(2, '0');
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
