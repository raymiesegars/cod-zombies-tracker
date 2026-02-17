'use client';

import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

const SCROLL_THRESHOLD = 400;

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(typeof window !== 'undefined' && window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      className="fixed right-4 z-40 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-bunker-600/80 bg-bunker-900/95 text-bunker-300 shadow-lg transition-colors hover:bg-bunker-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-blood-500 focus:ring-offset-2 focus:ring-offset-bunker-950 touch-manipulation bottom-[calc(4rem+env(safe-area-inset-bottom,0px))]"
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  );
}
