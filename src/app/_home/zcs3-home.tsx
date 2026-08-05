'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Button, Logo } from '@/components/ui';
import { TwitchEmbed } from '@/components/events/twitch-embed';
import {
  ZCS3_CHARITY_NAME,
  ZCS3_CHARITY_TAGLINE,
  ZCS3_CHARITY_URL,
  ZCS3_ENLIST_URL,
  ZCS3_FORMAT_REVEAL_LABEL,
  ZCS3_GAMES,
  ZCS3_LOGO_PATH,
  ZCS3_REVEAL_TWEET_URL,
  ZCS3_SLUG,
  ZCS3_TWITCH_URL,
} from '@/lib/events/zcs3';
import {
  ChevronDown,
  ExternalLink,
  Heart,
  ShoppingBag,
  Trophy,
  Users,
  Calendar,
  Sparkles,
} from 'lucide-react';

type CharityData = {
  amountCents: number;
  goalCents: number;
  merchUrl: string | null;
};

function formatUsd(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

function AnimatedDollars({ cents }: { cents: number }) {
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => formatUsd(Math.round(v)));
  const [text, setText] = useState(formatUsd(0));

  useEffect(() => {
    const unsub = display.on('change', (v) => setText(v));
    const controls = animate(mv, cents, { duration: 1.4, ease: [0.22, 1, 0.36, 1] });
    return () => {
      unsub();
      controls.stop();
    };
  }, [cents, display, mv]);

  return <span className="tabular-nums">{text}</span>;
}

function ComingSoonBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border border-bunker-600/80 bg-bunker-900/80 px-2 py-0.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-bunker-400 ${className}`}
    >
      Coming Soon
    </span>
  );
}

export default function Zcs3HomePage() {
  const [charity, setCharity] = useState<CharityData | null>(null);

  useEffect(() => {
    fetch(`/api/charity/${ZCS3_SLUG}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && typeof d.amountCents === 'number') {
          setCharity({
            amountCents: d.amountCents,
            goalCents: d.goalCents ?? 50_000,
            merchUrl: d.merchUrl ?? null,
          });
        }
      })
      .catch(() => setCharity(null));
  }, []);

  const amountCents = charity?.amountCents ?? 0;
  const goalCents = charity?.goalCents ?? 50_000;
  const progress = goalCents > 0 ? Math.min(100, (amountCents / goalCents) * 100) : 0;
  const merchUrl = charity?.merchUrl ?? null;
  const merchReady = Boolean(merchUrl);

  return (
    <div className="relative noise-overlay">
      {/* ── Hero ── */}
      <section className="relative min-h-[88dvh] flex flex-col items-center justify-center overflow-hidden px-4 pt-8 pb-16 sm:pt-12 sm:pb-20">
        {/* Vortex atmosphere over TV room */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 55% 45% at 50% 38%, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.15) 70%, transparent 100%)',
          }}
          aria-hidden
        />
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 50% 40% at 35% 45%, rgba(249,115,22,0.14) 0%, transparent 55%), radial-gradient(ellipse 45% 38% at 68% 48%, rgba(56,189,248,0.12) 0%, transparent 50%), radial-gradient(ellipse 30% 30% at 50% 42%, rgba(88,28,135,0.2) 0%, transparent 60%)',
          }}
          animate={{ opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.06] pointer-events-none" aria-hidden />

        <div className="relative z-10 w-full max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-500/40 bg-bunker-950/70 text-orange-300/90 text-[11px] sm:text-xs font-medium mb-5 sm:mb-6 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              Format reveal · {ZCS3_FORMAT_REVEAL_LABEL}
            </div>

            <div className="relative w-full max-w-[min(92vw,560px)] mx-auto mb-5 sm:mb-7">
              <motion.div
                className="absolute -inset-6 sm:-inset-10 rounded-full pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle, rgba(249,115,22,0.22) 0%, rgba(56,189,248,0.12) 40%, transparent 70%)',
                }}
                animate={{ scale: [1, 1.06, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                aria-hidden
              />
              <Image
                src={ZCS3_LOGO_PATH}
                alt="ZCS-3 Shattered Universe"
                width={1120}
                height={560}
                priority
                className="relative w-full h-auto drop-shadow-[0_0_32px_rgba(249,115,22,0.35)]"
              />
            </div>

            <p className="text-base sm:text-lg md:text-xl text-bunker-200 max-w-2xl mx-auto leading-relaxed px-1">
              A 2-player community tournament across classic Zombies — racing challenges for charity.
              September, just before the big releases.
            </p>

            <p className="mt-3 text-xs sm:text-sm text-bunker-500 tracking-wide uppercase">
              {ZCS3_GAMES.join(' · ')}
            </p>

            <div className="mt-5 sm:mt-6 flex items-center justify-center gap-2.5 text-bunker-400">
              <span className="text-[11px] sm:text-xs uppercase tracking-wider">Presented with</span>
              <Logo size="sm" animated={false} />
              <span className="text-sm sm:text-base font-zombies text-white tracking-wide">
                CoD Zombies Tracker
              </span>
            </div>

            <div className="mt-8 sm:mt-10 flex flex-col min-[720px]:flex-row items-stretch min-[720px]:items-center justify-center gap-3 w-full max-w-xl min-[720px]:max-w-none">
              <a href="#stream" className="w-full min-[720px]:w-auto">
                <Button
                  size="lg"
                  className="w-full min-[720px]:w-auto bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white border-orange-400/40 shadow-lg shadow-orange-900/40"
                >
                  Watch Stream
                </Button>
              </a>
              <a
                href={ZCS3_ENLIST_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-[720px]:w-auto"
              >
                <Button
                  size="lg"
                  variant="secondary"
                  rightIcon={<ExternalLink className="w-4 h-4" />}
                  className="w-full min-[720px]:w-auto border-sky-500/40 text-sky-100 hover:border-sky-400/60 hover:bg-sky-950/40"
                >
                  Enlist Now
                </Button>
              </a>
              {merchReady ? (
                <a href={merchUrl!} target="_blank" rel="noopener noreferrer" className="w-full min-[720px]:w-auto">
                  <Button
                    size="lg"
                    variant="secondary"
                    rightIcon={<ShoppingBag className="w-4 h-4" />}
                    className="w-full min-[720px]:w-auto"
                  >
                    Merch
                  </Button>
                </a>
              ) : (
                <span className="relative w-full min-[720px]:w-auto inline-flex">
                  <Button
                    size="lg"
                    variant="secondary"
                    disabled
                    className="w-full min-[720px]:w-auto opacity-50 cursor-not-allowed"
                    rightIcon={<ShoppingBag className="w-4 h-4" />}
                  >
                    Merch
                  </Button>
                  <ComingSoonBadge className="absolute -top-2 -right-1 sm:right-2" />
                </span>
              )}
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden sm:block z-10">
          <a
            href="#stream"
            className="block text-orange-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 rounded-full"
            aria-label="Scroll to stream"
          >
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]"
            >
              <ChevronDown className="w-10 h-10" strokeWidth={2.5} />
            </motion.div>
          </a>
        </div>
      </section>

      {/* ── Stream ── */}
      <section id="stream" className="relative py-10 sm:py-14 px-4 border-y border-orange-900/30 bg-bunker-950/85 backdrop-blur-[2px]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-zombies text-white tracking-wide">
              Live Cast
            </h2>
            <p className="mt-2 text-sm sm:text-base text-bunker-400 max-w-xl mx-auto">
              The main event streams on{' '}
              <a href={ZCS3_TWITCH_URL} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">
                xdflamer99
              </a>
              . Tune in for ZCS-3 Shattered Universe.
            </p>
          </div>
          <TwitchEmbed />
        </div>
      </section>

      {/* ── Money raised ── */}
      <section className="relative py-14 sm:py-20 px-4 overflow-hidden border-b border-sky-900/25 bg-gradient-to-b from-bunker-950 via-bunker-950/95 to-bunker-900/90">
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(249,115,22,0.1) 0%, transparent 65%)',
          }}
          aria-hidden
        />
        <div className="relative max-w-4xl mx-auto text-center">
          <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-orange-400/90 font-semibold mb-3">
            Raised for {ZCS3_CHARITY_NAME}
          </p>
          <p className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-zombies text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-300 to-sky-400 drop-shadow-sm leading-none">
            <AnimatedDollars cents={amountCents} />
          </p>
          <p className="mt-4 text-sm sm:text-base text-bunker-400">
            Goal <span className="text-white font-medium">{formatUsd(goalCents)}</span>
            {' · '}
            via event merchandise
          </p>

          <div className="mt-6 sm:mt-8 max-w-md mx-auto">
            <div className="h-3 rounded-full bg-bunker-800 border border-bunker-700 overflow-hidden shadow-[inset_0_0_12px_rgba(0,0,0,0.5)]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-orange-600 via-orange-400 to-sky-400 shadow-[0_0_16px_rgba(249,115,22,0.45)]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              />
            </div>
            <p className="mt-2 text-xs text-bunker-500 tabular-nums">{progress.toFixed(0)}% of goal</p>
          </div>
        </div>
      </section>

      {/* ── Contribute ── */}
      <section className="py-12 sm:py-16 px-4 border-b border-bunker-800/60 bg-bunker-950/90">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-zombies text-white tracking-wide">How You Contribute</h2>
            <p className="mt-2 text-sm sm:text-base text-bunker-400 max-w-xl mx-auto">
              Support hospitalized kids through play — every merch purchase fuels the charity total.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            {/* Merch */}
            <div
              className={`relative rounded-2xl border p-6 sm:p-8 ${
                merchReady
                  ? 'border-orange-600/40 bg-gradient-to-br from-orange-950/50 to-bunker-950/80 hover:border-orange-500/60'
                  : 'border-bunker-700/70 bg-bunker-900/50 opacity-90'
              } transition-colors`}
            >
              {!merchReady && <ComingSoonBadge className="absolute top-4 right-4" />}
              <div className="w-12 h-12 rounded-xl bg-orange-950/60 border border-orange-600/40 flex items-center justify-center mb-4">
                <ShoppingBag className={`w-6 h-6 ${merchReady ? 'text-orange-400' : 'text-bunker-500'}`} />
              </div>
              <h3 className="text-xl font-zombies text-white tracking-wide">Event Merch</h3>
              <p className="mt-2 text-sm text-bunker-400 leading-relaxed">
                Official ZCS-3 Shattered Universe gear. Purchases count toward the Gamers Outreach total shown above.
              </p>
              {merchReady ? (
                <a href={merchUrl!} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex">
                  <Button rightIcon={<ExternalLink className="w-4 h-4" />}>Shop Merch</Button>
                </a>
              ) : (
                <Button disabled className="mt-5 opacity-50 cursor-not-allowed">
                  Shop Merch
                </Button>
              )}
            </div>

            {/* Charity */}
            <a
              href={ZCS3_CHARITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl border border-sky-600/35 bg-gradient-to-br from-sky-950/40 to-bunker-950/80 p-6 sm:p-8 hover:border-sky-500/55 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-sky-950/60 border border-sky-600/40 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Heart className="w-6 h-6 text-sky-400" />
              </div>
              <h3 className="text-xl font-zombies text-white tracking-wide flex items-center gap-2">
                {ZCS3_CHARITY_NAME}
                <ExternalLink className="w-4 h-4 text-bunker-500 group-hover:text-sky-400" />
              </h3>
              <p className="mt-1 text-sm text-sky-300/90 italic">{ZCS3_CHARITY_TAGLINE}</p>
              <p className="mt-2 text-sm text-bunker-400 leading-relaxed">
                A charity that empowers hospitalized families through play — gaming carts and experiences in
                hospitals so kids can level up even on the hardest days.
              </p>
            </a>
          </div>
        </div>
      </section>

      {/* ── Leaderboard placeholder ── */}
      <section id="results" className="py-12 sm:py-16 px-4 border-b border-bunker-800/60 bg-bunker-900/80">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-zombies text-white tracking-wide flex items-center justify-center gap-2">
              <Trophy className="w-7 h-7 text-sky-400" />
              Tournament Results
            </h2>
            <p className="mt-2 text-sm text-bunker-400">
              Leaderboard drops after challenges go public.
            </p>
          </div>

          <div className="relative rounded-2xl border border-sky-700/30 bg-bunker-950/70 overflow-hidden">
            <div className="absolute inset-0 bg-bunker-950/75 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center p-8 text-center">
              <ComingSoonBadge className="mb-3" />
              <p className="text-lg sm:text-xl font-zombies text-white tracking-wide">
                Challenges reveal {ZCS3_FORMAT_REVEAL_LABEL}
              </p>
              <p className="mt-2 text-sm text-bunker-400 max-w-md">
                Check back Friday for the format reveal — then we&apos;ll lock in results tracking here.
              </p>
            </div>
            <ul className="divide-y divide-bunker-800/80 opacity-40 select-none pointer-events-none" aria-hidden>
              {[1, 2, 3, 4, 5].map((n) => (
                <li key={n} className="flex items-center gap-4 px-5 py-4">
                  <span className="w-8 text-sky-500/80 font-zombies">#{n}</span>
                  <div className="h-8 w-8 rounded-full bg-bunker-700" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-32 rounded bg-bunker-700" />
                    <div className="h-2 w-20 rounded bg-bunker-800" />
                  </div>
                  <div className="h-3 w-16 rounded bg-bunker-700" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section className="py-12 sm:py-16 px-4 bg-bunker-950/90 border-b border-bunker-800/50">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-orange-400/90 text-xs sm:text-sm uppercase tracking-wider mb-4">
            <Calendar className="w-4 h-4" />
            September 2026
          </div>
          <h2 className="text-2xl sm:text-3xl font-zombies text-white tracking-wide">About ZCS-3</h2>
          <p className="mt-4 text-sm sm:text-base text-bunker-300 leading-relaxed">
            Zombies Community Showdown 3 — <span className="text-white">Shattered Universe</span> — is a
            by-the-players tournament. Team up in pairs, clear challenges fast across BO1, BO2, BO3, Infinite
            Warfare, and WW2, and help raise funds for {ZCS3_CHARITY_NAME}. Open to the community. Bring your
            duo and face formidable opponents.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href={ZCS3_ENLIST_URL} target="_blank" rel="noopener noreferrer">
              <Button rightIcon={<Users className="w-4 h-4" />}>Enlist Your Duo</Button>
            </a>
            <a href={ZCS3_REVEAL_TWEET_URL} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" rightIcon={<ExternalLink className="w-4 h-4" />}>
                Official Reveal
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ── Quiet product CTA ── */}
      <section className="py-10 sm:py-12 px-4 bg-bunker-900/70">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="text-sm text-bunker-500 uppercase tracking-wider">Meanwhile</p>
            <p className="text-lg font-zombies text-white tracking-wide">Keep tracking your Zombies progress</p>
          </div>
          <Link href="/maps">
            <Button variant="secondary" size="lg">
              Browse Maps
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
