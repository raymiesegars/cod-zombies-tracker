'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui';
import { Trophy, ChevronRight } from 'lucide-react';
import { TournamentRulesContent } from '@/components/tournament-rules-content';

const STORAGE_PREFIX = 'czt_tournament_announcement_dismissed_';

type Tournament = { id: string; title: string };

export function TournamentAnnouncementModal() {
  const router = useRouter();
  const [open, setOpen] = useState<boolean | null>(null);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);

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
          setAcknowledged(false);
          setOpen(true);
        })
        .catch(() => setOpen(false));
    }, 500);
    return () => clearTimeout(t);
  }, []);

  const handleContinue = () => {
    if (!acknowledged || !tournament) return;
    window.localStorage.setItem(STORAGE_PREFIX + tournament.id, '1');
    setOpen(false);
    router.push('/tournaments');
  };

  if (open === null || !open || !tournament) return null;

  return (
    <Modal
      isOpen={true}
      onClose={() => {}}
      title="Tournament rules"
      description={`${tournament.title} is open — read and accept the rules below.`}
      size="xl"
      className="max-w-2xl"
      closeOnBackdrop={false}
      closeOnEscape={false}
      showCloseButton={false}
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-600/40 bg-bunker-800/80">
          <Trophy className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-white font-semibold text-base">{tournament.title}</p>
            <p className="text-bunker-300 text-sm mt-1">Review every rule before you compete or submit.</p>
          </div>
        </div>

        <TournamentRulesContent variant="prominent" />

        <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-bunker-600 bg-bunker-800/60 p-4 hover:border-amber-600/50 hover:bg-bunker-800/90 transition-colors">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="mt-1 h-5 w-5 shrink-0 rounded border-2 border-bunker-500 bg-bunker-900 text-amber-500 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-bunker-900 cursor-pointer"
          />
          <span className="text-sm sm:text-base text-bunker-100 leading-snug">
            <span className="font-semibold text-white">I acknowledge the tournament rules</span>
            <span className="text-bunker-400"> — </span>
            including the 12-day deadline, ZWR requirements, speedrun reset proof where applicable, and the required Discord clan tag or emblem (or alternate validation if posted).
          </span>
        </label>

        <button
          type="button"
          onClick={handleContinue}
          disabled={!acknowledged}
          className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed text-bunker-950 font-bold text-base transition-colors border-2 border-amber-400/70 shadow-lg shadow-amber-950/30 touch-manipulation"
        >
          Continue to tournaments
          <ChevronRight className="w-5 h-5 shrink-0" />
        </button>
      </div>
    </Modal>
  );
}
