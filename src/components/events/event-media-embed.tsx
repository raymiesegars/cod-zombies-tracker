'use client';

import { ExternalLink } from 'lucide-react';
import { TwitchEmbed } from '@/components/events/twitch-embed';
import {
  ZCS3_ANNOUNCEMENT_YOUTUBE_ID,
  ZCS3_ANNOUNCEMENT_YOUTUBE_URL,
  ZCS3_MEDIA_MODE,
  ZCS3_TWITCH_URL,
  type Zcs3MediaMode,
} from '@/lib/events/zcs3';

type EventMediaEmbedProps = {
  className?: string;
  /** Override constant; useful for testing. Default = ZCS3_MEDIA_MODE. */
  mode?: Zcs3MediaMode;
};

export function EventMediaEmbed({ className = '', mode = ZCS3_MEDIA_MODE }: EventMediaEmbedProps) {
  if (mode === 'stream') {
    return <TwitchEmbed className={className} />;
  }

  const embedSrc = `https://www.youtube.com/embed/${ZCS3_ANNOUNCEMENT_YOUTUBE_ID}?rel=0`;

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-3 mb-3 px-0.5">
        <p className="text-xs sm:text-sm font-medium text-bunker-200 truncate">
          Format reveal · announcement video
        </p>
        <a
          href={ZCS3_ANNOUNCEMENT_YOUTUBE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-bunker-400 hover:text-sky-300 transition-colors shrink-0"
        >
          Open on YouTube
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div
        className="relative rounded-xl overflow-hidden border border-orange-500/30 shadow-[0_0_40px_rgba(249,115,22,0.12),0_0_60px_rgba(56,189,248,0.08)] bg-black"
      >
        <div className="aspect-video w-full">
          <iframe
            src={embedSrc}
            title="ZCS-3 Shattered Universe announcement"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </div>

      <p className="mt-2 text-center text-[11px] text-bunker-500">
        Live cast returns closer to the event on{' '}
        <a href={ZCS3_TWITCH_URL} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">
          twitch.tv/xdflamer99
        </a>
        .
      </p>
    </div>
  );
}
