'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Select,
  Input,
  Modal,
} from '@/components/ui';
import { Medal, Trophy, Clock, Award, Loader2, Lock, Plus, Banknote, Pencil } from 'lucide-react';
import { BO3_GOBBLEGUM_MODES, BO3_GOBBLEGUM_DEFAULT, getBo3GobbleGumLabel } from '@/lib/bo3';
import { BO4_DIFFICULTIES, getBo4DifficultyLabel } from '@/lib/bo4';
import { BOCW_SUPPORT_MODES, BOCW_SUPPORT_DEFAULT, getBocwSupportLabel } from '@/lib/bocw';
import { BO6_GOBBLEGUM_MODES, BO6_GOBBLEGUM_DEFAULT, BO6_SUPPORT_MODES, BO6_SUPPORT_DEFAULT, getBo6GobbleGumLabel, getBo6SupportLabel } from '@/lib/bo6';
import { BO7_SUPPORT_MODES, BO7_SUPPORT_DEFAULT, getBo7SupportLabel } from '@/lib/bo7';

type PollOption = { id: string; label: string; order: number; voteCount?: number };
type Poll = {
  id: string;
  title: string;
  status: string;
  startsAt: string;
  endsAt: string;
  options: PollOption[];
  userVoteOptionId: string | null;
};
type Tournament = {
  id: string;
  title: string;
  status: string;
  startsAt: string;
  endsAt: string;
  isOpen?: boolean;
  game?: { shortName: string };
  map?: { name: string; slug: string };
  challenge?: { name: string };
  easterEgg?: { name: string };
};
type LeaderboardEntry = {
  rank: number;
  user: { id: string; username: string; displayName: string | null; avatarUrl: string | null; level: number };
  roundReached?: number;
  completionTimeSeconds?: number | null;
  killsReached?: number | null;
  scoreReached?: number | null;
  isVerified: boolean;
  playerCount: string;
  trophyPlace?: number | null; // 1=gold, 2=silver, 3=bronze
};

function useCountdown(endsAt: string | null): number | null {
  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => {
    if (!endsAt) return setRemaining(null);
    const end = new Date(endsAt).getTime();
    const tick = () => {
      const now = Date.now();
      if (now >= end) return setRemaining(0);
      setRemaining(Math.max(0, Math.floor((end - now) / 1000)));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);
  return remaining;
}

const POLL_OPTION_MAX_LENGTH = 38;
const POLL_VOTE_COUNT_WIDTH = '3rem'; // space for 3 digits

function truncateOptionLabel(label: string): string {
  if (label.length <= POLL_OPTION_MAX_LENGTH) return label;
  return label.slice(0, POLL_OPTION_MAX_LENGTH - 1) + '…';
}

function formatCountdown(seconds: number | null): string {
  if (seconds == null) return '—';
  if (seconds <= 0) return 'Ended';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

export default function TournamentsPage() {
  const { user, profile } = useAuth();
  const [polls, setPolls] = useState<{ id: string; title: string; status: string; endsAt: string }[]>([]);
  const [pollId, setPollId] = useState<string | null>(null);
  const [poll, setPoll] = useState<Poll | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [tournamentId, setTournamentId] = useState<string | null>(null);
  const [tournament, setTournament] = useState<(Tournament & { isOpen?: boolean }) | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [search, setSearch] = useState('');
  const [trophySort, setTrophySort] = useState<'gold' | 'silver' | 'bronze'>('gold');
  const [trophyEntries, setTrophyEntries] = useState<{ user: { username: string; displayName: string | null }; gold: number; silver: number; bronze: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [adminMe, setAdminMe] = useState<{ isSuperAdmin: boolean } | null>(null);
  const [pollModalOpen, setPollModalOpen] = useState(false);
  /** When non-null, we're editing this poll; when null, we're creating a new poll. Used so "New poll" doesn't accidentally edit the currently selected poll. */
  const [pollModalEditingPoll, setPollModalEditingPoll] = useState<Poll | null>(null);
  const [pollModalTitle, setPollModalTitle] = useState('');
  const [pollModalOptions, setPollModalOptions] = useState<string[]>(['', '']);
  const [pollModalSaving, setPollModalSaving] = useState(false);
  const [voteConfirmModal, setVoteConfirmModal] = useState<{ optionId: string; optionLabel: string } | null>(null);
  const [concludePollLoading, setConcludePollLoading] = useState(false);
  const [createLeaderboardOpen, setCreateLeaderboardOpen] = useState(false);
  const [createLeaderboardLoading, setCreateLeaderboardLoading] = useState(false);
  const [prizePoolCents, setPrizePoolCents] = useState<number | null>(null);
  const [tipsModalOpen, setTipsModalOpen] = useState(false);
  const [prizePoolEditValue, setPrizePoolEditValue] = useState('');
  const [prizePoolEditOpen, setPrizePoolEditOpen] = useState(false);
  const [prizePoolSaving, setPrizePoolSaving] = useState(false);
  const [endTournamentModalOpen, setEndTournamentModalOpen] = useState(false);
  const [endTournamentLoading, setEndTournamentLoading] = useState(false);
  const [awardingKey, setAwardingKey] = useState<string | null>(null); // `${userId}-${place}` when awarding
  const [games, setGames] = useState<{ id: string; name: string; shortName: string }[]>([]);
  const [mapsByGame, setMapsByGame] = useState<{ id: string; name: string; slug: string; gameId: string }[]>([]);
  const [mapDetail, setMapDetail] = useState<{ challenges: { id: string; name: string }[]; easterEggs: { id: string; name: string }[] } | null>(null);
  const [createForm, setCreateForm] = useState<{
    title: string;
    gameId: string;
    mapId: string;
    challengeId: string;
    easterEggId: string;
    pollId: string;
    config: Record<string, unknown>;
  }>({ title: '', gameId: '', mapId: '', challengeId: '', easterEggId: '', pollId: '', config: {} });

  const pollEndsAt = poll?.endsAt ?? null;
  const countdown = useCountdown(pollEndsAt);
  const pollEnded = countdown !== null && countdown <= 0;

  const tournamentEndsAt = tournament?.endsAt ?? null;
  const tournamentCountdown = useCountdown(tournamentEndsAt);
  const tournamentEnded = tournamentCountdown !== null && tournamentCountdown <= 0;

  const fetchPolls = useCallback((keepSelection?: boolean) => {
    const url = `/api/tournaments/polls?t=${Date.now()}`;
    fetch(url, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setPolls(list);
        if (!keepSelection && list.length > 0 && !pollId) {
          const current = list.find((p: { status: string }) => p.status === 'ACTIVE') ?? list[0];
          setPollId(current?.id ?? list[0]?.id);
        }
      })
      .catch(() => setPolls([]));
  }, [pollId]);

  const fetchTournaments = useCallback(() => {
    fetch('/api/tournaments')
      .then((r) => r.json())
      .then((data) => {
        setTournaments(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length > 0 && !tournamentId) {
          const open = data.find((t: Tournament) => t.status === 'OPEN');
          const current = open ?? data[0];
          setTournamentId(current?.id ?? data[0]?.id);
        }
      })
      .catch(() => setTournaments([]));
  }, [tournamentId]);

  useEffect(() => {
    fetchPolls();
    fetchTournaments();
    fetch('/api/admin/me')
      .then((r) => r.json())
      .then((d) => setAdminMe({ isSuperAdmin: d.isSuperAdmin === true }))
      .catch(() => setAdminMe(null));
    fetch('/api/tournaments/prize-pool')
      .then((r) => r.json())
      .then((d) => setPrizePoolCents(typeof d.amountCents === 'number' ? d.amountCents : 0))
      .catch(() => setPrizePoolCents(0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!pollId) return setPoll(null);
    setLoading(true);
    fetch(`/api/tournaments/polls/${pollId}`)
      .then((r) => r.json())
      .then(setPoll)
      .catch(() => setPoll(null))
      .finally(() => setLoading(false));
  }, [pollId]);

  useEffect(() => {
    if (!tournamentId) return setTournament(null);
    fetch(`/api/tournaments/${tournamentId}`)
      .then((r) => r.json())
      .then(setTournament)
      .catch(() => setTournament(null));
  }, [tournamentId]);

  // When countdown hits 0, refetch tournament so isOpen/locked state updates
  useEffect(() => {
    if (tournamentId && tournamentCountdown === 0) {
      fetch(`/api/tournaments/${tournamentId}`)
        .then((r) => r.json())
        .then(setTournament)
        .catch(() => {});
    }
  }, [tournamentId, tournamentCountdown]);

  useEffect(() => {
    if (!tournamentId) return setLeaderboard([]);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    fetch(`/api/tournaments/${tournamentId}/leaderboard?${params}`)
      .then((r) => r.json())
      .then((d) => setLeaderboard(d.entries ?? []))
      .catch(() => setLeaderboard([]));
  }, [tournamentId, search]);

  useEffect(() => {
    fetch(`/api/tournaments/trophy-leaderboard?sort=${trophySort}`)
      .then((r) => r.json())
      .then((d) => setTrophyEntries(d.entries ?? []))
      .catch(() => setTrophyEntries([]));
  }, [trophySort]);

  useEffect(() => {
    if (!createLeaderboardOpen) return;
    fetch('/api/games')
      .then((r) => r.json())
      .then((list) => setGames(Array.isArray(list) ? list : []))
      .catch(() => setGames([]));
    fetchPolls();
    setCreateForm({ title: '', gameId: '', mapId: '', challengeId: '', easterEggId: '', pollId: '', config: {} });
    setMapsByGame([]);
    setMapDetail(null);
  }, [createLeaderboardOpen]);

  useEffect(() => {
    if (!createForm.gameId) {
      setMapsByGame([]);
      setMapDetail(null);
      return;
    }
    fetch(`/api/maps?gameId=${encodeURIComponent(createForm.gameId)}`)
      .then((r) => r.json())
      .then((list) => setMapsByGame(Array.isArray(list) ? list : []))
      .catch(() => setMapsByGame([]));
    setMapDetail(null);
    setCreateForm((f) => ({ ...f, mapId: '', challengeId: '', easterEggId: '', config: {} }));
  }, [createForm.gameId]);

  useEffect(() => {
    if (!createForm.mapId) {
      setMapDetail(null);
      return;
    }
    const map = mapsByGame.find((m) => m.id === createForm.mapId);
    if (!map?.slug) {
      setMapDetail(null);
      return;
    }
    fetch(`/api/maps/${encodeURIComponent(map.slug)}`)
      .then((r) => r.json())
      .then((data) =>
        setMapDetail({
          challenges: (data.challenges ?? []).filter((c: { isActive?: boolean }) => c.isActive !== false).map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })),
          easterEggs: (data.easterEggs ?? []).filter((e: { isActive?: boolean }) => e.isActive !== false).map((e: { id: string; name: string }) => ({ id: e.id, name: e.name })),
        })
      )
      .catch(() => setMapDetail(null));
    setCreateForm((f) => ({ ...f, challengeId: '', easterEggId: '' }));
  }, [createForm.mapId, mapsByGame]);

  const handleVote = (optionId: string) => {
    if (!pollId || voting) return;
    setVoteConfirmModal(null);
    setVoting(true);
    fetch(`/api/tournaments/polls/${pollId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ optionId }),
      credentials: 'same-origin',
    })
      .then((r) => {
        if (r.ok) fetch(`/api/tournaments/polls/${pollId}`).then((res) => res.json()).then(setPoll);
        else return r.json().then((d) => Promise.reject(new Error(d.error)));
      })
      .catch((e) => alert(e.message))
      .finally(() => setVoting(false));
  };

  const showPollResults = poll && (pollEnded || poll.status === 'ENDED');

  const tournamentLocked = tournament && (tournament.status === 'LOCKED' || (tournament.endsAt && new Date(tournament.endsAt) < new Date()));

  const openPollModal = (editPoll?: Poll | null) => {
    setPollModalEditingPoll(editPoll ?? null);
    if (editPoll) {
      setPollModalTitle(editPoll.title);
      setPollModalOptions(editPoll.options?.length ? editPoll.options.map((o) => o.label) : ['', '']);
    } else {
      setPollModalTitle('');
      setPollModalOptions(['', '']);
    }
    setPollModalOpen(true);
  };

  const savePoll = async () => {
    const options = pollModalOptions.map((o) => o.trim()).filter(Boolean);
    if (options.length < 2 || options.length > 8) {
      alert('Between 2 and 8 options required.');
      return;
    }
    const isEdit = !!pollModalEditingPoll;
    setPollModalSaving(true);
    try {
      if (isEdit && pollModalEditingPoll?.id) {
        const r = await fetch(`/api/tournaments/polls/${pollModalEditingPoll.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: pollModalTitle.trim() || undefined, options }),
          credentials: 'same-origin',
        });
        if (!r.ok) throw new Error((await r.json()).error);
        if (pollId === pollModalEditingPoll.id) {
          fetch(`/api/tournaments/polls/${pollModalEditingPoll.id}`).then((res) => res.json()).then(setPoll);
        }
        fetchPolls();
      } else {
        const r = await fetch('/api/tournaments/polls', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: pollModalTitle.trim(), options }),
          credentials: 'same-origin',
        });
        if (!r.ok) throw new Error((await r.json()).error);
        const data = await r.json();
        setPollId(data.id);
        setPoll(data);
        fetchPolls(true);
      }
      setPollModalOpen(false);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setPollModalSaving(false);
    }
  };

  const handleCreateLeaderboard = async () => {
    const { title, gameId, mapId, challengeId, easterEggId, pollId, config } = createForm;
    if (!title.trim() || !gameId || !mapId) {
      alert('Please enter a title and select a game and map.');
      return;
    }
    const hasChallenge = !!challengeId;
    const hasEe = !!easterEggId;
    if (hasChallenge === hasEe) {
      alert('Please select exactly one: a challenge or an Easter egg.');
      return;
    }
    const game = games.find((g) => g.id === gameId);
    const shortName = game?.shortName ?? '';
    const mergedConfig: Record<string, unknown> = {
      playerCount: (config?.playerCount as string) || 'SOLO',
      ...(shortName === 'BO3' && { bo3GobbleGumMode: (config?.bo3GobbleGumMode as string) || BO3_GOBBLEGUM_DEFAULT }),
      ...(shortName === 'BO4' && {
        difficulty: (config?.difficulty as string) || 'NORMAL',
        bo4ElixirMode: (config?.bo4ElixirMode as string) || 'CLASSIC',
      }),
      ...(shortName === 'BOCW' && {
        bocwSupportMode: (config?.bocwSupportMode as string) || BOCW_SUPPORT_DEFAULT,
        rampageInducerUsed: config?.rampageInducerUsed === true,
      }),
      ...(shortName === 'BO6' && {
        bo6GobbleGumMode: (config?.bo6GobbleGumMode as string) || BO6_GOBBLEGUM_DEFAULT,
        bo6SupportMode: (config?.bo6SupportMode as string) || BO6_SUPPORT_DEFAULT,
        rampageInducerUsed: config?.rampageInducerUsed === true,
      }),
      ...(shortName === 'BO7' && {
        bo7SupportMode: (config?.bo7SupportMode as string) || BO7_SUPPORT_DEFAULT,
        rampageInducerUsed: config?.rampageInducerUsed === true,
      }),
      ...(shortName === 'IW' && {
        useFortuneCards: config?.useFortuneCards === true,
        useDirectorsCut: config?.useDirectorsCut === true,
      }),
      ...(shortName === 'WW2' && { ww2ConsumablesUsed: config?.ww2ConsumablesUsed !== false }),
      ...(shortName === 'WWII' && { ww2ConsumablesUsed: config?.ww2ConsumablesUsed !== false }),
      ...(shortName === 'VANGUARD' && {
        vanguardVoidUsed: config?.vanguardVoidUsed !== false,
        rampageInducerUsed: config?.rampageInducerUsed === true,
      }),
      ...config,
    };
    setCreateLeaderboardLoading(true);
    try {
      const r = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          gameId,
          mapId,
          challengeId: hasChallenge ? challengeId : undefined,
          easterEggId: hasEe ? easterEggId : undefined,
          pollId: pollId || undefined,
          config: mergedConfig,
        }),
        credentials: 'same-origin',
      });
      if (!r.ok) throw new Error((await r.json()).error || 'Failed');
      const data = await r.json();
      setCreateLeaderboardOpen(false);
      setTournamentId(data.id);
      fetchTournaments();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setCreateLeaderboardLoading(false);
    }
  };

  const handleConcludePoll = async () => {
    if (!pollId || concludePollLoading) return;
    setConcludePollLoading(true);
    try {
      const r = await fetch(`/api/tournaments/polls/${pollId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ENDED', endsAt: new Date().toISOString() }),
        credentials: 'same-origin',
      });
      if (!r.ok) throw new Error((await r.json()).error || 'Failed');
      await fetch(`/api/tournaments/polls/${pollId}`).then((res) => res.json()).then(setPoll);
      fetchPolls();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setConcludePollLoading(false);
    }
  };

  const handleAwardTrophy = async (userId: string, place: 1 | 2 | 3) => {
    if (!tournamentId) return;
    const key = `${userId}-${place}`;
    setAwardingKey(key);
    try {
      const r = await fetch(`/api/tournaments/${tournamentId}/award-trophy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, place }),
        credentials: 'same-origin',
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Failed to award trophy');
      // Refetch tournament leaderboard and global trophy leaderboard
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      fetch(`/api/tournaments/${tournamentId}/leaderboard?${params}`)
        .then((res) => res.json())
        .then((d) => setLeaderboard(d.entries ?? []))
        .catch(() => {});
      fetch(`/api/tournaments/trophy-leaderboard?sort=${trophySort}`)
        .then((res) => res.json())
        .then((d) => setTrophyEntries(d.entries ?? []))
        .catch(() => {});
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setAwardingKey(null);
    }
  };

  const handleEndTournament = async () => {
    if (!tournamentId || endTournamentLoading) return;
    setEndTournamentLoading(true);
    try {
      const r = await fetch(`/api/tournaments/${tournamentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endNow: true }),
        credentials: 'same-origin',
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Failed');
      setTournament(data);
      setEndTournamentModalOpen(false);
      fetchTournaments();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setEndTournamentLoading(false);
    }
  };

  const handleSavePrizePool = async () => {
    const parsed = parseFloat(prizePoolEditValue);
    if (Number.isNaN(parsed) || parsed < 0) {
      alert('Enter a valid amount (0 or greater).');
      return;
    }
    setPrizePoolSaving(true);
    try {
      const r = await fetch('/api/tournaments/prize-pool', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountDollars: parsed }),
        credentials: 'same-origin',
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Failed');
      setPrizePoolCents(data.amountCents ?? Math.round(parsed * 100));
      setPrizePoolEditOpen(false);
      setPrizePoolEditValue('');
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setPrizePoolSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-bunker-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Rules at top + Prize pool & Add to Prizepool */}
        <section className="mb-8 flex flex-col sm:flex-row sm:items-start gap-6 sm:gap-8">
          <div className="max-w-2xl flex-1 min-w-0">
            <h2 className="text-lg font-zombies text-white mb-2">Rules</h2>
            <ul className="text-sm text-bunker-400 space-y-1 list-disc list-inside">
              <li>Polls run for 5 days. When the timer ends, voting closes and results are revealed.</li>
              <li>Each tournament runs for 7 days; after that, no more runs can be submitted.</li>
              <li>Top 3 verified runs receive gold (30k XP), silver (15k XP), and bronze (7.5k XP).</li>
              <li>Trophies are awarded by a super admin after the tournament closes.</li>
            </ul>
          </div>
          <div className="flex flex-col gap-4 shrink-0">
            {prizePoolCents !== null && (
              <div className="flex flex-col gap-1">
                <span className="text-bunker-400 text-sm font-medium flex items-center gap-1.5">
                  <Banknote className="w-5 h-5 text-amber-500 shrink-0" />
                  Current prize pool
                </span>
                {adminMe?.isSuperAdmin && prizePoolEditOpen ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={prizePoolEditValue}
                      onChange={(e) => setPrizePoolEditValue(e.target.value)}
                      placeholder="0"
                      className="w-28 px-3 py-2 rounded-lg bg-bunker-800 border border-bunker-600 text-white text-lg font-semibold tabular-nums"
                    />
                    <Button size="sm" onClick={handleSavePrizePool} disabled={prizePoolSaving}>
                      {prizePoolSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => { setPrizePoolEditOpen(false); setPrizePoolEditValue(''); }} disabled={prizePoolSaving}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-3xl sm:text-4xl font-bold tabular-nums text-amber-400 drop-shadow-sm">
                      ${((prizePoolCents ?? 0) / 100).toFixed(2)}
                    </span>
                    {adminMe?.isSuperAdmin && !prizePoolEditOpen && (
                      <button
                        type="button"
                        onClick={() => { setPrizePoolEditValue(String((prizePoolCents ?? 0) / 100)); setPrizePoolEditOpen(true); }}
                        className="text-bunker-500 hover:text-amber-400/80 p-1.5 rounded-lg hover:bg-bunker-800/80 transition-colors"
                        title="Edit prize pool"
                        aria-label="Edit prize pool"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
            <button
              type="button"
              onClick={() => setTipsModalOpen(true)}
              className="inline-flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-bunker-950 font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all border-2 border-amber-400/60 hover:scale-[1.02] active:scale-[0.98]"
              aria-label="Add to prizepool — view tips policy"
            >
              <Banknote className="w-6 h-6 shrink-0" />
              Add to Prizepool
            </button>
          </div>
        </section>

        {/* Tips / Prize pool policy modal */}
        <Modal
          isOpen={tipsModalOpen}
          onClose={() => setTipsModalOpen(false)}
          title="Tournament Prize Pool & Tips Policy"
          description="Official policy for tips and prize pool."
          size="md"
        >
          <div className="prose prose-invert prose-sm max-w-none text-bunker-300 space-y-4">
            <p className="text-bunker-400 text-xs uppercase tracking-wider font-semibold">⸻</p>
            <h3 className="text-base font-zombies text-white">🏆 Tournament Prize Pool & Tips Policy</h3>
            <ul className="list-disc list-inside space-y-1.5 text-sm">
              <li>This tournament is 100% free to enter.</li>
              <li>Tips to the prize pool are completely optional.</li>
              <li>Tipping does not increase your chances of winning.</li>
              <li>Tipping does not grant special advantages.</li>
              <li>95% of tips go to the tournament prize pool; 5% is held back for tax purposes.</li>
              <li>Of the 95% that goes to the prize pool: 1st place receives 65%, 2nd place 25%, and 3rd place 10%.</li>
              <li>All tips are posted in Discord for full transparency.</li>
              <li>This is a skill-based competition — no element of chance determines outcomes.</li>
              <li>By participating, you confirm you meet your local legal requirements for skill-based competitions.</li>
              <li>The organizers reserve the right to verify runs and disqualify submissions that do not follow official rules.</li>
            </ul>
            <p className="text-bunker-400 text-xs uppercase tracking-wider font-semibold">⸻</p>
            <h3 className="text-base font-zombies text-white">📝 When you tip</h3>
            <p className="text-sm">
              Please include the <strong className="text-bunker-200">tournament number</strong> (e.g. &quot;Tournament 1&quot; or &quot;CZT Tournament 2&quot;) and something about the tournament in your tip comment so we can track it easily and add it to the right prize pool.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4">
            <a
              href={process.env.NEXT_PUBLIC_KOFI_URL || 'https://ko-fi.com/raymiesegars'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setTipsModalOpen(false)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-bunker-950 font-bold text-base shadow-lg hover:shadow-xl transition-all border-2 border-amber-400/60 hover:scale-[1.02]"
              aria-label="Tip now — open tip link in new tab"
            >
              <Banknote className="w-5 h-5 shrink-0" />
              Tip Now
            </a>
            <Button variant="secondary" onClick={() => setTipsModalOpen(false)}>Close</Button>
          </div>
        </Modal>

        {/* End tournament confirmation (super admin) */}
        <Modal
          isOpen={endTournamentModalOpen}
          onClose={() => !endTournamentLoading && setEndTournamentModalOpen(false)}
          title="End tournament now?"
          description="This will lock the tournament permanently."
          size="sm"
        >
          <div className="flex flex-col gap-4 pt-1">
            <p className="text-sm text-bunker-300">
              The tournament will lock permanently and no new runs can be submitted. After that you can award trophies to the top 3 verified runs.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setEndTournamentModalOpen(false)} disabled={endTournamentLoading}>
                Cancel
              </Button>
              <Button
                variant="secondary"
                onClick={handleEndTournament}
                disabled={endTournamentLoading}
                className="bg-blood-900/50 border-blood-600 text-blood-200 hover:bg-blood-800/50"
              >
                {endTournamentLoading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : null}
                End tournament
              </Button>
            </div>
          </div>
        </Modal>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Poll */}
          <div className="lg:w-1/2 flex flex-col min-h-0">
            <Card variant="bordered" className="border-bunker-700 flex flex-col min-h-[320px] lg:min-h-[380px]">
              <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap shrink-0">
                <CardTitle className="text-lg font-zombies text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-blood-500 shrink-0" />
                  Tournament Poll
                </CardTitle>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <Select
                    value={pollId ?? ''}
                    onChange={(e) => setPollId(e.target.value || null)}
                    options={[
                      { value: '', label: 'Select poll' },
                      ...polls.map((p) => ({ value: p.id, label: p.title })),
                    ]}
                    className="min-w-[160px] bg-bunker-800 border-bunker-600 text-white"
                  />
                  {adminMe?.isSuperAdmin && (
                    <>
                      <Button variant="secondary" size="sm" onClick={() => openPollModal(null)}>New poll</Button>
                      {poll && <Button variant="secondary" size="sm" onClick={() => openPollModal(poll)}>Edit poll</Button>}
                      {poll && !pollEnded && poll.status === 'ACTIVE' && (
                        <Button variant="secondary" size="sm" onClick={handleConcludePoll} disabled={concludePollLoading}>
                          {concludePollLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                          Conclude poll
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 pt-0 min-h-0 flex-1">
                {loading && !poll ? (
                  <p className="text-bunker-400 text-sm py-4">Loading…</p>
                ) : !poll ? (
                  <p className="text-bunker-400 text-sm py-4">No poll selected.</p>
                ) : (
                  <>
                    <div className="space-y-3 shrink-0">
                      <h3 className="text-base font-medium text-white">{poll.title}</h3>
                      {!pollEnded && countdown != null && (
                        <div className="flex items-center gap-2 text-blood-400 text-sm">
                          <Clock className="w-4 h-4 shrink-0" />
                          <span>Time left: {formatCountdown(countdown)}</span>
                        </div>
                      )}
                    </div>
                    {adminMe?.isSuperAdmin && !showPollResults && (
                      <div className="shrink-0 rounded-lg border border-blue-700/60 bg-blue-950/30 px-4 py-3">
                        <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider mb-2">Admin: current votes</p>
                        <ul className="space-y-1.5">
                          {(poll.options as PollOption[]).map((opt) => (
                            <li key={opt.id} className="flex items-center gap-3 text-sm min-h-[1.5rem]">
                              <span className="text-blue-100 font-medium truncate flex-1 min-w-0 max-w-[38ch] flex items-center" style={{ minHeight: '1.5rem' }} title={opt.label}>{truncateOptionLabel(opt.label)}</span>
                              <span className="text-military-400 font-semibold tabular-nums text-right shrink-0 flex items-center justify-end" style={{ width: POLL_VOTE_COUNT_WIDTH, minHeight: '1.5rem' }}>{opt.voteCount ?? 0}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {showPollResults ? (
                      <div className="mt-1 min-h-[200px] overflow-y-auto">
                        <ul className="space-y-3">
                          {(poll.options as PollOption[]).map((opt) => (
                            <li key={opt.id} className="flex items-center gap-3 py-3 px-4 rounded-lg bg-bunker-800/50 border border-bunker-700 min-h-[3rem]">
                              <span className="text-bunker-100 font-zombies text-base font-semibold tracking-wide truncate flex-1 min-w-0 max-w-[38ch] flex items-center" title={opt.label}>{truncateOptionLabel(opt.label)}</span>
                              <span className="text-military-400 font-semibold tabular-nums ml-auto shrink-0 flex items-center justify-end" style={{ width: POLL_VOTE_COUNT_WIDTH }}>{opt.voteCount ?? 0}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="mt-1 min-h-[200px] overflow-y-auto">
                        <ul className="space-y-3">
                          {(poll.options as PollOption[]).map((opt) => {
                            const isVoted = poll.userVoteOptionId === opt.id;
                            return (
                              <li key={opt.id}>
                                {isVoted ? (
                                  <div
                                    className="w-full flex items-center gap-3 py-4 px-5 rounded-xl border-2 border-blue-700/80 bg-blue-950/50 cursor-not-allowed opacity-90 min-h-[3.25rem]"
                                    aria-disabled="true"
                                  >
                                    <span className="text-blue-100 font-zombies text-base font-semibold tracking-wide truncate flex-1 min-w-0 max-w-[38ch] flex items-center" title={opt.label}>{truncateOptionLabel(opt.label)}</span>
                                    <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-800/80 text-blue-200 font-semibold text-sm border border-blue-600/60">
                                      <Lock className="w-4 h-4" />
                                      Voted (locked)
                                    </span>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setVoteConfirmModal({ optionId: opt.id, optionLabel: opt.label })}
                                    disabled={voting || pollEnded || !!poll.userVoteOptionId}
                                    className="w-full flex items-center gap-3 py-4 px-5 rounded-xl border-2 border-blood-500/70 bg-blood-900/40 hover:bg-blood-800/50 hover:border-blood-500 disabled:opacity-50 disabled:cursor-not-allowed text-left transition-all shadow-md hover:shadow-blood-900/30 min-h-[3.25rem]"
                                  >
                                    <span className="text-white font-zombies text-base font-semibold tracking-wide truncate flex-1 min-w-0 max-w-[38ch] flex items-center" title={opt.label}>{truncateOptionLabel(opt.label)}</span>
                                    <span className="shrink-0 px-4 py-2 rounded-lg bg-blood-600 hover:bg-blood-500 text-white font-semibold text-sm border border-blood-500 shadow-sm flex items-center">Vote</span>
                                  </button>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                    {!user && !pollEnded && (
                      <p className="text-xs text-bunker-500 mt-2 shrink-0">Sign in to vote.</p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Leaderboard */}
          <div className="lg:w-1/2 flex flex-col min-h-0">
            <Card variant="bordered" className="border-bunker-700 flex flex-col min-h-[320px] lg:min-h-[380px]">
              <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap shrink-0">
                <CardTitle className="text-lg font-zombies text-white flex items-center gap-2">
                  <Medal className="w-5 h-5 text-blood-500 shrink-0" />
                  Tournament Leaderboard
                </CardTitle>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <Select
                    value={tournamentId ?? ''}
                    onChange={(e) => setTournamentId(e.target.value || null)}
                    options={[
                      { value: '', label: 'Select tournament' },
                      ...tournaments.map((t) => ({ value: t.id, label: t.title })),
                    ]}
                    className="min-w-[160px] bg-bunker-800 border-bunker-600 text-white"
                  />
                  {adminMe?.isSuperAdmin && tournamentId && tournament?.isOpen && !tournamentEnded && (
                    <Button variant="secondary" size="sm" onClick={() => setEndTournamentModalOpen(true)}>
                      End tournament
                    </Button>
                  )}
                  {adminMe?.isSuperAdmin && (
                    <Button variant="secondary" size="sm" onClick={() => setCreateLeaderboardOpen(true)}>
                      Create leaderboard
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 pt-0 min-h-0 flex-1 overflow-hidden">
                {tournament && (
                  <>
                    <p className="text-bunker-400 text-sm shrink-0">
                      {tournament.game?.shortName} · {tournament.map?.name}
                      {tournament.challenge ? ` · ${tournament.challenge.name}` : tournament.easterEgg ? ` · ${tournament.easterEgg.name}` : ''}
                    </p>
                    {tournamentEndsAt && (
                      <div className="flex items-center gap-2 text-blood-400 text-sm shrink-0">
                        <Clock className="w-4 h-4 shrink-0" />
                        <span>
                          {tournamentEnded
                            ? 'Locked — no new runs can be submitted'
                            : `Time until lock: ${formatCountdown(tournamentCountdown)}`}
                        </span>
                      </div>
                    )}
                  </>
                )}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 shrink-0">
                  <Input
                    placeholder="Search player..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-bunker-800 border-bunker-600 text-white flex-1 min-w-0"
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 shrink-0">
                    {tournament?.isOpen && user && tournament.map?.slug && (
                      <Link href={`/maps/${tournament.map.slug}/edit?tournamentId=${tournamentId}`} className="block min-w-0">
                        <Button
                          size="sm"
                          className="w-full min-h-[2.25rem] sm:min-w-[10.5rem] inline-flex items-center justify-center gap-1.5"
                        >
                          <Plus className="w-4 h-4 shrink-0" />
                          Submit run
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                  {(() => {
                    const awardedPlaces = new Set(leaderboard.map((x) => x.trophyPlace).filter((p): p is number => p != null));
                    const goldAwarded = awardedPlaces.has(1);
                    const silverAwarded = awardedPlaces.has(2);
                    const bronzeAwarded = awardedPlaces.has(3);
                    return (
                  <ul className="space-y-1 pr-1">
                    {leaderboard.map((e) => {
                      const userHasTrophy = e.trophyPlace != null;
                      return (
                        <li key={e.user.id} className="flex items-center gap-2 py-2 text-sm border-b border-bunker-800/50 last:border-0">
                          {/* Trophy on far left when awarded */}
                          <span className="w-6 shrink-0 flex items-center justify-center">
                            {e.trophyPlace === 1 && <span title="Gold"><Medal className="w-4 h-4 text-amber-400" /></span>}
                            {e.trophyPlace === 2 && <span title="Silver"><Medal className="w-4 h-4 text-bunker-400" /></span>}
                            {e.trophyPlace === 3 && <span title="Bronze"><Medal className="w-4 h-4 text-amber-700" /></span>}
                          </span>
                          <span className="text-bunker-500 w-6 shrink-0 tabular-nums">#{e.rank}</span>
                          <span className="text-white font-medium min-w-0 truncate">{e.user.displayName || e.user.username}</span>
                          {e.completionTimeSeconds != null && (
                            <span className="text-military-400 ml-auto shrink-0 tabular-nums">
                              {Math.floor(e.completionTimeSeconds / 60)}:{(e.completionTimeSeconds % 60).toString().padStart(2, '0')}
                            </span>
                          )}
                          {e.killsReached != null && e.completionTimeSeconds == null && (
                            <span className="text-military-400 ml-auto shrink-0">{e.killsReached.toLocaleString()} kills</span>
                          )}
                          {e.scoreReached != null && e.completionTimeSeconds == null && e.killsReached == null && (
                            <span className="text-military-400 ml-auto shrink-0">{e.scoreReached >= 1e9 ? (e.scoreReached / 1e9).toFixed(2) + 'B' : e.scoreReached >= 1e6 ? (e.scoreReached / 1e6).toFixed(2) + 'M' : e.scoreReached.toLocaleString()}</span>
                          )}
                          {e.roundReached != null && e.completionTimeSeconds == null && e.killsReached == null && e.scoreReached == null && (
                            <span className="text-military-400 ml-auto shrink-0">Round {e.roundReached}</span>
                          )}
                          {e.isVerified && (
                            <span className="text-blue-400 text-xs shrink-0" title="Verified">✓</span>
                          )}
                          {/* Super admin: Gold / Silver / Bronze buttons per run */}
                          {adminMe?.isSuperAdmin && tournamentId && tournamentLocked && !userHasTrophy && (
                            <div className="flex items-center gap-1 shrink-0 ml-1">
                              <button
                                type="button"
                                onClick={() => handleAwardTrophy(e.user.id, 1)}
                                disabled={goldAwarded || awardingKey !== null}
                                title="Award gold"
                                className="px-2 py-0.5 rounded text-xs font-medium bg-amber-900/60 text-amber-300 border border-amber-600/50 hover:bg-amber-800/60 disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                {awardingKey === `${e.user.id}-1` ? <Loader2 className="w-3 h-3 animate-spin inline" /> : '🥇'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAwardTrophy(e.user.id, 2)}
                                disabled={silverAwarded || awardingKey !== null}
                                title="Award silver"
                                className="px-2 py-0.5 rounded text-xs font-medium bg-bunker-700 text-bunker-300 border border-bunker-600 hover:bg-bunker-600 disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                {awardingKey === `${e.user.id}-2` ? <Loader2 className="w-3 h-3 animate-spin inline" /> : '🥈'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAwardTrophy(e.user.id, 3)}
                                disabled={bronzeAwarded || awardingKey !== null}
                                title="Award bronze"
                                className="px-2 py-0.5 rounded text-xs font-medium bg-amber-950/80 text-amber-600 border border-amber-700/50 hover:bg-amber-900/60 disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                {awardingKey === `${e.user.id}-3` ? <Loader2 className="w-3 h-3 animate-spin inline" /> : '🥉'}
                              </button>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                    );
                  })()}
                  {leaderboard.length === 0 && tournamentId && (
                    <p className="text-bunker-500 text-sm py-6 text-center">No runs yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Trophy leaderboard */}
        <section className="mt-10">
          <Card variant="bordered" className="border-bunker-700 max-w-2xl flex flex-col min-h-[280px]">
            <CardHeader className="flex flex-row items-center justify-between gap-2 shrink-0">
              <CardTitle className="text-base font-zombies text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500 shrink-0" />
                Trophy Leaderboard
              </CardTitle>
              <Select
                value={trophySort}
                onChange={(e) => setTrophySort(e.target.value as 'gold' | 'silver' | 'bronze')}
                options={[
                  { value: 'gold', label: 'Gold' },
                  { value: 'silver', label: 'Silver' },
                  { value: 'bronze', label: 'Bronze' },
                ]}
                className="min-w-[100px] bg-bunker-800 border-bunker-600 text-white"
              />
            </CardHeader>
            <CardContent className="min-h-0 flex-1 overflow-hidden pt-0">
              <div className="h-[220px] overflow-y-auto overscroll-contain">
                <ul className="space-y-1.5 text-sm pr-1">
                  {trophyEntries.slice(0, 15).map((e, i) => (
                    <li key={e.user.username} className="flex items-center gap-2 py-1.5 border-b border-bunker-800/50 last:border-0">
                      <span className="text-bunker-500 w-5 shrink-0 tabular-nums">{i + 1}.</span>
                      <span className="text-white min-w-0 truncate">{e.user.displayName || e.user.username}</span>
                      <span className="text-amber-400 shrink-0">{e.gold}🥇</span>
                      <span className="text-bunker-400 shrink-0">{e.silver}🥈</span>
                      <span className="text-amber-700 shrink-0">{e.bronze}🥉</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Vote confirmation modal */}
        <Modal
          isOpen={!!voteConfirmModal}
          onClose={() => !voting && setVoteConfirmModal(null)}
          title="Confirm your vote"
          description={voteConfirmModal ? `You're voting for "${voteConfirmModal.optionLabel}". You cannot change your vote later.` : ''}
          size="sm"
        >
          <div className="flex flex-col gap-4 pt-1">
            <p className="text-sm text-bunker-300">
              Your vote is final. Once submitted, you won&apos;t be able to change it for this poll.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setVoteConfirmModal(null)} disabled={voting}>
                Cancel
              </Button>
              <Button
                onClick={() => voteConfirmModal && handleVote(voteConfirmModal.optionId)}
                disabled={voting || !voteConfirmModal}
              >
                {voting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                Confirm vote
              </Button>
            </div>
          </div>
        </Modal>

        {/* Create leaderboard modal (super admin) */}
        <Modal
          isOpen={createLeaderboardOpen}
          onClose={() => !createLeaderboardLoading && setCreateLeaderboardOpen(false)}
          title="Create tournament leaderboard"
          description="Set the game, map, and category. The leaderboard runs for 7 days."
          size="sm"
        >
          <div className="space-y-3">
            <Input
              label="Title"
              value={createForm.title}
              onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. CZT Tournament 1"
              className="bg-bunker-800"
            />
            <div>
              <label className="block text-sm font-medium text-bunker-300 mb-1">Game</label>
              <Select
                value={createForm.gameId}
                onChange={(e) => setCreateForm((f) => ({ ...f, gameId: e.target.value }))}
                options={[{ value: '', label: 'Select game' }, ...games.map((g) => ({ value: g.id, label: g.shortName || g.name }))]}
                className="w-full bg-bunker-800 border-bunker-600 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-bunker-300 mb-1">Map</label>
              <Select
                value={createForm.mapId}
                onChange={(e) => setCreateForm((f) => ({ ...f, mapId: e.target.value }))}
                options={[{ value: '', label: 'Select map' }, ...mapsByGame.map((m) => ({ value: m.id, label: m.name }))]}
                className="w-full bg-bunker-800 border-bunker-600 text-white"
                disabled={!createForm.gameId}
              />
            </div>
            {mapDetail && (
              <>
                <div>
                  <label className="block text-sm font-medium text-bunker-300 mb-1">Challenge (pick one)</label>
                  <Select
                    value={createForm.challengeId}
                    onChange={(e) => setCreateForm((f) => ({ ...f, challengeId: e.target.value, easterEggId: '' }))}
                    options={[{ value: '', label: 'None' }, ...mapDetail.challenges.map((c) => ({ value: c.id, label: c.name }))]}
                    className="w-full bg-bunker-800 border-bunker-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-bunker-300 mb-1">Easter egg (or pick one)</label>
                  <Select
                    value={createForm.easterEggId}
                    onChange={(e) => setCreateForm((f) => ({ ...f, easterEggId: e.target.value, challengeId: '' }))}
                    options={[{ value: '', label: 'None' }, ...mapDetail.easterEggs.map((e) => ({ value: e.id, label: e.name }))]}
                    className="w-full bg-bunker-800 border-bunker-600 text-white"
                  />
                </div>
              </>
            )}
            {createForm.gameId && (() => {
              const game = games.find((g) => g.id === createForm.gameId);
              const shortName = game?.shortName ?? '';
              const config = (createForm.config || {}) as Record<string, string | boolean>;
              const setConfig = (key: string, value: string | boolean) => {
                setCreateForm((f) => ({ ...f, config: { ...(f.config || {}), [key]: value } }));
              };
              return (
                <div className="space-y-3 pt-2 border-t border-bunker-700">
                  <p className="text-sm font-medium text-bunker-200">Tournament rules (locked when submitting)</p>
                  <div>
                    <label className="block text-sm font-medium text-bunker-300 mb-1">Player count</label>
                    <Select
                      value={String(config.playerCount || 'SOLO')}
                      onChange={(e) => setConfig('playerCount', e.target.value)}
                      options={[
                        { value: 'SOLO', label: 'Solo' },
                        { value: 'DUO', label: 'Duo' },
                        { value: 'TRIO', label: 'Trio' },
                        { value: 'SQUAD', label: 'Squad' },
                      ]}
                      className="w-full bg-bunker-800 border-bunker-600 text-white"
                    />
                  </div>
                  {shortName === 'BO3' && (
                    <div>
                      <label className="block text-sm font-medium text-bunker-300 mb-1">GobbleGums</label>
                      <Select
                        value={String(config.bo3GobbleGumMode ?? BO3_GOBBLEGUM_DEFAULT)}
                        onChange={(e) => setConfig('bo3GobbleGumMode', e.target.value)}
                        options={BO3_GOBBLEGUM_MODES.map((m) => ({ value: m, label: getBo3GobbleGumLabel(m) }))}
                        className="w-full bg-bunker-800 border-bunker-600 text-white"
                      />
                    </div>
                  )}
                  {shortName === 'BO4' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-bunker-300 mb-1">Difficulty</label>
                        <Select
                          value={String(config.difficulty ?? 'NORMAL')}
                          onChange={(e) => setConfig('difficulty', e.target.value)}
                          options={BO4_DIFFICULTIES.map((d) => ({ value: d, label: getBo4DifficultyLabel(d) }))}
                          className="w-full bg-bunker-800 border-bunker-600 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-bunker-300 mb-1">Elixirs</label>
                        <Select
                          value={String(config.bo4ElixirMode ?? 'CLASSIC')}
                          onChange={(e) => setConfig('bo4ElixirMode', e.target.value)}
                          options={[
                            { value: 'CLASSIC', label: 'Classic only' },
                            { value: 'ALL', label: 'All elixirs' },
                          ]}
                          className="w-full bg-bunker-800 border-bunker-600 text-white"
                        />
                      </div>
                    </>
                  )}
                  {shortName === 'BOCW' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-bunker-300 mb-1">Support</label>
                        <Select
                          value={String(config.bocwSupportMode ?? BOCW_SUPPORT_DEFAULT)}
                          onChange={(e) => setConfig('bocwSupportMode', e.target.value)}
                          options={BOCW_SUPPORT_MODES.map((m) => ({ value: m, label: getBocwSupportLabel(m) }))}
                          className="w-full bg-bunker-800 border-bunker-600 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-bunker-300 mb-1">Rampage Inducer</label>
                        <Select
                          value={config.rampageInducerUsed === true ? 'true' : 'false'}
                          onChange={(e) => setConfig('rampageInducerUsed', e.target.value === 'true')}
                          options={[
                            { value: 'false', label: 'No Rampage Inducer' },
                            { value: 'true', label: 'Rampage Inducer' },
                          ]}
                          className="w-full bg-bunker-800 border-bunker-600 text-white"
                        />
                      </div>
                    </>
                  )}
                  {shortName === 'BO6' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-bunker-300 mb-1">GobbleGums</label>
                        <Select
                          value={String(config.bo6GobbleGumMode ?? BO6_GOBBLEGUM_DEFAULT)}
                          onChange={(e) => setConfig('bo6GobbleGumMode', e.target.value)}
                          options={BO6_GOBBLEGUM_MODES.map((m) => ({ value: m, label: getBo6GobbleGumLabel(m) }))}
                          className="w-full bg-bunker-800 border-bunker-600 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-bunker-300 mb-1">Support</label>
                        <Select
                          value={String(config.bo6SupportMode ?? BO6_SUPPORT_DEFAULT)}
                          onChange={(e) => setConfig('bo6SupportMode', e.target.value)}
                          options={BO6_SUPPORT_MODES.map((m) => ({ value: m, label: getBo6SupportLabel(m) }))}
                          className="w-full bg-bunker-800 border-bunker-600 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-bunker-300 mb-1">Rampage Inducer</label>
                        <Select
                          value={config.rampageInducerUsed === true ? 'true' : 'false'}
                          onChange={(e) => setConfig('rampageInducerUsed', e.target.value === 'true')}
                          options={[
                            { value: 'false', label: 'No Rampage Inducer' },
                            { value: 'true', label: 'Rampage Inducer' },
                          ]}
                          className="w-full bg-bunker-800 border-bunker-600 text-white"
                        />
                      </div>
                    </>
                  )}
                  {shortName === 'BO7' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-bunker-300 mb-1">Support</label>
                        <Select
                          value={String(config.bo7SupportMode ?? BO7_SUPPORT_DEFAULT)}
                          onChange={(e) => setConfig('bo7SupportMode', e.target.value)}
                          options={BO7_SUPPORT_MODES.map((m) => ({ value: m, label: getBo7SupportLabel(m) }))}
                          className="w-full bg-bunker-800 border-bunker-600 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-bunker-300 mb-1">Rampage Inducer</label>
                        <Select
                          value={config.rampageInducerUsed === true ? 'true' : 'false'}
                          onChange={(e) => setConfig('rampageInducerUsed', e.target.value === 'true')}
                          options={[
                            { value: 'false', label: 'No Rampage Inducer' },
                            { value: 'true', label: 'Rampage Inducer' },
                          ]}
                          className="w-full bg-bunker-800 border-bunker-600 text-white"
                        />
                      </div>
                    </>
                  )}
                  {shortName === 'IW' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-bunker-300 mb-1">Fortune Cards</label>
                        <Select
                          value={config.useFortuneCards === true ? 'true' : 'false'}
                          onChange={(e) => setConfig('useFortuneCards', e.target.value === 'true')}
                          options={[
                            { value: 'false', label: 'Fate cards only' },
                            { value: 'true', label: 'Fate & Fortune cards' },
                          ]}
                          className="w-full bg-bunker-800 border-bunker-600 text-white"
                        />
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.useDirectorsCut === true}
                          onChange={(e) => setConfig('useDirectorsCut', e.target.checked)}
                          className="w-4 h-4 rounded border-bunker-600 bg-bunker-800 text-blood-500"
                        />
                        <span className="text-sm text-bunker-300">Directors Cut</span>
                      </label>
                    </>
                  )}
                  {(shortName === 'WW2' || shortName === 'WWII') && (
                    <div>
                      <label className="block text-sm font-medium text-bunker-300 mb-1">Consumables</label>
                      <Select
                        value={config.ww2ConsumablesUsed !== false ? 'true' : 'false'}
                        onChange={(e) => setConfig('ww2ConsumablesUsed', e.target.value === 'true')}
                        options={[
                          { value: 'true', label: 'With Consumables' },
                          { value: 'false', label: 'No Consumables' },
                        ]}
                        className="w-full bg-bunker-800 border-bunker-600 text-white"
                      />
                    </div>
                  )}
                  {shortName === 'VANGUARD' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-bunker-300 mb-1">Void</label>
                        <Select
                          value={config.vanguardVoidUsed !== false ? 'true' : 'false'}
                          onChange={(e) => setConfig('vanguardVoidUsed', e.target.value === 'true')}
                          options={[
                            { value: 'true', label: 'With Void' },
                            { value: 'false', label: 'Without Void' },
                          ]}
                          className="w-full bg-bunker-800 border-bunker-600 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-bunker-300 mb-1">Rampage Inducer</label>
                        <Select
                          value={config.rampageInducerUsed === true ? 'true' : 'false'}
                          onChange={(e) => setConfig('rampageInducerUsed', e.target.value === 'true')}
                          options={[
                            { value: 'false', label: 'No Rampage Inducer' },
                            { value: 'true', label: 'Rampage Inducer' },
                          ]}
                          className="w-full bg-bunker-800 border-bunker-600 text-white"
                        />
                      </div>
                    </>
                  )}
                </div>
              );
            })()}
            <div>
              <label className="block text-sm font-medium text-bunker-300 mb-1">Link to poll (optional)</label>
              <Select
                value={createForm.pollId}
                onChange={(e) => setCreateForm((f) => ({ ...f, pollId: e.target.value }))}
                options={[{ value: '', label: 'None' }, ...polls.map((p) => ({ value: p.id, label: p.title }))]}
                className="w-full bg-bunker-800 border-bunker-600 text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setCreateLeaderboardOpen(false)} disabled={createLeaderboardLoading}>
                Cancel
              </Button>
              <Button onClick={handleCreateLeaderboard} disabled={createLeaderboardLoading || !createForm.title.trim() || !createForm.gameId || !createForm.mapId || !mapDetail || (!createForm.challengeId && !createForm.easterEggId)}>
                {createLeaderboardLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                Create leaderboard
              </Button>
            </div>
          </div>
        </Modal>

        {/* Create/Edit Poll modal (super admin) */}
        {adminMe?.isSuperAdmin && (
          <Modal
            isOpen={pollModalOpen}
            onClose={() => !pollModalSaving && setPollModalOpen(false)}
            title={pollModalEditingPoll ? 'Edit poll' : 'Create poll'}
            description="2–8 options. Poll runs 5 days from creation."
            size="sm"
          >
            <div className="space-y-3">
              <Input
                label="Title"
                value={pollModalTitle}
                onChange={(e) => setPollModalTitle(e.target.value)}
                placeholder="e.g. CZT Tournament 1"
                className="bg-bunker-800"
              />
              {pollModalOptions.map((opt, i) => (
                <Input
                  key={i}
                  value={opt}
                  onChange={(e) => {
                    const next = [...pollModalOptions];
                    next[i] = e.target.value;
                    setPollModalOptions(next);
                  }}
                  placeholder={`Option ${i + 1}`}
                  className="bg-bunker-800"
                />
              ))}
              <div className="flex gap-2">
                {pollModalOptions.length < 8 && (
                  <Button variant="secondary" size="sm" onClick={() => setPollModalOptions([...pollModalOptions, ''])}>
                    Add option
                  </Button>
                )}
                {pollModalOptions.length > 2 && (
                  <Button variant="secondary" size="sm" onClick={() => setPollModalOptions(pollModalOptions.slice(0, -1))}>
                    Remove option
                  </Button>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" onClick={() => setPollModalOpen(false)} disabled={pollModalSaving}>Cancel</Button>
                <Button onClick={() => savePoll()} disabled={pollModalSaving || !pollModalTitle.trim()}>
                  {pollModalSaving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                  {pollModalEditingPoll ? 'Save' : 'Create'}
                </Button>
              </div>
            </div>
          </Modal>
        )}

      </div>
    </div>
  );
}
