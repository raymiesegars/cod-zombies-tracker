'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Modal } from '@/components/ui';
import Link from 'next/link';
import { Crown, ShieldCheck, ExternalLink, Loader2 } from 'lucide-react';

type WorldRecordDetail = {
  mapSlug: string;
  mapName: string;
  challengeLabel: string;
  playerCount: string;
  filters: string[];
  isVerified: boolean;
};

type WorldRecordsData = {
  worldRecords: number;
  verifiedWorldRecords: number;
  details: WorldRecordDetail[];
};

const PLAYER_COUNT_LABEL: Record<string, string> = {
  SOLO: 'Solo',
  DUO: 'Duo',
  TRIO: 'Trio',
  SQUAD: 'Squad',
};

export function WorldRecordsModal({
  isOpen,
  onClose,
  username,
}: {
  isOpen: boolean;
  onClose: () => void;
  username: string;
}) {
  const [data, setData] = useState<WorldRecordsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterVerified, setFilterVerified] = useState<'all' | 'verified'>('all');
  const [hoverTooltip, setHoverTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  useEffect(() => {
    if (isOpen && username) {
      setLoading(true);
      fetch(`/api/users/${username}/world-records-details`, { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((d: WorldRecordsData | null) => setData(d ?? { worldRecords: 0, verifiedWorldRecords: 0, details: [] }))
        .catch(() => setData({ worldRecords: 0, verifiedWorldRecords: 0, details: [] }))
        .finally(() => setLoading(false));
    }
  }, [isOpen, username]);

  const details = data?.details ?? [];
  const filtered =
    filterVerified === 'verified' ? details.filter((d) => d.isVerified) : details;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="World Records"
      description={`${data?.worldRecords ?? 0} leaderboard combinations where you're #1 (${data?.verifiedWorldRecords ?? 0} verified)`}
      size="lg"
    >
      <div className="space-y-4">
        {data && data.details.length > 0 && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFilterVerified('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterVerified === 'all'
                  ? 'bg-bunker-600 text-white'
                  : 'bg-bunker-800 text-bunker-400 hover:text-bunker-300'
              }`}
            >
              All ({data.details.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterVerified('verified')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                filterVerified === 'verified'
                  ? 'bg-element-600/30 text-element-400 border border-element-500/50'
                  : 'bg-bunker-800 text-bunker-400 hover:text-bunker-300 border border-bunker-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Verified ({data.verifiedWorldRecords})
            </button>
          </div>
        )}

        <div className="max-h-[50vh] overflow-y-auto space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blood-500" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-bunker-500 py-8 text-center">
              {filterVerified === 'verified'
                ? 'No verified world records.'
                : 'No world records yet.'}
            </p>
          ) : (
            <ul className="space-y-1.5">
              {filtered.map((item, idx) => {
                const fullTitle = `${item.mapName} · ${item.challengeLabel}`;
                const metaParts = [
                  PLAYER_COUNT_LABEL[item.playerCount] ?? item.playerCount,
                  ...(item.filters.length > 0 ? [item.filters.join(' · ')] : []),
                  ...(item.isVerified ? ['Verified'] : []),
                ];
                const fullTooltip = metaParts.length > 0
                  ? `${fullTitle} — ${metaParts.join(' · ')}`
                  : fullTitle;
                return (
                <li key={`${item.mapSlug}-${item.challengeLabel}-${item.playerCount}-${item.filters.join('-')}-${idx}`}>
                  <Link
                    href={`/maps/${item.mapSlug}`}
                    className="flex items-center gap-3 p-2.5 rounded-lg border border-bunker-700 bg-bunker-800/50 hover:border-bunker-600 hover:bg-bunker-800 transition-colors group"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoverTooltip({ text: fullTooltip, x: rect.left + rect.width / 2, y: rect.top });
                    }}
                    onMouseLeave={() => setHoverTooltip(null)}
                  >
                    <Crown className="w-4 h-4 text-yellow-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-white truncate block">
                        {item.mapName} · {item.challengeLabel}
                      </span>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                        <span className="text-xs text-bunker-400">
                          {PLAYER_COUNT_LABEL[item.playerCount] ?? item.playerCount}
                        </span>
                        {item.filters.length > 0 && (
                          <span className="text-xs text-bunker-500">
                            {item.filters.join(' · ')}
                          </span>
                        )}
                        {item.isVerified && (
                          <span className="inline-flex items-center gap-0.5 text-xs text-element-400">
                            <ShieldCheck className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-bunker-500 group-hover:text-element-400 shrink-0" />
                  </Link>
                </li>
              );
              })}
            </ul>
          )}
        </div>
      </div>

      {typeof document !== 'undefined' &&
        hoverTooltip &&
        createPortal(
          <div
            className="fixed z-[10001] w-64 -translate-x-1/2 -translate-y-full -mt-2 px-3 py-2 bg-bunker-800 rounded-lg shadow-xl border border-bunker-700 text-center pointer-events-none"
            style={{ left: hoverTooltip.x, top: hoverTooltip.y }}
          >
            <p className="text-sm text-bunker-200 whitespace-normal break-words">{hoverTooltip.text}</p>
          </div>,
          document.body
        )}
    </Modal>
  );
}
