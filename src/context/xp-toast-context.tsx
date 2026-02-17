'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { getLevelFromXp } from '@/lib/ranks';

export type XpToastOptions = {
  totalXp?: number; // So we can show rank + bar
};

type ToastState = {
  amount: number;
  totalXp: number | null;
};

type XpToastContextValue = {
  showXpToast: (amount: number, options?: XpToastOptions) => void;
};

const XpToastContext = createContext<XpToastContextValue | null>(null);

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
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(XP_TOAST_EVENT, { detail: { amount, totalXp: options?.totalXp } })
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
    window.addEventListener(XP_TOAST_EVENT, handler);
    return () => window.removeEventListener(XP_TOAST_EVENT, handler);
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
          />
        )}
      </AnimatePresence>
    </XpToastContext.Provider>
  );
}

function XpToastContent({ amount, totalXp }: ToastState) {
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
      className="fixed bottom-6 left-6 right-auto z-[100] pointer-events-none w-[280px] sm:w-[300px]"
      style={{ left: '1.5rem', right: 'auto' }}
    >
      {/* Fully opaque card – no transparency */}
      <div className="rounded-xl border border-bunker-600 bg-bunker-900 shadow-xl overflow-hidden">
        {/* +N XP row – extra left padding so content isn’t flush */}
        <div className="px-4 py-3 border-b border-bunker-700">
          <p className="text-center">
            <span className="text-military-400 font-medium">+</span>
            <span className="tabular-nums text-lg font-bold text-white mx-0.5">
              {amount.toLocaleString()}
            </span>
            <span className="text-military-500 font-medium"> XP</span>
          </p>
        </div>

        {hasRankAndBar && after && before && (
          <div className="px-4 py-3 space-y-3">
            {/* Rank: icon (no container) + level + name + total, like dashboard */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
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
                <p className="text-sm font-semibold text-white truncate">
                  Level {after.level} · {after.rankName}
                </p>
                <p className="text-xs text-bunker-400">
                  {totalXp.toLocaleString()} total XP
                  {leveledUp && (
                    <span className="text-blood-400 font-medium ml-1">· Level up!</span>
                  )}
                </p>
              </div>
            </div>
            {/* Bar: only animated element – from before to after */}
            <div className="space-y-1">
              <div className="w-full h-2 bg-bunker-800 rounded-full overflow-hidden border border-bunker-700">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-blood-600 to-blood-500"
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
