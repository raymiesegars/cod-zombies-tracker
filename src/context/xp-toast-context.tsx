'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getLevelFromXp, MAX_LEVEL } from '@/lib/ranks';
import { getAdminLevelFromXp, ADMIN_MAX_LEVEL } from '@/lib/admin-levels';
import { CheckCircle2 } from 'lucide-react';

export type XpToastOptions = {
  totalXp?: number;
  verified?: boolean;
  label?: string;
  admin?: boolean;
  adminTotalXp?: number;
  customZombiesTotalXp?: number;
  verifiedCustomZombiesTotalXp?: number;
};

type ToastState = {
  amount: number;
  totalXp: number | null;
  verified: boolean;
  label?: string;
  admin?: boolean;
  adminTotalXp?: number;
  customZombiesTotalXp?: number;
  verifiedCustomZombiesTotalXp?: number;
};

type XpToastContextValue = {
  showXpToast: (amount: number, options?: XpToastOptions) => void;
};

const XpToastContext = createContext<XpToastContextValue | null>(null);

export const XP_TOAST_VERIFIED_EVENT = 'cod-tracker-xp-toast-verified';

const TOAST_DURATION_MS = 4000;
const BAR_FILL_DURATION_S = 2.2;
const ACHIEVEMENT_SOUND_VOLUME = 0.35;
const LEVEL_UP_SOUND_VOLUME = 0.55;

function playAchievementSound() {
  if (typeof window === 'undefined') return;
  try {
    const audio = new Audio('/audio/achievment.mp3');
    audio.volume = ACHIEVEMENT_SOUND_VOLUME;
    audio.play().catch(() => {});
  } catch {
    // ignore
  }
}

function playLevelUpSound() {
  if (typeof window === 'undefined') return;
  try {
    const audio = new Audio('/audio/level-up-sound.mp3');
    audio.volume = LEVEL_UP_SOUND_VOLUME;
    audio.play().catch(() => {});
  } catch {
    // ignore
  }
}

export const XP_TOAST_EVENT = 'cod-tracker-xp-toast';

let xpToastShowRef: ((amount: number, options?: XpToastOptions) => void) | null = null;

export function dispatchXpToast(amount: number, options?: XpToastOptions) {
  if (amount <= 0) return;
  if (xpToastShowRef) {
    xpToastShowRef(amount, options);
    return;
  }
  const eventName = options?.verified ? XP_TOAST_VERIFIED_EVENT : XP_TOAST_EVENT;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(eventName, {
        detail: {
          amount,
          totalXp: options?.totalXp,
          label: options?.label,
          verifiedCustomZombiesTotalXp: options?.verifiedCustomZombiesTotalXp,
          customZombiesTotalXp: options?.customZombiesTotalXp,
        },
      })
    );
  }
}

export function XpToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const [toastId, setToastId] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const queueRef = useRef<Array<{ amount: number; options?: XpToastOptions }>>([]);
  const showNextInQueue = useCallback(() => {
    if (queueRef.current.length > 0) {
      const next = queueRef.current.shift()!;
      if (next.amount > 0) {
        playAchievementSound();
        setToastId((n) => n + 1);
        setToast({
          amount: next.amount,
          totalXp: next.options?.totalXp ?? null,
          verified: next.options?.verified ?? false,
          label: next.options?.label,
          admin: next.options?.admin ?? false,
          adminTotalXp: next.options?.adminTotalXp,
          customZombiesTotalXp: next.options?.customZombiesTotalXp,
          verifiedCustomZombiesTotalXp: next.options?.verifiedCustomZombiesTotalXp,
        });
        timeoutRef.current = setTimeout(showNextInQueue, TOAST_DURATION_MS);
      } else {
        showNextInQueue();
      }
    } else {
      setToast(null);
      timeoutRef.current = null;
    }
  }, []);

  const showXpToast = useCallback((amount: number, options?: XpToastOptions) => {
    if (amount <= 0) return;
    if (timeoutRef.current) {
      queueRef.current.push({ amount, options });
      return;
    }
    playAchievementSound();
    setToastId((n) => n + 1);
    setToast({
      amount,
      totalXp: options?.totalXp ?? null,
      verified: options?.verified ?? false,
      label: options?.label,
      admin: options?.admin ?? false,
      adminTotalXp: options?.adminTotalXp,
      customZombiesTotalXp: options?.customZombiesTotalXp,
      verifiedCustomZombiesTotalXp: options?.verifiedCustomZombiesTotalXp,
    });
    timeoutRef.current = setTimeout(showNextInQueue, TOAST_DURATION_MS);
  }, [showNextInQueue]);

  useEffect(() => {
    xpToastShowRef = showXpToast;
    return () => {
      xpToastShowRef = null;
    };
  }, [showXpToast]);

  useEffect(() => {
    const handler = (e: Event) => {
      const { amount, totalXp, label } = (e as CustomEvent<{ amount: number; totalXp?: number; label?: string }>).detail ?? {};
      if (typeof amount === 'number' && amount > 0) {
        showXpToast(amount, totalXp != null || label ? { totalXp, label } : undefined);
      }
    };
    const verifiedHandler = (e: Event) => {
      const { amount, totalXp, verifiedCustomZombiesTotalXp } = (e as CustomEvent<{ amount: number; totalXp?: number; verifiedCustomZombiesTotalXp?: number }>).detail ?? {};
      if (typeof amount === 'number' && amount > 0) {
        showXpToast(amount, {
          totalXp: totalXp ?? undefined,
          verified: true,
          verifiedCustomZombiesTotalXp: verifiedCustomZombiesTotalXp ?? undefined,
        });
      }
    };
    window.addEventListener(XP_TOAST_EVENT, handler);
    window.addEventListener(XP_TOAST_VERIFIED_EVENT, verifiedHandler);
    return () => {
      window.removeEventListener(XP_TOAST_EVENT, handler);
      window.removeEventListener(XP_TOAST_VERIFIED_EVENT, verifiedHandler);
    };
  }, [showXpToast]);

  return (
    <XpToastContext.Provider value={{ showXpToast }}>
      {children}
      <AnimatePresence>
        {toast && (
          <XpToastContent
            key={`xp-toast-${toastId}`}
            amount={toast.amount}
            totalXp={toast.totalXp}
            verified={toast.verified}
            label={toast.label}
            admin={toast.admin}
            adminTotalXp={toast.adminTotalXp}
            customZombiesTotalXp={toast.customZombiesTotalXp}
            verifiedCustomZombiesTotalXp={toast.verifiedCustomZombiesTotalXp}
          />
        )}
      </AnimatePresence>
    </XpToastContext.Provider>
  );
}

function XpToastContent({ amount, totalXp, verified, label, admin, adminTotalXp, customZombiesTotalXp, verifiedCustomZombiesTotalXp }: ToastState) {
  const isAdmin = admin === true && adminTotalXp != null && adminTotalXp >= 0;
  const isCustomZombies = verifiedCustomZombiesTotalXp != null && verifiedCustomZombiesTotalXp >= 0;
  const isCustomZombiesUnverified = !isCustomZombies && customZombiesTotalXp != null && customZombiesTotalXp >= 0;
  const effectiveTotal = isAdmin
    ? adminTotalXp
    : isCustomZombies
      ? verifiedCustomZombiesTotalXp
      : isCustomZombiesUnverified
        ? customZombiesTotalXp
        : totalXp ?? null;
  const totalXpBefore = effectiveTotal != null && effectiveTotal >= 0 ? Math.max(0, effectiveTotal - amount) : 0;
  const hasRankAndBar = !isAdmin && effectiveTotal != null && effectiveTotal >= 0;
  const after = isAdmin ? getAdminLevelFromXp(adminTotalXp!) : hasRankAndBar ? getLevelFromXp(effectiveTotal!) : null;
  const before = isAdmin ? getAdminLevelFromXp(totalXpBefore) : hasRankAndBar ? getLevelFromXp(totalXpBefore) : null;
  const leveledUp = Boolean(before && after && after.level > before.level);
  const showBar = hasRankAndBar || isAdmin;

  // Play level-up sound once on mount; component is re-keyed per toast
  useEffect(() => {
    if (leveledUp) playLevelUpSound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed bottom-6 left-0 right-0 z-[100] pointer-events-none flex justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full max-w-[300px]"
      >
        <div
          className={cn(
            'rounded-xl border shadow-xl overflow-hidden',
            isAdmin
              ? 'border-amber-500/80 bg-bunker-900 ring-2 ring-amber-400/50 shadow-[0_0_24px_rgba(251,191,36,0.4)]'
              : isCustomZombies || isCustomZombiesUnverified
                ? 'border-teal-500/70 bg-bunker-900 ring-2 ring-teal-500/40'
                : verified
                  ? 'border-blue-500/70 bg-bunker-900 ring-2 ring-blue-500/40'
                  : label === 'Mystery Box Challenge Complete'
                    ? 'border-amber-500/80 bg-bunker-900 ring-2 ring-amber-400/60 shadow-[0_0_20px_rgba(251,191,36,0.35)]'
                    : 'border-bunker-600 bg-bunker-900'
          )}
        >
          <div
            className={cn(
              'px-4 py-3',
              isAdmin
                ? 'border-b border-amber-900/50'
                : isCustomZombies || isCustomZombiesUnverified
                  ? 'border-b border-teal-900/50'
                  : verified
                    ? 'border-b border-blue-900/50'
                    : label === 'Mystery Box Challenge Complete'
                      ? 'border-b border-amber-900/40'
                      : 'border-b border-bunker-700'
            )}
          >
            {(label || isAdmin || isCustomZombies || isCustomZombiesUnverified) && (
              <p className={cn(
                'text-center text-xs font-semibold uppercase tracking-wider mb-2',
                isCustomZombies || isCustomZombiesUnverified ? 'text-teal-400' : isAdmin ? 'text-amber-400' : 'text-amber-400'
              )}>
                {isCustomZombies ? 'Custom Verified Zombies XP' : isCustomZombiesUnverified ? 'Custom Zombies XP' : isAdmin ? 'Admin XP' : label}
              </p>
            )}
            {leveledUp && (
              <p className={cn(
                'text-center text-xs font-black uppercase tracking-widest mb-2',
                isAdmin ? 'text-amber-400' : isCustomZombies ? 'text-teal-400' : isCustomZombiesUnverified ? 'text-teal-400' : verified ? 'text-blue-400' : 'text-blood-400'
              )}>
                {isAdmin ? '⬆ Admin Rank Up!' : isCustomZombies ? '⬆ Custom Verified Rank Up!' : isCustomZombiesUnverified ? '⬆ Custom Rank Up!' : verified ? '⬆ Verified Rank Up!' : '⬆ Level Up!'}
              </p>
            )}
            <p className="text-center flex items-center justify-center gap-2">
              {(verified || isCustomZombies) && !isAdmin && (
                <CheckCircle2 className={cn('w-5 h-5 shrink-0', isCustomZombies ? 'text-teal-400' : 'text-blue-400')} strokeWidth={2.5} aria-hidden />
              )}
              <span className={isAdmin ? 'text-amber-400 font-medium' : isCustomZombies || isCustomZombiesUnverified ? 'text-teal-400 font-medium' : verified ? 'text-blue-400 font-medium' : 'text-military-400 font-medium'}>+</span>
              <span className="tabular-nums text-lg font-bold text-white mx-0.5">
                {amount.toLocaleString()}
              </span>
              <span className={isAdmin ? 'text-amber-400/90 font-medium' : isCustomZombies || isCustomZombiesUnverified ? 'text-teal-400/90 font-medium' : verified ? 'text-blue-400/90 font-medium' : 'text-military-500 font-medium'}>
                {isAdmin ? ' Admin' : isCustomZombies ? ' Custom Verified' : isCustomZombiesUnverified ? ' Custom' : verified ? ' Verified' : ''} XP
              </span>
            </p>
          </div>

          {showBar && after && before && (
            <div className="px-4 py-3 space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center">
                  {(verified || isCustomZombies) && !isAdmin && (
                    <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center" aria-hidden>
                      <CheckCircle2 className={cn('w-4 h-4', isCustomZombies ? 'text-teal-500' : 'text-blue-500')} strokeWidth={2.5} />
                    </span>
                  )}
                  <Image
                    src={isAdmin ? (after as { levelIcon: string }).levelIcon : (after as { rankIcon: string }).rankIcon}
                    alt={isAdmin ? `Admin level ${after.level}` : (after as { rankName: string }).rankName}
                    width={40}
                    height={40}
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate flex items-center gap-1.5 flex-wrap">
                    Level {after.level}
                    {(verified || isCustomZombies) && !isAdmin && (
                      <span className={cn('inline-flex items-center gap-0.5 text-xs shrink-0', isCustomZombies ? 'text-teal-400' : 'text-blue-400')}>
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden />
                        {isCustomZombies ? 'Custom Verified' : 'Verified'}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-bunker-400">
                    {(isAdmin ? adminTotalXp : effectiveTotal)?.toLocaleString()} {isAdmin ? 'admin' : isCustomZombies ? 'custom verified' : isCustomZombiesUnverified ? 'custom' : verified ? 'verified' : 'total'} XP
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <div className={cn(
                  'w-full h-2 rounded-full overflow-hidden border',
                  isAdmin ? 'bg-bunker-800 border-amber-800/50' : isCustomZombies || isCustomZombiesUnverified ? 'bg-bunker-800 border-teal-800/50' : 'bg-bunker-800 border-bunker-700'
                )}>
                  <motion.div
                    className={cn(
                      'h-full rounded-full',
                      isAdmin ? 'bg-gradient-to-r from-amber-600 to-amber-500 shadow-[0_0_8px_rgba(251,191,36,0.5)]' : isCustomZombies || isCustomZombiesUnverified ? 'bg-gradient-to-r from-teal-600 to-teal-500' : verified ? 'bg-gradient-to-r from-blue-600 to-blue-500' : 'bg-gradient-to-r from-blood-600 to-blood-500'
                    )}
                    initial={{ width: `${before.progress}%` }}
                    animate={{ width: `${after.progress}%` }}
                    transition={{
                      duration: BAR_FILL_DURATION_S,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                  />
                </div>
                {after.level < (isAdmin ? ADMIN_MAX_LEVEL : MAX_LEVEL) && (
                  <p className="text-[11px] text-bunker-500 text-right">
                    {((after as { nextLevelXp: number }).nextLevelXp - (isAdmin ? adminTotalXp! : effectiveTotal!)).toLocaleString()} to next
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export function useXpToast(): XpToastContextValue {
  const ctx = useContext(XpToastContext);
  if (!ctx) {
    return {
      showXpToast: () => {},
    };
  }
  return ctx;
}
