import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

const TOKEN_CAP = 3;

/** Grant mystery box tokens to a user. Super admin only. Body: { userId, amount } */
export async function POST(request: NextRequest) {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const me = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { id: true },
    });
    if (!me) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    if (!isSuperAdmin(me.id)) {
      return NextResponse.json({ error: 'Forbidden: super admin only' }, { status: 403 });
    }

    const body = await request.json();
    const userId = typeof body.userId === 'string' ? body.userId.trim() : '';
    const amount = typeof body.amount === 'number' ? Math.max(0, Math.floor(body.amount)) : parseInt(String(body.amount ?? 0), 10);
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }
    if (Number.isNaN(amount) || amount < 1) {
      return NextResponse.json({ error: 'amount must be a positive integer' }, { status: 400 });
    }

    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, mysteryBoxTokens: true, username: true, displayName: true },
    });
    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const current = target.mysteryBoxTokens ?? 0;
    const toAdd = Math.min(amount, TOKEN_CAP - current);
    if (toAdd <= 0) {
      return NextResponse.json({
        ok: true,
        tokens: current,
        granted: 0,
        message: 'User already has max tokens (3).',
      });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { mysteryBoxTokens: { increment: toAdd } },
    });

    return NextResponse.json({
      ok: true,
      tokens: current + toAdd,
      granted: toAdd,
      user: { username: target.username, displayName: target.displayName },
    });
  } catch (error) {
    console.error('Error granting mystery box tokens:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
