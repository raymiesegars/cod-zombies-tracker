'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import {
  Card,
  CardContent,
  Button,
  Input,
  Avatar,
  Badge,
  PageLoader,
  Modal,
} from '@/components/ui';
import { UserWithRank } from '@/components/game';
import { Users, MessageSquare, ChevronLeft, Trash2 } from 'lucide-react';
import { getLevelFromXp, getRankForLevel, getRankIconPath } from '@/lib/ranks';
import { getDisplayAvatarUrl } from '@/lib/avatar';
import Image from 'next/image';

type Message = {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    avatarPreset?: string | null;
    level: number;
    totalXp: number;
  };
};

type ListingDetail = {
  id: string;
  createdAt: string;
  expiresAt: string;
  desiredPlayerCount: number;
  currentPlayerCount: number;
  notes: string | null;
  platform: string;
  contactInfo: Record<string, string> | null;
  creator: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    avatarPreset?: string | null;
    level: number;
    totalXp: number;
  };
  map: { id: string; name: string; slug: string; game: { shortName: string } };
  easterEgg: { id: string; name: string } | null;
  messages: Message[];
};

export default function FindGroupListingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user: authUser, profile } = useAuth();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [updatingSlots, setUpdatingSlots] = useState(false);
  const [deletingListing, setDeletingListing] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const fetchListing = useCallback(async () => {
    const res = await fetch(`/api/find-group/listings/${id}`);
    if (res.ok) {
      const data = await res.json();
      setListing(data);
    } else {
      setListing(null);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      await fetchListing();
      if (!cancelled) setIsLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [id, fetchListing]);

  const isCreator = authUser && profile && listing?.creator.id === profile.id;

  const handleUpdateSlots = async (newCount: number) => {
    if (!listing || listing.creator.id !== profile?.id) return;
    if (newCount < 1 || newCount > listing.desiredPlayerCount) return;
    setUpdatingSlots(true);
    try {
      const res = await fetch(`/api/find-group/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPlayerCount: newCount }),
      });
      if (res.ok) {
        const updated = await res.json();
        setListing((prev) => (prev ? { ...updated, messages: prev.messages } : updated));
      }
    } finally {
      setUpdatingSlots(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = messageText.trim();
    if (!text || !authUser || sendingMessage) return;
    setSendingMessage(true);
    try {
      const res = await fetch(`/api/find-group/listings/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      });
      if (res.ok) {
        const msg = await res.json();
        setListing((prev) =>
          prev ? { ...prev, messages: [...prev.messages, msg] } : null
        );
        setMessageText('');
      }
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDeleteListing = () => {
    if (!isCreator || deletingListing) return;
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteListing = async () => {
    if (!id || deletingListing) return;
    setDeletingListing(true);
    try {
      const res = await fetch(`/api/find-group/listings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteConfirmOpen(false);
        router.push('/find-group');
        return;
      }
    } finally {
      setDeletingListing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bunker-950 flex items-center justify-center">
        <PageLoader message="Loading listing…" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-bunker-950 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-bunker-400 mb-4">Listing not found or expired.</p>
          <Link href="/find-group" className="text-blood-400 hover:text-blood-300">
            Back to Find Group
          </Link>
        </div>
      </div>
    );
  }

  const contact = listing.contactInfo || {};
  const expiresIn = Math.ceil(
    (new Date(listing.expiresAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
  );

  return (
    <div className="min-h-screen bg-bunker-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-6">
          <Link
            href="/find-group"
            className="inline-flex items-center gap-2 text-sm text-bunker-400 hover:text-white self-start"
          >
            <ChevronLeft className="w-4 h-4 flex-shrink-0" />
            Back to Find Group
          </Link>
          {isCreator && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDeleteListing}
                disabled={deletingListing}
                className="inline-flex items-center gap-2 text-bunker-300 hover:text-red-400 hover:border-red-800/60"
              >
                <Trash2 className="w-4 h-4" />
                {deletingListing ? 'Deleting…' : 'Delete listing'}
              </Button>
              <Modal
                isOpen={deleteConfirmOpen}
                onClose={() => !deletingListing && setDeleteConfirmOpen(false)}
                title="Delete listing?"
                description="This listing and all its messages will be permanently removed. This cannot be undone."
                size="sm"
              >
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-bunker-300">
                    Are you sure you want to delete this listing? The chat will be removed too.
                  </p>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="secondary"
                      onClick={() => setDeleteConfirmOpen(false)}
                      disabled={deletingListing}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      onClick={confirmDeleteListing}
                      disabled={deletingListing}
                      leftIcon={<Trash2 className="w-4 h-4" />}
                    >
                      {deletingListing ? 'Deleting…' : 'Delete listing'}
                    </Button>
                  </div>
                </div>
              </Modal>
            </>
          )}
        </div>

        {/* Listing header */}
        <Card variant="bordered" className="mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="font-semibold text-white text-lg">{listing.map.name}</span>
              <Badge variant="default" size="sm">
                {listing.map.game.shortName}
              </Badge>
              {listing.easterEgg && (
                <Badge variant="purple" size="sm">
                  {listing.easterEgg.name}
                </Badge>
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <UserWithRank
                user={{
                  id: listing.creator.id,
                  username: listing.creator.username,
                  displayName: listing.creator.displayName,
                  avatarUrl: listing.creator.avatarUrl,
                  avatarPreset: listing.creator.avatarPreset,
                  level: listing.creator.level,
                  totalXp: listing.creator.totalXp,
                }}
                showAvatar={true}
                showLevel={true}
                size="md"
                linkToProfile={true}
              />
              <div className="flex items-center gap-2 text-bunker-400 text-sm">
                <span>{listing.platform}</span>
                <span>·</span>
                <span>Expires in {expiresIn} days</span>
              </div>
            </div>

            {/* Slots: creator can update */}
            <div className="mt-4 flex items-center gap-3">
              <span className="flex items-center gap-2 text-blood-400 font-medium">
                <Users className="w-4 h-4" />
                {listing.currentPlayerCount}/{listing.desiredPlayerCount} players
              </span>
              {isCreator && (
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4]
                    .filter((n) => n <= listing.desiredPlayerCount)
                    .map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => handleUpdateSlots(n)}
                        disabled={updatingSlots || listing.currentPlayerCount === n}
                        className={`rounded px-2 py-1 text-sm font-medium transition-colors ${
                          listing.currentPlayerCount === n
                            ? 'bg-blood-600 text-white'
                            : 'bg-bunker-700 text-bunker-300 hover:bg-bunker-600'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                </div>
              )}
            </div>

            {listing.notes && (
              <p className="mt-3 text-sm text-bunker-300">{listing.notes}</p>
            )}

            {/* Contact info */}
            {(contact.discord || contact.steam || contact.xbox) && (
              <div className="mt-4 pt-4 border-t border-bunker-700">
                <p className="text-xs font-medium text-bunker-500 mb-2">Contact</p>
                <div className="flex flex-wrap gap-2 text-sm">
                  {contact.discord && (
                    <span className="text-bunker-300">
                      Discord: <span className="text-white">{contact.discord}</span>
                    </span>
                  )}
                  {contact.steam && (
                    <span className="text-bunker-300">
                      Steam: <span className="text-white">{contact.steam}</span>
                    </span>
                  )}
                  {contact.xbox && (
                    <span className="text-bunker-300">
                      Xbox: <span className="text-white">{contact.xbox}</span>
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat */}
        <Card variant="bordered">
          <CardContent className="p-0">
            <div className="px-3 sm:px-4 py-3 border-b border-bunker-700 flex flex-wrap items-center gap-x-2 gap-y-1">
              <MessageSquare className="w-4 h-4 text-bunker-400 flex-shrink-0" />
              <span className="font-medium text-white">Chat</span>
              <span className="text-xs text-bunker-500">
                (Messages and listing expire in 30 days)
              </span>
            </div>
            <div className="min-h-[200px] max-h-[400px] overflow-y-auto p-4 space-y-3">
              {(listing.messages ?? []).length === 0 ? (
                <p className="text-sm text-bunker-500 text-center py-8">
                  No messages yet. Say hi or ask to join.
                </p>
              ) : (
                (listing.messages ?? []).map((msg) => (
                  <div key={msg.id} className="flex gap-3">
                    <Avatar
                      src={getDisplayAvatarUrl(msg.user)}
                      fallback={msg.user.displayName || msg.user.username}
                      size="sm"
                      className="flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {(() => {
                          const rank = getRankForLevel(msg.user.level ?? getLevelFromXp(msg.user.totalXp ?? 0).level);
                          return rank ? (
                            <span className="relative w-4 h-4 flex-shrink-0">
                              <Image
                                src={getRankIconPath(rank.icon)}
                                alt=""
                                width={16}
                                height={16}
                                className="object-contain"
                              />
                            </span>
                          ) : null;
                        })()}
                        <Link
                          href={`/users/${msg.user.username}`}
                          className="font-medium text-white hover:text-blood-400 text-sm"
                        >
                          {msg.user.displayName || msg.user.username}
                        </Link>
                        <span className="text-xs text-bunker-500">
                          Lvl {msg.user.level ?? getLevelFromXp(msg.user.totalXp ?? 0).level}
                        </span>
                        <span className="text-xs text-bunker-600">
                          {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-bunker-200 mt-0.5 break-words whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            {authUser && profile && (
              <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-bunker-700">
                <div className="flex gap-2 min-w-0">
                  <Input
                    placeholder="Type a message…"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    maxLength={2000}
                    className="flex-1 min-w-0"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={sendingMessage || !messageText.trim()}
                    className="flex-shrink-0 min-h-[44px] touch-manipulation"
                  >
                    {sendingMessage ? '…' : 'Send'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
