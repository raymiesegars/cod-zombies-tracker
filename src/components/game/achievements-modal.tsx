'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui';
import Link from 'next/link';
import { Award, ExternalLink, Loader2, ListChecks } from 'lucide-react';

type MapSummary = {
  mapId: string;
  mapName: string;
  mapSlug: string;
  gameShortName: string | null;
  total: number;
  unlocked: number;
};

type AchievementsOverviewData = {
  summaryByMap?: MapSummary[];
  completionByGame?: { gameId: string; gameName: string; shortName: string; total: number; unlocked: number; percentage: number }[];
};

export function AchievementsModal({
  isOpen,
  onClose,
  username,
  isOwnProfile = true,
}: {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  isOwnProfile?: boolean;
}) {
  const [data, setData] = useState<AchievementsOverviewData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && username) {
      setLoading(true);
      fetch(`/api/users/${username}/achievements-overview`, { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((d: AchievementsOverviewData | null) => setData(d ?? {}))
        .catch(() => setData({}))
        .finally(() => setLoading(false));
    }
  }, [isOpen, username]);

  const summaryByMap = data?.summaryByMap ?? [];
  const completionByGame = data?.completionByGame ?? [];
  const totalUnlocked = summaryByMap.reduce((s, m) => s + m.unlocked, 0);
  const totalAchievements = summaryByMap.reduce((s, m) => s + m.total, 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Achievements"
      description={`${totalUnlocked}/${totalAchievements} achievements unlocked by map`}
      size="lg"
    >
      <div className="max-h-[60vh] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blood-500" />
          </div>
        ) : (
          <>
            {!isOwnProfile && completionByGame.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-bunker-400 uppercase tracking-wider mb-2">View runs by game</p>
                <ul className="space-y-1.5">
                  {completionByGame.map((g) => (
                    <li key={g.gameId}>
                      <Link
                        href={`/users/${username}/logs?game=${encodeURIComponent(g.gameId)}`}
                        onClick={onClose}
                        className="flex items-center gap-3 p-2.5 rounded-lg border border-bunker-700 bg-bunker-800/50 hover:border-blood-800 hover:bg-bunker-800 transition-colors group"
                      >
                        <ListChecks className="w-4 h-4 text-element-400 shrink-0" />
                        <span className="font-medium text-white truncate flex-1">{g.shortName}</span>
                        <span className="text-sm text-bunker-400">{g.unlocked}/{g.total} achievements</span>
                        <ExternalLink className="w-4 h-4 text-bunker-500 group-hover:text-blood-400 shrink-0" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {summaryByMap.length === 0 ? (
              <p className="text-sm text-bunker-500 py-8 text-center">No achievement data.</p>
            ) : (
              <ul className="space-y-1.5">
                {summaryByMap.map((m) => (
                  <li key={m.mapId}>
                    <Link
                      href={isOwnProfile ? `/maps/${m.mapSlug}` : `/users/${username}/maps/${m.mapSlug}/runs`}
                      className="flex items-center gap-3 p-2.5 rounded-lg border border-bunker-700 bg-bunker-800/50 hover:border-blood-800 hover:bg-bunker-800 transition-colors group"
                    >
                      <Award className="w-4 h-4 text-yellow-400 shrink-0" />
                      <span className="font-medium text-white truncate flex-1">{m.mapName}</span>
                      {m.gameShortName && (
                        <span className="text-xs text-bunker-400">{m.gameShortName}</span>
                      )}
                      <span className="text-sm font-zombies text-blood-400 tabular-nums">
                        {m.unlocked}/{m.total}
                      </span>
                      <ExternalLink className="w-4 h-4 text-bunker-500 group-hover:text-blood-400 shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
