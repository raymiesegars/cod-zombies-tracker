import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { revokeAchievementsForMapAfterDelete } from '@/lib/achievements';
import { getLevelFromXp } from '@/lib/ranks';

type Params = { params: Promise<{ id: string }> };

async function getLogAndUser(id: string) {
  const supabaseUser = await getUser();
  if (!supabaseUser) return { error: 'Unauthorized' as const, status: 401 as const };
  const user = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
  });
  if (!user) return { error: 'User not found' as const, status: 404 as const };
  const log = await prisma.easterEggLog.findUnique({
    where: { id },
    include: {
      easterEgg: true,
      map: { include: { game: true } },
    },
  });
  if (!log || log.userId !== user.id) return { error: 'Not found' as const, status: 404 as const };
  return { log, user };
}

// Get your EE log
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const result = await getLogAndUser(id);
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json(result.log);
  } catch (error) {
    console.error('Error fetching Easter Egg log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update your EE log
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const result = await getLogAndUser(id);
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status });

    const body = await request.json();
    const roundCompleted = body.roundCompleted !== undefined
      ? (body.roundCompleted == null ? null : (typeof body.roundCompleted === 'number' ? body.roundCompleted : parseInt(String(body.roundCompleted), 10)))
      : undefined;
    const playerCount = body.playerCount;
    const isSolo = body.isSolo;
    const isNoGuide = body.isNoGuide;
    const proofUrl = body.proofUrl !== undefined ? body.proofUrl : undefined;
    const screenshotUrl = body.screenshotUrl !== undefined ? body.screenshotUrl : undefined;
    const notes = body.notes !== undefined ? body.notes : undefined;
    const completionTimeSeconds = body.completionTimeSeconds !== undefined
      ? (body.completionTimeSeconds != null && Number.isFinite(Number(body.completionTimeSeconds)) ? Math.max(0, Math.floor(Number(body.completionTimeSeconds))) : null)
      : undefined;

    const updated = await prisma.easterEggLog.update({
      where: { id },
      data: {
        ...(roundCompleted !== undefined && { roundCompleted }),
        ...(playerCount !== undefined && { playerCount }),
        ...(isSolo !== undefined && { isSolo }),
        ...(isNoGuide !== undefined && { isNoGuide }),
        ...(proofUrl !== undefined && { proofUrl }),
        ...(screenshotUrl !== undefined && { screenshotUrl }),
        ...(notes !== undefined && { notes }),
        ...(completionTimeSeconds !== undefined && { completionTimeSeconds }),
      },
      include: {
        easterEgg: true,
        map: { include: { game: true } },
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating Easter Egg log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete your log; revoke main-quest XP if we gave it, then revoke any achievements that depended on it
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const result = await getLogAndUser(id);
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status });
    const { log, user } = result;
    const mapId = log.mapId;
    const easterEggId = log.easterEggId;

    const ee = await prisma.easterEgg.findUnique({
      where: { id: easterEggId },
      select: { type: true, xpReward: true },
    });
    let mainQuestXpRemoved = 0;
    if (ee?.type === 'MAIN_QUEST' && (ee.xpReward ?? 0) > 0) {
      const awarded = await prisma.mainEasterEggXpAwarded.findUnique({
        where: { userId_easterEggId: { userId: user.id, easterEggId } },
      });
      if (awarded) {
        await prisma.mainEasterEggXpAwarded.delete({
          where: { userId_easterEggId: { userId: user.id, easterEggId } },
        });
        mainQuestXpRemoved = ee.xpReward ?? 0;
        await prisma.user.update({
          where: { id: user.id },
          data: { totalXp: { decrement: mainQuestXpRemoved } },
        });
      }
    }

    await prisma.easterEggLog.delete({ where: { id } });
    const { xpSubtracted } = await revokeAchievementsForMapAfterDelete(user.id, mapId);
    const totalXpRemoved = mainQuestXpRemoved + xpSubtracted;

    const updated = await prisma.user.findUnique({ where: { id: user.id }, select: { totalXp: true, level: true } });
    if (updated) {
      const newTotalXp = Math.max(0, updated.totalXp);
      if (newTotalXp !== updated.totalXp) {
        await prisma.user.update({ where: { id: user.id }, data: { totalXp: newTotalXp } });
      }
      const { level } = getLevelFromXp(newTotalXp);
      if (level !== updated.level) {
        await prisma.user.update({ where: { id: user.id }, data: { level } });
      }
    }

    return NextResponse.json({
      deleted: true,
      xpSubtracted: totalXpRemoved,
    });
  } catch (error) {
    console.error('Error deleting Easter Egg log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
