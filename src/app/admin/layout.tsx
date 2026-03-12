'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Bot, ShieldCheck, MessageSquare, History, Trophy, Egg, Award, BookOpen, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/admin/verification', label: 'Verification', icon: ShieldCheck, badgeKey: 'pending' as const },
  { href: '/admin/map-submissions', label: 'Map submissions', icon: MapPin, badgeKey: 'mapSubmissionsPending' as const },
  { href: '/admin/feedback', label: 'Feedback', icon: MessageSquare, badgeKey: 'feedbackUnread' as const },
  { href: '/admin/verified-history', label: 'Verified history', icon: History, badgeKey: 'verifiedHistoryUnread' as const },
  { href: '/admin/leaderboard', label: 'Leaderboard', icon: Trophy, badgeKey: null },
  { href: '/admin/easter-eggs', label: 'Easter Eggs', icon: Egg, badgeKey: null, easterEggAdminOrSuper: true },
  { href: '/admin/achievements', label: 'Achievements', icon: Award, badgeKey: null },
  { href: '/admin/chatbot', label: 'LeKronorium', icon: Bot, badgeKey: null },
  { href: '/rules', label: 'Rules', icon: BookOpen, badgeKey: null, superAdminOnly: true },
];

type Badges = { pending: number; feedbackUnread: number; verifiedHistoryUnread: number; mapSubmissionsPending: number };
type AdminMe = {
  isAdmin: boolean;
  isEasterEggAdmin?: boolean;
  adminXp: number;
  level: number;
  levelIconPath: string;
  currentLevelXp: number;
  nextLevelXp: number;
  progress: number;
  totalVerified: number;
  isSuperAdmin?: boolean;
};

const POLL_MS = 12000;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [badges, setBadges] = useState<Badges>({ pending: 0, feedbackUnread: 0, verifiedHistoryUnread: 0, mapSubmissionsPending: 0 });
  const [adminMe, setAdminMe] = useState<AdminMe | null>(null);

  const fetchBadges = useCallback(() => {
    fetch('/api/admin/dashboard-badges', { credentials: 'same-origin', cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.resolve({} as Partial<Badges>)))
      .then((d) => setBadges({ pending: d.pending ?? 0, feedbackUnread: d.feedbackUnread ?? 0, verifiedHistoryUnread: d.verifiedHistoryUnread ?? 0, mapSubmissionsPending: d.mapSubmissionsPending ?? 0 }))
      .catch(() => {});
  }, []);

  const fetchAdminMe = useCallback(() => {
    fetch('/api/admin/me', { credentials: 'same-origin', cache: 'no-store' })
      .then((r) => (r.ok ? r.json() as Promise<{ admin: AdminMe | null }> : Promise.resolve({ admin: null })))
      .then((d) => {
        if (d.admin) setAdminMe(d.admin);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchBadges();
    fetchAdminMe();
    const t = setInterval(() => {
      fetchBadges();
      fetchAdminMe();
    }, POLL_MS);
    return () => clearInterval(t);
  }, [fetchBadges, fetchAdminMe]);

  useEffect(() => {
    if (pathname === '/admin/feedback') {
      fetch('/api/admin/dashboard-seen', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ tab: 'feedback' }) }).catch(() => {});
      fetchBadges();
    }
  }, [pathname, fetchBadges]);

  return (
    <div className="min-h-screen bg-bunker-950">
      {adminMe?.isAdmin && (
        <div className="border-b border-amber-900/50 bg-bunker-900/90 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 shrink-0">
                <Image
                  src={adminMe.levelIconPath}
                  alt={`Admin rank ${adminMe.level}`}
                  width={28}
                  height={28}
                  className="object-contain sm:w-8 sm:h-8"
                  unoptimized
                />
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs font-semibold text-amber-400/90 uppercase tracking-wider truncate">Admin Rank</p>
                  <p className="text-xs sm:text-sm font-bold text-white">Level {adminMe.level}</p>
                </div>
              </div>
              <div className="flex-1 min-w-0 w-full sm:w-auto sm:min-w-[12rem]">
                <p className="text-[10px] sm:text-xs font-semibold text-amber-400/90 uppercase tracking-wider mb-0.5 sm:mb-1">Admin XP</p>
                <div className="h-2 sm:h-2.5 bg-bunker-800 rounded-full overflow-hidden border border-amber-800/50 shadow-[inset_0_0_10px_rgba(251,191,36,0.15)]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-500 shadow-[0_0_12px_rgba(251,191,36,0.5)]"
                    style={{ width: `${Math.min(100, adminMe.progress)}%` }}
                  />
                </div>
                <p className="text-[10px] sm:text-[11px] text-bunker-500 mt-0.5 truncate">
                  {adminMe.adminXp.toLocaleString()} / {(adminMe.nextLevelXp ?? adminMe.adminXp).toLocaleString()} XP
                  {adminMe.totalVerified > 0 && ` · ${adminMe.totalVerified} verified`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="border-b border-bunker-800 bg-bunker-900/80 sticky top-0 z-10" aria-label="Admin sections">
        <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">
          <div
            className="relative flex gap-0 overflow-x-auto overflow-y-hidden overscroll-x-contain px-2 sm:px-0 sm:gap-1 min-[1160px]:overflow-visible min-[1160px]:flex-wrap"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div
              className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 min-[1160px]:hidden bg-gradient-to-l from-bunker-900 to-transparent"
              aria-hidden
            />
            {tabs.filter((t) => {
              if ((adminMe?.isEasterEggAdmin && !adminMe?.isAdmin && !adminMe?.isSuperAdmin)) {
                return t.href === '/admin/easter-eggs';
              }
              if ((t as { superAdminOnly?: boolean }).superAdminOnly && !adminMe?.isSuperAdmin) return false;
              if ((t as { easterEggAdminOrSuper?: boolean }).easterEggAdminOrSuper && !adminMe?.isSuperAdmin && !adminMe?.isEasterEggAdmin) return false;
              return true;
            }).map(({ href, label, icon: Icon, badgeKey }) => {
              const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));
              const count = badgeKey != null ? badges[badgeKey] : 0;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 min-h-[44px] touch-manipulation',
                    isActive
                      ? 'border-blood-500 text-blood-400'
                      : 'border-transparent text-bunker-400 hover:text-bunker-200 hover:border-bunker-600 active:bg-bunker-800/50'
                  )}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  {label}
                  {badgeKey != null && count > 0 && (
                    <span className="flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-blood-600 text-white text-[10px] sm:text-xs font-bold">
                      {count > 99 ? '99+' : count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
