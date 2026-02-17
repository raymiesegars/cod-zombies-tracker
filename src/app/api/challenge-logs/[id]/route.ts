import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { revokeAchievementsForMapAfterDelete } from '@/lib/achievements';

type Params = { params: Promise<{ id: string }> };

async function getLogAndUser(id: string) {
  const supabaseUser = await getUser();
  if (!supabaseUser) return { error: 'Unauthorized' as const, status: 401 as const };
  const user = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
  });
  if (!user) return { error: 'User not found' as const, status: 404 as const };
  const log = await prisma.challengeLog.findUnique({
    where: { id },
    include: {
      challenge: true,
      map: { include: { game: true } },
    },
  });
  if (!log || log.userId !== user.id) return { error: 'Not found' as const, status: 404 as const };
  return { log, user };
}

// Get log: owner always; others can view if log owner's profile is public
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const log = await prisma.challengeLog.findUnique({
      where: { id },
      include: {
        challenge: true,
        map: { include: { game: true } },
        user: { select: { id: true, isPublic: true, username: true, displayName: true } },
      },
    });
    if (!log) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const supabaseUser = await getUser();
    const currentUser = supabaseUser
      ? await prisma.user.findUnique({ where: { supabaseId: supabaseUser.id }, select: { id: true } })
      : null;
    const isOwner = currentUser && log.userId === currentUser.id;
    if (!isOwner && !log.user.isPublic) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { user: u, ...logWithoutUser } = log;
    return NextResponse.json({
      ...logWithoutUser,
      isOwner: isOwner ?? false,
      runOwnerUsername: u.username ?? undefined,
      runOwnerDisplayName: u.displayName ?? u.username ?? undefined,
    });
  } catch (error) {
    console.error('Error fetching challenge log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update round, proof, notes, etc.
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const result = await getLogAndUser(id);
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status });
    const { log, user } = result;

    const body = await request.json();
    const roundReached = body.roundReached != null ? (typeof body.roundReached === 'number' ? body.roundReached : parseInt(String(body.roundReached), 10)) : undefined;
    const playerCount = body.playerCount;
    const proofUrl = body.proofUrl !== undefined ? body.proofUrl : undefined;
    const screenshotUrl = body.screenshotUrl !== undefined ? body.screenshotUrl : undefined;
    const notes = body.notes !== undefined ? body.notes : undefined;
    const completionTimeSeconds = body.completionTimeSeconds !== undefined
      ? (body.completionTimeSeconds != null && Number.isFinite(Number(body.completionTimeSeconds)) ? Math.max(0, Math.floor(Number(body.completionTimeSeconds))) : null)
      : undefined;

    if (roundReached !== undefined && (Number.isNaN(roundReached) || roundReached < 1)) {
      return NextResponse.json({ error: 'Invalid roundReached' }, { status: 400 });
    }

    const updated = await prisma.challengeLog.update({
      where: { id },
      data: {
        ...(roundReached !== undefined && { roundReached }),
        ...(playerCount !== undefined && { playerCount }),
        ...(proofUrl !== undefined && { proofUrl }),
        ...(screenshotUrl !== undefined && { screenshotUrl }),
        ...(notes !== undefined && { notes }),
        ...(completionTimeSeconds !== undefined && { completionTimeSeconds }),
      },
      include: {
        challenge: true,
        map: { include: { game: true } },
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating challenge log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete your log; we revoke any achievements that depended on it and subtract XP
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const result = await getLogAndUser(id);
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status });
    const { log, user } = result;
    const mapId = log.mapId;

    await prisma.challengeLog.delete({ where: { id } });
    const { xpSubtracted } = await revokeAchievementsForMapAfterDelete(user.id, mapId);

    return NextResponse.json({
      deleted: true,
      xpSubtracted,
    });
  } catch (error) {
    console.error('Error deleting challenge log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
