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
      select: { id: true, isAdmin: true },
    });
    if (!me || !me.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const list = await prisma.chatbotUnansweredQuestion.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        user: { select: { id: true, username: true, displayName: true } },
      },
    });
    return NextResponse.json({
      questions: list.map((q) => ({
        id: q.id,
        question: q.question,
        createdAt: q.createdAt.toISOString(),
        askedBy: q.user.displayName || q.user.username,
        askedByUsername: q.user.username,
      })),
    });
  } catch (error) {
    console.error('Chatbot unanswered list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
