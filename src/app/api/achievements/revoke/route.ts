import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { revokeSingleAchievement } from '@/lib/achievements';

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
    const achievementId = typeof body?.achievementId === 'string' ? body.achievementId : null;
    if (!achievementId) {
      return NextResponse.json({ error: 'achievementId is required' }, { status: 400 });
    }

    const result = await revokeSingleAchievement(user.id, achievementId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error revoking achievement:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
