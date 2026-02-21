'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getLevelFromXp } from '@/lib/ranks';
import { CheckCircle2 } from 'lucide-react';

export type XpToastOptions = {
  totalXp?: number; // So we can show rank + bar
  verified?: boolean; // Verified XP variant: blue outline, checkmark
};

type ToastState = {
  amount: number;
  totalXp: number | null;
  verified: boolean;
};

type XpToastContextValue = {
  showXpToast: (amount: number, options?: XpToastOptions) => void;
};

const XpToastContext = createContext<XpToastContextValue | null>(null);

export const XP_TOAST_VERIFIED_EVENT = 'cod-tracker-xp-toast-verified';

const TOAST_DURATION_MS = 4500;
const BAR_FILL_DURATION_S = 1.2;
const ACHIEVEMENT_SOUND_VOLUME = 0.35;

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
      new CustomEvent(eventName, { detail: { amount, totalXp: options?.totalXp } })
    );
  }
}

export function XpToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const [toastId, setToastId] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showXpToast = useCallback((amount: number, options?: XpToastOptions) => {
    if (amount <= 0) return;
    playAchievementSound();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setToastId((n) => n + 1);
    setToast({
      amount,
      totalXp: options?.totalXp ?? null,
      verified: options?.verified ?? false,
    });
    timeoutRef.current = setTimeout(() => {
      setToast(null);
      timeoutRef.current = null;
    }, TOAST_DURATION_MS);
  }, []);

  useEffect(() => {
    xpToastShowRef = showXpToast;
    return () => {
      xpToastShowRef = null;
    };
  }, [showXpToast]);

  useEffect(() => {
    const handler = (e: Event) => {
      const { amount, totalXp } = (e as CustomEvent<{ amount: number; totalXp?: number }>).detail ?? {};
      if (typeof amount === 'number' && amount > 0) {
        showXpToast(amount, totalXp != null ? { totalXp } : undefined);
      }
    };
    const verifiedHandler = (e: Event) => {
      const { amount, totalXp } = (e as CustomEvent<{ amount: number; totalXp?: number }>).detail ?? {};
      if (typeof amount === 'number' && amount > 0) {
        showXpToast(amount, { totalXp: totalXp ?? undefined, verified: true });
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
          />
        )}
      </AnimatePresence>
    </XpToastContext.Provider>
  );
}

function XpToastContent({ amount, totalXp, verified }: ToastState) {
  const hasRankAndBar = totalXp != null && totalXp >= 0;
  const totalXpBefore = hasRankAndBar ? Math.max(0, totalXp - amount) : 0;
  const after = hasRankAndBar ? getLevelFromXp(totalXp) : null;
  const before = hasRankAndBar ? getLevelFromXp(totalXpBefore) : null;
  const leveledUp = Boolean(before && after && after.level > before.level);

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-none w-[280px] sm:w-[300px]"
    >
      <div
        className={cn(
          'rounded-xl border shadow-xl overflow-hidden',
          verified
            ? 'border-blue-500/70 bg-bunker-900 ring-2 ring-blue-500/40'
            : 'border-bunker-600 bg-bunker-900'
        )}
      >
        {/* +N XP row – extra left padding so content isn’t flush */}
        <div className={cn('px-4 py-3', verified ? 'border-b border-blue-900/50' : 'border-b border-bunker-700')}>
          <p className="text-center flex items-center justify-center gap-2">
            {verified && (
              <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" strokeWidth={2.5} aria-hidden />
            )}
            <span className={verified ? 'text-blue-400 font-medium' : 'text-military-400 font-medium'}>+</span>
            <span className="tabular-nums text-lg font-bold text-white mx-0.5">
              {amount.toLocaleString()}
            </span>
            <span className={verified ? 'text-blue-400/90 font-medium' : 'text-military-500 font-medium'}>
              {verified ? ' Verified' : ''} XP
            </span>
          </p>
        </div>

        {hasRankAndBar && after && before && (
          <div className="px-4 py-3 space-y-3">
            {/* Rank: icon (no container) + level + name + total, like dashboard */}
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center">
                {verified && (
                  <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center" aria-hidden>
                    <CheckCircle2 className="w-4 h-4 text-blue-500" strokeWidth={2.5} />
                  </span>
                )}
                <Image
                  src={after.rankIcon}
                  alt={after.rankName}
                  width={40}
                  height={40}
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate flex items-center gap-1.5 flex-wrap">
                  Level {after.level} · {after.rankName}
                  {verified && (
                    <span className="inline-flex items-center gap-0.5 text-blue-400 text-xs shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden />
                      Verified
                    </span>
                  )}
                </p>
                <p className="text-xs text-bunker-400">
                  {totalXp.toLocaleString()} {verified ? 'verified' : 'total'} XP
                  {leveledUp && (
                    <span className={verified ? 'text-blue-400 font-medium ml-1' : 'text-blood-400 font-medium ml-1'}>
                      · {verified ? 'Verified rank up!' : 'Level up!'}
                    </span>
                  )}
                </p>
              </div>
            </div>
            {/* Bar: only animated element – from before to after */}
            <div className="space-y-1">
              <div className="w-full h-2 bg-bunker-800 rounded-full overflow-hidden border border-bunker-700">
                <motion.div
                  className={cn(
                    'h-full rounded-full',
                    verified ? 'bg-gradient-to-r from-blue-600 to-blue-500' : 'bg-gradient-to-r from-blood-600 to-blood-500'
                  )}
                  initial={{ width: `${before.progress}%` }}
                  animate={{ width: `${after.progress}%` }}
                  transition={{
                    duration: BAR_FILL_DURATION_S,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                />
              </div>
              {after.level < 20 && (
                <p className="text-[11px] text-bunker-500 text-right">
                  {(after.nextLevelXp - totalXp).toLocaleString()} to next
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
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
