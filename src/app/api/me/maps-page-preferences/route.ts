import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export type MapsPagePreferences = {
  gameOrder: string[];
  hasSeenSetupModal?: boolean;
};

function parsePreferences(raw: unknown): MapsPagePreferences | null {
  if (raw == null || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const gameOrder = o.gameOrder;
  if (!Array.isArray(gameOrder) || !gameOrder.every((x) => typeof x === 'string')) return null;
  const hasSeenSetupModal = o.hasSeenSetupModal;
  return {
    gameOrder,
    hasSeenSetupModal: typeof hasSeenSetupModal === 'boolean' ? hasSeenSetupModal : undefined,
  };
}

export async function GET() {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) {
      return NextResponse.json({ gameOrder: [], hasSeenSetupModal: false });
    }

    const user = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { mapsPagePreferences: true },
    });

    if (!user?.mapsPagePreferences) {
      return NextResponse.json({ gameOrder: [], hasSeenSetupModal: false });
    }

    const prefs = parsePreferences(user.mapsPagePreferences);
    if (!prefs) {
      return NextResponse.json({ gameOrder: [], hasSeenSetupModal: false });
    }

    return NextResponse.json({
      gameOrder: prefs.gameOrder ?? [],
      hasSeenSetupModal: prefs.hasSeenSetupModal ?? false,
    });
  } catch (error) {
    console.error('GET /api/me/maps-page-preferences', error);
    return NextResponse.json({ gameOrder: [], hasSeenSetupModal: false });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const gameOrder = Array.isArray(body.gameOrder) && body.gameOrder.every((x: unknown) => typeof x === 'string')
      ? (body.gameOrder as string[])
      : undefined;
    const hasSeenSetupModal = typeof body.hasSeenSetupModal === 'boolean' ? body.hasSeenSetupModal : undefined;

    const user = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { id: true, mapsPagePreferences: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const current = parsePreferences(user.mapsPagePreferences);
    const next: MapsPagePreferences = {
      gameOrder: gameOrder ?? current?.gameOrder ?? [],
      hasSeenSetupModal: hasSeenSetupModal ?? current?.hasSeenSetupModal,
    };

    await prisma.user.update({
      where: { id: user.id },
      data: { mapsPagePreferences: next as object },
    });

    return NextResponse.json({
      gameOrder: next.gameOrder,
      hasSeenSetupModal: next.hasSeenSetupModal ?? false,
    });
  } catch (error) {
    console.error('PATCH /api/me/maps-page-preferences', error);
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}
