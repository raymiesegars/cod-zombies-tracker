import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/** Submit a run for verification (add to pending queue). Admin only. Run must not already be verified or pending. */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const logType = body.logType === 'easter_egg' ? 'easter_egg' : 'challenge';
    const logId = typeof body.logId === 'string' ? body.logId.trim() : '';
    if (!logId) {
      return NextResponse.json({ error: 'logId is required' }, { status: 400 });
    }

    if (logType === 'challenge') {
      const log = await prisma.challengeLog.findUnique({
        where: { id: logId },
        select: { id: true, verificationRequestedAt: true, isVerified: true },
      });
      if (!log) {
        return NextResponse.json({ error: 'Run not found' }, { status: 400 });
      }
      if (log.isVerified) {
        return NextResponse.json({ error: 'Run is already verified' }, { status: 400 });
      }
      if (log.verificationRequestedAt) {
        return NextResponse.json({ error: 'Run is already pending verification' }, { status: 400 });
      }
      await prisma.challengeLog.update({
        where: { id: logId },
        data: { verificationRequestedAt: new Date() },
      });
    } else {
      const log = await prisma.easterEggLog.findUnique({
        where: { id: logId },
        select: { id: true, verificationRequestedAt: true, isVerified: true },
      });
      if (!log) {
        return NextResponse.json({ error: 'Run not found' }, { status: 400 });
      }
      if (log.isVerified) {
        return NextResponse.json({ error: 'Run is already verified' }, { status: 400 });
      }
      if (log.verificationRequestedAt) {
        return NextResponse.json({ error: 'Run is already pending verification' }, { status: 400 });
      }
      await prisma.easterEggLog.update({
        where: { id: logId },
        data: { verificationRequestedAt: new Date() },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error requesting verification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
