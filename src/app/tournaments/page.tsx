'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  Avatar,
} from '@/components/ui';
import { Medal, Trophy, Clock, Award, Loader2, Lock, Plus, Banknote, Pencil, BookOpen, Trash2, ShieldCheck, KeyRound } from 'lucide-react';
import { TournamentRulesContent } from '@/components/tournament-rules-content';
import { getGameDisplayShortName } from '@/lib/bo3-custom';
import { BO3_GOBBLEGUM_MODES, BO3_GOBBLEGUM_DEFAULT, getBo3GobbleGumLabel } from '@/lib/bo3';
import { BO4_DIFFICULTIES, BO4_ELIXIR_MODES, getBo4DifficultyLabel, getBo4ElixirModeLabel } from '@/lib/bo4';
import { BOCW_SUPPORT_MODES, BOCW_SUPPORT_DEFAULT, getBocwSupportLabel } from '@/lib/bocw';
import { BO6_GOBBLEGUM_MODES, BO6_GOBBLEGUM_DEFAULT, BO6_SUPPORT_MODES, BO6_SUPPORT_DEFAULT, getBo6GobbleGumLabel, getBo6SupportLabel } from '@/lib/bo6';
import { BO7_SUPPORT_MODES, BO7_SUPPORT_DEFAULT, getBo7SupportLabel } from '@/lib/bo7';
import { TournamentLeaderboardEntry } from '@/components/game';
import { DEFAULT_PRIZE_RULES, type PrizeRulesPayload, type PrizeRulesScope } from '@/lib/tournament-prize-rules';

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
  config?: Record<string, unknown>;
  game?: { shortName: string };
  map?: { name: string; slug: string };
  challenge?: { name: string };
  easterEgg?: { name: string };
};
type LeaderboardEntry = {
  rank: number;
  user: { id: string; username: string; displayName: string | null; avatarUrl: string | null; avatarPreset?: string | null; level: number };
  roundReached?: number;
  completionTimeSeconds?: number | null;
  killsReached?: number | null;
  scoreReached?: number | null;
  isVerified: boolean;
  playerCount: string;
  trophyPlace?: number | null; // 1=gold, 2=silver, 3=bronze
  logId?: string;
  logType?: 'challenge' | 'easter-egg';
  mapSlug?: string;
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

const POLL_VOTE_COUNT_WIDTH = '3rem'; // space for 3 digits

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
  const { user, profile, signInWithGoogle } = useAuth();
  const [polls, setPolls] = useState<{ id: string; title: string; status: string; endsAt: string }[]>([]);
  const [pollId, setPollId] = useState<string | null>(null);
  const [poll, setPoll] = useState<Poll | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [tournamentId, setTournamentId] = useState<string | null>(null);
  const [tournament, setTournament] = useState<(Tournament & { isOpen?: boolean }) | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);
  const [leaderboardRefreshKey, setLeaderboardRefreshKey] = useState(0);
  const leaderboardRequestSeq = useRef(0);
  const [search, setSearch] = useState('');
  const [trophySort, setTrophySort] = useState<'gold' | 'silver' | 'bronze'>('gold');
  const [trophyEntries, setTrophyEntries] = useState<{ user: { username: string; displayName: string | null }; gold: number; silver: number; bronze: number }[]>([]);
  const [trophyLeaderboardLoading, setTrophyLeaderboardLoading] = useState(true);
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
  const [voteSignInModalOpen, setVoteSignInModalOpen] = useState(false);
  const [concludePollLoading, setConcludePollLoading] = useState(false);
  const [createLeaderboardOpen, setCreateLeaderboardOpen] = useState(false);
  const [createLeaderboardLoading, setCreateLeaderboardLoading] = useState(false);
  const [currentPrizePoolCents, setCurrentPrizePoolCents] = useState<number | null>(null);
  const [nextPrizePoolCents, setNextPrizePoolCents] = useState<number | null>(null);
  const [currentPrizeRules, setCurrentPrizeRules] = useState<PrizeRulesPayload>(DEFAULT_PRIZE_RULES);
  const [nextPrizeRules, setNextPrizeRules] = useState<PrizeRulesPayload>(DEFAULT_PRIZE_RULES);
  const [prizeRulesModalScope, setPrizeRulesModalScope] = useState<PrizeRulesScope | null>(null);
  const [prizeRulesEditOpen, setPrizeRulesEditOpen] = useState(false);
  const [prizeRulesEditTitle, setPrizeRulesEditTitle] = useState('');
  const [prizeRulesEditItems, setPrizeRulesEditItems] = useState('');
  const [prizeRulesEditTipNote, setPrizeRulesEditTipNote] = useState('');
  const [prizeRulesSaving, setPrizeRulesSaving] = useState(false);
  const [prizePoolEditValue, setPrizePoolEditValue] = useState('');
  const [prizePoolEditScope, setPrizePoolEditScope] = useState<PrizeRulesScope | null>(null);
  const [prizePoolSaving, setPrizePoolSaving] = useState(false);
  const [endTournamentModalOpen, setEndTournamentModalOpen] = useState(false);
  const [endTournamentLoading, setEndTournamentLoading] = useState(false);
  const [deleteTournamentModal1Open, setDeleteTournamentModal1Open] = useState(false);
  const [deleteTournamentModal2Open, setDeleteTournamentModal2Open] = useState(false);
  const [deleteTournamentConfirmText, setDeleteTournamentConfirmText] = useState('');
  const [deleteTournamentLoading, setDeleteTournamentLoading] = useState(false);
  const [editTournamentModalOpen, setEditTournamentModalOpen] = useState(false);
  const [editTournamentConfig, setEditTournamentConfig] = useState<Record<string, unknown>>({});
  const [editTournamentSaving, setEditTournamentSaving] = useState(false);
  const [learnRulesModalOpen, setLearnRulesModalOpen] = useState(false);
  const [tournamentVerificationContent, setTournamentVerificationContent] = useState('');
  const [tournamentVerificationEditOpen, setTournamentVerificationEditOpen] = useState(false);
  const [tournamentVerificationDraft, setTournamentVerificationDraft] = useState('');
  const [tournamentVerificationSaving, setTournamentVerificationSaving] = useState(false);
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

  const fetchTournaments = useCallback((opts?: { bypassCache?: boolean }) => {
    const url = opts?.bypassCache ? `/api/tournaments?_=${Date.now()}` : '/api/tournaments';
    fetch(url, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setTournaments(list);
        const ids = new Set(list.map((t: Tournament) => t.id));
        if (tournamentId && !ids.has(tournamentId)) {
          setTournamentId(null);
          setTournament(null);
          setLeaderboard([]);
        } else if (list.length > 0 && !tournamentId) {
          const open = list.find((t: Tournament) => t.status === 'OPEN');
          const current = open ?? list[0];
          setTournamentId(current?.id ?? list[0]?.id);
        }
      })
      .catch(() => setTournaments([]));
  }, [tournamentId]);

  useEffect(() => {
    fetchPolls();
    fetchTournaments();
    fetch('/api/admin/me', { credentials: 'same-origin', cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { admin: null }))
      .then((d) => setAdminMe(d?.admin ? { isSuperAdmin: d.admin.isSuperAdmin === true } : null))
      .catch(() => setAdminMe(null));
    fetch('/api/tournaments/prize-pool?scope=current')
      .then((r) => r.json())
      .then((d) => setCurrentPrizePoolCents(typeof d.amountCents === 'number' ? d.amountCents : 0))
      .catch(() => setCurrentPrizePoolCents(0));
    fetch('/api/tournaments/prize-pool?scope=next')
      .then((r) => r.json())
      .then((d) => setNextPrizePoolCents(typeof d.amountCents === 'number' ? d.amountCents : 0))
      .catch(() => setNextPrizePoolCents(0));
    fetch('/api/tournaments/prize-rules?scope=current')
      .then((r) => r.json())
      .then((d) =>
        setCurrentPrizeRules({
          title: typeof d.title === 'string' && d.title.trim() ? d.title : DEFAULT_PRIZE_RULES.title,
          items: Array.isArray(d.items) ? d.items.filter((x: unknown): x is string => typeof x === 'string' && x.trim().length > 0) : DEFAULT_PRIZE_RULES.items,
          tipNote: typeof d.tipNote === 'string' && d.tipNote.trim() ? d.tipNote : DEFAULT_PRIZE_RULES.tipNote,
        })
      )
      .catch(() => setCurrentPrizeRules(DEFAULT_PRIZE_RULES));
    fetch('/api/tournaments/prize-rules?scope=next')
      .then((r) => r.json())
      .then((d) =>
        setNextPrizeRules({
          title: typeof d.title === 'string' && d.title.trim() ? d.title : DEFAULT_PRIZE_RULES.title,
          items: Array.isArray(d.items) ? d.items.filter((x: unknown): x is string => typeof x === 'string' && x.trim().length > 0) : DEFAULT_PRIZE_RULES.items,
          tipNote: typeof d.tipNote === 'string' && d.tipNote.trim() ? d.tipNote : DEFAULT_PRIZE_RULES.tipNote,
        })
      )
      .catch(() => setNextPrizeRules(DEFAULT_PRIZE_RULES));
    fetch('/api/tournaments/verification-message', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setTournamentVerificationContent(typeof d.content === 'string' ? d.content : ''))
      .catch(() => setTournamentVerificationContent(''));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!pollId) return setPoll(null);
    setLoading(true);
    fetch(`/api/tournaments/polls/${pollId}`, { credentials: 'same-origin', cache: 'no-store' })
      .then((r) => r.json())
      .then(setPoll)
      .catch(() => setPoll(null))
      .finally(() => setLoading(false));
  }, [pollId]);

  // Super admin: refetch poll so options include vote counts (GET returns them only when session is admin)
  useEffect(() => {
    if (!adminMe?.isSuperAdmin || !pollId || !poll) return;
    const opts = poll.options as PollOption[] | undefined;
    if (opts?.length && opts.every((o) => o.voteCount === undefined)) {
      fetch(`/api/tournaments/polls/${pollId}`, { credentials: 'same-origin', cache: 'no-store' })
        .then((r) => r.json())
        .then(setPoll)
        .catch(() => {});
    }
  }, [adminMe?.isSuperAdmin, pollId, poll]);

  useEffect(() => {
    if (!tournamentId) return setTournament(null);
    fetch(`/api/tournaments/${tournamentId}`, { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) {
          setTournament(null);
          setTournamentId(null);
          return null;
        }
        return r.json();
      })
      .then((data) => { if (data) setTournament(data); })
      .catch(() => { setTournament(null); setTournamentId(null); });
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
    if (!tournamentId) {
      setLeaderboard([]);
      setLeaderboardError(null);
      setLeaderboardLoading(false);
      return;
    }
    const requestSeq = ++leaderboardRequestSeq.current;
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    setLeaderboardLoading(true);
    setLeaderboardError(null);

    (async () => {
      try {
        const response = await fetch(`/api/tournaments/${tournamentId}/leaderboard?${params}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        const payload = (await response.json().catch(() => ({}))) as { entries?: LeaderboardEntry[]; error?: string };

        if (controller.signal.aborted || requestSeq !== leaderboardRequestSeq.current) return;
        if (!response.ok) {
          setLeaderboardError(payload.error || 'Failed to load leaderboard.');
          return;
        }

        setLeaderboard(Array.isArray(payload.entries) ? payload.entries : []);
      } catch {
        if (controller.signal.aborted || requestSeq !== leaderboardRequestSeq.current) return;
        setLeaderboardError('Failed to load leaderboard. Please try again.');
      } finally {
        if (!controller.signal.aborted && requestSeq === leaderboardRequestSeq.current) {
          setLeaderboardLoading(false);
        }
      }
    })();

    return () => controller.abort();
  }, [tournamentId, search, leaderboardRefreshKey]);

  useEffect(() => {
    setTrophyLeaderboardLoading(true);
    fetch(`/api/tournaments/trophy-leaderboard?sort=${trophySort}`)
      .then((r) => r.json())
      .then((d) => setTrophyEntries(d.entries ?? []))
      .catch(() => setTrophyEntries([]))
      .finally(() => setTrophyLeaderboardLoading(false));
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
  }, [createLeaderboardOpen, fetchPolls]);

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
    if (!user) {
      setVoteConfirmModal(null);
      setVoteSignInModalOpen(true);
      return;
    }
    setVoteConfirmModal(null);
    setVoting(true);
    fetch(`/api/tournaments/polls/${pollId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ optionId }),
      credentials: 'same-origin',
    })
      .then(async (r) => {
        if (r.ok) fetch(`/api/tournaments/polls/${pollId}`).then((res) => res.json()).then(setPoll);
        else {
          const d = await r.json().catch(() => ({} as { error?: string }));
          const err = new Error(d.error || 'Failed to submit vote') as Error & { status?: number };
          err.status = r.status;
          return Promise.reject(err);
        }
      })
      .catch((e: unknown) => {
        const status = typeof e === 'object' && e !== null && 'status' in e ? (e as { status?: number }).status : undefined;
        const message = e instanceof Error ? e.message : 'Failed to submit vote';
        if (status === 401 || message.toLowerCase() === 'unauthorized') {
          setVoteSignInModalOpen(true);
          return;
        }
        alert(message);
      })
      .finally(() => setVoting(false));
  };

  const showPollResults = poll && (pollEnded || poll.status === 'ENDED');

  const tournamentLocked = tournament && (tournament.status === 'LOCKED' || (tournament.endsAt && new Date(tournament.endsAt) < new Date()));
  const hasLivePoll = !!poll && poll.status === 'ACTIVE' && !pollEnded;
  const refreshLeaderboard = useCallback(() => {
    setLeaderboardRefreshKey((prev) => prev + 1);
  }, []);
  const prizeRulesModalTitle =
    prizeRulesModalScope === 'next' ? 'Next Tournament Prize Rules' : 'Current Tournament Prize Rules';
  const selectedPrizeRules =
    prizeRulesModalScope === 'next' ? nextPrizeRules : currentPrizeRules;

  const openEditTournamentModal = () => {
    if (!tournament) return;
    const cfg = (tournament.config && typeof tournament.config === 'object' ? tournament.config : {}) as Record<string, unknown>;
    const elixir = cfg.bo4ElixirMode as string | undefined;
    if (elixir === 'CLASSIC') cfg.bo4ElixirMode = 'CLASSIC_ONLY';
    else if (elixir === 'ALL') cfg.bo4ElixirMode = 'ALL_ELIXIRS_TALISMANS';
    setEditTournamentConfig({ ...cfg });
    setEditTournamentModalOpen(true);
  };

  const handleSaveEditTournament = async () => {
    if (!tournamentId || !tournament) return;
    setEditTournamentSaving(true);
    try {
      const cfg = { ...editTournamentConfig };
      const elixir = cfg.bo4ElixirMode as string | undefined;
      if (elixir === 'CLASSIC') cfg.bo4ElixirMode = 'CLASSIC_ONLY';
      else if (elixir === 'ALL') cfg.bo4ElixirMode = 'ALL_ELIXIRS_TALISMANS';
      const r = await fetch(`/api/tournaments/${tournamentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: cfg }),
        credentials: 'same-origin',
      });
      const data = await r.json();
      if (!r.ok) throw new Error((data as { error?: string }).error || 'Failed');
      setTournament(data);
      setEditTournamentModalOpen(false);
      refreshLeaderboard();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setEditTournamentSaving(false);
    }
  };

  const openTournamentVerificationEdit = () => {
    setTournamentVerificationDraft(tournamentVerificationContent);
    setTournamentVerificationEditOpen(true);
  };

  const saveTournamentVerificationMessage = async () => {
    setTournamentVerificationSaving(true);
    try {
      const r = await fetch('/api/tournaments/verification-message', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: tournamentVerificationDraft }),
        credentials: 'same-origin',
      });
      const data = (await r.json().catch(() => ({}))) as { error?: string; content?: string };
      if (!r.ok) throw new Error(data.error || 'Failed to save');
      setTournamentVerificationContent(typeof data.content === 'string' ? data.content : tournamentVerificationDraft);
      setTournamentVerificationEditOpen(false);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setTournamentVerificationSaving(false);
    }
  };

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
      ...(shortName === 'BO3' && {
        bo3GobbleGumMode: (config?.bo3GobbleGumMode as string) || BO3_GOBBLEGUM_DEFAULT,
        bo3AatUsed: config?.bo3AatUsed === true,
      }),
      ...(shortName === 'BO4' && {
        difficulty: (config?.difficulty as string) || 'NORMAL',
        bo4ElixirMode: (config?.bo4ElixirMode as string) || 'CLASSIC_ONLY',
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
      refreshLeaderboard();
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

  const handleDeleteTournament = async () => {
    if (!tournamentId || deleteTournamentLoading || deleteTournamentConfirmText !== 'DELETE') return;
    setDeleteTournamentLoading(true);
    try {
      const r = await fetch(`/api/tournaments/${tournamentId}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Failed');
      setDeleteTournamentModal2Open(false);
      setDeleteTournamentModal1Open(false);
      setDeleteTournamentConfirmText('');
      setTournamentId(null);
      setTournament(null);
      setLeaderboard([]);
      fetchTournaments({ bypassCache: true });
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setDeleteTournamentLoading(false);
    }
  };

  const handleSavePrizePool = async () => {
    if (!prizePoolEditScope) return;
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
        body: JSON.stringify({ scope: prizePoolEditScope, amountDollars: parsed }),
        credentials: 'same-origin',
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Failed');
      const cents = data.amountCents ?? Math.round(parsed * 100);
      if (prizePoolEditScope === 'current') setCurrentPrizePoolCents(cents);
      else setNextPrizePoolCents(cents);
      setPrizePoolEditScope(null);
      setPrizePoolEditValue('');
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setPrizePoolSaving(false);
    }
  };

  const openPrizePoolEdit = (scope: PrizeRulesScope) => {
    const value = scope === 'current' ? currentPrizePoolCents : nextPrizePoolCents;
    setPrizePoolEditValue(String((value ?? 0) / 100));
    setPrizePoolEditScope(scope);
  };

  const openPrizeRulesEditor = () => {
    if (!prizeRulesModalScope) return;
    const rules = prizeRulesModalScope === 'next' ? nextPrizeRules : currentPrizeRules;
    setPrizeRulesEditTitle(rules.title);
    setPrizeRulesEditItems(rules.items.join('\n'));
    setPrizeRulesEditTipNote(rules.tipNote);
    setPrizeRulesEditOpen(true);
  };

  const handleSavePrizeRules = async () => {
    if (!prizeRulesModalScope) return;
    const items = prizeRulesEditItems
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    if (items.length === 0) {
      alert('Add at least one prize rule item.');
      return;
    }

    setPrizeRulesSaving(true);
    try {
      const r = await fetch('/api/tournaments/prize-rules', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          scope: prizeRulesModalScope,
          title: prizeRulesEditTitle.trim() || DEFAULT_PRIZE_RULES.title,
          items,
          tipNote: prizeRulesEditTipNote.trim() || DEFAULT_PRIZE_RULES.tipNote,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Failed to update prize rules');
      const nextValue: PrizeRulesPayload = {
        title: data.title,
        items: data.items,
        tipNote: data.tipNote,
      };
      if (prizeRulesModalScope === 'next') setNextPrizeRules(nextValue);
      else setCurrentPrizeRules(nextValue);
      setPrizeRulesEditOpen(false);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setPrizeRulesSaving(false);
    }
  };

  return (
    <div className="min-h-dvh bg-bunker-950 min-w-0 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-6 xl:px-8 py-6 sm:py-8 min-w-0">
        <section className="mb-6 sm:mb-8 min-w-0">
          <div className={`grid grid-cols-1 ${hasLivePoll ? 'xl:grid-cols-2' : ''} gap-4 sm:gap-6 min-w-0`}>
            <Card variant="bordered" className="border-amber-600/40 bg-gradient-to-br from-bunker-900 to-bunker-950">
              <CardContent className="pt-6 space-y-5">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wider text-amber-300/90 font-semibold">Current Tournament</p>
                  <h2 className="text-2xl sm:text-3xl font-zombies text-white">Live Prize Pool</h2>
                  <div className="flex items-center gap-2 text-bunker-300 text-xs sm:text-sm">
                    <Clock className="w-4 h-4 shrink-0 text-blood-400" />
                    <span>{tournamentEnded ? 'Tournament locked' : 'Time until lock'}</span>
                  </div>
                  <p className="text-3xl sm:text-5xl font-extrabold tabular-nums tracking-tight text-blood-300 leading-none">
                    {tournament ? formatCountdown(tournamentCountdown) : '—'}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-bunker-300 text-sm font-medium flex items-center gap-1.5">
                    <Banknote className="w-5 h-5 text-amber-500 shrink-0" />
                    Current prize pool
                  </span>
                  {adminMe?.isSuperAdmin && prizePoolEditScope === 'current' ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={prizePoolEditValue}
                        onChange={(e) => setPrizePoolEditValue(e.target.value)}
                        placeholder="0"
                        className="w-32 px-3 py-2 rounded-lg bg-bunker-800 border border-bunker-600 text-white text-lg font-semibold tabular-nums"
                      />
                      <Button size="sm" onClick={handleSavePrizePool} disabled={prizePoolSaving}>
                        {prizePoolSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => { setPrizePoolEditScope(null); setPrizePoolEditValue(''); }} disabled={prizePoolSaving}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-3xl sm:text-4xl font-bold tabular-nums text-amber-400 drop-shadow-sm">
                        ${((currentPrizePoolCents ?? 0) / 100).toFixed(2)}
                      </span>
                      {adminMe?.isSuperAdmin && (
                        <button
                          type="button"
                          onClick={() => openPrizePoolEdit('current')}
                          className="text-bunker-500 hover:text-amber-400/80 p-1.5 rounded-lg hover:bg-bunker-800/80 transition-colors"
                          title="Edit current prize pool"
                          aria-label="Edit current prize pool"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setPrizeRulesModalScope('current')}
                    className="inline-flex flex-1 items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-bunker-950 font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all border-2 border-amber-400/60"
                  >
                    <ShieldCheck className="w-5 h-5 shrink-0" />
                    Prize Rules
                  </button>
                  <a
                    href={process.env.NEXT_PUBLIC_KOFI_URL || 'https://ko-fi.com/raymiesegars'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-bunker-800 hover:bg-bunker-700 text-amber-200 font-semibold text-sm border border-amber-600/50"
                    aria-label="Add to current tournament prize pool"
                  >
                    <Banknote className="w-4 h-4 shrink-0" />
                    Add to Prize Pool
                  </a>
                </div>
              </CardContent>
            </Card>

            {hasLivePoll && (
              <Card variant="bordered" className="border-blue-600/40 bg-gradient-to-br from-bunker-900 to-bunker-950">
                <CardContent className="pt-6 space-y-5">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wider text-blue-300/90 font-semibold">Next Tournament</p>
                    <h2 className="text-2xl sm:text-3xl font-zombies text-white">Poll Countdown</h2>
                    <div className="flex items-center gap-2 text-bunker-300 text-xs sm:text-sm">
                      <Clock className="w-4 h-4 shrink-0 text-blue-400" />
                      <span>Poll closes in</span>
                    </div>
                    <p className="text-3xl sm:text-5xl font-extrabold tabular-nums tracking-tight text-blue-300 leading-none">
                      {formatCountdown(countdown)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-bunker-300 text-sm font-medium flex items-center gap-1.5">
                      <Banknote className="w-5 h-5 text-blue-400 shrink-0" />
                      Next tournament prize pool
                    </span>
                    {adminMe?.isSuperAdmin && prizePoolEditScope === 'next' ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          value={prizePoolEditValue}
                          onChange={(e) => setPrizePoolEditValue(e.target.value)}
                          placeholder="0"
                          className="w-32 px-3 py-2 rounded-lg bg-bunker-800 border border-bunker-600 text-white text-lg font-semibold tabular-nums"
                        />
                        <Button size="sm" onClick={handleSavePrizePool} disabled={prizePoolSaving}>
                          {prizePoolSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => { setPrizePoolEditScope(null); setPrizePoolEditValue(''); }} disabled={prizePoolSaving}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-3xl sm:text-4xl font-bold tabular-nums text-blue-300 drop-shadow-sm">
                          ${((nextPrizePoolCents ?? 0) / 100).toFixed(2)}
                        </span>
                        {adminMe?.isSuperAdmin && (
                          <button
                            type="button"
                            onClick={() => openPrizePoolEdit('next')}
                            className="text-bunker-500 hover:text-blue-300 p-1.5 rounded-lg hover:bg-bunker-800/80 transition-colors"
                            title="Edit next prize pool"
                            aria-label="Edit next prize pool"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => setPrizeRulesModalScope('next')}
                      className="inline-flex flex-1 items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-bunker-950 font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all border-2 border-blue-400/60"
                    >
                      <ShieldCheck className="w-5 h-5 shrink-0" />
                      Prize Rules
                    </button>
                    <a
                      href={process.env.NEXT_PUBLIC_KOFI_URL || 'https://ko-fi.com/raymiesegars'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-bunker-800 hover:bg-bunker-700 text-blue-200 font-semibold text-sm border border-blue-600/50"
                      aria-label="Add to next tournament prize pool"
                    >
                      <Banknote className="w-4 h-4 shrink-0" />
                      Add to Prize Pool
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Prize rules modal */}
        <Modal
          isOpen={prizeRulesModalScope !== null}
          onClose={() => setPrizeRulesModalScope(null)}
          title={prizeRulesModalTitle}
          description="Official policy for tips and prize pool."
          size="md"
        >
          <div className="prose prose-invert prose-sm max-w-none text-bunker-300 space-y-4">
            <p className="text-bunker-400 text-xs uppercase tracking-wider font-semibold">⸻</p>
            <h3 className="text-base font-zombies text-white">🏆 {selectedPrizeRules.title}</h3>
            <ul className="list-disc list-inside space-y-1.5 text-sm">
              {selectedPrizeRules.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="text-bunker-400 text-xs uppercase tracking-wider font-semibold">⸻</p>
            <h3 className="text-base font-zombies text-white">📝 When you tip</h3>
            <p className="text-sm">{selectedPrizeRules.tipNote}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4">
            <div>
              {adminMe?.isSuperAdmin && (
                <Button variant="secondary" onClick={openPrizeRulesEditor}>
                  <Pencil className="w-4 h-4 shrink-0 mr-1" />
                  Edit Prize Rules
                </Button>
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <a
              href={process.env.NEXT_PUBLIC_KOFI_URL || 'https://ko-fi.com/raymiesegars'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setPrizeRulesModalScope(null)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-bunker-950 font-bold text-base shadow-lg hover:shadow-xl transition-all border-2 border-amber-400/60 hover:scale-[1.02]"
              aria-label="Tip now — open tip link in new tab"
            >
              <Banknote className="w-5 h-5 shrink-0" />
              Tip Now
            </a>
            <Button variant="secondary" onClick={() => setPrizeRulesModalScope(null)}>Close</Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={prizeRulesEditOpen}
          onClose={() => !prizeRulesSaving && setPrizeRulesEditOpen(false)}
          title={prizeRulesModalScope === 'next' ? 'Edit Next Tournament Prize Rules' : 'Edit Current Tournament Prize Rules'}
          description="One bullet per line keeps formatting clean."
          size="md"
        >
          <div className="space-y-3">
            <Input
              label="Rules heading"
              value={prizeRulesEditTitle}
              onChange={(e) => setPrizeRulesEditTitle(e.target.value)}
              className="bg-bunker-800 border-bunker-600 text-white"
              placeholder="Tournament Prize Pool & Tips Policy"
            />
            <div>
              <label className="block text-sm font-medium text-bunker-300 mb-1">Rule bullets (one per line)</label>
              <textarea
                value={prizeRulesEditItems}
                onChange={(e) => setPrizeRulesEditItems(e.target.value)}
                rows={10}
                className="w-full px-3 py-2 rounded-lg bg-bunker-800 border border-bunker-600 text-white text-sm"
                placeholder="Each line becomes a bullet point"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-bunker-300 mb-1">When you tip note</label>
              <textarea
                value={prizeRulesEditTipNote}
                onChange={(e) => setPrizeRulesEditTipNote(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded-lg bg-bunker-800 border border-bunker-600 text-white text-sm"
                placeholder="Tip instructions shown in the Prize Rules modal"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setPrizeRulesEditOpen(false)} disabled={prizeRulesSaving}>
                Cancel
              </Button>
              <Button onClick={handleSavePrizeRules} disabled={prizeRulesSaving}>
                {prizeRulesSaving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                Save Rules
              </Button>
            </div>
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

        {/* Delete tournament confirmation 1 (super admin) */}
        <Modal
          isOpen={deleteTournamentModal1Open}
          onClose={() => !deleteTournamentLoading && setDeleteTournamentModal1Open(false)}
          title="Delete this tournament?"
          description="First confirmation."
          size="sm"
        >
          <div className="flex flex-col gap-4 pt-1">
            <p className="text-sm text-bunker-300">
              This will permanently remove the tournament and all its leaderboard data, logs, and trophies. This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDeleteTournamentModal1Open(false)} disabled={deleteTournamentLoading}>
                Cancel
              </Button>
              <Button
                variant="secondary"
                onClick={() => { setDeleteTournamentModal1Open(false); setDeleteTournamentModal2Open(true); }}
                disabled={deleteTournamentLoading}
                className="bg-blood-900/50 border-blood-600 text-blood-200 hover:bg-blood-800/50"
              >
                I understand, continue
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete tournament confirmation 2 (super admin) */}
        <Modal
          isOpen={deleteTournamentModal2Open}
          onClose={() => !deleteTournamentLoading && (setDeleteTournamentModal2Open(false), setDeleteTournamentConfirmText(''))}
          title="Final confirmation"
          description="Type DELETE to confirm."
          size="sm"
        >
          <div className="flex flex-col gap-4 pt-1">
            <p className="text-sm text-bunker-300">
              Type <strong className="text-blood-400">DELETE</strong> below to permanently delete this tournament.
            </p>
            <Input
              value={deleteTournamentConfirmText}
              onChange={(e) => setDeleteTournamentConfirmText(e.target.value)}
              placeholder="DELETE"
              className="bg-bunker-800 border-bunker-600 text-white font-mono"
              autoComplete="off"
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => { setDeleteTournamentModal2Open(false); setDeleteTournamentConfirmText(''); }} disabled={deleteTournamentLoading}>
                Cancel
              </Button>
              <Button
                variant="secondary"
                onClick={handleDeleteTournament}
                disabled={deleteTournamentLoading || deleteTournamentConfirmText !== 'DELETE'}
                className="bg-blood-900/50 border-blood-600 text-blood-200 hover:bg-blood-800/50 disabled:opacity-50"
              >
                {deleteTournamentLoading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : null}
                Delete permanently
              </Button>
            </div>
          </div>
        </Modal>

        {(() => {
          const activePoll = poll && !pollEnded && poll.status === 'ACTIVE';
          const userHasVoted = !!poll?.userVoteOptionId;
          const pollFirst = activePoll && !userHasVoted;
          return (
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 lg:gap-8 items-stretch min-w-0">
          {/* Poll: full width row, first when active+not voted else last. Wide: Leaderboard 60% | Trophy 40% side by side. */}
          <div className={`flex flex-col min-h-0 min-w-0 lg:col-span-2 ${pollFirst ? 'order-1' : 'order-3'}`}>
            <Card variant="bordered" className="border-bunker-700 flex flex-col min-h-[320px] lg:min-h-[380px] w-full min-w-0 overflow-hidden">
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
                            <li key={opt.id} className="flex items-start sm:items-center gap-3 text-sm min-h-[1.5rem] w-full">
                              <span className="text-blue-100 font-medium whitespace-normal break-words leading-snug flex-1 min-w-0" style={{ minHeight: '1.5rem' }} title={opt.label}>{opt.label}</span>
                              <span className="text-military-400 font-semibold tabular-nums text-right shrink-0 flex items-center justify-end ml-auto" style={{ width: POLL_VOTE_COUNT_WIDTH, minHeight: '1.5rem' }}>{opt.voteCount ?? 0}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {showPollResults ? (
                      <div className="mt-1 min-h-[200px] overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
                        <ul className="space-y-3">
                          {(poll.options as PollOption[]).map((opt) => (
                            <li key={opt.id} className="flex items-start sm:items-center gap-3 py-3 px-3 sm:px-4 rounded-lg bg-bunker-800/50 border border-bunker-700 min-h-[3rem] w-full">
                              <span className="text-bunker-100 font-zombies text-base font-semibold tracking-wide whitespace-normal break-words leading-snug flex-1 min-w-0" title={opt.label}>{opt.label}</span>
                              <span className="text-military-400 font-semibold tabular-nums ml-auto shrink-0 flex items-center justify-end" style={{ width: POLL_VOTE_COUNT_WIDTH }}>{opt.voteCount ?? 0}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="mt-1 min-h-[200px] overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
                        <ul className="space-y-3">
                          {(poll.options as PollOption[]).map((opt) => {
                            const isVoted = poll.userVoteOptionId === opt.id;
                            return (
                              <li key={opt.id} className="w-full">
                                {isVoted ? (
                                  <div
                                    className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-3 py-4 px-3 sm:px-5 rounded-xl border-2 border-blue-700/80 bg-blue-950/50 cursor-not-allowed opacity-90 min-h-[3.25rem]"
                                    aria-disabled="true"
                                  >
                                    <span className="text-blue-100 font-zombies text-base font-semibold tracking-wide whitespace-normal break-words leading-snug w-full sm:flex-1 min-w-0" title={opt.label}>{opt.label}</span>
                                    <span className="shrink-0 sm:ml-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-800/80 text-blue-200 font-semibold text-sm border border-blue-600/60">
                                      <Lock className="w-4 h-4" />
                                      Voted (locked)
                                    </span>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!user) {
                                        setVoteSignInModalOpen(true);
                                        return;
                                      }
                                      setVoteConfirmModal({ optionId: opt.id, optionLabel: opt.label });
                                    }}
                                    disabled={voting || pollEnded || !!poll.userVoteOptionId}
                                    className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-3 py-4 px-3 sm:px-5 rounded-xl border-2 border-blood-500/70 bg-blood-900/40 hover:bg-blood-800/50 hover:border-blood-500 disabled:opacity-50 disabled:cursor-not-allowed text-left transition-all shadow-md hover:shadow-blood-900/30 min-h-[3.25rem]"
                                  >
                                    <span className="text-white font-zombies text-base font-semibold tracking-wide whitespace-normal break-words leading-snug w-full sm:flex-1 min-w-0" title={opt.label}>{opt.label}</span>
                                    <span className="shrink-0 sm:ml-auto px-4 py-2 rounded-lg bg-blood-600 hover:bg-blood-500 text-white font-semibold text-sm border border-blood-500 shadow-sm flex items-center">Vote</span>
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

          {/* Tournament Leaderboard: left 3/5 on wide screens */}
          <div className={`flex flex-col gap-4 min-h-0 min-w-0 h-full ${pollFirst ? 'order-2' : 'order-1'}`}>
            {(tournamentVerificationContent.trim().length > 0 || adminMe?.isSuperAdmin) && (
              <Card
                variant="bordered"
                className="border-amber-700/45 bg-gradient-to-br from-amber-950/35 via-bunker-950/90 to-bunker-900/95 shadow-lg shadow-amber-950/20 w-full min-w-0 overflow-hidden shrink-0"
              >
                <CardHeader className="flex flex-row items-start sm:items-center justify-between gap-3 flex-wrap shrink-0 pb-2">
                  <CardTitle className="text-base sm:text-lg font-zombies text-amber-100 flex items-start sm:items-center gap-2.5 tracking-wide">
                    <span className="mt-0.5 sm:mt-0 inline-flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg border border-amber-600/50 bg-amber-950/50 text-amber-300">
                      <KeyRound className="w-5 h-5 sm:w-[1.35rem] sm:h-[1.35rem]" aria-hidden />
                    </span>
                    <span className="leading-snug">Tournament Secret Code for Verification</span>
                  </CardTitle>
                  {adminMe?.isSuperAdmin && (
                    <Button
                      variant="secondary"
                      size="sm"
                      type="button"
                      onClick={openTournamentVerificationEdit}
                      className="border-amber-700/60 bg-amber-950/40 text-amber-100 hover:bg-amber-900/50 hover:border-amber-600/70 shrink-0"
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="pt-0 pb-4 sm:pb-5">
                  {tournamentVerificationContent.trim() ? (
                    <div className="rounded-lg border border-bunker-700/80 bg-bunker-950/60 px-3 py-3 sm:px-4 sm:py-4 text-sm sm:text-base text-bunker-50 whitespace-pre-wrap break-words">
                      {tournamentVerificationContent}
                    </div>
                  ) : adminMe?.isSuperAdmin ? (
                    <p className="text-sm text-bunker-500 italic px-0.5">
                      No message yet. Players will not see this block until you add text. Click Edit to publish instructions for the current tournament run.
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            )}
            <Card variant="bordered" className="border-bunker-700 flex flex-col min-h-[320px] lg:min-h-[380px] w-full min-w-0">
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
                  {adminMe?.isSuperAdmin && tournamentId && tournamentLocked && (
                    <Button variant="secondary" size="sm" onClick={() => setDeleteTournamentModal1Open(true)} className="text-blood-400 hover:text-blood-300 border-blood-700 hover:border-blood-600">
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete tournament
                    </Button>
                  )}
                  {adminMe?.isSuperAdmin && tournamentId && tournament && (
                    <Button variant="secondary" size="sm" onClick={openEditTournamentModal}>
                      <Pencil className="w-4 h-4 mr-1" />
                      Edit rules
                    </Button>
                  )}
                  {adminMe?.isSuperAdmin && (
                    <Button variant="secondary" size="sm" onClick={() => setCreateLeaderboardOpen(true)}>
                      Create leaderboard
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 pt-0">
                {tournament && (
                  <>
                    <p className="text-bunker-400 text-sm shrink-0">
                      {getGameDisplayShortName(tournament.game?.shortName)} · {tournament.map?.name}
                      {tournament.challenge ? ` · ${tournament.challenge.name}` : tournament.easterEgg ? ` · ${tournament.easterEgg.name}` : ''}
                      {tournament.game?.shortName === 'BO3' && tournament.config && typeof tournament.config === 'object' && (
                        <>
                          {' · '}
                          {getBo3GobbleGumLabel((tournament.config.bo3GobbleGumMode as string) || BO3_GOBBLEGUM_DEFAULT)}
                          {(tournament.config.bo3AatUsed as boolean) ? ' · AATs Used' : ' · No AATs'}
                        </>
                      )}
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
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setLearnRulesModalOpen(true)}
                      className="inline-flex items-center justify-center gap-1.5"
                    >
                      <BookOpen className="w-4 h-4 shrink-0" />
                      Learn Rules
                    </Button>
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
                <div className="min-h-[220px]">
                  {leaderboardError && tournamentId && (
                    <div className="mb-3 rounded-lg border border-blood-700/60 bg-blood-950/30 px-3 py-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
                      <p className="text-sm text-blood-200">{leaderboardError}</p>
                      <Button size="sm" variant="secondary" onClick={refreshLeaderboard} className="w-full sm:w-auto">
                        Retry
                      </Button>
                    </div>
                  )}
                  {leaderboardLoading && tournamentId && leaderboard.length === 0 ? (
                    <div className="py-12 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-blood-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (() => {
                    const awardedPlaces = new Set(leaderboard.map((x) => x.trophyPlace).filter((p): p is number => p != null));
                    const goldAwarded = awardedPlaces.has(1);
                    const silverAwarded = awardedPlaces.has(2);
                    const bronzeAwarded = awardedPlaces.has(3);
                    const mapSlug = tournament?.map?.slug;
                    return (
                  <ul className="space-y-2 pr-1">
                    {leaderboard.map((e, index) => {
                      const userHasTrophy = e.trophyPlace != null;
                      const awardButtons = adminMe?.isSuperAdmin && tournamentId && tournamentLocked && !userHasTrophy ? (
                        <div className="flex items-center gap-1 shrink-0" onClick={(ev) => ev.stopPropagation()}>
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
                      ) : undefined;
                      return (
                        <li key={e.user.id}>
                          <TournamentLeaderboardEntry
                            entry={e}
                            index={index}
                            mapSlug={mapSlug}
                            awardButtons={awardButtons}
                          />
                        </li>
                      );
                    })}
                  </ul>
                    );
                  })()}
                  {leaderboardLoading && tournamentId && leaderboard.length > 0 && (
                    <p className="text-bunker-500 text-xs py-2">Updating leaderboard...</p>
                  )}
                  {!leaderboardLoading && !leaderboardError && leaderboard.length === 0 && tournamentId && (
                    <p className="text-bunker-500 text-sm py-6 text-center">No runs yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trophy leaderboard: right 2/5 on wide screens */}
          <div className={`flex flex-col min-h-0 min-w-0 h-full ${pollFirst ? 'order-3' : 'order-2'}`}>
            <Card variant="bordered" className="border-bunker-700 flex flex-col min-h-[280px] lg:min-h-[380px] w-full min-w-0">
            <CardHeader className="flex flex-row flex-wrap items-start sm:items-center justify-between gap-2 shrink-0">
              <CardTitle className="text-base font-zombies text-white flex items-center gap-2 min-w-0">
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
                className="basis-full sm:basis-auto w-full sm:w-auto min-w-0 sm:min-w-[100px] bg-bunker-800 border-bunker-600 text-white"
              />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="min-h-[180px]">
                {trophyLeaderboardLoading ? (
                  <div className="h-full flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-blood-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                <ul className="space-y-1.5 text-sm pr-1">
                  {trophyEntries.slice(0, 15).map((e, i) => (
                    <li key={e.user.username} className="flex items-center gap-2 py-1.5 border-b border-bunker-800/50 last:border-0">
                      {(() => {
                        const fullName = e.user.displayName || e.user.username;
                        const shortName = fullName.length > 15 ? `${fullName.slice(0, 15)}...` : fullName;
                        return (
                          <>
                      <span className="text-bunker-500 w-5 shrink-0 tabular-nums">{i + 1}.</span>
                      <span className="text-white min-w-0 truncate flex-1" title={fullName}>{shortName}</span>
                      <span className="ml-auto shrink-0 flex items-center gap-2">
                        <span className="text-amber-400">{e.gold}🥇</span>
                        <span className="text-bunker-400">{e.silver}🥈</span>
                        <span className="text-amber-700">{e.bronze}🥉</span>
                      </span>
                          </>
                        );
                      })()}
                    </li>
                  ))}
                </ul>
                )}
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
          );
        })()}

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

        <Modal
          isOpen={voteSignInModalOpen}
          onClose={() => setVoteSignInModalOpen(false)}
          title="Sign in required to vote"
          description="You need to be signed in to cast a poll vote."
          size="sm"
        >
          <div className="flex flex-col gap-4 pt-1">
            <p className="text-sm text-bunker-300">
              Voting is only available for signed-in users so each player gets one vote.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setVoteSignInModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setVoteSignInModalOpen(false);
                  signInWithGoogle();
                }}
              >
                Sign in to vote
              </Button>
            </div>
          </div>
        </Modal>

        {/* Learn Rules modal */}
        <Modal
          isOpen={learnRulesModalOpen}
          onClose={() => setLearnRulesModalOpen(false)}
          title="Tournament rules"
          description="12-day window, ZWR category rules, speedrun proof, and required clan tag or emblem from Discord."
          size="lg"
        >
          <div className="space-y-4">
            <TournamentRulesContent />
          </div>
          <div className="flex justify-end pt-4">
            <Button onClick={() => setLearnRulesModalOpen(false)}>Close</Button>
          </div>
        </Modal>

        <Modal
          isOpen={tournamentVerificationEditOpen}
          onClose={() => !tournamentVerificationSaving && setTournamentVerificationEditOpen(false)}
          title="Tournament Secret Code for Verification"
          description="Shown to everyone on the tournaments page. Line breaks and emoji are saved exactly as you type."
          size="lg"
        >
          <textarea
            value={tournamentVerificationDraft}
            onChange={(e) => setTournamentVerificationDraft(e.target.value)}
            rows={14}
            className="w-full min-h-[220px] rounded-lg border border-bunker-600 bg-bunker-800 px-4 py-3 text-sm sm:text-base text-white placeholder:text-bunker-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-600/70 resize-y font-sans"
            spellCheck
            aria-label="Tournament verification message"
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="secondary"
              type="button"
              onClick={() => !tournamentVerificationSaving && setTournamentVerificationEditOpen(false)}
              disabled={tournamentVerificationSaving}
            >
              Cancel
            </Button>
            <Button type="button" onClick={saveTournamentVerificationMessage} disabled={tournamentVerificationSaving}>
              {tournamentVerificationSaving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              Save
            </Button>
          </div>
        </Modal>

        {/* Edit tournament rules modal (super admin) */}
        {adminMe?.isSuperAdmin && tournament && (
          <Modal
            isOpen={editTournamentModalOpen}
            onClose={() => !editTournamentSaving && setEditTournamentModalOpen(false)}
            title="Edit tournament rules"
            description="Changes apply to all runs already submitted to this tournament."
            size="sm"
          >
            <div className="space-y-3">
              {tournament.game?.shortName && (() => {
                const shortName = tournament.game.shortName;
                const config = (editTournamentConfig || {}) as Record<string, string | boolean>;
                const setConfig = (key: string, value: string | boolean) => {
                  setEditTournamentConfig((prev) => ({ ...prev, [key]: value }));
                };
                return (
                  <>
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
                      <>
                        <div>
                          <label className="block text-sm font-medium text-bunker-300 mb-1">GobbleGums</label>
                          <Select
                            value={String(config.bo3GobbleGumMode ?? BO3_GOBBLEGUM_DEFAULT)}
                            onChange={(e) => setConfig('bo3GobbleGumMode', e.target.value)}
                            options={BO3_GOBBLEGUM_MODES.map((m) => ({ value: m, label: getBo3GobbleGumLabel(m) }))}
                            className="w-full bg-bunker-800 border-bunker-600 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-bunker-300 mb-1">AATs</label>
                          <Select
                            value={config.bo3AatUsed === true ? 'true' : 'false'}
                            onChange={(e) => setConfig('bo3AatUsed', e.target.value === 'true')}
                            options={[
                              { value: 'false', label: 'No AATs' },
                              { value: 'true', label: 'AATs Used' },
                            ]}
                            className="w-full bg-bunker-800 border-bunker-600 text-white"
                          />
                        </div>
                      </>
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
                            value={String(config.bo4ElixirMode ?? 'CLASSIC_ONLY')}
                            onChange={(e) => setConfig('bo4ElixirMode', e.target.value)}
                            options={BO4_ELIXIR_MODES.map((m) => ({ value: m, label: getBo4ElixirModeLabel(m) }))}
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
                  </>
                );
              })()}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" onClick={() => setEditTournamentModalOpen(false)} disabled={editTournamentSaving}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEditTournament} disabled={editTournamentSaving}>
                  {editTournamentSaving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                  Save
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Create leaderboard modal (super admin) */}
        <Modal
          isOpen={createLeaderboardOpen}
          onClose={() => !createLeaderboardLoading && setCreateLeaderboardOpen(false)}
          title="Create tournament leaderboard"
          description="Set the game, map, and category. The leaderboard is open for 12 days; all submissions must be in before the countdown ends."
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
                options={[{ value: '', label: 'Select game' }, ...games.map((g) => ({ value: g.id, label: getGameDisplayShortName(g.shortName, g.name) }))]}
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
                    <>
                      <div>
                        <label className="block text-sm font-medium text-bunker-300 mb-1">GobbleGums</label>
                        <Select
                          value={String(config.bo3GobbleGumMode ?? BO3_GOBBLEGUM_DEFAULT)}
                          onChange={(e) => setConfig('bo3GobbleGumMode', e.target.value)}
                          options={BO3_GOBBLEGUM_MODES.map((m) => ({ value: m, label: getBo3GobbleGumLabel(m) }))}
                          className="w-full bg-bunker-800 border-bunker-600 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-bunker-300 mb-1">AATs</label>
                        <Select
                          value={config.bo3AatUsed === true ? 'true' : 'false'}
                          onChange={(e) => setConfig('bo3AatUsed', e.target.value === 'true')}
                          options={[
                            { value: 'false', label: 'No AATs' },
                            { value: 'true', label: 'AATs Used' },
                          ]}
                          className="w-full bg-bunker-800 border-bunker-600 text-white"
                        />
                      </div>
                    </>
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
                          value={String(config.bo4ElixirMode ?? 'CLASSIC_ONLY')}
                          onChange={(e) => setConfig('bo4ElixirMode', e.target.value)}
                          options={BO4_ELIXIR_MODES.map((m) => ({ value: m, label: getBo4ElixirModeLabel(m) }))}
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
