'use client';

import { useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** When false, content area does not scroll (child handles its own overflow) */
  contentScroll?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl',
};

let activeBodyScrollLocks = 0;
let previousBodyOverflow = '';

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  size = 'md',
  contentScroll = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
}: ModalProps) {
  const releaseBodyLockRef = useRef<(() => void) | null>(null);
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) onClose();
    },
    [onClose, closeOnEscape]
  );

  useEffect(() => {
    if (!isOpen) return;

    if (activeBodyScrollLocks === 0) {
      previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    activeBodyScrollLocks += 1;
    releaseBodyLockRef.current = () => {
      if (activeBodyScrollLocks > 0) activeBodyScrollLocks -= 1;
      if (activeBodyScrollLocks === 0) {
        document.body.style.overflow = previousBodyOverflow;
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      releaseBodyLockRef.current?.();
      releaseBodyLockRef.current = null;
    };
  }, [isOpen, handleEscape]);

  const content = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" aria-modal="true" role="dialog">
          {/* Backdrop - same as image lightbox; full viewport so modal is never clipped by parent overflow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOnBackdrop ? onClose : undefined}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal panel - match lightbox styling (bunker/void dark theme) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'relative z-10 flex flex-col w-full max-h-[90dvh] rounded-xl shadow-2xl border border-bunker-700 bg-bunker-900',
              sizeStyles[size],
              className
            )}
          >
            {/* Header */}
            {(title || description) && (
              <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-b border-bunker-700">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    {title && (
                      <h2 className="text-base sm:text-lg font-semibold text-white">{title}</h2>
                    )}
                    {description && (
                      <p className="mt-1 text-xs sm:text-sm text-bunker-400">{description}</p>
                    )}
                  </div>
                  {showCloseButton ? (
                    <button
                      type="button"
                      onClick={onClose}
                      className="p-2 -m-2 rounded-lg bg-blood-600 hover:bg-blood-500 text-white transition-colors shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation focus:outline-none focus:ring-2 focus:ring-blood-400 focus:ring-offset-2 focus:ring-offset-bunker-900"
                      aria-label="Close"
                    >
                      <X className="w-5 h-5" strokeWidth={2.5} />
                    </button>
                  ) : null}
                </div>
              </div>
            )}

            {/* Close button without header */}
            {!title && !description && (
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg bg-blood-600 hover:bg-blood-500 text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation focus:outline-none focus:ring-2 focus:ring-blood-400 focus:ring-offset-2 focus:ring-offset-bunker-900"
                aria-label="Close"
              >
                <X className="w-5 h-5" strokeWidth={2.5} />
              </button>
            )}

            {/* Content - scrollable when tall unless contentScroll=false (child handles overflow) */}
            <div
              className={cn(
                'flex-1 min-h-0 p-4 sm:p-6',
                contentScroll
                  ? 'overflow-y-auto overflow-x-hidden overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch]'
                  : 'overflow-hidden'
              )}
            >
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(content, document.body);
}
