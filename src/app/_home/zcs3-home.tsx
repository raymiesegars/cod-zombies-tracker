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

/** Soft black plate behind copy so TV room / gradients don't wash out text */
const textPlate =
  '[text-shadow:0_1px_2px_rgba(0,0,0,0.95),0_0_18px_rgba(0,0,0,0.85),0_0_4px_rgba(0,0,0,1)]';
const textPlateStrong =
  '[text-shadow:0_1px_3px_rgba(0,0,0,1),0_2px_14px_rgba(0,0,0,0.95),0_0_24px_rgba(0,0,0,0.8)]';

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
      {/* Hero */}
      <section className="relative min-h-[78dvh] flex flex-col items-center justify-start overflow-hidden px-4 pt-3 sm:pt-4 pb-14 sm:pb-16">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 55% 45% at 50% 32%, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.58) 45%, rgba(0,0,0,0.18) 70%, transparent 100%)',
          }}
          aria-hidden
        />
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 50% 40% at 35% 40%, rgba(249,115,22,0.14) 0%, transparent 55%), radial-gradient(ellipse 45% 38% at 68% 42%, rgba(56,189,248,0.12) 0%, transparent 50%), radial-gradient(ellipse 30% 30% at 50% 36%, rgba(88,28,135,0.2) 0%, transparent 60%)',
          }}
          animate={{ opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.06] pointer-events-none" aria-hidden />

        <div className="relative z-10 w-full max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="flex flex-col items-center"
          >
            <div className="relative w-full max-w-[min(92vw,560px)] mx-auto mb-3 sm:mb-4">
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

            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-500/45 bg-black/70 text-orange-200 text-[11px] sm:text-xs font-medium mb-4 sm:mb-5 backdrop-blur-sm ${textPlate}`}
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-300 shrink-0" />
              Format reveal · {ZCS3_FORMAT_REVEAL_LABEL}
            </div>

            <p
              className={`text-base sm:text-lg md:text-xl text-white/95 max-w-2xl mx-auto leading-relaxed px-1 ${textPlateStrong}`}
            >
              A 2-player community tournament across classic Zombies, racing challenges for charity.
              September, just before the big releases.
            </p>

            <p className={`mt-3 text-xs sm:text-sm text-bunker-100 tracking-wide uppercase ${textPlate}`}>
              {ZCS3_GAMES.join(' · ')}
            </p>

            <div className={`mt-5 sm:mt-6 flex items-center justify-center gap-2.5 text-bunker-100 ${textPlate}`}>
              <span className="text-[11px] sm:text-xs uppercase tracking-wider text-bunker-100">Presented with</span>
              <Logo size="sm" animated={false} />
              <span className="text-sm sm:text-base font-zombies text-white tracking-wide">
                CoD Zombies Tracker
              </span>
            </div>

            <div className="mt-7 sm:mt-8 flex flex-col min-[720px]:flex-row items-stretch min-[720px]:items-center justify-center gap-3 w-full max-w-xl min-[720px]:max-w-none">
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
                <Button
                  size="lg"
                  variant="secondary"
                  disabled
                  className="w-full min-[720px]:w-auto opacity-60 cursor-not-allowed border-bunker-600"
                  rightIcon={<ShoppingBag className="w-4 h-4" />}
                >
                  Merch (Soon)
                </Button>
              )}
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 hidden sm:block z-10">
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

      {/* Stream */}
      <section id="stream" className="relative py-10 sm:py-14 px-4 border-y border-orange-900/30 bg-bunker-950/92 backdrop-blur-[2px]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className={`text-2xl sm:text-3xl md:text-4xl font-zombies text-white tracking-wide ${textPlateStrong}`}>
              Live Cast
            </h2>
            <p className={`mt-2 text-sm sm:text-base text-bunker-100 max-w-xl mx-auto ${textPlate}`}>
              The main event streams on{' '}
              <a href={ZCS3_TWITCH_URL} target="_blank" rel="noopener noreferrer" className="text-sky-300 hover:underline">
                xdflamer99
              </a>
              . Tune in for ZCS-3 Shattered Universe.
            </p>
          </div>
          <TwitchEmbed />
        </div>
      </section>

      {/* Money raised */}
      <section className="relative py-14 sm:py-20 px-4 overflow-hidden border-b border-sky-900/25 bg-gradient-to-b from-bunker-950 via-bunker-950 to-bunker-900">
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(249,115,22,0.1) 0%, transparent 65%)',
          }}
          aria-hidden
        />
        <div className="relative max-w-4xl mx-auto text-center">
          <p className={`text-xs sm:text-sm uppercase tracking-[0.2em] text-orange-300 font-semibold mb-3 ${textPlate}`}>
            Raised for {ZCS3_CHARITY_NAME}
          </p>
          <p
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-zombies text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-300 to-sky-400 leading-none"
            style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.9)) drop-shadow(0 0 20px rgba(0,0,0,0.7))' }}
          >
            <AnimatedDollars cents={amountCents} />
          </p>
          <p className={`mt-4 text-sm sm:text-base text-bunker-100 ${textPlate}`}>
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
            <p className={`mt-2 text-xs text-bunker-200 tabular-nums ${textPlate}`}>{progress.toFixed(0)}% of goal</p>
          </div>
        </div>
      </section>

      {/* Contribute */}
      <section className="py-12 sm:py-16 px-4 border-b border-bunker-800/60 bg-bunker-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className={`text-2xl sm:text-3xl font-zombies text-white tracking-wide ${textPlateStrong}`}>
              How You Contribute
            </h2>
            <p className={`mt-2 text-sm sm:text-base text-bunker-100 max-w-xl mx-auto ${textPlate}`}>
              Support hospitalized kids through play. Every merch purchase fuels the charity total.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            <div
              className={`relative rounded-2xl border p-6 sm:p-8 ${
                merchReady
                  ? 'border-orange-600/40 bg-gradient-to-br from-orange-950/80 to-bunker-950 hover:border-orange-500/60'
                  : 'border-bunker-600 bg-bunker-900/90'
              } transition-colors`}
            >
              <div className="w-12 h-12 rounded-xl bg-orange-950/60 border border-orange-600/40 flex items-center justify-center mb-4">
                <ShoppingBag className={`w-6 h-6 ${merchReady ? 'text-orange-400' : 'text-bunker-400'}`} />
              </div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="text-xl font-zombies text-white tracking-wide">Event Merch</h3>
                {!merchReady && (
                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-bunker-300 border border-bunker-600 rounded px-1.5 py-0.5 bg-bunker-950/80">
                    Soon
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-bunker-200 leading-relaxed">
                Official ZCS-3 Shattered Universe gear. Purchases count toward the Gamers Outreach total shown above.
              </p>
              {merchReady ? (
                <a href={merchUrl!} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex">
                  <Button rightIcon={<ExternalLink className="w-4 h-4" />}>Shop Merch</Button>
                </a>
              ) : (
                <Button disabled className="mt-5 opacity-60 cursor-not-allowed">
                  Shop Merch (Soon)
                </Button>
              )}
            </div>

            <a
              href={ZCS3_CHARITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl border border-sky-600/40 bg-gradient-to-br from-sky-950/70 to-bunker-950 p-6 sm:p-8 hover:border-sky-500/55 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-sky-950/60 border border-sky-600/40 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Heart className="w-6 h-6 text-sky-400" />
              </div>
              <h3 className="text-xl font-zombies text-white tracking-wide flex items-center gap-2">
                {ZCS3_CHARITY_NAME}
                <ExternalLink className="w-4 h-4 text-bunker-400 group-hover:text-sky-400" />
              </h3>
              <p className="mt-1 text-sm text-sky-200 italic">{ZCS3_CHARITY_TAGLINE}</p>
              <p className="mt-2 text-sm text-bunker-200 leading-relaxed">
                A charity that empowers hospitalized families through play: gaming carts and experiences in
                hospitals so kids can level up even on the hardest days.
              </p>
            </a>
          </div>
        </div>
      </section>

      {/* Leaderboard placeholder */}
      <section id="results" className="py-12 sm:py-16 px-4 border-b border-bunker-800/60 bg-bunker-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className={`text-2xl sm:text-3xl font-zombies text-white tracking-wide flex items-center justify-center gap-2 ${textPlateStrong}`}>
              <Trophy className="w-7 h-7 text-sky-400" />
              Tournament Results
            </h2>
            <p className={`mt-2 text-sm text-bunker-100 ${textPlate}`}>
              Leaderboard drops after challenges go public.
            </p>
          </div>

          <div className="relative rounded-2xl border border-sky-700/30 bg-bunker-950 overflow-hidden">
            <div className="absolute inset-0 bg-bunker-950/80 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center p-8 text-center">
              <span className="mb-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-bunker-200 border border-bunker-600 rounded px-2 py-0.5 bg-bunker-900">
                Coming Soon
              </span>
              <p className={`text-lg sm:text-xl font-zombies text-white tracking-wide ${textPlateStrong}`}>
                Challenges reveal {ZCS3_FORMAT_REVEAL_LABEL}
              </p>
              <p className={`mt-2 text-sm text-bunker-100 max-w-md ${textPlate}`}>
                Check back Friday for the format reveal, then we&apos;ll lock in results tracking here.
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

      {/* About */}
      <section className="py-12 sm:py-16 px-4 bg-bunker-950 border-b border-bunker-800/50">
        <div className="max-w-3xl mx-auto text-center">
          <div className={`inline-flex items-center gap-2 text-orange-300 text-xs sm:text-sm uppercase tracking-wider mb-4 ${textPlate}`}>
            <Calendar className="w-4 h-4" />
            September 2026
          </div>
          <h2 className={`text-2xl sm:text-3xl font-zombies text-white tracking-wide ${textPlateStrong}`}>About ZCS-3</h2>
          <p className={`mt-4 text-sm sm:text-base text-bunker-100 leading-relaxed ${textPlate}`}>
            Zombies Community Showdown 3: <span className="text-white font-medium">Shattered Universe</span>. A
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

      {/* Quiet product CTA */}
      <section className="py-10 sm:py-12 px-4 bg-bunker-900">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className={`text-sm text-bunker-200 uppercase tracking-wider ${textPlate}`}>Meanwhile</p>
            <p className={`text-lg font-zombies text-white tracking-wide ${textPlateStrong}`}>
              Keep tracking your Zombies progress
            </p>
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
