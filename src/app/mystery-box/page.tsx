'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Avatar, Button, Logo, Modal, PageLoader } from '@/components/ui';
import { motion } from 'framer-motion';
import { Box, Settings, HelpCircle, UserPlus, LogOut, Shield, Trash2, Check, CheckCircle, Clock, Loader2, RefreshCw, XCircle } from 'lucide-react';
import { getMysteryBoxXpRange, getChallengeRangeDisplay, getBaseXpFromFilters, getMysteryBoxXpMultiplierPercent } from '@/lib/mystery-box';
import { getBo3GobbleGumLabel } from '@/lib/bo3';
import { getBocwSupportLabel } from '@/lib/bocw';
import { getBo6GobbleGumLabel, getBo6SupportLabel } from '@/lib/bo6';
import { getBo7SupportLabel } from '@/lib/bo7';
import { getFirstRoomVariantLabel } from '@/lib/first-room-variants';
import { getVanguardVoidLabel } from '@/lib/vanguard';
import { getLevelFromXp, getRankForLevel, getRankIconPath } from '@/lib/ranks';

type LobbyMember = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  level: number;
  totalXp: number;
  joinedAt: string;
  hasLoggedChallenge?: boolean;
};

type RollDetails = {
  id: string;
  gameId: string;
  mapId: string;
  challengeId: string;
  tags: object | null;
  filterSettings: object | null;
  completedByHost: boolean;
  userHasCompleted?: boolean;
  createdAt?: string;
  game?: { id: string; name: string; shortName: string };
  map?: { id: string; name: string; slug: string };
  challenge?: { id: string; name: string; type: string };
};

type DiscardVoteDetails = {
  id: string;
  rollId: string;
  intent?: 'discard' | 'reroll';
  votes: Record<string, string>;
  votersNeeded: number;
  userHasVoted: boolean;
};

type LobbyData = {
  id: string;
  hostId: string;
  isHost: boolean;
  host: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    level: number;
    totalXp: number;
    hasLoggedChallenge?: boolean;
  };
  members: LobbyMember[];
  roll: RollDetails | null;
  discardVote?: DiscardVoteDetails | null;
};

type MysteryBoxData = {
  tokens: number;
  nextTokenAt: string | null;
  lobby: LobbyData | null;
};

type MysteryBoxFilterSettings = {
  excludedGameIds: string[];
  excludeSpeedruns: boolean;
  maxRound: number | null;
};
function toLibFilterSettings(s: MysteryBoxFilterSettings): import('@/lib/mystery-box').MysteryBoxFilterSettings {
  return { ...s, maxRound: s.maxRound ?? undefined };
}

export default function MysteryBoxPage() {
  const { profile, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<MysteryBoxData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [filterSettings, setFilterSettings] = useState<MysteryBoxFilterSettings>({
    excludedGameIds: [],
    excludeSpeedruns: false,
    maxRound: null,
  });
  const [adminMe, setAdminMe] = useState<{ isSuperAdmin: boolean } | null>(null);
  const [spinWarningOpen, setSpinWarningOpen] = useState(false);
  const [spinInsufficientModal, setSpinInsufficientModal] = useState<{
    users: { userId: string; displayName: string }[];
  } | null>(null);
  const [discardWarningOpen, setDiscardWarningOpen] = useState(false);
  const [discardVoteSubmitting, setDiscardVoteSubmitting] = useState(false);
  const [pendingRerollAfterVote, setPendingRerollAfterVote] = useState(false);
  const [spinning, setSpinning] = useState(false);

  const SPIN_WARNING_KEY = 'mystery-box-spin-warning-dismissed';

  const handleStartDiscardVote = async (intent: 'discard' | 'reroll' = 'discard') => {
    setDiscardWarningOpen(false);
    setDiscardVoteSubmitting(true);
    if (intent === 'reroll') setPendingRerollAfterVote(true);
    try {
      const res = await fetch('/api/mystery-box/lobby/discard-vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ intent }),
      });
      if (res.ok) {
        fetchData();
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.error || 'Failed to start discard vote');
      }
    } catch {
      alert('Failed to start discard vote');
    } finally {
      setDiscardVoteSubmitting(false);
    }
  };

  const handleDiscardVote = async (choice: 'YES' | 'NO') => {
    setDiscardVoteSubmitting(true);
    try {
      const res = await fetch('/api/mystery-box/lobby/discard-vote/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ choice }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) {
        fetchData();
      } else {
        alert(d.error || 'Failed to submit vote');
      }
    } catch {
      alert('Failed to submit vote');
    } finally {
      setDiscardVoteSubmitting(false);
    }
  };

  const handleKickMember = async (userId: string) => {
    try {
      const res = await fetch(`/api/mystery-box/lobby/members/${userId}`, { method: 'DELETE', credentials: 'same-origin' });
      if (res.ok) {
        fetchData();
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.error || 'Failed to kick member');
      }
    } catch {
      alert('Failed to kick member');
    }
  };

  const doSpin = async (): Promise<boolean> => {
    const payload = {
      excludedGameIds: filterSettings.excludedGameIds.length ? filterSettings.excludedGameIds : undefined,
      excludeSpeedruns: filterSettings.excludeSpeedruns || undefined,
      maxRound: filterSettings.maxRound ?? undefined,
    };
    const res = await fetch('/api/mystery-box/lobby/roll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ filterSettings: payload }),
    });
    if (res.ok) {
      fetchData();
      return true;
    }
    const resData = await res.json().catch(() => ({}));
    if (resData.insufficientTokens?.length > 0) {
      setSpinInsufficientModal({ users: resData.insufficientTokens });
    }
    return false;
  };

  const handleSpinWithAnimation = () => {
    setSpinWarningOpen(false);
    setSpinInsufficientModal(null);
    setSpinning(true);
    const audio = typeof window !== 'undefined' ? new Audio('/audio/mystery-box.mp3') : null;
    audio?.play().catch(() => {});
    doSpin().then((ok) => {
      if (!ok) setSpinning(false);
    });
    setTimeout(() => setSpinning(false), 6000);
  };

  const requestSpin = () => {
    if (typeof window !== 'undefined' && localStorage.getItem(SPIN_WARNING_KEY) === '1') {
      handleSpinWithAnimation();
    } else {
      setSpinWarningOpen(true);
    }
  };

  const fetchData = () => {
    fetch('/api/mystery-box/me', { credentials: 'same-origin', cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-create solo lobby when none, or refetch if already in one (e.g. after accepting invite)
  const hasTriedAutoCreate = useRef(false);
  useEffect(() => {
    if (authLoading || loading || !profile) return;
    if (data?.lobby) return;
    if (hasTriedAutoCreate.current) return;
    hasTriedAutoCreate.current = true;
    fetch('/api/mystery-box/lobby', { method: 'POST', credentials: 'same-origin' })
      .then(async (res) => {
        if (res.ok) {
          fetchData();
        } else {
          hasTriedAutoCreate.current = false;
          const body = await res.json().catch(() => ({}));
          if (body.error?.includes('Already in a lobby') || body.error?.includes('Already hosting')) {
            fetchData(); // We have a lobby, just fetch it
          }
        }
      })
      .catch(() => { hasTriedAutoCreate.current = false; });
  }, [authLoading, loading, profile, data?.lobby]);

  // Poll when in lobby so all members see host actions (spin, discard vote, etc.) within a few seconds
  useEffect(() => {
    if (!data?.lobby) return;
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- poll keyed by lobby id only
  }, [data?.lobby?.id]);

  // When anyone receives a fresh roll (created < 6s ago), show spinning animation so members see it too
  const lastSpinningRollId = useRef<string | null>(null);
  useEffect(() => {
    const roll = data?.lobby?.roll;
    if (!roll?.createdAt || !roll.id) return;
    const created = new Date(roll.createdAt).getTime();
    const now = Date.now();
    const age = (now - created) / 1000;
    if (age >= 6 || lastSpinningRollId.current === roll.id) return;
    lastSpinningRollId.current = roll.id;
    setSpinning(true);
    const remaining = Math.max(0, 6000 - (now - created));
    const t = setTimeout(() => {
      setSpinning(false);
      lastSpinningRollId.current = null;
    }, remaining);
    return () => clearTimeout(t);
  }, [data?.lobby?.roll?.id, data?.lobby?.roll?.createdAt]);

  // When reroll vote passes: no roll, no vote → auto-spin
  useEffect(() => {
    if (!pendingRerollAfterVote || !data?.lobby) return;
    const hasRoll = Boolean(data.lobby.roll && !data.lobby.roll.completedByHost);
    const hasVote = Boolean(data.lobby.discardVote);
    if (!hasRoll && !hasVote) {
      setPendingRerollAfterVote(false);
      doSpin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- doSpin stable, data.lobby rolled into roll/discardVote
  }, [pendingRerollAfterVote, data?.lobby?.roll, data?.lobby?.discardVote]);

  useEffect(() => {
    fetch('/api/admin/me', { credentials: 'same-origin', cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : { isSuperAdmin: false }))
      .then((d) => setAdminMe({ isSuperAdmin: d.isSuperAdmin ?? false }))
      .catch(() => setAdminMe(null));
  }, []);

  useEffect(() => {
    if (!authLoading && !profile) {
      router.push('/');
    }
  }, [authLoading, profile, router]);

  const handleLeave = () => {
    fetch('/api/mystery-box/lobby', { method: 'DELETE', credentials: 'same-origin' })
      .then(async (res) => {
        if (res.ok) {
          // Force fresh fetch after leave (lobby/roll may have changed)
          const r = await fetch('/api/mystery-box/me?t=' + Date.now(), { credentials: 'same-origin', cache: 'no-store' });
          const d = r.ok ? await r.json() : null;
          setData(d);
        }
      })
      .catch(() => {});
  };

  const handleResetChallenge = () => {
    fetch('/api/mystery-box/lobby/roll', { method: 'DELETE', credentials: 'same-origin' })
      .then((res) => (res.ok ? fetchData() : res.json().then((d) => alert(d.error || 'Failed to reset'))))
      .catch(() => alert('Failed to reset'));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-bunker-950 flex items-center justify-center">
        <PageLoader message="Loading..." fullScreen />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-bunker-950">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-zombies text-white tracking-wide flex items-center gap-2">
              <Box className="w-8 h-8 text-amber-500" strokeWidth={1.5} />
              Mystery Box
            </h1>
            <p className="text-bunker-400 text-sm mt-1">
              Spin for random challenges. Complete them for bonus XP!
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAboutModalOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-bunker-600 bg-bunker-800/50 text-bunker-300 hover:text-white hover:bg-bunker-700/50 text-sm"
            >
              <HelpCircle className="w-4 h-4" />
              About the Box
            </button>
          </div>
        </div>

        {/* Token display */}
        <div className="rounded-xl border border-bunker-700 bg-bunker-900/80 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
              Tokens
            </p>
            <p className="text-2xl font-bold text-white mt-1">
              {data?.tokens ?? 0} / 3
            </p>
            {data?.nextTokenAt ? (
              <p className="text-sm text-amber-400/90 mt-1">
                Next token in: <Countdown until={data.nextTokenAt} onComplete={fetchData} />
              </p>
            ) : (data?.tokens ?? 0) >= 3 ? (
              <p className="text-sm text-bunker-400 mt-1">
                You&apos;re capped! Use a token to gain more.
              </p>
            ) : (
              <p className="text-xs text-bunker-500 mt-1">
                Gain 1 token every 24 hours. Tokens cap at 3.
              </p>
            )}
          </div>
        </div>

        {/* Super admin: Grant tokens */}
        {adminMe?.isSuperAdmin && (
          <GrantTokensAdminCard
            currentUserId={profile.id}
            onGranted={fetchData}
          />
        )}

        {/* Lobby section - auto-creates when none, so we show loading until ready */}
        {!data?.lobby ? (
          <div className="rounded-xl border border-bunker-700 bg-bunker-900/50 p-8 text-center">
            <p className="text-bunker-400">Setting up your lobby…</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg font-zombies text-white">Mystery Box Lobby</h2>
              {data.lobby.members.length > 0 && (
                <Button variant="secondary" onClick={handleLeave} leftIcon={<LogOut className="w-4 h-4" />}>
                  Leave Group
                </Button>
              )}
            </div>

            {/* Lobby slots: host + 3 members. Invites locked when active roll (not logged/discarded). */}
            {(() => {
              const hasActiveRoll = Boolean(
                data.lobby?.roll && !data.lobby.roll.completedByHost
              );
              const canInvite = data.lobby!.isHost && !hasActiveRoll;
              return (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <LobbySlot
                    user={data.lobby!.host}
                    isHost
                    label="Host"
                    hasLoggedChallenge={hasActiveRoll ? data.lobby!.host.hasLoggedChallenge : undefined}
                  />
                  {[0, 1, 2].map((i) => {
                    const member = data.lobby!.members[i];
                    return (
                      <LobbySlot
                        key={member?.id ?? i}
                        user={member}
                        isHost={false}
                        label={member ? undefined : canInvite ? 'Invite' : hasActiveRoll ? 'Locked' : undefined}
                        onInvite={canInvite ? () => setInviteModalOpen(true) : undefined}
                        onKick={data.lobby!.isHost && member ? () => handleKickMember(member.id) : undefined}
                        inviteLocked={hasActiveRoll}
                        hasLoggedChallenge={member && hasActiveRoll ? member.hasLoggedChallenge : undefined}
                      />
                    );
                  })}
                </div>
              );
            })()}

            {/* Box + Spin area - overflow-visible when spinning so text can rise above */}
            <div className={`mt-6 sm:mt-8 rounded-xl border border-bunker-700 bg-bunker-900/80 p-4 sm:p-6 text-center ${spinning ? 'overflow-visible' : ''}`}>
              {spinning ? (
                <MysteryBoxSpinning pendingRoll={data.lobby.roll} />
              ) : data.lobby.roll && !data.lobby.roll.completedByHost ? (
                <RollResult
                  roll={data.lobby.roll}
                  isHost={data.lobby.isHost}
                  isSolo={data.lobby.members.length === 0}
                  tokens={data.tokens}
                  filterSettings={filterSettings}
                  onSpin={requestSpin}
                  onRerollConfirm={() => handleStartDiscardVote('reroll')}
                  onDiscard={() => setDiscardWarningOpen(true)}
                  onReset={handleResetChallenge}
                  onSettingsOpen={() => setFilterModalOpen(true)}
                />
              ) : (
                <div className="py-8">
                  <MysteryBoxClosed
                    isHost={data.lobby.isHost}
                    tokens={data.tokens}
                    filterSettings={filterSettings}
                    onSpin={requestSpin}
                    onSettingsOpen={() => setFilterModalOpen(true)}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {aboutModalOpen && (
          <AboutModal onClose={() => setAboutModalOpen(false)} />
        )}
        {filterModalOpen && data?.lobby?.isHost && (
          <FilterModal
            settings={filterSettings}
            onSave={(s) => { setFilterSettings(s); setFilterModalOpen(false); }}
            onClose={() => setFilterModalOpen(false)}
          />
        )}
        {inviteModalOpen && data?.lobby?.isHost && (
          <InviteModal
            lobbyId={data.lobby.id}
            onClose={() => setInviteModalOpen(false)}
            onInvited={fetchData}
          />
        )}
        {spinWarningOpen && (
          <SpinWarningModal
            onConfirm={(dontShowAgain) => {
              if (dontShowAgain && typeof window !== 'undefined') {
                localStorage.setItem(SPIN_WARNING_KEY, '1');
              }
              handleSpinWithAnimation();
            }}
            onClose={() => setSpinWarningOpen(false)}
          />
        )}
        {spinInsufficientModal && (
          <InsufficientTokensModal
            users={spinInsufficientModal.users}
            onClose={() => setSpinInsufficientModal(null)}
          />
        )}
        {discardWarningOpen && (
          <DiscardWarningModal
            onConfirm={handleStartDiscardVote}
            onClose={() => setDiscardWarningOpen(false)}
            loading={discardVoteSubmitting}
          />
        )}
        {data?.lobby?.discardVote && (
          <DiscardVoteModal
            intent={data.lobby.discardVote.intent ?? 'discard'}
            host={data.lobby.host}
            members={data.lobby.members}
            votes={data.lobby.discardVote.votes}
            userHasVoted={data.lobby.discardVote.userHasVoted}
            currentUserId={profile?.id ?? ''}
            onVote={handleDiscardVote}
            loading={discardVoteSubmitting}
          />
        )}
      </div>
    </div>
  );
}

function Countdown({ until, onComplete }: { until: string; onComplete: () => void }) {
  const [text, setText] = useState('');

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const target = new Date(until).getTime();
      const diff = Math.max(0, target - now);
      if (diff <= 0) {
        setText('Ready!');
        onComplete();
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setText(`${h}h ${m}m ${s}s`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [until, onComplete]);

  return <span>{text}</span>;
}

function LobbySlot({
  user,
  isHost,
  label,
  onInvite,
  onKick,
  inviteLocked,
  hasLoggedChallenge,
}: {
  user?: { id: string; username: string; displayName: string | null; avatarUrl: string | null; level: number; totalXp: number };
  isHost: boolean;
  label?: string;
  onInvite?: () => void;
  onKick?: () => void;
  inviteLocked?: boolean;
  hasLoggedChallenge?: boolean;
}) {
  return (
    <div className="rounded-lg border border-bunker-700 bg-bunker-800/50 p-4 min-h-[100px] flex flex-col items-center justify-center relative group">
      {user ? (
        <>
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-bunker-700 flex items-center justify-center overflow-hidden mb-2">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-bold text-bunker-400">
                  {(user.displayName ?? user.username).charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            {hasLoggedChallenge === true && (
              <span
                className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600"
                title="Logged"
                aria-label="Logged"
              >
                <CheckCircle className="h-3 w-3 text-white" strokeWidth={2.5} />
              </span>
            )}
            {hasLoggedChallenge === false && (
              <span
                className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-bunker-600 border border-bunker-500"
                title="Not logged yet"
                aria-label="Not logged yet"
              >
                <Clock className="h-3 w-3 text-bunker-400" strokeWidth={2} />
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-white truncate max-w-full">
            {user.displayName ?? user.username}
          </p>
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {isHost && <span className="text-xs text-amber-500">Host</span>}
            {hasLoggedChallenge === true && (
              <span className="text-xs text-emerald-400">Logged</span>
            )}
            {hasLoggedChallenge === false && (
              <span className="text-xs text-bunker-500">Pending</span>
            )}
          </div>
          {onKick && !isHost && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onKick();
              }}
              className="absolute top-2 right-2 p-1.5 rounded text-bunker-400 hover:text-blood-400 hover:bg-bunker-700 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label={`Kick ${user.displayName ?? user.username}`}
              title="Kick from lobby"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </>
      ) : (
        <>
          {onInvite ? (
            <button
              type="button"
              onClick={onInvite}
              className="flex flex-col items-center gap-2 text-bunker-400 hover:text-amber-400 transition-colors"
            >
              <UserPlus className="w-8 h-8" />
              <span className="text-sm">{label ?? 'Invite'}</span>
            </button>
          ) : inviteLocked ? (
            <span className="text-sm text-bunker-500 text-center">Invites locked</span>
          ) : (
            <span className="text-sm text-bunker-500">Empty</span>
          )}
        </>
      )}
    </div>
  );
}

const SAMPLE_CHALLENGES = [
  'BO3 · Der Eisendrache · Round 5 Giant Speedrun',
  'BO2 · Origins · Round 30 Speedrun',
  'BOCW · Firebase Z · Round 10 Speedrun',
  'WAW · Nacht · Highest Round',
  'BO1 · Kino · No Jug Challenge',
  'BO4 · IX · Round 15 Speedrun',
  'BO6 · Liberty Falls · Round 5 Speedrun',
  'BO7 · Terminus · Round 20 Speedrun',
  'WW2 · The Final Reich · No Perks',
  'BO2 · Mob · Round 50 Speedrun',
  'BO3 · Revelations · Round 100',
  'BOCW · Outbreak · Round 20',
  'BO4 · Dead of the Night · Easter Egg',
];

function MysteryBoxWood({ open = false, className }: { open?: boolean; className?: string }) {
  return (
    <div className={className}>
      <div
        className="relative w-full max-w-[33rem] mx-auto rounded-md overflow-hidden"
        style={{
          height: '104px',
          background: 'linear-gradient(180deg, #4a3728 0%, #5d4037 12%, #6d4c41 25%, #5d4037 50%, #4a3728 75%, #3e2723 100%)',
          boxShadow: 'inset 0 1px 0 rgba(139,90,43,0.4), inset 0 -1px 0 rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.5)',
          border: '2px solid #3e2723',
          borderTopColor: '#6d4c41',
          borderBottomColor: '#2c1810',
        }}
      >
        {/* Wood grain lines */}
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: 'repeating-linear-gradient(92deg, transparent 0px, transparent 2px, rgba(0,0,0,0.2) 2px, rgba(0,0,0,0.2) 5px)',
        }} />
        {/* Knot / grain variation */}
        <div className="absolute inset-0 opacity-15" style={{
          background: 'radial-gradient(ellipse 30% 50% at 30% 50%, rgba(0,0,0,0.3), transparent), radial-gradient(ellipse 25% 40% at 70% 50%, rgba(0,0,0,0.2), transparent)',
        }} />
        {/* Left logo */}
        <div className="absolute left-0 top-0 bottom-0 w-1/2 flex items-center justify-center p-3">
          <Logo size="lg" animated={false} className="opacity-90 drop-shadow-md" />
        </div>
        {/* Right logo */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-center p-3">
          <Logo size="lg" animated={false} className="opacity-90 drop-shadow-md" />
        </div>
      </div>
    </div>
  );
}

function MysteryBoxSpinning({ pendingRoll }: { pendingRoll: RollDetails | null }) {
  const [displayText, setDisplayText] = useState(SAMPLE_CHALLENGES[0]);
  const startRef = useRef(Date.now());
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const indexRef = useRef(0);
  const pendingRollRef = useRef(pendingRoll);
  pendingRollRef.current = pendingRoll;

  useEffect(() => {
    startRef.current = Date.now();
    indexRef.current = 0;

    const scheduleNext = () => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      if (elapsed >= 5.8) {
        const roll = pendingRollRef.current;
        const final = roll
          ? `${roll.game?.shortName ?? '?'} · ${roll.map?.name ?? '?'} · ${roll.challenge?.name ?? 'Challenge'}`
          : SAMPLE_CHALLENGES[indexRef.current % SAMPLE_CHALLENGES.length];
        setDisplayText(final);
        return;
      }
      indexRef.current = (indexRef.current + 1) % SAMPLE_CHALLENGES.length;
      setDisplayText(SAMPLE_CHALLENGES[indexRef.current]);
      const progress = elapsed / 6;
      const delay = 50 + Math.pow(progress, 2) * 450;
      timeoutRef.current = setTimeout(scheduleNext, delay);
    };
    scheduleNext();
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  return (
    <div className="pb-6 overflow-visible">
      {/* Explicit structure: space above box (text lands here) | box (text emerges from behind) */}
      <div className="relative">
        {/* Top slot: 120px of empty space - text rests here when visible above box */}
        <div className="h-28 sm:h-32 flex items-end justify-center" aria-hidden />
        {/* Text layer - spans both zones, z-below box so hidden when overlapping box */}
        <div
          className="absolute left-0 right-0 top-0 flex items-center justify-center px-4 z-[5]"
          style={{ height: '220px' }}
        >
          <motion.p
            key={displayText}
            className="text-amber-400 font-zombies text-xs sm:text-sm drop-shadow-[0_0_6px_rgba(251,191,36,0.9)] text-center w-full"
            initial={{ y: 90 }}
            animate={{ y: -70 }}
            transition={{ duration: 0.04 }}
          >
            {displayText}
          </motion.p>
        </div>
        {/* Box - solid bg, z above text; text behind this is hidden, text above is visible */}
        <motion.div
          className="relative z-10 -mt-4"
          initial={{ scaleY: 1 }}
          animate={{ scaleY: [1, 1.03, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <MysteryBoxWood open />
        </motion.div>
        {/* Light beam */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 w-36 sm:w-44 h-28 pointer-events-none z-[6]"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          style={{
            top: 60,
            background: 'linear-gradient(to top, rgba(251,191,36,0.4) 0%, rgba(251,191,36,0.1) 50%, transparent 100%)',
            filter: 'blur(10px)',
          }}
        />
      </div>
      <p className="text-bunker-500 text-sm mt-4">Spinning…</p>
    </div>
  );
}

function MysteryBoxClosed({
  isHost,
  tokens,
  filterSettings,
  onSpin,
  onSettingsOpen,
}: {
  isHost: boolean;
  tokens: number;
  filterSettings: MysteryBoxFilterSettings;
  onSpin: () => void;
  onSettingsOpen: () => void;
}) {
  const xpMultiplier = getMysteryBoxXpMultiplierPercent(toLibFilterSettings(filterSettings));
  return (
    <>
      <div className="pt-2 pb-2">
        <MysteryBoxWood />
      </div>
      <p className="text-bunker-400 mb-4">
        {isHost ? 'The box is closed. Spin when ready!' : 'Waiting on the host to roll the box.'}
      </p>
      {isHost && (
        <div className="flex flex-col items-center justify-center gap-3">
          <Button
            disabled={tokens < 1}
            onClick={() => onSpin()}
            className="w-full max-w-xs"
          >
            Spin ({tokens} token{tokens !== 1 ? 's' : ''})
          </Button>
          <button
            type="button"
            onClick={() => onSettingsOpen()}
            className="inline-flex items-center gap-3 px-5 py-3 rounded-xl border-2 border-amber-600/60 bg-amber-900/20 text-amber-400 hover:bg-amber-900/40 hover:border-amber-500/80 transition-colors w-full max-w-xs justify-center"
          >
            <Settings className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={1.5} />
            <div className="text-left">
              <span className="block font-semibold text-white">Change Rules</span>
              <span className="text-xs text-amber-400/90">XP: {xpMultiplier}%</span>
            </div>
          </button>
        </div>
      )}
    </>
  );
}

function formatStipulations(tags: object | null, mapSlug?: string | null): string[] {
  if (!tags || typeof tags !== 'object') return [];
  const out: string[] = [];
  const t = tags as Record<string, unknown>;
  if (t.wawNoJug === true) out.push('No Jug');
  if (t.wawFixedWunderwaffe === true) out.push('Fixed Wunderwaffe');
  if (t.firstRoomVariant && typeof t.firstRoomVariant === 'string') {
    out.push(mapSlug ? `First Room: ${getFirstRoomVariantLabel(mapSlug, t.firstRoomVariant)}` : `First Room: ${String(t.firstRoomVariant).replace(/_/g, ' ')}`);
  }
  if (t.bo2BankUsed === false) out.push('No Bank');
  if (t.useFortuneCards === false) out.push('Fate Only');
  if (t.useDirectorsCut === true) out.push('Director\'s Cut');
  if (t.bo3GobbleGumMode && typeof t.bo3GobbleGumMode === 'string') out.push(getBo3GobbleGumLabel(t.bo3GobbleGumMode));
  if (t.bo3AatUsed === false) out.push('No Alchemical Antithesis');
  if (t.bo4ElixirMode === 'CLASSIC_ONLY') out.push('Classic Elixirs Only');
  if (t.bo4ElixirMode === 'ALL_ELIXIRS_TALISMANS') out.push('All Elixirs & Talismans');
  if (t.bocwSupportMode && typeof t.bocwSupportMode === 'string') out.push(getBocwSupportLabel(t.bocwSupportMode));
  if (t.bo6GobbleGumMode && typeof t.bo6GobbleGumMode === 'string') out.push(getBo6GobbleGumLabel(t.bo6GobbleGumMode));
  if (t.bo6SupportMode && typeof t.bo6SupportMode === 'string') out.push(getBo6SupportLabel(t.bo6SupportMode));
  if (t.bo7SupportMode && typeof t.bo7SupportMode === 'string') out.push(getBo7SupportLabel(t.bo7SupportMode));
  if (t.bo7IsCursedRun === true) {
    const relics = Array.isArray(t.bo7RelicsUsed) ? (t.bo7RelicsUsed as string[]).join(', ') : '';
    out.push(relics ? `Cursed (${relics})` : 'Cursed Run');
  }
  if (t.ww2ConsumablesUsed === false) out.push('No Consumables');
  if (t.vanguardVoidUsed === false) out.push(getVanguardVoidLabel(false));
  if (t.rampageInducerUsed === false) out.push('No Rampage Inducer');
  return out;
}

function RollResult({
  roll,
  isHost,
  isSolo,
  tokens,
  filterSettings,
  onSpin,
  onRerollConfirm,
  onDiscard,
  onReset,
  onSettingsOpen,
}: {
  roll: RollDetails;
  isHost: boolean;
  isSolo: boolean;
  tokens: number;
  filterSettings: MysteryBoxFilterSettings;
  onSpin: () => void;
  onRerollConfirm: () => void;
  onDiscard: () => void;
  onReset: () => void;
  onSettingsOpen: () => void;
}) {
  const [rerollWarningOpen, setRerollWarningOpen] = useState(false);
  const mapSlug = roll.map?.slug;
  const challengeId = roll.challengeId;
  const userHasCompleted = Boolean(roll.userHasCompleted);
  const xpRange = getMysteryBoxXpRange(roll.filterSettings as { excludedGameIds?: string[]; excludeSpeedruns?: boolean; maxRound?: number } | null);
  const stipulations = formatStipulations(roll.tags, roll.map?.slug);

  return (
    <>
      <div className="mb-4 px-2">
        <p className="text-amber-400 font-semibold text-base sm:text-lg truncate">
          {roll.game?.shortName} · {roll.map?.name}
        </p>
        <p className="text-white text-lg sm:text-xl font-zombies mt-1 break-words">
          {roll.challenge?.name ?? 'Challenge'}
        </p>
        {stipulations.length > 0 && (
          <p className="text-amber-300 text-sm sm:text-base mt-2 font-medium">
            {stipulations.join(' · ')}
          </p>
        )}
        <p className="text-amber-500/90 text-xs sm:text-sm mt-2">
          Bonus XP: {xpRange.min}-{xpRange.max} — {roll.challenge?.type ? getChallengeRangeDisplay(roll.challenge.type) : 'Round 1+'}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {userHasCompleted ? (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-military-600/50 bg-military-900/30 text-military-400">
            <Check className="w-4 h-4" />
            Logged
          </div>
        ) : mapSlug ? (
          <Link
            href={`/maps/${mapSlug}/edit?challengeId=${challengeId}&mysteryBoxRollId=${roll.id}`}
            className="inline-block"
          >
            <Button>Log This Challenge</Button>
          </Link>
        ) : null}
        {isHost &&
          (isSolo ? (
            <Button
              variant="secondary"
              onClick={onReset}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Reset Challenge
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={onDiscard}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Discard
            </Button>
          ))}
      </div>
      {isHost && tokens >= 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => onSettingsOpen()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-amber-600/60 bg-amber-900/20 text-amber-400 hover:bg-amber-900/40 hover:border-amber-500/80 transition-colors"
          >
            <Settings className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
            <span className="font-medium">Change Rules</span>
            <span className="text-xs text-amber-400/90 bg-amber-900/40 px-2 py-0.5 rounded">
              XP: {getMysteryBoxXpMultiplierPercent(toLibFilterSettings(filterSettings))}%
            </span>
          </button>
          <button
            type="button"
            onClick={() => setRerollWarningOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-blood-600/60 bg-blood-900/20 text-blood-400 hover:bg-blood-900/40 hover:border-blood-500/80 transition-colors"
          >
            <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
            <span className="font-medium">Reroll</span>
          </button>
        </div>
      )}
      {rerollWarningOpen && (
        <RerollWarningModal
          onConfirm={() => {
            setRerollWarningOpen(false);
            onRerollConfirm();
          }}
          onClose={() => setRerollWarningOpen(false)}
        />
      )}
    </>
  );
}

function GrantTokensAdminCard({
  currentUserId,
  onGranted,
}: {
  currentUserId: string;
  onGranted: () => void;
}) {
  const [grantLoading, setGrantLoading] = useState(false);
  const [grantMessage, setGrantMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: string; username: string; displayName: string | null }[]>([]);
  const [amount, setAmount] = useState(1);

  const searchUsers = () => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    fetch(`/api/users/search?q=${encodeURIComponent(searchQuery.trim())}&limit=10`, { credentials: 'same-origin' })
      .then((res) => (res.ok ? res.json() : { users: [] }))
      .then((d) => setSearchResults(d.users ?? []))
      .catch(() => setSearchResults([]));
  };

  const grantToUser = (userId: string, tokenAmount?: number) => {
    const amt = tokenAmount ?? amount;
    setGrantLoading(true);
    setGrantMessage(null);
    fetch('/api/admin/mystery-box-tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ userId, amount: amt }),
    })
      .then((res) => res.json())
      .then((d) => {
        if (d.ok) {
          setGrantMessage(d.granted > 0 ? `Granted ${d.granted} token${d.granted !== 1 ? 's' : ''} to ${d.user?.displayName ?? d.user?.username ?? 'user'}` : d.message ?? 'Done');
          onGranted();
        } else {
          setGrantMessage(d.error ?? 'Failed');
        }
      })
      .catch(() => setGrantMessage('Failed'))
      .finally(() => setGrantLoading(false));
  };

  return (
    <div className="rounded-xl border border-amber-900/60 bg-amber-950/20 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-4 h-4 text-amber-500" />
        <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">Super Admin: Grant Tokens</h3>
      </div>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-bunker-400 text-sm">Grant to me:</span>
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              type="button"
              disabled={grantLoading}
              onClick={() => grantToUser(currentUserId, n)}
              className="px-3 py-1.5 rounded-lg bg-amber-900/50 hover:bg-amber-800/50 text-amber-200 text-sm font-medium border border-amber-700/50 disabled:opacity-50"
            >
              +{n} token{n !== 1 ? 's' : ''}
            </button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="search"
            placeholder="Search by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
            className="flex-1 px-3 py-2 rounded-lg bg-bunker-800 border border-bunker-600 text-white text-sm placeholder-bunker-500"
          />
          <button
            type="button"
            onClick={searchUsers}
            className="px-3 py-2 rounded-lg bg-bunker-700 hover:bg-bunker-600 text-bunker-200 text-sm"
          >
            Search
          </button>
        </div>
        {searchResults.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-bunker-400 text-sm">Amount:</span>
              <input
                type="number"
                min={1}
                max={3}
                value={amount}
                onChange={(e) => setAmount(Math.min(3, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                className="w-14 px-2 py-1 rounded bg-bunker-800 border border-bunker-600 text-white text-sm"
              />
            </div>
            <div className="space-y-1">
              {searchResults.map((u) => (
                <div key={u.id} className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-bunker-800/50">
                  <span className="text-white text-sm">{u.displayName ?? u.username}</span>
                  <button
                    type="button"
                    onClick={() => grantToUser(u.id)}
                    disabled={grantLoading}
                    className="px-2 py-1 rounded bg-amber-700/50 hover:bg-amber-600/50 text-amber-100 text-xs font-medium disabled:opacity-50"
                  >
                    Grant {amount}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {grantMessage && <p className="text-sm text-bunker-400">{grantMessage}</p>}
      </div>
    </div>
  );
}

function FilterModal({
  settings,
  onSave,
  onClose,
}: {
  settings: MysteryBoxFilterSettings;
  onSave: (s: MysteryBoxFilterSettings) => void;
  onClose: () => void;
}) {
  const [games, setGames] = useState<{ id: string; name: string; shortName: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [excludedGameIds, setExcludedGameIds] = useState<Set<string>>(new Set(settings.excludedGameIds));
  const [excludeSpeedruns, setExcludeSpeedruns] = useState(settings.excludeSpeedruns);
  const [maxRound, setMaxRound] = useState(settings.maxRound?.toString() ?? '');

  useEffect(() => {
    setLoading(true);
    fetch('/api/games', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setGames(Array.isArray(data) ? data : []);
      })
      .catch(() => setGames([]))
      .finally(() => setLoading(false));
  }, []);

  const previewSettings: MysteryBoxFilterSettings = {
    excludedGameIds: Array.from(excludedGameIds),
    excludeSpeedruns,
    maxRound: maxRound.trim() ? parseInt(maxRound, 10) || null : null,
  };
  const xpMultiplier = getMysteryBoxXpMultiplierPercent(toLibFilterSettings(previewSettings));
  const xpRange = getMysteryBoxXpRange(toLibFilterSettings(previewSettings));

  const handleSave = () => {
    onSave({
      excludedGameIds: Array.from(excludedGameIds),
      excludeSpeedruns,
      maxRound: maxRound.trim() ? parseInt(maxRound, 10) || null : null,
    });
  };

  const toggleGame = (id: string) => {
    setExcludedGameIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        className="bg-bunker-900 border border-bunker-700 rounded-xl max-w-md w-full max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-bunker-700 flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-900/30 border border-amber-700/50 flex items-center justify-center">
            <Settings className="w-6 h-6 text-amber-400" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-lg font-zombies text-white">Box Rules</h3>
            <p className="text-sm text-amber-400/90 mt-0.5">
              XP multiplier: <strong>{xpMultiplier}%</strong> · Range: {xpRange.min}-{xpRange.max} XP
            </p>
          </div>
        </div>
        <div className="p-4 space-y-4 overflow-y-auto flex-1 min-h-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
              <p className="text-bunker-400 text-sm">Loading games...</p>
            </div>
          ) : (
          <>
          <div>
            <p className="text-sm font-medium text-bunker-300 mb-2">Exclude games (uncheck to exclude from rolls)</p>
            <div className="space-y-2">
              {games.map((g) => (
                <label key={g.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!excludedGameIds.has(g.id)}
                    onChange={() => toggleGame(g.id)}
                    className="rounded border-bunker-600"
                  />
                  <span className="text-white text-sm">{g.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={excludeSpeedruns}
                onChange={(e) => setExcludeSpeedruns(e.target.checked)}
                className="rounded border-bunker-600"
              />
              <span className="text-white text-sm">Exclude all speedrun categories</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-bunker-300 mb-1">Max round (e.g. 50 = no challenges over round 50)</label>
            <input
              type="number"
              min={1}
              max={999}
              placeholder="No limit"
              value={maxRound}
              onChange={(e) => setMaxRound(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-bunker-800 border border-bunker-600 text-white"
            />
          </div>
          <div className="p-3 rounded-lg bg-amber-900/20 border border-amber-700/40">
            <p className="text-sm font-medium text-amber-400">Preview: {xpMultiplier}% XP · {xpRange.min}-{xpRange.max} XP range</p>
          </div>
          </>
          )}
        </div>
        <div className="p-4 border-t border-bunker-700 flex gap-2">
          <Button onClick={handleSave}>Save</Button>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}

function InsufficientTokensModal({
  users,
  onClose,
}: {
  users: { userId: string; displayName: string }[];
  onClose: () => void;
}) {
  const names = users.map((u) => u.displayName).join(', ');
  const reason =
    users.length === 1
      ? `${names} doesn't have any tokens.`
      : `The following people don't have tokens: ${names}`;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        className="bg-bunker-900 border border-bunker-700 rounded-xl max-w-md w-full p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-zombies text-amber-400">Can&apos;t spin</h3>
        <p className="text-sm text-bunker-300">
          Everyone in the lobby needs at least 1 token to spin. {reason} They gain 1 token every 24 hours (max 3).
        </p>
        <Button onClick={onClose}>Got it</Button>
      </div>
    </div>
  );
}

function RerollWarningModal({ onConfirm, onClose }: { onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        className="bg-bunker-900 border border-bunker-700 rounded-xl max-w-md w-full p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-zombies text-blood-400">Reroll challenge?</h3>
        <p className="text-sm text-bunker-300">
          This will start a vote with all lobby members. Everyone must agree to discard and spend another token to reroll. If one person votes no, the challenge will not be discarded.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <Button onClick={onConfirm} className="min-h-[44px] touch-manipulation bg-blood-600 hover:bg-blood-500">
            Yes, start vote
          </Button>
          <Button variant="secondary" onClick={onClose} className="min-h-[44px] touch-manipulation">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

function DiscardWarningModal({
  onConfirm,
  onClose,
  loading,
}: {
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        className="bg-bunker-900 border border-bunker-700 rounded-xl max-w-md w-full p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-zombies text-blood-400">Discard this challenge?</h3>
        <p className="text-sm text-bunker-300">
          This will start a vote with all lobby members. Everyone must agree to discard. If one person votes no, the
          challenge will not be discarded.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            onClick={onConfirm}
            disabled={loading}
            leftIcon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            className="min-h-[44px] touch-manipulation bg-blood-600 hover:bg-blood-500"
          >
            {loading ? 'Starting vote…' : 'Yes, start vote'}
          </Button>
          <Button variant="secondary" onClick={onClose} disabled={loading} className="min-h-[44px] touch-manipulation">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

function DiscardVoteModal({
  intent,
  host,
  members,
  votes,
  userHasVoted,
  currentUserId,
  onVote,
  loading,
}: {
  intent?: 'discard' | 'reroll';
  host: { id: string; username: string; displayName: string | null };
  members: LobbyMember[];
  votes: Record<string, string>;
  userHasVoted: boolean;
  currentUserId: string;
  onVote: (choice: 'YES' | 'NO') => void;
  loading?: boolean;
}) {
  const isReroll = intent === 'reroll';
  const voters: { id: string; name: string }[] = [
    { id: host.id, name: host.displayName || host.username },
    ...members.map((m) => ({ id: m.id, name: m.displayName || m.username })),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div
        className="bg-bunker-900 border border-bunker-700 rounded-xl max-w-md w-full p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-zombies text-amber-400">
          {isReroll ? 'Discard and reroll?' : 'Discard challenge?'}
        </h3>
        <p className="text-sm text-bunker-300">
          {isReroll
            ? 'Everyone must agree to discard and reroll (uses another token).'
            : 'Everyone must agree to discard this challenge.'}
        </p>

        <div className="space-y-2">
          {voters.map((v) => {
            const vote = votes[v.id];
            const isYou = v.id === currentUserId;
            const name = isYou ? `${v.name} (you)` : v.name;
            return (
              <div
                key={v.id}
                className="flex items-center justify-between gap-3 rounded-lg bg-bunker-800/60 px-3 py-2"
              >
                <span className="text-sm text-bunker-200 truncate">{name}</span>
                <span className="flex-shrink-0">
                  {vote === 'YES' ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  ) : vote === 'NO' ? (
                    <XCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <Clock className="w-5 h-5 text-bunker-500" />
                  )}
                </span>
              </div>
            );
          })}
        </div>

        {!userHasVoted && (
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              onClick={() => onVote('YES')}
              disabled={loading}
              leftIcon={loading ? undefined : <Check className="w-4 h-4" />}
              className="min-h-[44px] touch-manipulation bg-blood-600 hover:bg-blood-500"
            >
              {loading ? 'Submitting…' : 'Yes'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => onVote('NO')}
              disabled={loading}
              leftIcon={loading ? undefined : <XCircle className="w-4 h-4" />}
              className="min-h-[44px] touch-manipulation border-bunker-600"
            >
              {loading ? 'Submitting…' : 'No'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function SpinWarningModal({
  onConfirm,
  onClose,
}: {
  onConfirm: (dontShowAgain: boolean) => void;
  onClose: () => void;
}) {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        className="bg-bunker-900 border border-bunker-700 rounded-xl max-w-md w-full p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-zombies text-white">Before you spin</h3>
        <p className="text-sm text-bunker-300">
          Once you spin, you won&apos;t be able to invite new members to the lobby until the challenge is completed or discarded. Invite everyone first, then spin together!
        </p>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="rounded border-bunker-600"
          />
          <span className="text-sm text-bunker-400">Do not show this warning again</span>
        </label>
        <div className="flex flex-wrap gap-2 pt-2">
          <Button onClick={() => onConfirm(dontShowAgain)} className="min-h-[44px] touch-manipulation">Spin</Button>
          <Button variant="secondary" onClick={onClose} className="min-h-[44px] touch-manipulation">Cancel</Button>
        </div>
      </div>
    </div>
  );
}

function AboutModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        className="bg-bunker-900 border border-bunker-700 rounded-xl max-w-lg w-full p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-zombies text-white">About the Mystery Box</h3>
        <div className="text-sm text-bunker-300 space-y-2">
          <p>• Gain 1 token every 24 hours (max 3). Spend a token to spin.</p>
          <p>• Invite friends to your lobby (you&apos;re always in one). Only the host can spin.</p>
          <p>• The box rolls a random game, map, and challenge. Log it to earn bonus XP (5–100).</p>
          <p>• More restrictive filters = less base XP. Higher rounds = more bonus XP.</p>
          <p>• Co-op partners who also log get the same bonus XP (unverified).</p>
        </div>
        <Button onClick={onClose}>Got it</Button>
      </div>
    </div>
  );
}

function InviteModal({
  lobbyId,
  onClose,
  onInvited,
}: {
  lobbyId: string;
  onClose: () => void;
  onInvited: () => void;
}) {
  const [friends, setFriends] = useState<{
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    avatarPreset?: string | null;
    level?: number;
    totalXp?: number;
  }[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/me/friends', { credentials: 'same-origin' })
      .then((res) => (res.ok ? res.json() : { friends: [] }))
      .then((d) => setFriends(d.friends ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = friends.filter(
    (f) =>
      !search ||
      f.username.toLowerCase().includes(search.toLowerCase()) ||
      (f.displayName ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const handleInvite = (friendId: string) => {
    if (invitingId || invitedIds.has(friendId)) return;
    setInvitingId(friendId);
    fetch('/api/mystery-box/lobby/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ friendUserId: friendId }),
    })
      .then((res) => {
        if (res.ok) {
          setInvitedIds((prev) => new Set(prev).add(friendId));
          onInvited();
        }
      })
      .finally(() => setInvitingId(null));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        className="bg-bunker-900 border border-bunker-700 rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="p-4 text-lg font-zombies text-white border-b border-bunker-700">Invite Friend</h3>
        <input
          type="search"
          placeholder="Search friends..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mx-4 mt-4 px-3 py-2 rounded-lg bg-bunker-800 border border-bunker-600 text-white placeholder-bunker-500"
        />
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <p className="text-bunker-500 text-sm">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-bunker-500 text-sm">No friends found.</p>
          ) : (
            <ul className="space-y-2">
              {filtered.map((f) => {
                const level = f.totalXp != null ? getLevelFromXp(f.totalXp).level : (f.level ?? 1);
                const rank = getRankForLevel(level);
                const rankIcon = rank ? getRankIconPath(rank.icon) : null;
                const displayName = f.displayName ?? f.username;
                return (
                  <li
                    key={f.id}
                    className="flex items-center justify-between gap-2 py-2 border-b border-bunker-800 last:border-0"
                  >
                    <span className="inline-flex items-center gap-2 min-w-0 flex-1">
                      {rankIcon && (
                        <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded" title={`Level ${level}`}>
                          <Image src={rankIcon} alt="" width={28} height={28} className="w-full h-full object-contain" />
                        </span>
                      )}
                      <Avatar
                        src={f.avatarUrl}
                        fallback={displayName}
                        size="sm"
                        className="flex-shrink-0"
                      />
                      <span className="text-white truncate">{displayName}</span>
                    </span>
                    {invitedIds.has(f.id) ? (
                    <span className="text-sm text-element-400 font-medium">Invited!</span>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleInvite(f.id)}
                      disabled={!!invitingId}
                      isLoading={invitingId === f.id}
                    >
                      Invite
                    </Button>
                  )}
                </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="p-4 border-t border-bunker-700">
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
