import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isBo4Game, BO4_DIFFICULTIES } from '@/lib/bo4';
import { isIwGame, isSpeedrunChallengeType } from '@/lib/iw';
import { isBo3Game } from '@/lib/bo3';
import { isBocwGame } from '@/lib/bocw';
import { isBo6Game } from '@/lib/bo6';
import { isBo7Game } from '@/lib/bo7';
import { getBo2MapConfig } from '@/lib/bo2/bo2-map-config';
import type { PlayerCount, ChallengeType, Prisma, Bo4Difficulty } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { searchParams } = new URL(request.url);
  const playerCount = searchParams.get('playerCount') as PlayerCount | null;
  const challengeType = searchParams.get('challengeType') as ChallengeType | null;
  const difficulty = searchParams.get('difficulty') as Bo4Difficulty | null;
  const searchQ = searchParams.get('search')?.trim() ?? '';
  const verifiedOnly = searchParams.get('verified') === 'true';
  const fortuneCards = searchParams.get('fortuneCards'); // 'true' | 'false' | null (no filter)
  const directorsCut = searchParams.get('directorsCut') === 'true';
  // BO3
  const bo3GobbleGumMode = searchParams.get('bo3GobbleGumMode'); // 'CLASSIC_ONLY' | 'MEGA' | 'NONE' | null
  const bo3AatUsed = searchParams.get('bo3AatUsed'); // 'true' | 'false' | null (AATs used / No AATs)
  // BO4
  const bo4ElixirMode = searchParams.get('bo4ElixirMode'); // 'CLASSIC_ONLY' | 'ALL_ELIXIRS_TALISMANS' | null
  // BOCW
  const bocwSupportMode = searchParams.get('bocwSupportMode'); // 'WITH_SUPPORT' | 'WITHOUT_SUPPORT' | null
  // BO6
  const bo6GobbleGumMode = searchParams.get('bo6GobbleGumMode'); // 'WITH_GOBBLEGUMS' | 'NO_GOBBLEGUMS' | null
  const bo6SupportMode = searchParams.get('bo6SupportMode'); // 'WITH_SUPPORT' | 'NO_SUPPORT' | null
  // BO7
  const bo7SupportMode = searchParams.get('bo7SupportMode'); // 'WITH_SUPPORT' | 'NO_SUPPORT' | null
  const bo7CursedFilter = searchParams.get('bo7CursedRun'); // 'true' | 'false' | null (no filter)
  // Comma-separated relic names; only applied when bo7CursedRun=true
  const bo7RelicsParam = searchParams.get('bo7Relics'); // e.g. 'Blood Vials,Bus' | null
  // WaW run modifiers
  const wawNoJug = searchParams.get('wawNoJug'); // 'true' | 'false' | null
  const wawFixedWunderwaffe = searchParams.get('wawFixedWunderwaffe'); // 'true' | 'false' | null
  const bo2BankUsed = searchParams.get('bo2BankUsed'); // 'true' | 'false' | null
  // BOCW/BO6/BO7: Rampage Inducer. Default 'false' = No Rampage Inducer; 'true' = Rampage Inducer only.
  const rampageInducerParam = searchParams.get('rampageInducerUsed'); // 'true' | 'false' | null
  const limitParam = Math.min(500, Math.max(1, parseInt(searchParams.get('limit') || '25', 10) || 25));
  const offsetParam = Math.max(0, parseInt(searchParams.get('offset') ?? '0', 10) || 0);
  const mergeTake = 500;

  try {
    const { slug } = await params;
    const map = await prisma.map.findUnique({
      where: { slug },
      select: { id: true, game: { select: { shortName: true } } },
    });

    if (!map) {
      return NextResponse.json({ error: 'Map not found' }, { status: 404 });
    }

    const whereClause: Prisma.ChallengeLogWhereInput = {
      mapId: map.id,
      ...(verifiedOnly && { isVerified: true }),
    };

    const eeWhereClause: Prisma.EasterEggLogWhereInput = {
      mapId: map.id,
      roundCompleted: { not: null },
      ...(verifiedOnly && { isVerified: true }),
    };

    // Restrict to users matching search (by username/displayName) when search is provided
    if (searchQ.length > 0) {
      const searchUsers = await prisma.user.findMany({
        where: {
          isPublic: true,
          OR: [
            { username: { contains: searchQ, mode: 'insensitive' } },
            { displayName: { contains: searchQ, mode: 'insensitive' } },
          ],
        },
        select: { id: true },
      });
      const searchUserIds = searchUsers.map((u) => u.id);
      if (searchUserIds.length === 0) {
        return NextResponse.json({ total: 0, entries: [] });
      }
      whereClause.userId = { in: searchUserIds };
      eeWhereClause.userId = { in: searchUserIds };
    }

    if (playerCount) {
      whereClause.playerCount = playerCount;
      eeWhereClause.playerCount = playerCount;
    }

    if (isBo4Game(map.game?.shortName) && difficulty && BO4_DIFFICULTIES.includes(difficulty as any)) {
      whereClause.difficulty = difficulty;
      eeWhereClause.difficulty = difficulty;
    }

    const gameShortName = map.game?.shortName;

    if (isIwGame(gameShortName)) {
      if (fortuneCards === 'true') whereClause.useFortuneCards = true;
      else if (fortuneCards === 'false') whereClause.useFortuneCards = false;
      if (directorsCut) whereClause.useDirectorsCut = true;
    }

    if (isBo3Game(gameShortName)) {
      if (bo3GobbleGumMode) (whereClause as Record<string, unknown>).bo3GobbleGumMode = bo3GobbleGumMode;
      if (bo3AatUsed === 'true') (whereClause as Record<string, unknown>).bo3AatUsed = true;
      else if (bo3AatUsed === 'false') (whereClause as Record<string, unknown>).bo3AatUsed = false;
    }

    if (isBo4Game(gameShortName) && bo4ElixirMode) {
      (whereClause as Record<string, unknown>).bo4ElixirMode = bo4ElixirMode;
    }

    if (isBocwGame(gameShortName) && bocwSupportMode) {
      (whereClause as Record<string, unknown>).bocwSupportMode = bocwSupportMode;
    }

    if (isBo6Game(gameShortName)) {
      if (bo6GobbleGumMode) (whereClause as Record<string, unknown>).bo6GobbleGumMode = bo6GobbleGumMode;
      if (bo6SupportMode) (whereClause as Record<string, unknown>).bo6SupportMode = bo6SupportMode;
    }

    if (isBo7Game(gameShortName)) {
      if (bo7SupportMode) (whereClause as Record<string, unknown>).bo7SupportMode = bo7SupportMode;
      if (bo7CursedFilter === 'true') {
        (whereClause as Record<string, unknown>).bo7IsCursedRun = true;
        if (bo7RelicsParam) {
          const relics = bo7RelicsParam.split(',').map((r) => r.trim()).filter(Boolean);
          if (relics.length > 0) {
            // Every selected relic must appear in the run's relics array
            (whereClause as Record<string, unknown>).bo7RelicsUsed = { hasEvery: relics };
          }
        }
      } else if (bo7CursedFilter === 'false') {
        (whereClause as Record<string, unknown>).bo7IsCursedRun = false;
      }
    }

    if (gameShortName === 'WAW') {
      if (wawNoJug === 'true') (whereClause as Record<string, unknown>).wawNoJug = true;
      else if (wawNoJug === 'false') (whereClause as Record<string, unknown>).wawNoJug = false;
      if (wawFixedWunderwaffe === 'true') (whereClause as Record<string, unknown>).wawFixedWunderwaffe = true;
      else if (wawFixedWunderwaffe === 'false') (whereClause as Record<string, unknown>).wawFixedWunderwaffe = false;
    }

    if ((isBocwGame(gameShortName) || isBo6Game(gameShortName) || isBo7Game(gameShortName))) {
      if (rampageInducerParam === 'true') {
        (whereClause as Record<string, unknown>).rampageInducerUsed = true;
        (eeWhereClause as Record<string, unknown>).rampageInducerUsed = true;
      } else {
        // Default: No Rampage Inducer (false or null/legacy)
        (whereClause as Record<string, unknown>).rampageInducerUsed = { not: true };
        (eeWhereClause as Record<string, unknown>).rampageInducerUsed = { not: true };
      }
    }

    if (gameShortName === 'BO2' && getBo2MapConfig(slug)?.hasBank) {
      if (bo2BankUsed === 'true') (whereClause as Record<string, unknown>).bo2BankUsed = true;
      else if (bo2BankUsed === 'false') (whereClause as Record<string, unknown>).bo2BankUsed = false;
    }

    // "Highest Round" (or no filter) = best round from any challenge OR easter egg; specific challenge = only that challenge's logs
    const isSpecificChallenge = challengeType && challengeType !== 'HIGHEST_ROUND';
    const isSpeedrun =
      isSpecificChallenge &&
      isSpeedrunChallengeType(challengeType!);
    const isNoMansLand = isSpecificChallenge && challengeType === 'NO_MANS_LAND';
    const isRush = isSpecificChallenge && challengeType === 'RUSH';
    if (isSpecificChallenge) {
      whereClause.challenge = { type: challengeType };
    }
    if (isSpeedrun) {
      whereClause.completionTimeSeconds = { not: null };
    }
    if (isNoMansLand) {
      (whereClause as Record<string, unknown>).killsReached = { not: null };
    }
    if (isRush) {
      (whereClause as Record<string, unknown>).scoreReached = { not: null };
    }

    const orderBy =
      isSpeedrun
        ? { completionTimeSeconds: 'asc' as const }
        : isNoMansLand
          ? { killsReached: 'desc' as const }
          : isRush
            ? { scoreReached: 'desc' as const }
            : { roundReached: 'desc' as const };

    const challengeLogs = await prisma.challengeLog.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            avatarPreset: true,
            level: true,
          },
        },
        challenge: true,
      },
      orderBy,
      take: mergeTake * 2,
    });

    // Only include Easter Egg logs when showing "Highest Round" (merged view); never for Pistol Only, One Box, etc.
    const eeLogs = isSpecificChallenge
      ? []
      : await prisma.easterEggLog.findMany({
          where: eeWhereClause,
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                avatarPreset: true,
                level: true,
              },
            },
          },
          orderBy: { roundCompleted: 'desc' },
          take: mergeTake * 2,
        });

    type LeaderboardEntry = {
      userId: string;
      playerCount: PlayerCount;
      round: number;
      completionTimeSeconds?: number | null;
      user: { id: string; username: string; displayName: string | null; avatarUrl: string | null; avatarPreset: string | null; level: number };
      proofUrls: string[];
      proofUrl: string | null;
      completedAt: Date;
      logId: string;
      runType: 'challenge' | 'easter-egg';
      isVerified: boolean;
    };

    const userBestMap = new Map<string, LeaderboardEntry>();

    for (const log of challengeLogs) {
      const key = `${log.userId}-${log.playerCount}`;
      const existing = userBestMap.get(key);
      const logTime = log.completionTimeSeconds ?? null;
      const logKills = (log as { killsReached?: number | null }).killsReached ?? null;
      const logScore = (log as { scoreReached?: number | null }).scoreReached ?? null;
      if (isSpeedrun) {
        if (logTime == null) continue;
        if (!existing || existing.completionTimeSeconds == null || logTime < existing.completionTimeSeconds) {
          userBestMap.set(key, {
            userId: log.userId,
            playerCount: log.playerCount,
            round: isNoMansLand && logKills != null ? logKills : isRush && logScore != null ? logScore : log.roundReached,
            completionTimeSeconds: logTime,
            user: log.user,
            proofUrls: log.proofUrls ?? [],
            proofUrl: (log.proofUrls && log.proofUrls.length > 0) ? log.proofUrls[0]! : null,
            completedAt: log.completedAt,
            logId: log.id,
            runType: 'challenge',
            isVerified: log.isVerified ?? false,
          });
        }
      } else if (isRush) {
        if (logScore == null) continue;
        if (!existing || logScore > existing.round) {
          userBestMap.set(key, {
            userId: log.userId,
            playerCount: log.playerCount,
            round: logScore,
            completionTimeSeconds: log.completionTimeSeconds,
            user: log.user,
            proofUrls: log.proofUrls ?? [],
            proofUrl: (log.proofUrls && log.proofUrls.length > 0) ? log.proofUrls[0]! : null,
            completedAt: log.completedAt,
            logId: log.id,
            runType: 'challenge',
            isVerified: log.isVerified ?? false,
          });
        }
      } else if (isNoMansLand) {
        if (logKills == null) continue;
        if (!existing || logKills > existing.round) {
          userBestMap.set(key, {
            userId: log.userId,
            playerCount: log.playerCount,
            round: logKills,
            completionTimeSeconds: log.completionTimeSeconds,
            user: log.user,
            proofUrls: log.proofUrls ?? [],
            proofUrl: (log.proofUrls && log.proofUrls.length > 0) ? log.proofUrls[0]! : null,
            completedAt: log.completedAt,
            logId: log.id,
            runType: 'challenge',
            isVerified: log.isVerified ?? false,
          });
        }
      } else {
        if (!existing || log.roundReached > existing.round) {
          userBestMap.set(key, {
            userId: log.userId,
            playerCount: log.playerCount,
            round: log.roundReached,
            completionTimeSeconds: log.completionTimeSeconds,
            user: log.user,
            proofUrls: log.proofUrls ?? [],
            proofUrl: (log.proofUrls && log.proofUrls.length > 0) ? log.proofUrls[0]! : null,
            completedAt: log.completedAt,
            logId: log.id,
            runType: 'challenge',
            isVerified: log.isVerified ?? false,
          });
        }
      }
    }

    for (const log of eeLogs) {
      const key = `${log.userId}-${log.playerCount}`;
      const round = log.roundCompleted!;
      const existing = userBestMap.get(key);
      if (!existing || round > existing.round) {
        userBestMap.set(key, {
          userId: log.userId,
          playerCount: log.playerCount,
          round,
          user: log.user,
          proofUrls: log.proofUrls ?? [],
          proofUrl: (log.proofUrls && log.proofUrls.length > 0) ? log.proofUrls[0]! : null,
          completedAt: log.completedAt,
          logId: log.id,
          runType: 'easter-egg',
          isVerified: log.isVerified ?? false,
        });
      }
    }

    const uniqueLogs = Array.from(userBestMap.values()).sort((a, b) => {
      if (isSpeedrun) {
        const at = a.completionTimeSeconds ?? Infinity;
        const bt = b.completionTimeSeconds ?? Infinity;
        return at - bt;
      }
      return b.round - a.round;
    });

    const total = uniqueLogs.length;
    const entries = uniqueLogs
      .slice(offsetParam, offsetParam + limitParam)
      .map((entry, index) => ({
        rank: offsetParam + index + 1,
        user: entry.user,
        value: isSpeedrun && entry.completionTimeSeconds != null ? entry.completionTimeSeconds : entry.round,
        invertRanking: isSpeedrun,
        playerCount: entry.playerCount,
        proofUrls: entry.proofUrls,
        proofUrl: entry.proofUrl,
        completedAt: entry.completedAt,
        logId: entry.logId,
        runType: entry.runType,
        isVerified: entry.isVerified,
      }));

    return NextResponse.json({ total, entries });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
