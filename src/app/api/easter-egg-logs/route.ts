import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { processMapAchievements } from '@/lib/achievements';
import { normalizeProofUrls, validateProofUrl } from '@/lib/utils';

// Log an EE completion (new run each time). Main-quest XP once per user per EE.
export async function POST(request: NextRequest) {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      easterEggId,
      mapId,
      roundCompleted,
      playerCount,
      isSolo,
      isNoGuide,
      proofUrl,
      proofUrls: bodyProofUrls,
      screenshotUrl,
      notes,
    } = body;
    const rawProofUrls = Array.isArray(bodyProofUrls)
      ? bodyProofUrls
      : proofUrl != null
        ? [proofUrl]
        : [];
    for (const u of rawProofUrls) {
      const err = validateProofUrl(String(u));
      if (err) return NextResponse.json({ error: `Proof URL: ${err}` }, { status: 400 });
    }
    const proofUrls = normalizeProofUrls(rawProofUrls.map(String));
    const completionTimeSeconds = body.completionTimeSeconds != null && Number.isFinite(Number(body.completionTimeSeconds))
      ? Math.max(0, Math.floor(Number(body.completionTimeSeconds)))
      : null;

    if (!easterEggId || !mapId || !playerCount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const log = await prisma.easterEggLog.create({
      data: {
        userId: user.id,
        easterEggId,
        mapId,
        roundCompleted,
        playerCount,
        isSolo,
        isNoGuide,
        proofUrls,
        screenshotUrl,
        notes,
        completionTimeSeconds,
      },
    });

    // Main quest = one-time XP; we track so we don’t double-award
    const newlyUnlocked = await processMapAchievements(user.id, mapId);
    const xpGained = newlyUnlocked.reduce((sum, a) => sum + a.xpReward, 0);
    const totalXp =
      xpGained > 0
        ? (await prisma.user.findUnique({ where: { id: user.id }, select: { totalXp: true } }))?.totalXp ?? undefined
        : undefined;

    // Bump level if they crossed a threshold
    if (xpGained > 0) {
      const { getLevelFromXp } = await import('@/lib/ranks');
      const updated = await prisma.user.findUnique({ where: { id: user.id }, select: { totalXp: true, level: true } });
      if (updated) {
        const { level } = getLevelFromXp(updated.totalXp);
        if (level !== updated.level) {
          await prisma.user.update({ where: { id: user.id }, data: { level } });
        }
      }
    }

    return NextResponse.json({
      ...log,
      xpGained,
      newlyUnlockedAchievements: newlyUnlocked.length,
      ...(totalXp != null && { totalXp }),
    });
  } catch (error) {
    console.error('Error creating Easter Egg log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// List EE logs. ?userId / ?mapId to filter.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const mapId = searchParams.get('mapId');

  try {
    const logs = await prisma.easterEggLog.findMany({
      where: {
        ...(userId && { userId }),
        ...(mapId && { mapId }),
      },
      include: {
        easterEgg: true,
        map: true,
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            avatarPreset: true,
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching Easter Egg logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
