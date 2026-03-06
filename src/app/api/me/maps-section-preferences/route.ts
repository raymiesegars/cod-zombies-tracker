import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export type MapsSectionPreferences = {
  defaultGameId?: string;
  defaultMapId?: string;
  defaultCategory?: string;
};

function parsePreferences(raw: unknown): MapsSectionPreferences | null {
  if (raw == null || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const defaultGameId = typeof o.defaultGameId === 'string' ? o.defaultGameId : undefined;
  const defaultMapId = typeof o.defaultMapId === 'string' ? o.defaultMapId : undefined;
  const defaultCategory = typeof o.defaultCategory === 'string' ? o.defaultCategory : undefined;
  if (!defaultGameId && !defaultMapId && !defaultCategory) return null;
  return { defaultGameId, defaultMapId, defaultCategory };
}

export async function GET() {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) {
      return NextResponse.json({ defaultGameId: '', defaultMapId: '', defaultCategory: '' });
    }

    const user = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { mapsSectionPreferences: true },
    });

    const prefs = parsePreferences(user?.mapsSectionPreferences);
    return NextResponse.json({
      defaultGameId: prefs?.defaultGameId ?? '',
      defaultMapId: prefs?.defaultMapId ?? '',
      defaultCategory: prefs?.defaultCategory ?? '',
    });
  } catch (error) {
    console.error('GET /api/me/maps-section-preferences', error);
    return NextResponse.json({ defaultGameId: '', defaultMapId: '', defaultCategory: '' });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const defaultGameId = typeof body.defaultGameId === 'string' ? body.defaultGameId : undefined;
    const defaultMapId = typeof body.defaultMapId === 'string' ? body.defaultMapId : undefined;
    const defaultCategory = typeof body.defaultCategory === 'string' ? body.defaultCategory : undefined;

    const user = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { id: true, mapsSectionPreferences: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const current = parsePreferences(user.mapsSectionPreferences);
    const next: MapsSectionPreferences = {
      defaultGameId: defaultGameId ?? current?.defaultGameId ?? '',
      defaultMapId: defaultMapId ?? current?.defaultMapId ?? '',
      defaultCategory: defaultCategory ?? current?.defaultCategory ?? '',
    };

    const toStore = (next.defaultGameId || next.defaultMapId || next.defaultCategory)
      ? next
      : null;

    await prisma.user.update({
      where: { id: user.id },
      data: { mapsSectionPreferences: toStore ? (toStore as object) : Prisma.DbNull },
    });

    return NextResponse.json({
      defaultGameId: next.defaultGameId ?? '',
      defaultMapId: next.defaultMapId ?? '',
      defaultCategory: next.defaultCategory ?? '',
    });
  } catch (error) {
    console.error('PATCH /api/me/maps-section-preferences', error);
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}
