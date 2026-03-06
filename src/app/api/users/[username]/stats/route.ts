import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { computeUserStats } from '@/lib/user-stats';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        challengeLogs: {
          include: {
            challenge: true,
            map: { include: { game: true } },
          },
        },
        easterEggLogs: {
          include: {
            easterEgg: true,
            map: { include: { game: true } },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.isPublic) {
      const supabaseUser = await getUser();
      if (!supabaseUser) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const currentUser = await prisma.user.findUnique({
        where: { supabaseId: supabaseUser.id },
      });
      if (!currentUser || currentUser.id !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const stats = await computeUserStats(user);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
