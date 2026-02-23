'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui';
import Link from 'next/link';
import { CheckCircle2, Circle, ExternalLink, Loader2 } from 'lucide-react';

type MapItem = {
  mapId: string;
  mapName: string;
  mapSlug: string;
  gameShortName: string | null;
};

type MapsData = {
  played: MapItem[];
  notPlayed: MapItem[];
  total: number;
};

export function MapsModal({
  isOpen,
  onClose,
  username,
  isOwnProfile,
}: {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  isOwnProfile: boolean;
}) {
  const [data, setData] = useState<MapsData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && username) {
      setLoading(true);
      fetch(`/api/users/${username}/maps-overview`, { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((d: MapsData | null) => setData(d ?? { played: [], notPlayed: [], total: 0 }))
        .catch(() => setData({ played: [], notPlayed: [], total: 0 }))
        .finally(() => setLoading(false));
    }
  }, [isOpen, username]);

  const played = data?.played ?? [];
  const notPlayed = data?.notPlayed ?? [];
  const total = data?.total ?? 0;

  const mapHref = (slug: string) =>
    isOwnProfile ? `/maps/${slug}` : `/users/${username}/maps/${slug}/runs`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Maps Played"
      description={`${played.length}/${total} maps played`}
      size="lg"
    >
      <div className="max-h-[60vh] overflow-y-auto space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blood-500" />
          </div>
        ) : (
          <>
            <section>
              <h3 className="text-sm font-medium text-bunker-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-element-400" />
                Played ({played.length})
              </h3>
              {played.length === 0 ? (
                <p className="text-sm text-bunker-500 py-2">None yet.</p>
              ) : (
                <ul className="space-y-1.5">
                  {played.map((item) => (
                    <li key={item.mapId}>
                      <Link
                        href={mapHref(item.mapSlug)}
                        className="flex items-center gap-3 p-2.5 rounded-lg border border-bunker-700 bg-bunker-800/50 hover:border-element-700 hover:bg-bunker-800 transition-colors group"
                      >
                        <CheckCircle2 className="w-4 h-4 text-element-400 shrink-0" />
                        <span className="font-medium text-white truncate">{item.mapName}</span>
                        {item.gameShortName && (
                          <span className="text-xs text-bunker-400">{item.gameShortName}</span>
                        )}
                        <ExternalLink className="w-4 h-4 text-bunker-500 group-hover:text-element-400 shrink-0 ml-auto" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h3 className="text-sm font-medium text-bunker-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Circle className="w-4 h-4 text-bunker-500" />
                Not yet played ({notPlayed.length})
              </h3>
              {notPlayed.length === 0 ? (
                <p className="text-sm text-bunker-500 py-2">All maps played!</p>
              ) : (
                <ul className="space-y-1.5">
                  {notPlayed.map((item) => (
                    <li key={item.mapId}>
                      <Link
                        href={`/maps/${item.mapSlug}`}
                        className="flex items-center gap-3 p-2.5 rounded-lg border border-bunker-700 bg-bunker-800/30 hover:border-bunker-600 hover:bg-bunker-800/50 transition-colors group"
                      >
                        <Circle className="w-4 h-4 text-bunker-500 shrink-0" />
                        <span className="font-medium text-bunker-300 truncate">{item.mapName}</span>
                        {item.gameShortName && (
                          <span className="text-xs text-bunker-500">{item.gameShortName}</span>
                        )}
                        <ExternalLink className="w-4 h-4 text-bunker-600 group-hover:text-bunker-400 shrink-0 ml-auto" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </Modal>
  );
}
