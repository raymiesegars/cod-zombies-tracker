import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/supabase/server';
import { getLevelFromXp } from '@/lib/ranks';

type Params = { params: Promise<{ slug: string }> | { slug: string } };

export const dynamic = 'force-dynamic';

// Step checkboxes + which main EEs we've already given XP for. No auth = empty.
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { slug } = await Promise.resolve(params);
    const map = await prisma.map.findUnique({
      where: { slug },
      select: {
        id: true,
        easterEggs: {
          where: { isActive: true },
          select: {
            id: true,
            type: true,
            steps: { select: { id: true } },
          },
        },
      },
    });
    if (!map) {
      return NextResponse.json({ error: 'Map not found' }, { status: 404 });
    }

    const supabaseUser = await getUser();
    if (!supabaseUser) {
      return NextResponse.json({
        checkedStepIds: [],
        mainEeXpAwardedEasterEggIds: [],
      });
    }

    const user = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({
        checkedStepIds: [],
        mainEeXpAwardedEasterEggIds: [],
      });
    }

    const stepIds = map.easterEggs.flatMap((ee) => ee.steps.map((s) => s.id));
    const eeIds = map.easterEggs.map((ee) => ee.id);

    const [progressRows, awardedRows] = await Promise.all([
      prisma.userEasterEggStepProgress.findMany({
        where: {
          userId: user.id,
          easterEggStepId: { in: stepIds },
        },
        select: { easterEggStepId: true },
      }),
      prisma.mainEasterEggXpAwarded.findMany({
        where: {
          userId: user.id,
          easterEggId: { in: eeIds },
        },
        select: { easterEggId: true },
      }),
    ]);

    return NextResponse.json({
      checkedStepIds: progressRows.map((r) => r.easterEggStepId),
      mainEeXpAwardedEasterEggIds: awardedRows.map((r) => r.easterEggId),
    });
  } catch (error) {
    console.error('Error fetching Easter Egg progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Toggle one step or clear all for an EE. Finishing the last main-quest step awards XP once.
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { slug } = await Promise.resolve(params);
    const map = await prisma.map.findUnique({
      where: { slug },
      include: {
        easterEggs: {
          where: { isActive: true },
          include: { steps: { orderBy: { order: 'asc' } } },
        },
      },
    });
    if (!map) {
      return NextResponse.json({ error: 'Map not found' }, { status: 404 });
    }

    const body = await request.json();
    const { action, easterEggStepId, easterEggId } = body;

    if (action === 'toggle' && easterEggStepId) {
      const step = await prisma.easterEggStep.findUnique({
        where: { id: easterEggStepId },
        include: {
          easterEgg: {
            include: { steps: { orderBy: { order: 'asc' } } },
          },
        },
      });
      if (!step || step.easterEgg.mapId !== map.id) {
        return NextResponse.json({ error: 'Step not found' }, { status: 404 });
      }

      const existing = await prisma.userEasterEggStepProgress.findUnique({
        where: {
          userId_easterEggStepId: { userId: user.id, easterEggStepId },
        },
      });

      if (existing) {
        await prisma.userEasterEggStepProgress.delete({
          where: {
            userId_easterEggStepId: { userId: user.id, easterEggStepId },
          },
        });
        return NextResponse.json({
          action: 'unchecked',
          checkedStepIds: [], // client will refetch or we could return updated list
          xpAwarded: null,
        });
      }

      await prisma.userEasterEggStepProgress.create({
        data: {
          userId: user.id,
          easterEggStepId,
        },
      });

      const ee = step.easterEgg;
      let xpAwarded: number | null = null;
      let totalXp: number | undefined;
      let debugMainQuest: { stepsLength: number; checkedCount: number; allChecked: boolean; alreadyAwarded: boolean; xpReward: number } | undefined;
      if (ee.type === 'MAIN_QUEST' && ee.steps.length > 0) {
        const checkedCount = await prisma.userEasterEggStepProgress.count({
          where: {
            userId: user.id,
            easterEggStepId: { in: ee.steps.map((s) => s.id) },
          },
        });
        const allChecked = checkedCount === ee.steps.length;
        const alreadyAwarded = await prisma.mainEasterEggXpAwarded.findUnique({
          where: {
            userId_easterEggId: { userId: user.id, easterEggId: ee.id },
          },
        });

        debugMainQuest = { stepsLength: ee.steps.length, checkedCount, allChecked, alreadyAwarded: !!alreadyAwarded, xpReward: ee.xpReward };
        console.log('[EE progress API]', { eeId: ee.id, eeName: ee.name, ...debugMainQuest });

        if (allChecked && !alreadyAwarded && ee.xpReward > 0) {
          await prisma.mainEasterEggXpAwarded.create({
            data: { userId: user.id, easterEggId: ee.id },
          });
          await prisma.user.update({
            where: { id: user.id },
            data: { totalXp: { increment: ee.xpReward } },
          });
          const updated = await prisma.user.findUnique({
            where: { id: user.id },
            select: { totalXp: true, level: true },
          });
          if (updated) {
            totalXp = updated.totalXp;
            const { level } = getLevelFromXp(updated.totalXp);
            if (level !== updated.level) {
              await prisma.user.update({
                where: { id: user.id },
                data: { level },
              });
            }
          }
          xpAwarded = ee.xpReward;
        }
      }

      const response: { action: string; xpAwarded: number | null; totalXp: number | null; _debug?: Record<string, unknown> } = {
        action: 'checked',
        xpAwarded: xpAwarded != null ? Number(xpAwarded) : null,
        totalXp: totalXp != null ? Number(totalXp) : null,
      };
      if (process.env.NODE_ENV === 'development' && debugMainQuest) {
        response._debug = debugMainQuest;
      }
      return NextResponse.json(response);
    }

    if (action === 'clear' && easterEggId) {
      const ee = map.easterEggs.find((e) => e.id === easterEggId);
      if (!ee) {
        return NextResponse.json({ error: 'Easter Egg not found' }, { status: 404 });
      }
      const stepIds = ee.steps.map((s) => s.id);
      await prisma.userEasterEggStepProgress.deleteMany({
        where: {
          userId: user.id,
          easterEggStepId: { in: stepIds },
        },
      });
      return NextResponse.json({ action: 'cleared' });
    }

    return NextResponse.json(
      { error: 'Invalid action: use toggle+easterEggStepId or clear+easterEggId' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating Easter Egg progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
