import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/admin';

const DEFAULT_GOAL_CENTS: Record<string, number> = {
  zcs3: 50_000, // $500
};

function normalizeSlug(slug: string) {
  return slug.trim().toLowerCase();
}

/** GET: Public charity campaign totals. */
export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = normalizeSlug(params.slug);
    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    }

    const row = await prisma.charityCampaign.findUnique({
      where: { id: slug },
      select: { amountCents: true, goalCents: true, merchUrl: true, updatedAt: true },
    });

    const goalCents = row?.goalCents ?? DEFAULT_GOAL_CENTS[slug] ?? 50_000;

    return NextResponse.json(
      {
        slug,
        amountCents: row?.amountCents ?? 0,
        goalCents,
        merchUrl: row?.merchUrl ?? null,
        updatedAt: row?.updatedAt?.toISOString() ?? null,
      },
      { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } }
    );
  } catch (error) {
    console.error('Error fetching charity campaign:', error);
    return NextResponse.json({ error: 'Failed to fetch charity campaign' }, { status: 500 });
  }
}

/**
 * PATCH: Update charity campaign (super admin only).
 * Body: { amountCents?: number, amountDollars?: number, goalCents?: number, goalDollars?: number, merchUrl?: string | null }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = normalizeSlug(params.slug);
    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    }

    const supabaseUser = await getUser();
    if (!supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const me = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { id: true },
    });
    if (!me || !isSuperAdmin(me.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const existing = await prisma.charityCampaign.findUnique({ where: { id: slug } });

    let amountCents = existing?.amountCents ?? 0;
    if (typeof body.amountCents === 'number' && Number.isFinite(body.amountCents)) {
      amountCents = Math.max(0, Math.round(body.amountCents));
    } else if (typeof body.amountDollars === 'number' && Number.isFinite(body.amountDollars)) {
      amountCents = Math.max(0, Math.round(body.amountDollars * 100));
    }

    let goalCents = existing?.goalCents ?? DEFAULT_GOAL_CENTS[slug] ?? 50_000;
    if (typeof body.goalCents === 'number' && Number.isFinite(body.goalCents)) {
      goalCents = Math.max(0, Math.round(body.goalCents));
    } else if (typeof body.goalDollars === 'number' && Number.isFinite(body.goalDollars)) {
      goalCents = Math.max(0, Math.round(body.goalDollars * 100));
    }

    let merchUrl = existing?.merchUrl ?? null;
    if ('merchUrl' in body) {
      if (body.merchUrl === null || body.merchUrl === '') {
        merchUrl = null;
      } else if (typeof body.merchUrl === 'string') {
        const trimmed = body.merchUrl.trim();
        if (trimmed && !/^https?:\/\//i.test(trimmed)) {
          return NextResponse.json({ error: 'merchUrl must be an http(s) URL' }, { status: 400 });
        }
        merchUrl = trimmed || null;
      }
    }

    const row = await prisma.charityCampaign.upsert({
      where: { id: slug },
      create: {
        id: slug,
        amountCents,
        goalCents,
        merchUrl,
        updatedAt: new Date(),
      },
      update: { amountCents, goalCents, merchUrl },
    });

    return NextResponse.json({
      slug,
      amountCents: row.amountCents,
      goalCents: row.goalCents,
      merchUrl: row.merchUrl,
      updatedAt: row.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error updating charity campaign:', error);
    return NextResponse.json({ error: 'Failed to update charity campaign' }, { status: 500 });
  }
}
