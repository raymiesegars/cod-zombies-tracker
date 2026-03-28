import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { TournamentStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

/** GET: Returns the most recent OPEN tournament (for announcement popup). */
export async function GET() {
  try {
    const now = new Date();
    const tournament = await prisma.tournament.findFirst({
      where: {
        status: TournamentStatus.OPEN,
        endsAt: { gt: now },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        endsAt: true,
        map: { select: { slug: true } },
      },
    });
    return NextResponse.json(tournament ? { tournament: { id: tournament.id, title: tournament.title } } : { tournament: null });
  } catch (error) {
    console.error('Error fetching active open tournament:', error);
    return NextResponse.json({ tournament: null });
  }
}
