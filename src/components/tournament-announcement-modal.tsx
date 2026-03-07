'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Modal } from '@/components/ui';
import { Trophy } from 'lucide-react';
import { TournamentRulesContent } from '@/components/tournament-rules-content';

const STORAGE_PREFIX = 'czt_tournament_announcement_dismissed_';

type Tournament = { id: string; title: string };

export function TournamentAnnouncementModal() {
  const [open, setOpen] = useState<boolean | null>(null);
  const [tournament, setTournament] = useState<Tournament | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const t = setTimeout(() => {
      fetch('/api/tournaments/active-open', { cache: 'no-store' })
        .then((r) => r.json())
        .then((data) => {
          if (!data?.tournament) {
            setOpen(false);
            return;
          }
          const dismissed = window.localStorage.getItem(STORAGE_PREFIX + data.tournament.id);
          if (dismissed === '1') {
            setOpen(false);
            return;
          }
          setTournament(data.tournament);
          setOpen(true);
        })
        .catch(() => setOpen(false));
    }, 500);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  const handleDontShowAgain = () => {
    if (typeof window !== 'undefined' && tournament) {
      window.localStorage.setItem(STORAGE_PREFIX + tournament.id, '1');
    }
    setOpen(false);
  };

  if (open === null || !open || !tournament) return null;

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title="Tournament started"
      description={`${tournament.title} is now open for submissions.`}
      size="md"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 p-3 rounded-xl border border-bunker-600 bg-bunker-800/80">
          <Trophy className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-white font-medium">{tournament.title} has started</p>
            <p className="text-white/90 text-sm mt-1">Click below to view the tournament and submit your run.</p>
          </div>
        </div>
        <Link
          href="/tournaments"
          onClick={handleClose}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-bunker-950 font-semibold text-sm transition-colors border border-amber-500/60 touch-manipulation"
        >
          View tournament
        </Link>

        <div className="pt-3 border-t border-bunker-700">
          <p className="font-bold text-white mb-3">Tournament rules</p>
          <TournamentRulesContent />
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-bunker-700">
          <button
            type="button"
            onClick={handleClose}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-bunker-600 hover:bg-bunker-500 text-white font-medium text-sm transition-colors border border-bunker-500 touch-manipulation"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleDontShowAgain}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-bunker-700 hover:bg-bunker-600 text-bunker-300 font-medium text-sm transition-colors border border-bunker-600 touch-manipulation"
          >
            Don&apos;t show me this again
          </button>
        </div>
      </div>
    </Modal>
  );
}
