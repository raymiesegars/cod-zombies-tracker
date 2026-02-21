'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ShieldCheck, ShieldOff, Loader2, CheckCheck, Trash2, UserPlus, UserMinus, Check, X } from 'lucide-react';

type NotificationItem = {
  id: string;
  type: string;
  message: string | null;
  read: boolean;
  createdAt: string;
  runLabel: string;
  runPath: string | null;
  logType: string;
  logId: string | null;
  friendRequestId?: string;
};

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<'read-all' | 'clear' | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifications = () => {
    setLoading(true);
    fetch('/api/me/notifications', { credentials: 'same-origin', cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : { unreadCount: 0, notifications: [] }))
      .then((data) => {
        setUnreadCount(data.unreadCount ?? 0);
        setNotifications(data.notifications ?? []);
      })
      .catch(() => {
        setUnreadCount(0);
        setNotifications([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60 * 1000);
    const onRefresh = () => fetchNotifications();
    window.addEventListener('cod-tracker-notifications-refresh', onRefresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener('cod-tracker-notifications-refresh', onRefresh);
    };
  }, []);

  const markRead = (id: string) => {
    fetch(`/api/me/notifications/${id}/read`, { method: 'PATCH', credentials: 'same-origin' }).then(() => {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    });
  };

  const markAllRead = () => {
    if (unreadCount === 0) return;
    setActionLoading('read-all');
    fetch('/api/me/notifications/read-all', { method: 'PATCH', credentials: 'same-origin' })
      .then((res) => {
        if (res.ok) {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
          setUnreadCount(0);
        }
      })
      .finally(() => setActionLoading(null));
  };

  const clearAll = () => {
    if (notifications.length === 0) return;
    setActionLoading('clear');
    fetch('/api/me/notifications', { method: 'DELETE', credentials: 'same-origin' })
      .then((res) => {
        if (res.ok) {
          setNotifications([]);
          setUnreadCount(0);
        }
      })
      .finally(() => setActionLoading(null));
  };

  const removeFriendRequestNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleAcceptFriend = (friendRequestId: string, notificationId: string) => {
    if (!friendRequestId) return;
    removeFriendRequestNotification(notificationId);
    fetch('/api/me/friends/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ friendRequestId }),
      credentials: 'same-origin',
    }).then((res) => {
      if (res.ok) window.dispatchEvent(new Event('cod-tracker-friends-updated'));
    });
  };

  const handleDenyFriend = (friendRequestId: string, notificationId: string) => {
    if (!friendRequestId) return;
    removeFriendRequestNotification(notificationId);
    fetch('/api/me/friends/deny', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ friendRequestId }),
      credentials: 'same-origin',
    });
  };

  const getNotificationIcon = (type: string) => {
    if (type === 'VERIFICATION_APPROVED') return <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />;
    if (type === 'VERIFICATION_REMOVED') return <ShieldOff className="w-4 h-4 text-blood-400 flex-shrink-0 mt-0.5" />;
    if (type === 'FRIEND_REQUEST_RECEIVED' || type === 'FRIEND_REQUEST_ACCEPTED') return <UserPlus className="w-4 h-4 text-element-400 flex-shrink-0 mt-0.5" />;
    if (type === 'FRIEND_REMOVED') return <UserMinus className="w-4 h-4 text-blood-400 flex-shrink-0 mt-0.5" />;
    return <ShieldOff className="w-4 h-4 text-bunker-400 flex-shrink-0 mt-0.5" />;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          if (!open) fetchNotifications();
        }}
        className="inline-flex items-center justify-center p-2.5 rounded-lg border border-transparent text-bunker-200 hover:text-white hover:bg-white/5 hover:border-bunker-600/60 transition-colors shrink-0 relative"
        aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-blood-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden />
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full right-0 mt-1.5 w-80 max-w-[calc(100vw-2rem)] max-h-[70vh] overflow-hidden flex flex-col bg-bunker-900 border border-bunker-700 rounded-lg shadow-xl z-20"
            >
              <div className="flex-shrink-0 px-3 py-2 border-b border-bunker-700 flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-xs text-bunker-400">{unreadCount} unread</span>
                )}
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-bunker-500" />
                  </div>
                ) : notifications.length === 0 ? (
                  <p className="px-3 py-6 text-sm text-bunker-500 text-center">No notifications yet.</p>
                ) : (
                  <ul className="py-1">
                    {notifications.map((n) => {
                      const isFriendRequest = n.type === 'FRIEND_REQUEST_RECEIVED' && n.friendRequestId;

                      if (isFriendRequest) {
                        return (
                          <li key={n.id}>
                            <div
                              className={`block px-3 py-2.5 text-left hover:bg-bunker-800/80 transition-colors border-l-2 ${
                                n.read ? 'border-transparent' : 'border-blood-500'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                {getNotificationIcon(n.type)}
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm text-white font-medium truncate">{n.message ?? n.runLabel}</p>
                                  <p className="text-[10px] text-bunker-500 mt-1">
                                    {new Date(n.createdAt).toLocaleDateString()}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <button
                                      type="button"
                                      onClick={() => handleAcceptFriend(n.friendRequestId!, n.id)}
                                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-element-600 hover:bg-element-500 text-white"
                                    >
                                      <Check className="w-3 h-3" />
                                      Accept
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDenyFriend(n.friendRequestId!, n.id)}
                                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blood-600 hover:bg-blood-500 text-white"
                                    >
                                      <X className="w-3 h-3" />
                                      Deny
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      }

                      const href = n.runPath ?? '#';
                      const isClickable = n.type !== 'FRIEND_REQUEST_ACCEPTED' && n.type !== 'FRIEND_REMOVED' && href !== '#';

                      const content = (
                        <div className="flex items-start gap-2">
                          {getNotificationIcon(n.type)}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-white font-medium truncate">{n.runLabel}</p>
                            {n.type === 'VERIFICATION_APPROVED' ? (
                              <p className="text-xs text-bunker-400 mt-0.5">Your run was verified.</p>
                            ) : n.type === 'VERIFICATION_REMOVED' ? (
                              <p className="text-xs text-bunker-400 mt-0.5">Your run&apos;s verification was removed.</p>
                            ) : n.type === 'FRIEND_REQUEST_ACCEPTED' ? (
                              <p className="text-xs text-bunker-400 mt-0.5">{n.message ?? 'They are now your friend.'}</p>
                            ) : n.type === 'FRIEND_REMOVED' ? (
                              <p className="text-xs text-bunker-400 mt-0.5">{n.message ?? 'You were removed from their friends list.'}</p>
                            ) : n.message ? (
                              <p className="text-xs text-bunker-400 mt-0.5 line-clamp-2">{n.message}</p>
                            ) : (
                              <p className="text-xs text-bunker-400 mt-0.5">Verification was not approved.</p>
                            )}
                            <p className="text-[10px] text-bunker-500 mt-1">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      );

                      return (
                        <li key={n.id}>
                          {isClickable ? (
                            <Link
                              href={href}
                              onClick={() => {
                                if (!n.read) markRead(n.id);
                                setOpen(false);
                              }}
                              className={`block px-3 py-2.5 text-left hover:bg-bunker-800/80 transition-colors border-l-2 ${
                                n.read ? 'border-transparent' : 'border-blood-500'
                              }`}
                            >
                              {content}
                            </Link>
                          ) : (
                            <div
                              onClick={() => !n.read && markRead(n.id)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if ((e.key === 'Enter' || e.key === ' ') && !n.read) markRead(n.id);
                              }}
                              className={`block px-3 py-2.5 text-left hover:bg-bunker-800/80 transition-colors cursor-default border-l-2 ${
                                n.read ? 'border-transparent' : 'border-blood-500'
                              }`}
                            >
                              {content}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
              {notifications.length > 0 && (
                <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 border-t border-bunker-700 bg-bunker-800/50">
                  <button
                    type="button"
                    onClick={markAllRead}
                    disabled={unreadCount === 0 || actionLoading !== null}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium text-bunker-300 hover:text-white hover:bg-bunker-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                  >
                    {actionLoading === 'read-all' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCheck className="w-3.5 h-3.5" />
                    )}
                    Mark all read
                  </button>
                  <button
                    type="button"
                    onClick={clearAll}
                    disabled={actionLoading !== null}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium text-bunker-300 hover:text-blood-300 hover:bg-bunker-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                  >
                    {actionLoading === 'clear' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    Clear all
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
