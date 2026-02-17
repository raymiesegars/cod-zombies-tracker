import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const revalidate = 300; // maps only change on deploy basically

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const gameId = searchParams.get('gameId');
  const isDlc = searchParams.get('isDlc');
  const search = searchParams.get('search');
  const includeEasterEggs = searchParams.get('includeEasterEggs') === 'main';

  try {
    const maps = await prisma.map.findMany({
      where: {
        ...(gameId && { gameId }),
        ...(isDlc !== null && { isDlc: isDlc === 'true' }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        game: true,
        ...(includeEasterEggs && {
          easterEggs: {
            where: { type: 'MAIN_QUEST', isActive: true },
            select: { id: true, name: true, slug: true },
            orderBy: { slug: 'asc' },
          },
        }),
      },
      orderBy: [
        { game: { order: 'asc' } },
        { order: 'asc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json(maps, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=300' },
    });
  } catch (error) {
    console.error('Error fetching maps:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
