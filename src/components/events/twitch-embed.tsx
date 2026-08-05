'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';

const CHANNEL = 'xdflamer99';

function twitchParents(): string[] {
  if (typeof window === 'undefined') return ['localhost'];
  const host = window.location.hostname;
  const parents = new Set<string>([host, 'localhost', 'codzombiestracker.com', 'www.codzombiestracker.com']);
  return Array.from(parents);
}

type TwitchEmbedProps = {
  className?: string;
  /** Show chat beside player on large screens. Default true. */
  showChat?: boolean;
};

export function TwitchEmbed({ className = '', showChat = true }: TwitchEmbedProps) {
  const [parents, setParents] = useState<string[]>(['localhost']);
  const [mounted, setMounted] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const [chatHeight, setChatHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    setParents(twitchParents());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !showChat || !playerRef.current) return;
    const el = playerRef.current;
    const sync = () => setChatHeight(el.offsetHeight);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [mounted, showChat]);

  const parentQuery = useMemo(
    () => parents.map((p) => `parent=${encodeURIComponent(p)}`).join('&'),
    [parents]
  );

  const playerSrc = `https://player.twitch.tv/?channel=${CHANNEL}&${parentQuery}&muted=false`;
  const chatSrc = `https://www.twitch.tv/embed/${CHANNEL}/chat?${parentQuery}&darkpopout`;
  const channelUrl = `https://www.twitch.tv/${CHANNEL}`;

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-3 mb-3 px-0.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
          </span>
          <p className="text-xs sm:text-sm font-medium text-bunker-200 truncate">
            Official cast · <span className="text-sky-400">twitch.tv/{CHANNEL}</span>
          </p>
        </div>
        <a
          href={channelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-bunker-400 hover:text-sky-300 transition-colors shrink-0"
        >
          Open Twitch
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div
        className="relative rounded-xl overflow-hidden border border-orange-500/30 shadow-[0_0_40px_rgba(249,115,22,0.12),0_0_60px_rgba(56,189,248,0.08)]"
        style={{
          background:
            'linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(15,15,15,0.9) 40%, rgba(56,189,248,0.1) 100%)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 30% 40%, rgba(249,115,22,0.15), transparent 55%), radial-gradient(ellipse 70% 50% at 80% 60%, rgba(56,189,248,0.12), transparent 50%)',
          }}
          aria-hidden
        />

        {!mounted ? (
          <div className="aspect-video w-full bg-bunker-950/80 flex items-center justify-center text-bunker-500 text-sm">
            Loading stream…
          </div>
        ) : (
          <div className={`relative flex flex-col ${showChat ? 'lg:flex-row' : ''}`}>
            <div ref={playerRef} className="aspect-video w-full flex-1 bg-black min-w-0">
              <iframe
                src={playerSrc}
                title={`Twitch stream — ${CHANNEL}`}
                allowFullScreen
                scrolling="no"
                frameBorder={0}
                allow="autoplay; fullscreen"
                className="w-full h-full"
              />
            </div>
            {showChat && (
              <div
                className="hidden lg:block relative w-[min(100%,340px)] shrink-0 border-l border-sky-500/20 bg-bunker-950/90"
                style={chatHeight ? { height: chatHeight } : undefined}
              >
                <iframe
                  src={chatSrc}
                  title={`Twitch chat — ${CHANNEL}`}
                  frameBorder={0}
                  scrolling="yes"
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {showChat && (
        <p className="mt-2 text-center text-[11px] text-bunker-500 lg:hidden">
          Chat is available on larger screens, or{' '}
          <a href={channelUrl} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">
            open Twitch
          </a>
          .
        </p>
      )}
    </div>
  );
}
