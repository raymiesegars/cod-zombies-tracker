import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { getAdminLevelFromXp, getAdminLevelIconPath } from '@/lib/admin-levels';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const me = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { id: true, isAdmin: true },
    });
    if (!me || !me.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const admins = await prisma.user.findMany({
      where: { isAdmin: true },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        avatarPreset: true,
        adminXp: true,
        _count: {
          select: {
            verifiedChallengeLogs: true,
            verifiedEasterEggLogs: true,
          },
        },
      },
    });

    const rows = admins.map((u) => ({
      id: u.id,
      username: u.username,
      displayName: u.displayName,
      avatarUrl: u.avatarUrl,
      avatarPreset: u.avatarPreset,
      adminXp: u.adminXp,
      totalVerified: u._count.verifiedChallengeLogs + u._count.verifiedEasterEggLogs,
      ...getAdminLevelFromXp(u.adminXp),
      levelIconPath: getAdminLevelIconPath(getAdminLevelFromXp(u.adminXp).level),
    }));

    rows.sort((a, b) => b.totalVerified - a.totalVerified);

    return NextResponse.json({ leaderboard: rows });
  } catch (error) {
    console.error('Error fetching admin leaderboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
