import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getOptionalUserFromSession } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/admin';
import { RULES_GAMES } from '@/lib/rules/index';

export const dynamic = 'force-dynamic';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ game: string }> }
) {
  try {
    const supabaseUser = await getOptionalUserFromSession();
    if (!supabaseUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const me = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { id: true },
    });
    if (!me || !isSuperAdmin(me.id)) {
      return NextResponse.json({ error: 'Forbidden: super admin only' }, { status: 403 });
    }

    const { game } = await params;
    const shortName = decodeURIComponent(game).toUpperCase();
    if (!RULES_GAMES.some((g) => g.shortName === shortName)) {
      return NextResponse.json({ error: 'Game not in allowed list' }, { status: 400 });
    }

    await prisma.gameRules.deleteMany({
      where: { gameShortName: shortName },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error resetting rules:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
