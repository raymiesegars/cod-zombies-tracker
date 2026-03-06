import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getOptionalUserFromSession } from '@/lib/supabase/server';
import { getAdminLevelFromXp, getAdminLevelIconPath } from '@/lib/admin-levels';
import { isSuperAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseUser = await getOptionalUserFromSession();
    if (!supabaseUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const me = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: {
        id: true,
        isAdmin: true,
        adminXp: true,
        adminDashboardSeen: true,
        _count: {
          select: { verifiedChallengeLogs: true, verifiedEasterEggLogs: true },
        },
      },
    });

    if (!me || !me.isAdmin) {
      return NextResponse.json({ admin: null });
    }

    const levelInfo = getAdminLevelFromXp(me.adminXp);
    return NextResponse.json({
      admin: {
        id: me.id,
        adminXp: me.adminXp,
        isSuperAdmin: isSuperAdmin(me.id),
        adminDashboardSeen: me.adminDashboardSeen as { feedbackAt?: string; verifiedHistoryAt?: string } | null,
        totalVerified: me._count.verifiedChallengeLogs + me._count.verifiedEasterEggLogs,
        ...levelInfo,
        levelIconPath: getAdminLevelIconPath(levelInfo.level),
      },
    });
  } catch (error) {
    console.error('Error fetching admin me:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
