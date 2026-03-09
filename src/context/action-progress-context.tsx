'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export type ReportProgress = (current: number, total: number) => void;

type ActionProgressContextValue = {
  runWithProgress: <T>(message: string, fn: (reportProgress: ReportProgress) => Promise<T>) => Promise<T>;
};

const ActionProgressContext = createContext<ActionProgressContextValue | null>(null);

export function useActionProgress() {
  const ctx = useContext(ActionProgressContext);
  return ctx;
}

const SIMULATED_RAMP_MS = 1800;
const SIMULATED_TICK_MS = 50;
const SIMULATED_TARGET = 99;

export function ActionProgressProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [simulatedPercent, setSimulatedPercent] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    if (!visible || progress.total > 0) return;
    setSimulatedPercent(0);
    const increment = (SIMULATED_TARGET / SIMULATED_RAMP_MS) * SIMULATED_TICK_MS;
    const id = setInterval(() => {
      setSimulatedPercent((p) => {
        const next = p + increment;
        return next >= SIMULATED_TARGET ? SIMULATED_TARGET : next;
      });
    }, SIMULATED_TICK_MS);
    return () => clearInterval(id);
  }, [visible, progress.total]);

  const runWithProgress = useCallback(
    async <T,>(msg: string, fn: (reportProgress: ReportProgress) => Promise<T>): Promise<T> => {
      setMessage(msg);
      setProgress({ current: 0, total: 0 });
      setSimulatedPercent(0);
      setIsCompleting(false);
      setVisible(true);
      const reportProgress: ReportProgress = (current, total) => {
        setProgress({ current, total: Math.max(total, current) });
      };
      try {
        const result = await fn(reportProgress);
        setIsCompleting(true);
        setProgress((p) => ({ current: p.total || 1, total: p.total || 1 }));
        setSimulatedPercent(100);
        await new Promise((r) => setTimeout(r, 200));
        return result;
      } finally {
        setVisible(false);
      }
    },
    []
  );

  const hasRealProgress = progress.total > 0;
  const realPercent = hasRealProgress
    ? Math.min(SIMULATED_TARGET, (progress.current / progress.total) * 100)
    : 0;
  const percent = isCompleting
    ? 100
    : hasRealProgress
      ? realPercent
      : simulatedPercent;

  return (
    <ActionProgressContext.Provider value={{ runWithProgress }}>
      {children}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {visible && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[10001] flex items-center justify-center bg-bunker-950/80 backdrop-blur-sm"
                aria-live="polite"
                aria-busy="true"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="mx-4 w-full max-w-sm rounded-xl border border-bunker-600 bg-bunker-900 p-6 shadow-xl"
                >
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-amber-500" aria-hidden />
                    <p className="text-center text-sm font-medium text-white">{message}</p>
                    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-bunker-800">
                      <motion.div
                        className="absolute inset-y-0 left-0 rounded-full bg-amber-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                      />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </ActionProgressContext.Provider>
  );
}
