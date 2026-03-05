import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const MAX_CONTENT_LENGTH = 100_000;

export async function POST(request: NextRequest) {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const me = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { id: true, isAdmin: true },
    });
    if (!me || !me.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json().catch(() => ({}));
    const title = typeof body.title === 'string' ? body.title.trim().slice(0, 200) : null;
    const category = typeof body.category === 'string' ? body.category.trim().slice(0, 100) : null;
    const content = typeof body.content === 'string' ? body.content.trim() : '';
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }
    if (content.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json(
        { error: `Content must be ${MAX_CONTENT_LENGTH.toLocaleString()} characters or less` },
        { status: 400 }
      );
    }

    const row = await prisma.chatbotKnowledge.create({
      data: {
        title: title || null,
        category: category || null,
        content,
        status: 'PENDING',
        submittedById: me.id,
      },
    });
    return NextResponse.json({ id: row.id, status: 'PENDING' });
  } catch (error) {
    console.error('Chatbot knowledge submit error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
