import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/context/auth-context';
import { XpToastProvider } from '@/context/xp-toast-context';
import { LogProgressModalProvider } from '@/context/log-progress-modal-context';
import { Navbar, Footer, BackToTop, TVRoomBackground, MusicPlayer, AuthLayoutWrapper, MessagingWidget } from '@/components/layout';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

// Canonical: https://codzombiestracker.com (no www)
const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://codzombiestracker.com').replace(/^https?:\/\/www\./, 'https://').replace(/\/$/, '');
const BASE = SITE_URL;

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: 'CoD Zombies Tracker – Easter Egg Guides, Leaderboards, Co-op & Verified Runs',
    template: '%s | CoD Zombies Tracker',
  },
  description:
    'Free CoD Zombies tracker: Easter egg guides, challenges, speedruns, leaderboards, co-op logging, verified runs, XP and ranks. WW2, IW, AW, Vanguard, MW2. Find group, friends, messaging. No ads.',
  keywords: [
    'Call of Duty Zombies',
    'CoD Zombies',
    'Zombies tracker',
    'Easter egg guide',
    'Zombies Easter egg',
    'main quest guide',
    'high round',
    'Zombies leaderboard',
    'Zombies speedrun',
    'find group Zombies',
    'LFG CoD Zombies',
    'Co-op Zombies',
    'verified Zombies runs',
    'Black Ops Zombies',
    'WAW BO1 BO2 BO3 BO4 BOCW BO6 BO7',
    'Infinite Warfare Zombies',
    'WW2 Zombies',
    'Vanguard Zombies',
    'MW2 Zombies',
    'Zombies progress tracker',
    'Zombies achievements',
    'Easter egg speedrun',
    'No Downs',
    'Pistol Only',
    'free Zombies tracker',
    'Zombies buildables guide',
  ],
  authors: [{ name: 'CoD Zombies Tracker', url: BASE }],
  creator: 'CoD Zombies Tracker',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'CoD Zombies Tracker',
    title: 'CoD Zombies Tracker – Easter Egg Guides, Leaderboards, Co-op & Verified Runs',
    description: 'Free CoD Zombies tracker. Easter egg guides, challenges, speedruns, leaderboards, co-op logging, verified runs. WW2, IW, AW, Vanguard, MW2. No ads.',
    url: BASE,
    images: [{ url: '/images/og-default.png', width: 1200, height: 630, alt: 'CoD Zombies Tracker' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CoD Zombies Tracker – Easter Egg Guides, Leaderboards & Co-op',
    description: 'Free CoD Zombies tracker. Easter egg guides, challenges, speedruns, co-op logging, verified runs. No ads.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: BASE },
  category: 'games',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-16.png',  sizes: '16x16',  type: 'image/png' },
      { url: '/icon-32.png',  sizes: '32x32',  type: 'image/png' },
      { url: '/icon-48.png',  sizes: '48x48',  type: 'image/png' },
      { url: '/icon-96.png',  sizes: '96x96',  type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icon.svg',     type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${BASE}/#website`,
      url: BASE,
      name: 'CoD Zombies Tracker',
      description: 'Free CoD Zombies tracker. Easter egg guides, challenges, speedruns, leaderboards, co-op logging, verified runs, XP and ranks. WW2, IW, AW, Vanguard, MW2. No ads.',
      potentialAction: [
        { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: `${BASE}/maps?search={search_term_string}` }, 'query-input': 'required name=search_term_string' },
        { '@type': 'ViewAction', target: BASE + '/maps', name: 'Browse Maps' },
        { '@type': 'ViewAction', target: BASE + '/leaderboards', name: 'View Leaderboards' },
        { '@type': 'ViewAction', target: BASE + '/find-group', name: 'Find Group' },
      ],
    },
    {
      '@type': 'Organization',
      name: 'CoD Zombies Tracker',
      url: BASE,
      description: 'Free CoD Zombies tracker. Easter egg guides, challenges, speedruns, leaderboards, co-op, verified runs. No ads.',
    },
    {
      '@type': 'WebApplication',
      name: 'CoD Zombies Tracker',
      url: BASE,
      applicationCategory: 'GameApplication',
      description: 'Free CoD Zombies tracker. Easter egg guides, challenges, speedruns, co-op logging, verified runs, XP and ranks. No ads.',
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col overflow-x-hidden">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <TVRoomBackground />
        <div className="relative z-10 flex flex-col min-h-screen">
          <AuthProvider>
            <XpToastProvider>
              <LogProgressModalProvider>
                <AuthLayoutWrapper>
                  <Navbar />
                  <main className="flex-1">{children}</main>
                <Footer />
                <BackToTop />
                <MessagingWidget />
              </AuthLayoutWrapper>
              </LogProgressModalProvider>
            </XpToastProvider>
          </AuthProvider>
        </div>
        <MusicPlayer />
      </body>
    </html>
  );
}
