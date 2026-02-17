import prisma from '@/lib/prisma';
import { MapsPageClient } from './MapsPageClient';
import type { MapWithGame, Game } from '@/types';

export const revalidate = 300;

export default async function MapsPage() {
  const [maps, games] = await Promise.all([
    prisma.map.findMany({
      include: { game: true },
      orderBy: [
        { game: { order: 'asc' } },
        { order: 'asc' },
        { name: 'asc' },
      ],
    }),
    prisma.game.findMany({
      orderBy: { order: 'asc' },
    }),
  ]);

  return (
    <MapsPageClient
      initialMaps={maps as MapWithGame[]}
      initialGames={games as Game[]}
    />
  );
}
