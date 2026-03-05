import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const me = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { id: true },
    });
    if (!me || !isSuperAdmin(me.id)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const pending = await prisma.chatbotKnowledge.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      include: {
        submittedBy: { select: { id: true, username: true, displayName: true } },
      },
    });
    return NextResponse.json({
      submissions: pending.map((r) => ({
        id: r.id,
        title: r.title,
        category: r.category,
        content: r.content,
        createdAt: r.createdAt.toISOString(),
        submittedBy: r.submittedBy.displayName || r.submittedBy.username,
        submittedByUsername: r.submittedBy.username,
      })),
    });
  } catch (error) {
    console.error('Chatbot submissions list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
