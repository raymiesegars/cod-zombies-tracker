import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getOptionalUserFromSession } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/admin';
import {
  DEFAULT_PRIZE_RULES,
  PRIZE_RULES_KEYS,
  normalizePrizeRulesPayload,
  resolvePrizeRulesScope,
} from '@/lib/tournament-prize-rules';

export async function GET(request: NextRequest) {
  try {
    const scope = resolvePrizeRulesScope(new URL(request.url).searchParams.get('scope'));
    const key = PRIZE_RULES_KEYS[scope];

    const row = await prisma.rulesPageSection.findUnique({
      where: { key },
      select: { title: true, items: true },
    });

    const normalized = normalizePrizeRulesPayload(row?.title, row?.items);

    return NextResponse.json({ scope, ...normalized });
  } catch (error) {
    console.error('Error fetching tournament prize rules:', error);
    return NextResponse.json({ error: 'Failed to fetch tournament prize rules' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabaseUser = await getOptionalUserFromSession();
    if (!supabaseUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const me = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { id: true },
    });
    if (!me || !isSuperAdmin(me.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const scope = resolvePrizeRulesScope(typeof body.scope === 'string' ? body.scope : null);
    const key = PRIZE_RULES_KEYS[scope];
    const title = typeof body.title === 'string' && body.title.trim() ? body.title.trim() : DEFAULT_PRIZE_RULES.title;
    const tipNote = typeof body.tipNote === 'string' && body.tipNote.trim() ? body.tipNote.trim() : DEFAULT_PRIZE_RULES.tipNote;

    if (!Array.isArray(body.items)) {
      return NextResponse.json({ error: 'items must be an array of strings' }, { status: 400 });
    }
    const items = body.items
      .map((item: unknown) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean);
    if (items.length === 0) {
      return NextResponse.json({ error: 'Provide at least one prize rule item' }, { status: 400 });
    }

    const payload = { tipNote, items };

    await prisma.rulesPageSection.upsert({
      where: { key },
      create: {
        key,
        title,
        items: payload,
        sortOrder: scope === 'current' ? 900 : 901,
      },
      update: {
        title,
        items: payload,
      },
    });

    return NextResponse.json({ scope, title, items, tipNote });
  } catch (error) {
    console.error('Error updating tournament prize rules:', error);
    return NextResponse.json({ error: 'Failed to update tournament prize rules' }, { status: 500 });
  }
}

