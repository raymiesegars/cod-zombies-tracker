import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { TournamentStatus } from '@prisma/client';
import { getUser } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

/** GET: One tournament with full config (for log form and display). */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        game: { select: { id: true, shortName: true, name: true } },
        map: { select: { id: true, name: true, slug: true } },
        challenge: { select: { id: true, name: true, type: true, slug: true } },
        easterEgg: { select: { id: true, name: true, type: true, slug: true } },
      },
    });
    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }
    const isOpen = tournament.status === TournamentStatus.OPEN && new Date() < tournament.endsAt;
    return NextResponse.json({
      ...tournament,
      isOpen,
    });
  } catch (error) {
    console.error('Error fetching tournament:', error);
    return NextResponse.json({ error: 'Failed to fetch tournament' }, { status: 500 });
  }
}

/** PATCH: Update tournament (super admin only). Body: { endNow: true } to lock tournament immediately. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const me = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { id: true },
    });
    if (!me || !isSuperAdmin(me.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    if (body.endNow === true) {
      const now = new Date();
      await prisma.tournament.update({
        where: { id },
        data: { status: TournamentStatus.LOCKED, endsAt: now },
      });
      const updated = await prisma.tournament.findUnique({
        where: { id },
        include: {
          game: { select: { id: true, shortName: true, name: true } },
          map: { select: { id: true, name: true, slug: true } },
          challenge: { select: { id: true, name: true, type: true, slug: true } },
          easterEgg: { select: { id: true, name: true, type: true, slug: true } },
        },
      });
      return NextResponse.json({ ...updated, isOpen: false });
    }

    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  } catch (error) {
    console.error('Error updating tournament:', error);
    return NextResponse.json({ error: 'Failed to update tournament' }, { status: 500 });
  }
}

/** DELETE: Remove tournament (super admin only, ended tournaments only). Cascades to logs and trophies. */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const me = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { id: true },
    });
    if (!me || !isSuperAdmin(me.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      select: { id: true, status: true, endsAt: true },
    });
    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }

    const now = new Date();
    const isEnded = tournament.status === TournamentStatus.LOCKED || new Date(tournament.endsAt) < now;
    if (!isEnded) {
      return NextResponse.json({ error: 'Can only delete ended tournaments' }, { status: 400 });
    }

    await prisma.tournament.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('Error deleting tournament:', error);
    return NextResponse.json({ error: 'Failed to delete tournament' }, { status: 500 });
  }
}
