'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/auth-context';
import { Button, Logo, MapIcon } from '@/components/ui';
import { UserWithRank } from '@/components/game';
import { NotificationsDropdown } from '@/components/layout/notifications-dropdown';
import { Menu, X, LogOut, User, Settings, Trophy, LayoutDashboard, Users } from 'lucide-react';

const DISCORD_URL = 'https://discord.gg/Gc6Cnt7XxT';
const DISCORD_BLUE = '#5865F2';

const WrenchIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const DiscordIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill={DISCORD_BLUE} xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

export function Navbar() {
  const { user, profile, isLoading, signInWithGoogle, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const dashboardHref = user && profile?.username ? `/users/${profile.username}` : null;
  const linkClass =
    'py-2.5 px-2.5 sm:px-3 text-sm font-medium font-zombies text-bunker-200 hover:text-white hover:bg-white/5 transition-colors rounded-lg border border-transparent hover:border-bunker-600/60 tracking-wide whitespace-nowrap shrink-0';
  const iconOnlyClass =
    'inline-flex items-center justify-center p-2.5 rounded-lg border border-transparent text-bunker-200 hover:text-white hover:bg-white/5 hover:border-bunker-600/60 transition-colors shrink-0';

  const navLinks: { href: string; label: string; icon: React.ComponentType<{ className?: string }>; iconOnly?: boolean }[] = [
    ...(dashboardHref ? [{ href: dashboardHref, label: 'Dashboard', icon: LayoutDashboard }] : []),
    { href: '/maps', label: 'Maps', icon: MapIcon },
    { href: '/leaderboards', label: 'Leaderboards', icon: Trophy },
    { href: '/find-group', label: 'Find Group', icon: Users },
    { href: '/tools', label: 'Tools', icon: WrenchIcon, iconOnly: true },
  ];

  return (
    <nav className="navbar-creative sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto pl-4 sm:pl-5 lg:pl-6 pr-4 sm:pr-6 lg:pr-8">
        <div className="flex items-center justify-between gap-2 h-14 sm:h-16 min-w-0">
          {/* Logo + text: shrink-0 so it never gets cut off */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 min-h-[2.5rem] shrink-0">
            <span className="flex flex-shrink-0 items-center justify-center w-8 h-8 self-center">
              <Logo size="sm" animated={false} className="block w-full h-full" />
            </span>
            <span className="text-lg sm:text-xl font-zombies text-white tracking-wide hidden sm:inline self-center">
              CoD Zombies Tracker
            </span>
            <span className="text-lg font-zombies text-white tracking-wide sm:hidden self-center">
              Zombies Tracker
            </span>
          </Link>

          {/* Desktop Navigation: icon-only below 1440px to avoid cramping; labels show at 1440px+ */}
          <div className="hidden md:flex items-center gap-0.5 min-w-0 shrink">
            {navLinks.map((link) => {
              const Icon = link.icon;
              if (link.iconOnly) {
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={iconOnlyClass}
                    aria-label={link.label}
                  >
                    <Icon className="w-5 h-5 text-current" />
                  </Link>
                );
              }
              return (
                <Link key={link.href} href={link.href} className={`${linkClass} inline-flex items-center gap-1.5`} aria-label={link.label}>
                  <Icon className="w-4 h-4 flex-shrink-0 text-current" />
                  <span className="hidden min-[1440px]:inline">{link.label}</span>
                </Link>
              );
            })}
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={iconOnlyClass}
              aria-label="Join our Discord"
            >
              <DiscordIcon className="w-5 h-5" />
            </a>
          </div>

          {/* Desktop User Menu: min-w-0 so username truncates only when needed; ml-4 spacing from Discord */}
          <div className="hidden md:flex items-center gap-2 min-w-0 ml-4">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-bunker-800 animate-pulse shrink-0" />
            ) : user && profile ? (
              <>
                <NotificationsDropdown />
                <div className="relative inline-flex flex-col items-end min-w-0">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-bunker-800/50 transition-colors min-w-0"
                >
                  <UserWithRank
                    user={{
                      id: profile.id,
                      username: profile.username,
                      displayName: profile.displayName,
                      avatarUrl: profile.avatarUrl,
                      avatarPreset: (profile as { avatarPreset?: string | null }).avatarPreset,
                      level: profile.level,
                      totalXp: profile.totalXp,
                    }}
                    showAvatar={true}
                    showLevel={true}
                    size="sm"
                    linkToProfile={false}
                  />
                </button>

                <AnimatePresence>
                  {isMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsMenuOpen(false)}
                        aria-hidden
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-1.5 min-w-[12rem] w-48 py-2 bg-bunker-900 border border-bunker-700 rounded-lg shadow-xl z-20"
                      >
                        {profile?.username && (
                          <Link
                            href={`/users/${profile.username}`}
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-white hover:text-blood-400 hover:bg-bunker-800/50"
                          >
                            <User className="w-4 h-4" />
                            Profile
                          </Link>
                        )}
                        <Link
                          href="/settings"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-white hover:text-blood-400 hover:bg-bunker-800/50"
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>
                        <hr className="my-2 border-bunker-700" />
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            signOut();
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white hover:text-blood-400 hover:bg-bunker-800/50"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
                </div>
              </>
            ) : (
              <Button size="sm" onClick={signInWithGoogle}>
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile menu button: shrink-0 so it's never cut off; touch target preserved */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden shrink-0 p-2.5 -mr-1 text-white hover:text-blood-400 hover:bg-bunker-800/50 rounded-lg transition-colors touch-manipulation"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-bunker-900/95 border-b border-bunker-800/50"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 min-h-[44px] text-base font-zombies text-white hover:text-blood-400 hover:bg-bunker-800/50 rounded-lg transition-colors tracking-wide touch-manipulation"
                >
                  <link.icon className="w-5 h-5 flex-shrink-0 text-current" />
                  {link.label}
                </Link>
              ))}
              <a
                href={DISCORD_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 min-h-[44px] text-base font-zombies text-white hover:text-blood-400 hover:bg-bunker-800/50 rounded-lg transition-colors tracking-wide touch-manipulation"
                aria-label="Join our Discord"
              >
                <DiscordIcon className="w-5 h-5 flex-shrink-0" />
                Discord
              </a>
              {user ? (
                <>
                  <hr className="border-bunker-700 my-2" />
                  <div className="px-4 py-2">
                    <NotificationsDropdown />
                  </div>
                  {profile?.username && (
                    <Link
                      href={`/users/${profile.username}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 min-h-[44px] text-base text-white hover:text-blood-400 hover:bg-bunker-800/50 rounded-lg transition-colors touch-manipulation"
                    >
                      <User className="w-5 h-5 flex-shrink-0" />
                      Profile
                    </Link>
                  )}
                  <Link
                    href="/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 min-h-[44px] text-base text-white hover:text-blood-400 hover:bg-bunker-800/50 rounded-lg transition-colors touch-manipulation"
                  >
                    <Settings className="w-5 h-5 flex-shrink-0" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      signOut();
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 min-h-[44px] text-left text-base text-white hover:text-blood-400 hover:bg-bunker-800/50 rounded-lg transition-colors touch-manipulation"
                  >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="pt-2">
                  <Button
                    className="w-full"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      signInWithGoogle();
                    }}
                  >
                    Sign In
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
