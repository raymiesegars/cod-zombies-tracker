import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { getChatbotTokens } from '@/lib/chatbot/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) {
      return NextResponse.json({ remaining: 0, isAdmin: false, signedIn: false, nextRefillAt: null });
    }

    const me = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { id: true },
    });
    if (!me) {
      return NextResponse.json({ remaining: 0, isAdmin: false, signedIn: false, nextRefillAt: null });
    }

    const { remaining, isAdmin, nextRefillAt } = await getChatbotTokens(me.id);
    return NextResponse.json({
      remaining,
      isAdmin,
      signedIn: true,
      nextRefillAt,
    });
  } catch (error) {
    console.error('Chatbot limits error:', error);
    return NextResponse.json({ remaining: 0, isAdmin: false, signedIn: false, nextRefillAt: null });
  }
}
