'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui';
import { Trophy, Loader2 } from 'lucide-react';
import { Avatar } from '@/components/ui';

type LeaderboardRow = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  avatarPreset: string | null;
  adminXp: number;
  totalVerified: number;
  level: number;
  levelIconPath: string;
  progress: number;
};

export default function AdminLeaderboardPage() {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  const fetchLeaderboard = useCallback(() => {
    fetch('/api/admin/leaderboard', { credentials: 'same-origin', cache: 'no-store' })
      .then((res) => {
        if (res.status === 403) {
          setForbidden(true);
          return { leaderboard: [] };
        }
        return res.ok ? res.json() : { leaderboard: [] };
      })
      .then((data) => setRows(data.leaderboard ?? []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  if (forbidden) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-bunker-400">You don&apos;t have access to this page.</p>
        <Link href="/" className="text-blood-400 hover:underline mt-2 inline-block">Back to home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-zombies text-white tracking-wide flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-500" />
          Admin — Verifier leaderboard
        </h1>
        <p className="text-sm text-bunker-400 mt-1">
          Admins ranked by total verified runs. Admin level is based on XP from verifying runs.
        </p>
      </div>

      {loading ? (
        <Card variant="bordered" className="border-bunker-700">
          <CardContent className="py-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </CardContent>
        </Card>
      ) : rows.length === 0 ? (
        <Card variant="bordered" className="border-bunker-700">
          <CardContent className="py-12 text-center text-bunker-400 text-sm">
            No admins yet.
          </CardContent>
        </Card>
      ) : (
        <Card variant="bordered" className="border-bunker-700 overflow-hidden">
          <ul className="divide-y divide-bunker-800">
            {rows.map((row, i) => (
              <li
                key={row.id}
                className="grid grid-cols-[2.5rem_2.5rem_auto_1fr_5.5rem] md:grid-cols-[2.5rem_3rem_auto_1fr_6rem] items-center gap-x-3 px-4 py-3 min-h-[3.25rem] hover:bg-bunker-800/40 transition-colors"
              >
                <span className="text-base md:text-lg font-zombies text-blood-500 tabular-nums leading-none">
                  #{i + 1}
                </span>
                <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 flex-shrink-0">
                  <Image
                    src={row.levelIconPath}
                    alt={`Admin level ${row.level}`}
                    width={40}
                    height={40}
                    className="w-full h-full object-contain"
                    unoptimized
                  />
                </div>
                <div className="flex items-center justify-center flex-shrink-0">
                  <Avatar
                    src={row.avatarUrl}
                    fallback={row.displayName || row.username}
                    size="sm"
                    className="w-7 h-7 md:w-8 md:h-8 shrink-0 border border-bunker-600"
                  />
                </div>
                <div className="min-w-0 flex flex-col justify-center">
                  <Link
                    href={`/users/${row.username}`}
                    className="font-medium text-white truncate block hover:text-blood-400 leading-tight"
                  >
                    {row.displayName || row.username}
                  </Link>
                  <p className="text-xs text-bunker-500 leading-tight">
                    Level {row.level} · {row.adminXp.toLocaleString()} Admin XP
                  </p>
                </div>
                <div className="flex items-center justify-center flex-shrink-0 min-w-[3.5rem] md:min-w-[4rem]">
                  <span className="font-zombies-round-smeared font-extrabold tabular-nums text-amber-400 text-xl md:text-2xl leading-none">
                    {row.totalVerified.toLocaleString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
