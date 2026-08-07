'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ZCS3_CHALLENGE_DEFAULT_INDEX, ZCS3_CHALLENGE_SLIDES } from '@/lib/events/zcs3';
import { cn } from '@/lib/utils';

type ChallengeCarouselProps = {
  className?: string;
};

export function ChallengeCarousel({ className = '' }: ChallengeCarouselProps) {
  const slides = ZCS3_CHALLENGE_SLIDES;
  const defaultIndex = ZCS3_CHALLENGE_DEFAULT_INDEX >= 0 ? ZCS3_CHALLENGE_DEFAULT_INDEX : 0;
  const [index, setIndex] = useState(defaultIndex);
  const [direction, setDirection] = useState(0);

  const goTo = useCallback(
    (next: number, dir: number) => {
      const len = slides.length;
      const normalized = ((next % len) + len) % len;
      setDirection(dir);
      setIndex(normalized);
    },
    [slides.length]
  );

  const next = useCallback(() => goTo(index + 1, 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1, -1), [goTo, index]);

  const slide = slides[index];
  const prevSlide = slides[(index - 1 + slides.length) % slides.length];
  const nextSlide = slides[(index + 1) % slides.length];

  return (
    <div className={cn('w-full', className)}>
      {/* Game tabs */}
      <div
        className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-5 sm:mb-6"
        role="tablist"
        aria-label="Challenge games"
      >
        {slides.map((s, i) => {
          const active = i === index;
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => goTo(i, i > index ? 1 : i < index ? -1 : 0)}
              className={cn(
                'min-h-[44px] px-4 sm:px-5 py-2.5 rounded-lg text-sm sm:text-base font-zombies tracking-wide border-2 transition-all touch-manipulation',
                active
                  ? 'bg-orange-600 border-orange-300 text-white shadow-[0_0_24px_rgba(249,115,22,0.45)] scale-[1.03]'
                  : 'bg-bunker-900 border-bunker-500 text-bunker-100 hover:border-sky-400 hover:text-white hover:bg-bunker-800'
              )}
            >
              <span className="sm:hidden">{s.shortLabel}</span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Image + big side nav */}
      <div className="relative flex items-center gap-2 sm:gap-3 md:gap-4">
        <button
          type="button"
          onClick={prev}
          aria-label={`Previous game: ${prevSlide.label}`}
          className="shrink-0 z-20 flex flex-col items-center justify-center gap-1 min-w-[3.25rem] sm:min-w-[4.5rem] md:min-w-[5.5rem] h-[4.5rem] sm:h-[5.5rem] md:h-24 rounded-xl border-2 border-orange-400/80 bg-gradient-to-b from-orange-600 to-orange-700 text-white hover:from-orange-500 hover:to-orange-600 hover:border-orange-300 active:scale-95 transition-all touch-manipulation shadow-[0_0_28px_rgba(249,115,22,0.4)]"
        >
          <ChevronLeft className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2.75} />
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider leading-none">
            {prevSlide.shortLabel}
          </span>
        </button>

        <div className="relative flex-1 min-w-0">
          <div
            className="relative w-full overflow-hidden rounded-xl border border-sky-500/35 bg-bunker-950 shadow-[0_0_40px_rgba(56,189,248,0.1),0_0_50px_rgba(249,115,22,0.08)]"
            style={{ aspectRatio: '16 / 9' }}
          >
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={slide.id}
                custom={direction}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <Image
                  src={slide.src}
                  alt={`${slide.label} challenges for ZCS-3 Shattered Universe`}
                  fill
                  priority={slide.id === 'bo3'}
                  sizes="(max-width: 1280px) 100vw, 1100px"
                  className="object-contain object-center bg-black"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <button
          type="button"
          onClick={next}
          aria-label={`Next game: ${nextSlide.label}`}
          className="shrink-0 z-20 flex flex-col items-center justify-center gap-1 min-w-[3.25rem] sm:min-w-[4.5rem] md:min-w-[5.5rem] h-[4.5rem] sm:h-[5.5rem] md:h-24 rounded-xl border-2 border-sky-400/80 bg-gradient-to-b from-sky-600 to-sky-700 text-white hover:from-sky-500 hover:to-sky-600 hover:border-sky-300 active:scale-95 transition-all touch-manipulation shadow-[0_0_28px_rgba(56,189,248,0.4)]"
        >
          <ChevronRight className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2.75} />
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider leading-none">
            {nextSlide.shortLabel}
          </span>
        </button>
      </div>

      <p className="mt-3 text-center text-sm sm:text-base font-zombies tracking-wide text-white [text-shadow:0_1px_3px_rgba(0,0,0,1),0_0_14px_rgba(0,0,0,0.9)]">
        {slide.label}
        <span className="text-bunker-300 font-sans font-normal tracking-normal">
          {' '}
          · {index + 1} / {slides.length}
        </span>
      </p>

      {/* Per-map rules under the image */}
      <div className="mt-5 sm:mt-6 relative min-h-[12rem]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-3 sm:space-y-3.5"
          >
            <p className="text-center text-xs sm:text-sm uppercase tracking-[0.18em] text-orange-300/95 font-semibold [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">
              {slide.label} maps
            </p>
            <ul className="grid gap-3 sm:gap-3.5">
              {slide.maps.map((m) => (
                <li
                  key={`${slide.id}-${m.map}`}
                  className="rounded-xl border border-bunker-600/90 bg-bunker-900/90 px-4 py-3.5 sm:px-5 sm:py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3 gap-0.5">
                    <h3 className="text-base sm:text-lg font-zombies text-white tracking-wide shrink-0">
                      {m.map}
                    </h3>
                    <span className="hidden sm:inline text-bunker-600" aria-hidden>
                      /
                    </span>
                    <p className="text-sm sm:text-base font-semibold text-sky-300">
                      {m.title}
                    </p>
                  </div>
                  <p className="mt-2 text-sm sm:text-[15px] text-bunker-100 leading-relaxed">
                    {m.rules}
                  </p>
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
