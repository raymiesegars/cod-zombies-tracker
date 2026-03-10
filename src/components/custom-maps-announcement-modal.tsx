'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Modal } from '@/components/ui';
import { useAuth } from '@/context/auth-context';
import {
  MapPin,
  Link2,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const STORAGE_KEY = 'czt_custom_maps_announcement_seen_v1';

export function CustomMapsAnnouncementModal() {
  const { profile } = useAuth();
  const [open, setOpen] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !profile) return;
    const seen = window.localStorage.getItem(STORAGE_KEY);
    setOpen(seen !== STORAGE_KEY);
  }, [profile]);

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
      title="Introducing: Custom Maps on CZT"
      description="Add your Black Ops 3 Custom Zombies map — one-time announcement."
      size="xl"
      contentScroll={true}
      className="max-h-[90vh]"
    >
      <div className="flex flex-col gap-6 pb-2">
        <section className="rounded-xl border-2 border-teal-500/50 bg-teal-950/30 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-6 h-6 text-teal-400 shrink-0" />
            <h3 className="text-lg font-semibold text-teal-100">
              Share your map with the community
            </h3>
          </div>
          <p className="text-sm text-bunker-300 mb-4">
            Submit your Steam Workshop map for review. Once approved, it gets its own page with
            leaderboards, challenges, Easter egg guides, and XP — just like official maps.
          </p>
          <Link
            href="/maps?submitMap=1"
            onClick={handleDismiss}
            className="flex items-center justify-center gap-2 w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-base shadow-lg hover:shadow-teal-900/30 transition-all border-2 border-teal-500/60 hover:scale-[1.02] active:scale-[0.98]"
          >
            Go to Maps & Submit Custom Map
            <ChevronRight className="w-5 h-5 shrink-0" />
          </Link>
        </section>

        <h4 className="text-sm font-semibold text-bunker-200 uppercase tracking-wider">
          How to submit
        </h4>

        <ol className="space-y-3">
          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blood-600 text-xs font-bold text-white">
              1
            </span>
            <div>
              <span className="font-medium text-bunker-200">Go to Maps</span>
              <p className="text-sm text-bunker-400 mt-0.5">
                Scroll to the <strong className="text-teal-400">BO3 Custom Zombies</strong> section
                and click <strong className="text-teal-400">Submit Custom Map</strong>.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blood-600 text-xs font-bold text-white">
              2
            </span>
            <div>
              <span className="font-medium text-bunker-200">Fill in the basics</span>
              <p className="text-sm text-bunker-400 mt-0.5">
                Map name and Steam Workshop URL. Your map must be published on Steam Workshop first.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blood-600 text-xs font-bold text-white">
              3
            </span>
            <div>
              <span className="font-medium text-bunker-200">Add images</span>
              <p className="text-sm text-bunker-400 mt-0.5">
                Upload a thumbnail (required). A banner for the map page is optional.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blood-600 text-xs font-bold text-white">
              4
            </span>
            <div>
              <span className="font-medium text-bunker-200">Optional: suggested rounds & Easter Egg</span>
              <p className="text-sm text-bunker-400 mt-0.5">
                Help admins by suggesting achievement rounds or EE steps. We use The Giant as a baseline.
              </p>
            </div>
          </li>
        </ol>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border-2 border-amber-600/40 bg-amber-950/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Link2 className="w-5 h-5 text-amber-400 shrink-0" />
              <h4 className="text-sm font-semibold text-amber-100">Required</h4>
            </div>
            <ul className="text-xs text-bunker-300 space-y-1">
              <li>• Steam Workshop URL</li>
              <li>• At least one image (thumbnail)</li>
              <li>• Map must be public on Steam</li>
            </ul>
          </div>
          <div className="rounded-xl border-2 border-element-600/40 bg-element-950/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-element-400 shrink-0" />
              <h4 className="text-sm font-semibold text-element-100">After approval</h4>
            </div>
            <ul className="text-xs text-bunker-300 space-y-1">
              <li>• Full leaderboards & challenges</li>
              <li>• Easter egg guides & XP</li>
              <li>• Custom Zombies rank & level</li>
            </ul>
          </div>
        </div>

        <div className="rounded-lg border border-bunker-700 bg-bunker-800/50 p-4 flex gap-3">
          <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-white">Admin review</h4>
            <p className="text-xs text-bunker-400">
              Submissions are reviewed by admins. Once approved, your map appears on the Maps page
              and users can log runs, earn XP, and climb the Custom Zombies leaderboard.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-bunker-700">
          <Link
            href="/maps?submitMap=1"
            onClick={handleDismiss}
            className="min-h-[44px] px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm transition-colors border border-teal-500/50 touch-manipulation flex items-center gap-2"
          >
            Take me to Maps
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </Modal>
  );
}
