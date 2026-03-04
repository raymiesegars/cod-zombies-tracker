import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/** List all feedback (admin only). Returns user name, date, message, type. */
export async function GET() {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const me = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { id: true, isAdmin: true },
    });
    if (!me || !me.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const list = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, username: true, displayName: true },
        },
      },
    });

    const feedback = list.map((f) => ({
      id: f.id,
      userId: f.userId,
      userName: f.user.displayName || f.user.username,
      username: f.user.username,
      message: f.message,
      type: f.type,
      createdAt: f.createdAt.toISOString(),
    }));

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Admin feedback list error:', error);
    return NextResponse.json({ error: 'Failed to load feedback' }, { status: 500 });
  }
}
