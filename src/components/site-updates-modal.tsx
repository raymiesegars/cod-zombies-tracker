'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Modal } from '@/components/ui';
import { Medal, Package, Users, CheckCircle2, MessageCircle, User, Sparkles, ChevronRight } from 'lucide-react';

const STORAGE_KEY = 'czt_site_updates_seen_v1';

export function SiteUpdatesModal() {
  const [open, setOpen] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const seen = window.localStorage.getItem(STORAGE_KEY);
    setOpen(seen !== STORAGE_KEY); // show modal only when key is not set
  }, []);

  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, STORAGE_KEY);
    }
    setOpen(false);
  };

  if (open === null || !open) return null;

  return (
    <Modal
      isOpen={true}
      onClose={handleDismiss}
      title="What's new on CZT"
      description="A quick overview of the latest features — you'll only see this once."
      size="xl"
      contentScroll={true}
      className="max-h-[90vh]"
    >
      <div className="flex flex-col gap-6 pb-2">
        {/* #1 Tournaments */}
        <section className="rounded-xl border border-amber-600/40 bg-amber-950/30 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Medal className="w-5 h-5 text-amber-400 shrink-0" />
            <h3 className="text-base sm:text-lg font-semibold text-amber-100">Tournaments</h3>
          </div>
          <p className="text-sm text-bunker-300 mb-4">
            Vote in polls for the next event, submit runs to the tournament leaderboard, and compete for gold, silver, and bronze — trophies award bonus XP. Optional prize pool for winners.
          </p>
          <Link
            href="/tournaments"
            onClick={handleDismiss}
            className="flex items-center justify-center gap-2 w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-bunker-950 font-bold text-base shadow-lg hover:shadow-amber-900/30 transition-all border-2 border-amber-500/60 hover:scale-[1.02] active:scale-[0.98]"
          >
            Go to Tournaments
            <ChevronRight className="w-5 h-5 shrink-0" />
          </Link>
        </section>

        {/* #2 Mystery Box */}
        <section className="rounded-xl border border-element-600/40 bg-element-950/20 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-5 h-5 text-element-400 shrink-0" />
            <h3 className="text-base sm:text-lg font-semibold text-element-100">Mystery Box</h3>
          </div>
          <p className="text-sm text-bunker-300 mb-4">
            Track which box hits you've logged and view your progress across maps. Log weapons and see how your collection grows.
          </p>
          <Link
            href="/mystery-box"
            onClick={handleDismiss}
            className="flex items-center justify-center gap-2 w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-element-600 hover:bg-element-500 text-white font-bold text-base shadow-lg hover:shadow-element-900/30 transition-all border-2 border-element-500/60 hover:scale-[1.02] active:scale-[0.98]"
          >
            Open Mystery Box
            <ChevronRight className="w-5 h-5 shrink-0" />
          </Link>
        </section>

        {/* Quick bullets */}
        <div className="grid gap-3 sm:grid-cols-1">
          <div className="flex gap-3 rounded-lg bg-bunker-800/50 p-3 border border-bunker-700/50">
            <Users className="w-5 h-5 text-blood-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-white">Co-op runs</h4>
              <p className="text-xs text-bunker-400">Log runs with your squad; teammates get a pending run to confirm. One run counts for everyone.</p>
            </div>
          </div>
          <div className="flex gap-3 rounded-lg bg-bunker-800/50 p-3 border border-bunker-700/50">
            <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-white">Run verification & Verified XP</h4>
              <p className="text-xs text-bunker-400">Request verification on runs (proof required). Verified runs show a blue check and count toward your Verified XP and rank.</p>
            </div>
          </div>
          <div className="flex gap-3 rounded-lg bg-bunker-800/50 p-3 border border-bunker-700/50">
            <MessageCircle className="w-5 h-5 text-military-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-white">Friends & messaging</h4>
              <p className="text-xs text-bunker-400">Add friends, see who's online, and DM anyone from the Chat & Friends hub (bottom-left).</p>
            </div>
          </div>
          <div className="flex gap-3 rounded-lg bg-bunker-800/50 p-3 border border-bunker-700/50">
            <User className="w-5 h-5 text-bunker-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-white">Profile & settings</h4>
              <p className="text-xs text-bunker-400">Customize which 4 stat blocks show on your profile. Avatar presets, reorder and hide maps on the Maps page.</p>
            </div>
          </div>
          <div className="flex gap-3 rounded-lg bg-bunker-800/50 p-3 border border-bunker-700/50">
            <Sparkles className="w-5 h-5 text-amber-400/80 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-white">More</h4>
              <p className="text-xs text-bunker-400">Multiple proof links per run · Ranks 1–100 · Leaderboard search & verified toggle · Round milestones from any challenge.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-bunker-700">
          <button
            type="button"
            onClick={handleDismiss}
            className="min-h-[44px] px-6 py-2.5 rounded-xl bg-blood-600 hover:bg-blood-500 text-white font-semibold text-sm transition-colors border border-blood-500/50 touch-manipulation"
          >
            Got it
          </button>
        </div>
      </div>
    </Modal>
  );
}
