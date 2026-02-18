'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/auth-context';
import { Button, Logo, MapIcon } from '@/components/ui';
import { UserWithRank } from '@/components/game';
import { Menu, X, LogOut, User, Settings, Trophy, LayoutDashboard, Users, Wrench } from 'lucide-react';

export function Navbar() {
  const { user, profile, isLoading, signInWithGoogle, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /* SEO & UX: Maps first (primary content), then Leaderboards, Find Group, Dashboard when logged in */
  const baseNavLinks = [
    { href: '/maps', label: 'Maps', icon: MapIcon },
    { href: '/leaderboards', label: 'Leaderboards', icon: Trophy },
    { href: '/find-group', label: 'Find Group', icon: Users },
    { href: '/tools', label: 'Tools', icon: Wrench },
  ];
  const dashboardHref = user && profile?.username ? `/users/${profile.username}` : null;
  const navLinks = dashboardHref
    ? [...baseNavLinks, { href: dashboardHref, label: 'Dashboard', icon: LayoutDashboard }]
    : baseNavLinks;

  const linkClass =
    'px-3.5 py-2.5 text-sm font-medium font-zombies text-bunker-200 hover:text-white hover:bg-white/5 transition-colors rounded-lg border border-transparent hover:border-bunker-600/60 tracking-wide';

  return (
    <nav className="navbar-creative sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo + text: horizontally and vertically centered */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 min-h-[2.5rem]">
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

          {/* Desktop Navigation: Maps, Leaderboards, Find Group, Tools, Dashboard (when logged in) */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/maps" className={linkClass}>
              Maps
            </Link>
            <Link href="/leaderboards" className={linkClass}>
              Leaderboards
            </Link>
            <Link href="/find-group" className={linkClass}>
              Find Group
            </Link>
            <Link href="/tools" className={linkClass}>
              Tools
            </Link>
            {dashboardHref ? (
              <Link href={dashboardHref} className={linkClass}>
                Dashboard
              </Link>
            ) : null}
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-bunker-800 animate-pulse" />
            ) : user && profile ? (
              <div className="relative inline-flex flex-col items-end">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-bunker-800/50 transition-colors"
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
            ) : (
              <Button size="sm" onClick={signInWithGoogle}>
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white hover:text-blood-400 hover:bg-bunker-800/50 rounded-lg transition-colors"
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
                  <link.icon className="w-5 h-5 flex-shrink-0" />
                  {link.label}
                </Link>
              ))}
              
              {user ? (
                <>
                  <hr className="border-bunker-700 my-2" />
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
