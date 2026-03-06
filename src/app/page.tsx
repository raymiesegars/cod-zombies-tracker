'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button, Card, CardContent, Logo, EasterEggIcon, MapIcon, MysteryBoxIcon } from '@/components/ui';
import { useAuth } from '@/context/auth-context';
import { useChatbot } from '@/context/chatbot-context';
import { Trophy, Target, Users, ChevronRight, ChevronDown, Wrench, ExternalLink, PenLine, Medal, BookOpen, Bot } from 'lucide-react';
import { useLogProgressModal } from '@/context/log-progress-modal-context';

const features = [
  {
    icon: EasterEggIcon,
    title: 'Full Easter Egg Guides & Tracking',
    description: 'Step-by-step guides for every map: main quests, musical eggs, side eggs, and buildables. Track steps, log completions with proof, and earn XP.',
  },
  {
    icon: MapIcon,
    title: 'Every Map Covered',
    description: 'World at War through Black Ops 7, plus IW, WW2, AW, Vanguard, and MW2 Zombies. Full Easter egg coverage, leaderboards, and achievements.',
  },
  {
    icon: Target,
    title: 'Challenges & Speedruns',
    description: 'No Downs, Pistol Only, Starting Room, and more. Round milestones from any challenge. EE speedruns. BO4 difficulty tiers (Casual–Realistic).',
  },
  {
    icon: Trophy,
    title: 'Leaderboards & Verified Runs',
    description: 'Solo, Duo, Trio, Squad. Search by name. Verified XP. EE speedrun boards. Filters: GobbleGums, Elixirs, Support, Fortune Cards.',
  },
  {
    icon: Users,
    title: 'Co-op, Friends & Messaging',
    description: 'Log runs with your squad—teammates get credit when they confirm. Add friends, send DMs, find groups. Run verification with admin-approved proof.',
  },
];

/** Format number for hero: compact, 2 decimals when under 10k (e.g. 1.84k), 1 decimal 10k–100k (11.8k), then whole k/M. */
function formatCompact(n: number): string {
  if (n < 1000) return n.toLocaleString();
  if (n < 10_000) {
    const s = (n / 1000).toFixed(2);
    return (s.endsWith('00') ? s.slice(0, -3) : s.replace(/0+$/, '').replace(/\.$/, '')) + 'k';
  }
  if (n < 100_000) {
    const s = (n / 1000).toFixed(1);
    return (s.endsWith('.0') ? s.slice(0, -2) : s) + 'k';
  }
  if (n < 1_000_000) return Math.round(n / 1000) + 'k';
  return (n / 1_000_000).toFixed(2).replace(/\.?0+$/, '') + 'M';
}

export default function HomePage() {
  const { user, profile, isLoading: authLoading, signInWithGoogle } = useAuth();
  const { openLogProgressModal } = useLogProgressModal() ?? {};
  const chatbot = useChatbot();
  const [homeStats, setHomeStats] = useState<{
    maps: number;
    users: number;
    achievements: number;
    runs: number;
  } | null>(null);

  useEffect(() => {
    fetch('/api/home-stats')
      .then((res) => res.json())
      .then((data) => {
        if (data?.maps != null && data?.users != null && data?.achievements != null && data?.runs != null) {
          setHomeStats({
            maps: data.maps,
            users: data.users,
            achievements: data.achievements,
            runs: data.runs,
          });
        }
      })
      .catch(() => setHomeStats(null));
  }, []);

  // Don't show user-dependent CTAs until auth has resolved — avoids "Get Started" flashing to "Log Progress" for logged-in users
  const authReady = !authLoading;

  return (
    <div className="relative noise-overlay">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-4">
        {/* Menu background image is behind everything (in layout/TVRoomBackground); hero stays transparent so TVs show through */}
        {/* Local darkening only behind the headline + body text for better contrast */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 45% 32% at 50% 40%, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.12) 75%, transparent 100%)',
          }}
        />
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.08]" />
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 70% 60% at 50% 30%, rgba(38, 38, 38, 0.15) 0%, transparent 55%)',
          }}
        />
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <div>
            <div className="flex justify-center mb-8 sm:mb-12">
              <Logo size="hero" animated={true} />
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-zombies tracking-wider">
              <span className="text-white">Track Your</span>
              <br />
              <span className="text-gradient animate-flicker">Zombies Progress</span>
            </h1>

            <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-bunker-300 max-w-2xl mx-auto px-4">
              Easter egg guides, challenges, speedruns, and leaderboards for every CoD Zombies map. Log runs with your squad, get verified, earn XP and ranks. Find teammates, message friends, and climb the boards.
            </p>
            <p className="mt-3 text-sm text-bunker-500">
              <Link href="/rules" className="inline-flex items-center gap-1.5 text-blood-500 hover:text-blood-400 transition-colors">
                <BookOpen className="w-4 h-4" />
                Rules & verification
              </Link>
            </p>

            <div className="mt-8 sm:mt-10 flex flex-col min-[780px]:flex-row items-center justify-center gap-3 sm:gap-4">
              {!authReady ? (
                <>
                  <div className="w-full min-[780px]:w-auto h-12 min-[780px]:h-11 rounded-lg bg-bunker-800/60 border border-bunker-700/60 min-w-[140px]" aria-hidden />
                  <Link href="/maps" className="w-full min-[780px]:w-auto">
                    <Button size="lg" rightIcon={<ChevronRight className="w-5 h-5" />} variant="secondary" className="w-full min-[780px]:w-auto [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">
                      Browse Maps
                    </Button>
                  </Link>
                </>
              ) : user ? (
                <>
                  {openLogProgressModal && (
                    <Button
                      size="lg"
                      onClick={openLogProgressModal}
                      rightIcon={<PenLine className="w-5 h-5" />}
                      className="w-full min-[780px]:w-auto bg-blood-600 hover:bg-blood-500 text-white border-blood-500/50 shadow-lg shadow-blood-900/40 [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]"
                    >
                      Log Progress
                    </Button>
                  )}
                  <Link href="/maps" className="w-full min-[780px]:w-auto">
                    <Button size="lg" rightIcon={<ChevronRight className="w-5 h-5" />} variant="secondary" className="w-full min-[780px]:w-auto [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">
                      Browse Maps
                    </Button>
                  </Link>
                  <Link href="/rules" className="w-full min-[780px]:w-auto">
                    <Button
                      size="lg"
                      variant="secondary"
                      className="w-full min-[780px]:w-auto [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]"
                    >
                      Rules
                    </Button>
                  </Link>
                  {chatbot && (
                    <Button
                      size="lg"
                      variant="secondary"
                      onClick={chatbot.openChatbot}
                      className="w-full min-[780px]:w-auto [text-shadow:0_1px_2px_rgba(0,0,0,0.6)] inline-flex items-center gap-2.5"
                    >
                      <span className="w-7 h-7 rounded flex items-center justify-center bg-bunker-800 border border-bunker-600 shrink-0 mr-0.5 text-element-400">
                        <Bot className="w-4 h-4" strokeWidth={2} />
                      </span>
                      Ask LeKronorium
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    onClick={signInWithGoogle}
                    rightIcon={<ChevronRight className="w-5 h-5" />}
                    className="w-full min-[780px]:w-auto"
                  >
                    Get Started
                  </Button>
                  <Link href="/maps" className="w-full min-[780px]:w-auto">
                    <Button variant="secondary" size="lg" className="w-full min-[780px]:w-auto [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]">
                      Browse Maps
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Stats: Runs (truncated), Users, Achievements (truncated, actual total) */}
          <div className="mt-16 sm:mt-20 mb-12 sm:mb-14 grid grid-cols-3 gap-1 sm:gap-3">
            <div className="text-center">
              <p className="text-2xl sm:text-3xl md:text-4xl font-zombies text-blood-400">
                {homeStats != null ? formatCompact(homeStats.runs) : '—'}
              </p>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-bunker-400">Runs Logged</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl md:text-4xl font-zombies text-blood-400">
                {homeStats != null ? homeStats.users.toLocaleString() : '—'}
              </p>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-bunker-400">Users</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl md:text-4xl font-zombies text-blood-400">
                {homeStats != null ? formatCompact(homeStats.achievements) : '—'}
              </p>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-bunker-400">Achievements</p>
            </div>
          </div>
        </div>

        {/* Scroll indicator: red down arrow with bounce */}
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 hidden sm:block">
          <a href="#features" className="block text-blood-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blood-400 rounded-full" aria-label="Scroll down">
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="drop-shadow-[0_0_8px_rgba(185,28,28,0.6)]"
            >
              <ChevronDown className="w-10 h-10 text-blood-500" strokeWidth={2.5} />
            </motion.div>
          </a>
        </div>
      </section>

      {/* LeKronorium — Promo (opens chatbot) */}
      {chatbot && (
        <section className="py-8 sm:py-12 px-4 border-y border-element-900/40 bg-gradient-to-b from-element-950/30 to-bunker-950">
          <button
            type="button"
            onClick={chatbot.openChatbot}
            className="block w-full max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl border-2 border-element-700/50 bg-element-950/60 hover:bg-element-900/50 hover:border-element-600/70 transition-all text-left group touch-manipulation"
          >
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-element-900/50 border-2 border-element-600/50 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0 text-element-400">
                <Bot className="w-10 h-10 sm:w-12 sm:h-12" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-zombies text-white tracking-wide">
                  LeKronorium
                </h2>
                <p className="mt-1 sm:mt-2 text-sm sm:text-base text-white/90">
                  Ask our AI anything about the site, maps, rules, easter eggs, and strats. Exclusive zombies knowledge—answers only from what we&apos;ve trained it on.
                </p>
              </div>
              <ChevronRight className="w-8 h-8 text-element-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
            </div>
          </button>
        </section>
      )}

      {/* Tournaments — Promo */}
      <section className="py-8 sm:py-12 px-4 border-y border-blood-900/40 bg-gradient-to-b from-blood-950/30 to-bunker-950">
        <Link
          href="/tournaments"
          className="block max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl border-2 border-blood-700/50 bg-blood-950/60 hover:bg-blood-900/50 hover:border-blood-600/70 transition-all text-left group"
        >
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-blood-900/50 border-2 border-blood-600/50 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
              <Medal className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-zombies text-white tracking-wide">
                Tournaments
              </h2>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-white/90">
                Vote on the next category, submit your run, and compete for gold, silver, and bronze. Top 3 get trophy XP.
              </p>
            </div>
            <ChevronRight className="w-8 h-8 text-white group-hover:translate-x-1 transition-transform flex-shrink-0" />
          </div>
        </Link>
      </section>

      {/* Mystery Box — Big Promo */}
      <section className="py-8 sm:py-12 px-4 border-y border-amber-900/40 bg-gradient-to-b from-amber-950/40 to-bunker-950">
        <Link
          href="/mystery-box"
          prefetch={false}
          className="block max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl border-2 border-amber-700/50 bg-amber-950/60 hover:bg-amber-900/50 hover:border-amber-600/70 transition-all text-left group"
        >
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-amber-900/50 border-2 border-amber-600/50 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
              <MysteryBoxIcon className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-zombies text-amber-100 tracking-wide">
                Mystery Box
              </h2>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-amber-200/80">
                Spin for random challenges. Invite friends, spin together, complete runs for bonus XP. 3 tokens to start—1 per 24h.
              </p>
            </div>
            <ChevronRight className="w-8 h-8 text-amber-500 group-hover:translate-x-1 transition-transform flex-shrink-0" />
          </div>
        </Link>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24 bg-bunker-950 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-zombies text-white tracking-wide">
              Guides, Leaderboards & Community
            </h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-bunker-400 max-w-2xl mx-auto">
              Step-by-step Easter egg guides, buildables, challenges, and speedruns across WAW, BO1–7, IW, WW2, AW, Vanguard, and MW2. Log runs with proof, co-op with your squad, get verified, and find teammates.
            </p>
          </div>

          {authReady && user && openLogProgressModal && (
            <div className="mb-8 sm:mb-12">
              <button
                type="button"
                onClick={openLogProgressModal}
                className="w-full p-6 sm:p-8 rounded-xl border-2 border-blood-600/60 bg-blood-950/50 hover:bg-blood-900/60 hover:border-blood-500/80 transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-blood-600/30 border border-blood-600/50 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <PenLine className="w-7 h-7 sm:w-8 sm:h-8 text-blood-400" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-zombies text-white tracking-wide">
                      Log Progress Now
                    </h3>
                    <p className="mt-1 text-sm text-bunker-400">
                      Pick a game and map → log your run with proof, challenges, and squad. Earn XP and climb the leaderboards.
                    </p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-blood-500 group-hover:translate-x-1 transition-transform ml-auto flex-shrink-0" />
                </div>
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
            {features.map((feature) => (
              <div key={feature.title}>
                <Card variant="bordered" className="h-full hover:border-blood-800/50 transition-colors">
                  <CardContent className="p-4 sm:pt-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blood-950/50 border border-blood-800/30 flex items-center justify-center mb-3 sm:mb-4">
                      <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-blood-500" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-white">{feature.title}</h3>
                    <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-bunker-400">{feature.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* More Zombies Tools */}
      <section className="py-14 sm:py-20 bg-bunker-900/80 px-4 border-t border-bunker-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-zombies text-white tracking-wide flex items-center gap-2">
                <Wrench className="w-6 h-6 text-blood-500" />
                More Zombies Tools
              </h2>
              <p className="mt-1 text-sm text-bunker-400">
                Calculators, strategies, and verified records from the community.
              </p>
            </div>
            <Link
              href="/tools"
              className="text-sm font-medium text-blood-400 hover:text-blood-300 transition-colors inline-flex items-center gap-1"
            >
              View all
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <a
              href="https://www.zombacus.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <div className="p-4 sm:p-5 rounded-xl bg-bunker-800/60 border border-bunker-700/60 hover:border-element-700/50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-element-400 transition-colors">
                      Zombacus
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-bunker-400">
                      Calculators, strategies & guides, drop cycle tracker, camo tracker, and more.
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-bunker-500 group-hover:text-element-400 flex-shrink-0 mt-0.5" />
                </div>
              </div>
            </a>
            <a
              href="https://zwr.gg/"
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <div className="p-4 sm:p-5 rounded-xl bg-bunker-800/60 border border-bunker-700/60 hover:border-blood-700/50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-blood-400 transition-colors">
                      ZWR
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-bunker-400">
                      Official Zombies World Records—verified high scores and leaderboards.
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-bunker-500 group-hover:text-blood-400 flex-shrink-0 mt-0.5" />
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-bunker-900 relative overflow-hidden px-4">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blood-700/40 to-transparent" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blood-950/50 border border-blood-800/30 rounded-full text-blood-400 text-xs sm:text-sm mb-4 sm:mb-6">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              CoD Zombies Tracker
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-zombies text-white tracking-wide">
              Start Completing Every Easter Egg
            </h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-bunker-400">
              Free account. Easter egg guides, challenges, speedruns, XP and ranks. Log runs with squad, get verified, customize your maps and profile.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col min-[780px]:flex-row items-center justify-center gap-3">
              {!authReady ? (
                <>
                  <div className="h-12 sm:h-11 rounded-lg bg-bunker-800/60 border border-bunker-700/60 min-w-[160px]" aria-hidden />
                  <Link href="/maps">
                    <Button size="lg" variant="secondary" rightIcon={<ChevronRight className="w-5 h-5" />} className="[text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">
                      Browse Maps
                    </Button>
                  </Link>
                </>
              ) : user ? (
                <>
                  {openLogProgressModal && (
                    <Button
                      size="lg"
                      onClick={openLogProgressModal}
                      rightIcon={<PenLine className="w-5 h-5" />}
                      className="bg-blood-600 hover:bg-blood-500 text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]"
                    >
                      Log Progress
                    </Button>
                  )}
                  <Link href="/maps">
                    <Button size="lg" variant="secondary" rightIcon={<ChevronRight className="w-5 h-5" />} className="[text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">
                      Browse Maps
                    </Button>
                  </Link>
                </>
              ) : (
                <Button
                  size="lg"
                  onClick={signInWithGoogle}
                  rightIcon={<ChevronRight className="w-5 h-5" />}
                >
                  Sign Up with Google
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
