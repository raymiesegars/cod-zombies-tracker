import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { MAX_LEVEL } from '@/lib/ranks';
import { VERIFIED_MILESTONE_MIN_LEVEL } from '@/lib/verified-level-milestones';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const claims = await prisma.verifiedLevelMilestoneClaim.findMany({
      where: { level: { gte: VERIFIED_MILESTONE_MIN_LEVEL } },
      orderBy: { level: 'asc' },
      select: {
        level: true,
        verifiedTotalXp: true,
        reachedAt: true,
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            avatarPreset: true,
          },
        },
      },
    });

    const byLevel = new Map<number, (typeof claims)[number]>();
    for (const claim of claims) byLevel.set(claim.level, claim);

    const milestones = [];
    for (let level = VERIFIED_MILESTONE_MIN_LEVEL; level <= MAX_LEVEL; level++) {
      const claim = byLevel.get(level);
      milestones.push({
        level,
        claimed: !!claim,
        reachedAt: claim?.reachedAt ?? null,
        verifiedTotalXp: claim?.verifiedTotalXp ?? null,
        user: claim?.user ?? null,
      });
    }

    return NextResponse.json(
      {
        trackedFromLevel: VERIFIED_MILESTONE_MIN_LEVEL,
        milestones,
      },
      { headers: { 'Cache-Control': 'private, no-store, max-age=0' } }
    );
  } catch (error) {
    const code = typeof error === 'object' && error && 'code' in error ? (error as { code?: string }).code : undefined;
    if (code === 'P2021' || code === 'P2022') {
      return NextResponse.json(
        { trackedFromLevel: VERIFIED_MILESTONE_MIN_LEVEL, milestones: [] },
        { headers: { 'Cache-Control': 'private, no-store, max-age=0' } }
      );
    }
    console.error('Error fetching hall-of-fame milestones:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
