'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Modal } from '@/components/ui';
import { Vote } from 'lucide-react';

const STORAGE_PREFIX = 'czt_poll_dismissed_';

type Poll = { id: string; title: string; endsAt: string };

export function PollVoteReminderModal() {
  const [open, setOpen] = useState<boolean | null>(null);
  const [poll, setPoll] = useState<Poll | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const t = setTimeout(() => {
      fetch('/api/tournaments/polls/active-for-reminder', { credentials: 'same-origin', cache: 'no-store' })
      .then((res) => {
        if (res.status === 401) {
          setOpen(false);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data || data.hasVoted || !data.poll) {
          setOpen(false);
          return;
        }
        const dismissed = window.localStorage.getItem(STORAGE_PREFIX + data.poll.id);
        if (dismissed === '1') {
          setOpen(false);
          return;
        }
        setPoll(data.poll);
        setOpen(true);
      })
      .catch(() => setOpen(false));
    }, 30000);
    return () => clearTimeout(t);
  }, []);

  const handleOkay = () => {
    setOpen(false);
  };

  const handleDontShowAgain = () => {
    if (typeof window !== 'undefined' && poll) {
      window.localStorage.setItem(STORAGE_PREFIX + poll.id, '1');
    }
    setOpen(false);
  };

  if (open === null || !open || !poll) return null;

  return (
    <Modal
      isOpen={true}
      onClose={handleOkay}
      title="Vote in the current poll"
      description="Your voice helps shape the next tournament."
      size="md"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 p-3 rounded-xl border border-amber-600/40 bg-amber-950/30">
          <Vote className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-100 font-medium">{poll.title}</p>
            <p className="text-amber-200/80 text-sm mt-1">
              There is an active poll for the next event. Cast your vote so it counts.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-2 border-t border-bunker-700">
          <Link
            href="/tournaments"
            onClick={handleOkay}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-bunker-950 font-semibold text-sm transition-colors border border-amber-500/60 touch-manipulation inline-flex items-center justify-center"
          >
            Go vote
          </Link>
          <button
            type="button"
            onClick={handleOkay}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-bunker-600 hover:bg-bunker-500 text-white font-medium text-sm transition-colors border border-bunker-500 touch-manipulation"
          >
            Okay
          </button>
          <button
            type="button"
            onClick={handleDontShowAgain}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-bunker-700 hover:bg-bunker-600 text-bunker-300 font-medium text-sm transition-colors border border-bunker-600 touch-manipulation"
          >
            Don&apos;t show again for this poll
          </button>
        </div>
      </div>
    </Modal>
  );
}
