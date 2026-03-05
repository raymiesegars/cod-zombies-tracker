import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type VerifiedEntry = {
  logType: 'challenge' | 'easter_egg';
  logId: string;
  mapSlug: string;
  mapName: string;
  runLabel: string;
  verifiedAt: string;
  verifiedBy: { id: string; username: string; displayName: string | null };
};

export async function GET() {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const me = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { id: true, isAdmin: true },
    });
    if (!me || !me.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const [challengeLogs, eeLogs] = await Promise.all([
      prisma.challengeLog.findMany({
        where: { isVerified: true, verifiedAt: { not: null }, verifiedById: { not: null } },
        include: {
          verifiedBy: { select: { id: true, username: true, displayName: true } },
          challenge: { select: { name: true } },
          map: { select: { slug: true, name: true } },
        },
        orderBy: { verifiedAt: 'desc' },
        take: 500,
      }),
      prisma.easterEggLog.findMany({
        where: { isVerified: true, verifiedAt: { not: null }, verifiedById: { not: null } },
        include: {
          verifiedBy: { select: { id: true, username: true, displayName: true } },
          easterEgg: { select: { name: true } },
          map: { select: { slug: true, name: true } },
        },
        orderBy: { verifiedAt: 'desc' },
        take: 500,
      }),
    ]);

    const entries: VerifiedEntry[] = [];

    for (const log of challengeLogs) {
      if (!log.verifiedAt || !log.verifiedBy) continue;
      entries.push({
        logType: 'challenge',
        logId: log.id,
        mapSlug: log.map.slug,
        mapName: log.map.name,
        runLabel: `${log.challenge.name} – Round ${log.roundReached}`,
        verifiedAt: log.verifiedAt.toISOString(),
        verifiedBy: {
          id: log.verifiedBy.id,
          username: log.verifiedBy.username,
          displayName: log.verifiedBy.displayName,
        },
      });
    }
    for (const log of eeLogs) {
      if (!log.verifiedAt || !log.verifiedBy) continue;
      entries.push({
        logType: 'easter_egg',
        logId: log.id,
        mapSlug: log.map.slug,
        mapName: log.map.name,
        runLabel: log.easterEgg.name,
        verifiedAt: log.verifiedAt.toISOString(),
        verifiedBy: {
          id: log.verifiedBy.id,
          username: log.verifiedBy.username,
          displayName: log.verifiedBy.displayName,
        },
      });
    }

    entries.sort((a, b) => new Date(b.verifiedAt).getTime() - new Date(a.verifiedAt).getTime());

    return NextResponse.json({ entries: entries.slice(0, 300) });
  } catch (error) {
    console.error('Error fetching verification history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
