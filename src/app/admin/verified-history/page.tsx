'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui';
import { History, Loader2, ExternalLink, Trophy } from 'lucide-react';

type VerifiedEntry = {
  logType: 'challenge' | 'easter_egg';
  logId: string;
  mapSlug: string;
  mapName: string;
  runLabel: string;
  verifiedAt: string;
  verifiedBy: { id: string; username: string; displayName: string | null };
  isTournamentRun?: boolean;
};

export default function AdminVerifiedHistoryPage() {
  const [entries, setEntries] = useState<VerifiedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  const fetchHistory = useCallback(() => {
    fetch('/api/admin/verification-history', { credentials: 'same-origin', cache: 'no-store' })
      .then((res) => {
        if (res.status === 403) {
          setForbidden(true);
          return { entries: [] };
        }
        return res.ok ? res.json() : { entries: [] };
      })
      .then((data) => setEntries(data.entries ?? []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    const t = setInterval(fetchHistory, 12000);
    return () => clearInterval(t);
  }, [fetchHistory]);

  useEffect(() => {
    fetch('/api/admin/dashboard-seen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ tab: 'verifiedHistory' }),
    }).catch(() => {});
  }, []);

  if (forbidden) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-bunker-400">You don&apos;t have access to this page.</p>
        <Link href="/" className="text-blood-400 hover:underline mt-2 inline-block">Back to home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-zombies text-white tracking-wide flex items-center gap-2">
          <History className="w-6 h-6 text-blood-500" />
          Admin — Verified history
        </h1>
        <p className="text-sm text-bunker-400 mt-1">
          Chronological list of all verified runs. Click a row to open the run.
        </p>
      </div>

      {loading ? (
        <Card variant="bordered" className="border-bunker-700">
          <CardContent className="py-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blood-500 animate-spin" />
          </CardContent>
        </Card>
      ) : entries.length === 0 ? (
        <Card variant="bordered" className="border-bunker-700">
          <CardContent className="py-12 text-center text-bunker-400 text-sm">
            No verified runs yet.
          </CardContent>
        </Card>
      ) : (
        <Card variant="bordered" className="border-bunker-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bunker-700 bg-bunker-900/80">
                  <th className="text-left py-3 px-4 text-bunker-400 font-medium">Time</th>
                  <th className="text-left py-3 px-4 text-bunker-400 font-medium">Run</th>
                  <th className="text-left py-3 px-4 text-bunker-400 font-medium">Map</th>
                  <th className="text-left py-3 px-4 text-bunker-400 font-medium">Verified by</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => {
                  const runHref = `/maps/${e.mapSlug}/run/${e.logType === 'challenge' ? 'challenge' : 'easter-egg'}/${e.logId}`;
                  return (
                    <tr
                      key={`${e.logType}-${e.logId}`}
                      className="border-b border-bunker-800/80 hover:bg-bunker-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 text-bunker-300 whitespace-nowrap">
                        {new Date(e.verifiedAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 text-white">
                        <span className="flex items-center gap-2 flex-wrap">
                          {e.runLabel}
                          {e.isTournamentRun && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full border border-amber-600/60 bg-amber-950/95 text-amber-300" title="Tournament submission">
                              <Trophy className="w-3 h-3" />
                              Tourney
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-bunker-300">{e.mapName}</td>
                      <td className="py-3 px-4 text-bunker-300">
                        {e.verifiedBy.displayName || e.verifiedBy.username}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={runHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blood-400 hover:text-blood-300"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Open
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
