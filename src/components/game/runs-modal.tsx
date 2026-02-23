'use client';

import { useState, useEffect, useCallback } from 'react';
import { Modal, Button } from '@/components/ui';
import Link from 'next/link';
import { Loader2, ShieldCheck, ExternalLink } from 'lucide-react';

type RunItem = {
  id: string;
  type: 'challenge' | 'easter-egg';
  completedAt: string;
  roundReached?: number;
  roundCompleted?: number | null;
  challenge?: { id: string; name: string; type: string };
  easterEgg?: { id: string; name: string; type: string };
  map: { id: string; name: string; slug: string; game: { shortName: string } | null };
  isVerified: boolean;
};

const PAGE_SIZE = 25;

export function RunsModal({
  isOpen,
  onClose,
  username,
  title,
  verifiedOnly,
}: {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  title: string;
  verifiedOnly?: boolean;
}) {
  const [runs, setRuns] = useState<RunItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchRuns = useCallback(
    async (nextOffset: number) => {
      const isLoadMore = nextOffset > 0;
      if (isLoadMore) setLoadingMore(true);
      else {
        setLoading(true);
        setRuns([]);
      }
      try {
        const params = new URLSearchParams();
        params.set('limit', String(PAGE_SIZE));
        params.set('offset', String(nextOffset));
        if (verifiedOnly) params.set('verified', 'true');
        const res = await fetch(`/api/users/${username}/runs?${params}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        const newRuns = data.runs ?? [];
        if (isLoadMore) setRuns((prev) => [...prev, ...newRuns]);
        else setRuns(newRuns);
        setTotal(data.total ?? 0);
      } catch {
        if (!isLoadMore) setRuns([]);
        setTotal((t) => (isLoadMore ? t : 0));
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [username, verifiedOnly]
  );

  useEffect(() => {
    if (isOpen && username) {
      fetchRuns(0);
    }
  }, [isOpen, username, verifiedOnly, fetchRuns]);

  const hasMore = runs.length < total;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} description={`${total} run${total !== 1 ? 's' : ''} logged`}>
      <div className="max-h-[60vh] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blood-500" />
          </div>
        ) : runs.length === 0 ? (
          <p className="text-bunker-400 text-center py-8">No runs found.</p>
        ) : (
          <ul className="space-y-2">
            {runs.map((run) => (
              <li key={`${run.type}-${run.id}`}>
                <Link
                  href={`/maps/${run.map.slug}/run/${run.type === 'challenge' ? 'challenge' : 'easter-egg'}/${run.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-bunker-700 bg-bunker-800/50 hover:border-blood-800 hover:bg-bunker-800 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-white truncate">
                        {run.type === 'challenge' ? run.challenge?.name : run.easterEgg?.name}
                      </span>
                      {run.isVerified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-element-400 shrink-0" aria-label="Verified" />
                      )}
                    </div>
                    <p className="text-xs text-bunker-400 mt-0.5">
                      {run.map.name}
                      {run.map.game?.shortName && ` · ${run.map.game.shortName}`}
                      {run.roundReached != null && ` · Round ${run.roundReached}`}
                      {run.roundCompleted != null && ` · Round ${run.roundCompleted}`}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-bunker-500 group-hover:text-blood-400 shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        )}
        {!loading && hasMore && (
          <div className="mt-4 text-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fetchRuns(runs.length)}
              disabled={loadingMore}
              leftIcon={loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
            >
              {loadingMore ? 'Loading…' : `Load more (${runs.length} of ${total})`}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
