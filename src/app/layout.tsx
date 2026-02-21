import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/context/auth-context';
import { XpToastProvider } from '@/context/xp-toast-context';
import { Navbar, Footer, BackToTop, TVRoomBackground, MusicPlayer, AuthLayoutWrapper, FriendsListWidget } from '@/components/layout';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://codzombiestracker.com';
const BASE = SITE_URL.replace(/\/$/, '');

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: 'CoD Zombies Tracker – Easter Egg Guides, High Round Leaderboards, Speedruns & Find Group',
    template: '%s | CoD Zombies Tracker',
  },
  description:
    'Free, open source CoD Zombies tracker: Easter egg guides, high round and speedrun leaderboards, find group, log runs with proof, achievements and XP. No ads, no paywalls—tips help keep it running.',
  keywords: [
    'Call of Duty Zombies',
    'CoD Zombies',
    'Treyarch Zombies',
    'Easter egg guide',
    'Zombies Easter egg',
    'main quest guide',
    'high round',
    'Zombies leaderboard',
    'Zombies speedrun',
    'find group Zombies',
    'LFG CoD Zombies',
    'looking for group Zombies Easter egg',
    'find people to do Zombies Easter eggs',
    'Zombies Easter egg teammates',
    'Black Ops Zombies',
    'WAW Zombies',
    'BO1 BO2 BO3 BO4 BOCW BO6 BO7 Zombies',
    'Zombies progress tracker',
    'Zombies achievements',
    'Easter egg speedrun',
    'No Downs',
    'Zombies squad',
    'free Zombies tracker',
    'open source Zombies',
    'step by step Easter egg',
    'Zombies buildables guide',
  ],
  authors: [{ name: 'CoD Zombies Tracker', url: BASE }],
  creator: 'CoD Zombies Tracker',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'CoD Zombies Tracker',
    title: 'CoD Zombies Tracker – Easter Egg Guides, Leaderboards, Find Group & Progress',
    description: 'Free, open source. Easter egg guides, leaderboards, find group, log runs. No ads; tips help keep the site running.',
    url: BASE,
    images: [{ url: '/images/og-default.png', width: 1200, height: 630, alt: 'CoD Zombies Tracker' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CoD Zombies Tracker – Easter Egg Guides, Leaderboards & Find Group',
    description: 'Free, open source CoD Zombies tracker. Easter egg guides, leaderboards, find group, progress tracking. No ads.',
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
      { url: '/icon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/icon-48.png', sizes: '48x48', type: 'image/png' }],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${BASE}/#website`,
      url: BASE,
      name: 'CoD Zombies Tracker',
      description: 'Free, open source CoD Zombies tracker. Easter egg guides, high round and speedrun leaderboards, find group, progress tracking. No monetization, no ads; built to stay around.',
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
      description: 'Free, open source. CoD Zombies Easter egg guides, leaderboards, find group, progress tracking. No ads.',
    },
    {
      '@type': 'WebApplication',
      name: 'CoD Zombies Tracker',
      url: BASE,
      applicationCategory: 'GameApplication',
      description: 'Free, open source. Track Easter eggs, high rounds, speedruns, achievements. Find groups, log runs, climb leaderboards. No ads.',
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
              <AuthLayoutWrapper>
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
                <BackToTop />
                <FriendsListWidget variant="floating" />
              </AuthLayoutWrapper>
            </XpToastProvider>
          </AuthProvider>
        </div>
        <MusicPlayer />
      </body>
    </html>
  );
}
