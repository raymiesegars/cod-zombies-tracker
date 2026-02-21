'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/auth-context';
import { Avatar, Button, Modal } from '@/components/ui';
import { Users, ChevronDown, ChevronUp, Trash2, Loader2 } from 'lucide-react';

type Friend = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  isOnline: boolean;
  lastSeenAt: string | null;
};

type Props = {
  variant?: 'floating' | 'inline';
};

export function FriendsListWidget({ variant = 'floating' }: Props) {
  const { profile } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ friend: Friend } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchFriends = useCallback(() => {
    fetch('/api/me/friends', { credentials: 'same-origin', cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : { friends: [] }))
      .then((data) => setFriends(data.friends ?? []))
      .catch(() => setFriends([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!profile?.id) return;
    setLoading(true);
    fetchFriends();
    const interval = setInterval(fetchFriends, 60 * 1000);
    const onUpdate = () => fetchFriends();
    window.addEventListener('cod-tracker-friends-updated', onUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener('cod-tracker-friends-updated', onUpdate);
    };
  }, [profile?.id, fetchFriends]);

  const handleRemoveFriend = async (friendId: string) => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/me/friends/${friendId}`, { method: 'DELETE', credentials: 'same-origin' });
      if (res.ok) {
        setFriends((prev) => prev.filter((f) => f.id !== friendId));
        setDeleteModal(null);
        window.dispatchEvent(new Event('cod-tracker-friends-updated'));
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!profile) return null;

  const onlineCount = friends.filter((f) => f.isOnline).length;
  const isFloating = variant === 'floating';

  const content = (
    <div className={isFloating ? '' : 'py-2'}>
      <button
        type="button"
        onClick={() => isFloating && setExpanded(!expanded)}
        className={`flex items-center justify-between gap-2 w-full ${isFloating ? 'px-3 py-2' : 'px-0'} text-left`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Users className="w-5 h-5 text-blood-400 flex-shrink-0" />
          <span className="text-sm font-medium text-white truncate">Friends</span>
          <span className="text-xs text-bunker-400 flex-shrink-0">
            {loading ? '…' : `${onlineCount}/${friends.length}`}
          </span>
        </div>
        {isFloating && (expanded ? <ChevronDown className="w-4 h-4 text-bunker-400" /> : <ChevronUp className="w-4 h-4 text-bunker-400" />)}
      </button>

      <AnimatePresence>
        {(!isFloating || expanded) && (
          <motion.div
            initial={isFloating ? { height: 0, opacity: 0 } : undefined}
            animate={isFloating ? { height: 'auto', opacity: 1 } : undefined}
            exit={isFloating ? { height: 0, opacity: 0 } : undefined}
            transition={{ duration: 0.2 }}
            className={isFloating ? 'overflow-hidden' : ''}
          >
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-bunker-500" />
              </div>
            ) : friends.length === 0 ? (
              <p className="text-xs text-bunker-500 py-2 px-3">No friends yet.</p>
            ) : (
              <ul className={`space-y-0.5 ${isFloating ? 'max-h-48 overflow-y-auto py-1' : 'py-1'}`}>
                {friends.map((f) => (
                  <li key={f.id} className="group flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-bunker-800/50">
                    <Link href={`/users/${f.username}`} className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="relative flex-shrink-0">
                        <Avatar src={f.avatarUrl} fallback={f.displayName} size="sm" className="w-8 h-8" />
                        {f.isOnline && (
                          <span
                            className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-element-500 border-2 border-bunker-900"
                            title="Online"
                          />
                        )}
                      </div>
                      <span className="text-sm text-white truncate">{f.displayName}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDeleteModal({ friend: f })}
                      className="p-1.5 rounded text-bunker-400 hover:text-blood-400 hover:bg-bunker-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label={`Remove ${f.displayName} from friends`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const modalEl = (
    <Modal
      isOpen={!!deleteModal}
      onClose={() => !deleteLoading && setDeleteModal(null)}
      title="Remove friend?"
      description={
        deleteModal
          ? `Remove ${deleteModal.friend.displayName} from your friends? They will also be removed from your list and will get a notification.`
          : ''
      }
      size="sm"
    >
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={() => setDeleteModal(null)} disabled={deleteLoading}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={() => deleteModal && handleRemoveFriend(deleteModal.friend.id)}
          disabled={deleteLoading}
          leftIcon={deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        >
          {deleteLoading ? 'Removing…' : 'Remove friend'}
        </Button>
      </div>
    </Modal>
  );

  if (isFloating) {
    return (
      <>
        <div className="fixed bottom-4 left-4 z-40 w-56 rounded-lg border border-bunker-700 bg-bunker-900 shadow-xl md:block hidden">
          {content}
        </div>
        {modalEl}
      </>
    );
  }

  return (
    <>
      {content}
      {modalEl}
    </>
  );
}
