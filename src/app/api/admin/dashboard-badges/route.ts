import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const me = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { id: true, isAdmin: true, adminDashboardSeen: true },
    });
    if (!me || !me.isAdmin) {
      return NextResponse.json({ pending: 0, feedbackUnread: 0, verifiedHistoryUnread: 0 });
    }

    const seen = (me.adminDashboardSeen as { feedbackAt?: string; verifiedHistoryAt?: string } | null) ?? {};

    const [pendingChallenge, pendingEe, feedbackUnread, verifiedHistoryUnread] = await Promise.all([
      prisma.challengeLog.count({
        where: { verificationRequestedAt: { not: null }, isVerified: false, userId: { not: me.id } },
      }),
      prisma.easterEggLog.count({
        where: { verificationRequestedAt: { not: null }, isVerified: false, userId: { not: me.id } },
      }),
      seen.feedbackAt
        ? prisma.feedback.count({ where: { createdAt: { gt: new Date(seen.feedbackAt) } } })
        : prisma.feedback.count(),
      seen.verifiedHistoryAt
        ? prisma.challengeLog.count({ where: { isVerified: true, verifiedAt: { gt: new Date(seen.verifiedHistoryAt) } } }) +
          prisma.easterEggLog.count({ where: { isVerified: true, verifiedAt: { gt: new Date(seen.verifiedHistoryAt) } } })
        : prisma.challengeLog.count({ where: { isVerified: true, verifiedAt: { not: null } } }) +
          prisma.easterEggLog.count({ where: { isVerified: true, verifiedAt: { not: null } } }),
    ]);
    const pending = pendingChallenge + pendingEe;

    return NextResponse.json({
      pending,
      feedbackUnread,
      verifiedHistoryUnread,
    });
  } catch (error) {
    console.error('Error fetching dashboard badges:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
