'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Card, CardContent, Logo, EasterEggIcon, MapIcon } from '@/components/ui';
import { PendingCoOpSection } from '@/components/game';
import { useAuth } from '@/context/auth-context';
import { Trophy, Target, Users, ChevronRight, Wrench, ExternalLink } from 'lucide-react';

const features = [
  {
    icon: EasterEggIcon,
    title: 'Full Easter Egg Guides & Tracking',
    description: 'Step-by-step guides for every map: main quests, musical eggs, and side Easter eggs. Track which steps you’ve done and log full completions.',
  },
  {
    icon: MapIcon,
    title: 'Every Map Covered',
    description: 'From World at War to Black Ops 6—every Treyarch Zombies map with full Easter egg coverage and progress tracking.',
  },
  {
    icon: Target,
    title: 'Challenges',
    description: 'No Downs, Pistol Only, Starting Room, and more. Log rounds and compete on challenges.',
  },
  {
    icon: Trophy,
    title: 'Leaderboards',
    description: 'Climb the ranks in Solo, Duo, Trio, or Squad. See who’s on top for every map.',
  },
];

const statsConfig: { label: string; value?: string; key?: 'maps' }[] = [
  { label: 'Maps', key: 'maps' },
  { label: 'Challenge Types', value: '10+' },
  { label: 'Achievements', value: '100+' },
];

export default function HomePage() {
  const { user, profile, signInWithGoogle } = useAuth();
  const [mapCount, setMapCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/maps')
      .then((res) => res.json())
      .then((data) => setMapCount(Array.isArray(data) ? data.length : 0))
      .catch(() => setMapCount(0));
  }, []);

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
              Step-by-step Easter egg guides and progress tracking for every map. Main quests, musical eggs, side eggs—all in one place. Log completions, find teammates for Easter eggs, and climb leaderboards.
            </p>

            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              {user ? (
                <>
                  <Link href="/maps" className="w-full sm:w-auto">
                    <Button size="lg" rightIcon={<ChevronRight className="w-5 h-5" />} className="w-full sm:w-auto [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">
                      Browse Maps
                    </Button>
                  </Link>
                  {profile?.username && (
                    <Link href={`/users/${profile.username}`} className="w-full sm:w-auto">
                      <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                        View Profile
                      </Button>
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    onClick={signInWithGoogle}
                    rightIcon={<ChevronRight className="w-5 h-5" />}
                    className="w-full sm:w-auto"
                  >
                    Get Started
                  </Button>
                  <Link href="/maps" className="w-full sm:w-auto">
                    <Button variant="secondary" size="lg" className="w-full sm:w-auto [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]">
                      Browse Maps
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {user && (
              <div className="mt-8 sm:mt-10 max-w-3xl mx-auto">
                <PendingCoOpSection />
              </div>
            )}
          </div>

          {/* Stats - 3 only: Maps (actual count), Challenge Types, Achievements */}
          <div className="mt-16 sm:mt-20 grid grid-cols-3 gap-1 sm:gap-3">
            {statsConfig.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl sm:text-3xl md:text-4xl font-zombies text-blood-400">
                  {stat.key === 'maps' ? (mapCount ?? '—') : (stat.value ?? '')}
                </p>
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-bunker-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 hidden sm:block">
          <div className="w-6 h-10 border-2 border-blood-800/40 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-blood-700 rounded-full" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-bunker-950 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-zombies text-white tracking-wide">
              Guides & Tracking for Every Map
            </h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-bunker-400 max-w-2xl mx-auto">
              Full Easter egg guides—main quest, musical, and side—with step-by-step instructions and progress tracking on every Treyarch Zombies map. Find teammates for Easter eggs on the Find Group page.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
              Free account. Full guides and step tracking for main quests, musical eggs, and side eggs on every map.
            </p>
            <div className="mt-6 sm:mt-8">
              {user ? (
                <Link href="/maps">
                  <Button size="lg" rightIcon={<ChevronRight className="w-5 h-5" />} className="[text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">
                    Browse Maps
                  </Button>
                </Link>
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
