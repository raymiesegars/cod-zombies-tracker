'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui';
import Link from 'next/link';
import { CheckCircle2, Circle, ExternalLink, Loader2 } from 'lucide-react';

type EasterEggItem = {
  id: string;
  name: string;
  mapId: string;
  mapName: string;
  mapSlug: string;
  gameShortName: string | null;
  logId?: string;
};

type EasterEggsData = {
  done: EasterEggItem[];
  notDone: EasterEggItem[];
  total: number;
};

export function EasterEggsModal({
  isOpen,
  onClose,
  username,
}: {
  isOpen: boolean;
  onClose: () => void;
  username: string;
}) {
  const [data, setData] = useState<EasterEggsData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && username) {
      setLoading(true);
      fetch(`/api/users/${username}/easter-eggs-overview`, { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((d: EasterEggsData | null) => setData(d ?? { done: [], notDone: [], total: 0 }))
        .catch(() => setData({ done: [], notDone: [], total: 0 }))
        .finally(() => setLoading(false));
    }
  }, [isOpen, username]);

  const done = data?.done ?? [];
  const notDone = data?.notDone ?? [];
  const total = data?.total ?? 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Easter Eggs"
      description={`${done.length}/${total} main-quest Easter eggs completed`}
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
                Completed ({done.length})
              </h3>
              {done.length === 0 ? (
                <p className="text-sm text-bunker-500 py-2">None yet.</p>
              ) : (
                <ul className="space-y-1.5">
                  {done.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/maps/${item.mapSlug}/run/easter-egg/${item.logId}`}
                        className="flex items-center gap-3 p-2.5 rounded-lg border border-bunker-700 bg-bunker-800/50 hover:border-element-700 hover:bg-bunker-800 transition-colors group"
                      >
                        <CheckCircle2 className="w-4 h-4 text-element-400 shrink-0" />
                        <span className="font-medium text-white truncate">{item.name}</span>
                        <span className="text-xs text-bunker-400 truncate">
                          {item.mapName}
                          {item.gameShortName && ` · ${item.gameShortName}`}
                        </span>
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
                Not completed ({notDone.length})
              </h3>
              {notDone.length === 0 ? (
                <p className="text-sm text-bunker-500 py-2">All done!</p>
              ) : (
                <ul className="space-y-1.5">
                  {notDone.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/maps/${item.mapSlug}`}
                        className="flex items-center gap-3 p-2.5 rounded-lg border border-bunker-700 bg-bunker-800/30 hover:border-bunker-600 hover:bg-bunker-800/50 transition-colors group"
                      >
                        <Circle className="w-4 h-4 text-bunker-500 shrink-0" />
                        <span className="font-medium text-bunker-300 truncate">{item.name}</span>
                        <span className="text-xs text-bunker-500 truncate">
                          {item.mapName}
                          {item.gameShortName && ` · ${item.gameShortName}`}
                        </span>
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
