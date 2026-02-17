import type { Metadata } from 'next';
import prisma from '@/lib/prisma';

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://codzombiestracker.com';
const baseUrl = BASE.replace(/\/$/, '');

type Props = { params: { username: string }; children: React.ReactNode };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    select: { displayName: true, username: true, isPublic: true },
  });

  const name = user?.displayName || user?.username || params.username;
  const title = user ? `${name} - CoD Zombies Tracker Profile` : 'User Not Found';
  const description = user?.isPublic !== false
    ? `View ${name}'s CoD Zombies progress: maps played, Easter eggs completed, high rounds, achievements and rank.`
    : 'User profile on CoD Zombies Tracker.';

  return {
    title,
    description,
    openGraph: {
      title: user ? `${name} | CoD Zombies Tracker` : 'User Not Found',
      description,
      type: 'profile',
      url: `${baseUrl}/users/${params.username}`,
    },
    robots: user?.isPublic === false ? { index: false, follow: false } : undefined,
    alternates: { canonical: `${baseUrl}/users/${params.username}` },
  };
}

export default function UserLayout({ children }: Props) {
  return children;
}
