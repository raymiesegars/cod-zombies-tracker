import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';

/** GET /api/users/[username]/runs?limit=25&offset=0&verified=all|true|false
 * Returns paginated challenge + EE logs for a user. verified=all (default) | true (verified only) | false (unverified only).
 * User must be public unless viewing own profile.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '25', 10) || 25));
    const offset = Math.max(0, parseInt(searchParams.get('offset') ?? '0', 10) || 0);
    const verifiedParam = searchParams.get('verified'); // 'all' | 'true' | 'false'

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true, isPublic: true },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const supabaseUser = await getUser();
    const currentUser = supabaseUser
      ? await prisma.user.findUnique({ where: { supabaseId: supabaseUser.id }, select: { id: true } })
      : null;
    const isOwnProfile = currentUser && currentUser.id === user.id;
    if (!user.isPublic && !isOwnProfile) {
      return NextResponse.json({ error: 'Profile is private' }, { status: 403 });
    }

    const challengeWhere: { userId: string; isVerified?: boolean } = { userId: user.id };
    const eeWhere: { userId: string; isVerified?: boolean } = { userId: user.id };
    if (verifiedParam === 'true') {
      challengeWhere.isVerified = true;
      eeWhere.isVerified = true;
    } else if (verifiedParam === 'false') {
      challengeWhere.isVerified = false;
      eeWhere.isVerified = false;
    }

    const includeChallenge = {
      challenge: { select: { id: true, name: true, type: true } },
      map: { select: { id: true, name: true, slug: true, game: { select: { shortName: true } } } },
    };
    const includeEasterEgg = {
      easterEgg: { select: { id: true, name: true, type: true } },
      map: { select: { id: true, name: true, slug: true, game: { select: { shortName: true } } } },
    };

    const [challengeLogs, easterEggLogs, totalChallenge, totalEe] = await Promise.all([
      prisma.challengeLog.findMany({
        where: challengeWhere,
        include: includeChallenge,
        orderBy: { completedAt: 'desc' },
      }),
      prisma.easterEggLog.findMany({
        where: eeWhere,
        include: includeEasterEgg,
        orderBy: { completedAt: 'desc' },
      }),
      prisma.challengeLog.count({ where: challengeWhere }),
      prisma.easterEggLog.count({ where: eeWhere }),
    ]);
    const total = totalChallenge + totalEe;

    type RunItem = {
      id: string;
      type: 'challenge' | 'easter-egg';
      completedAt: string;
      roundReached?: number;
      roundCompleted?: number | null;
      challenge?: { id: string; name: string; type: string };
      easterEgg?: { id: string; name: string; type: string };
      map: { id: string; name: string; slug: string; game: { shortName: string } | null };
      isVerified: boolean;
    };

    const allRuns: RunItem[] = [
      ...challengeLogs.map((l) => ({
        id: l.id,
        type: 'challenge' as const,
        completedAt: l.completedAt.toISOString(),
        roundReached: l.roundReached,
        challenge: l.challenge,
        map: l.map,
        isVerified: l.isVerified ?? false,
      })),
      ...easterEggLogs.map((l) => ({
        id: l.id,
        type: 'easter-egg' as const,
        completedAt: l.completedAt.toISOString(),
        roundCompleted: l.roundCompleted,
        easterEgg: l.easterEgg,
        map: l.map,
        isVerified: l.isVerified ?? false,
      })),
    ].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

    const paginated = allRuns.slice(offset, offset + limit);

    return NextResponse.json({
      runs: paginated,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching user runs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
