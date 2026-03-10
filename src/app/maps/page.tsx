import prisma from '@/lib/prisma';
import { MapsPageClient } from './MapsPageClient';
import type { MapWithGame, Game } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MapsPage({
  searchParams,
}: {
  searchParams: Promise<{ submitMap?: string }> | { submitMap?: string };
}) {
  const params = await Promise.resolve(searchParams);
  const openSubmit = params?.submitMap === '1';

  const [maps, games] = await Promise.all([
    prisma.map.findMany({
      include: { game: true },
      orderBy: [
        { game: { order: 'asc' } },
        { order: 'asc' },
        { name: 'asc' },
      ],
    }),
    prisma.game.findMany({ orderBy: { order: 'asc' } }),
  ]);

  return (
    <MapsPageClient
      initialMaps={maps as MapWithGame[]}
      initialGames={games as Game[]}
      openSubmitModal={openSubmit}
    />
  );
}
