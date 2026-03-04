import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const MAX_MESSAGE_LENGTH = 2000;
const VALID_TYPES = ['bug', 'feedback'] as const;

/** Submit feedback or a bug report. Requires authenticated user. */
export async function POST(request: NextRequest) {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) {
      return NextResponse.json({ error: 'Sign in to submit feedback' }, { status: 401 });
    }

    const me = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { id: true },
    });
    if (!me) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const rawMessage = typeof body.message === 'string' ? body.message.trim() : '';
    if (!rawMessage) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    if (rawMessage.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message must be ${MAX_MESSAGE_LENGTH} characters or less` },
        { status: 400 }
      );
    }

    const type = VALID_TYPES.includes(body.type) ? body.type : 'feedback';

    await prisma.feedback.create({
      data: {
        userId: me.id,
        message: rawMessage,
        type,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Feedback submit error:', error);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}
