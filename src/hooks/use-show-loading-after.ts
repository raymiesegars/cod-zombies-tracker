'use client';

import { useState, useEffect } from 'react';

/**
 * Returns true only after `loading` has been true for at least `delayMs`.
 * When `loading` becomes false, returns false immediately (no delay).
 * Use this to avoid showing a loading UI for very short loads (< ~200ms), which feel like a jarring blink.
 */
export function useShowLoadingAfter(loading: boolean, delayMs: number): boolean {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!loading) {
      setShow(false);
      return;
    }
    if (typeof window === 'undefined') return;
    const timer = window.setTimeout(() => setShow(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [loading, delayMs]);

  return loading && show;
}
