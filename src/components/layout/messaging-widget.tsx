'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/auth-context';
import { Avatar, Button, Modal } from '@/components/ui';
import { getDisplayAvatarUrl } from '@/lib/avatar';
import { cn } from '@/lib/utils';
import {
  MessageSquare, X, ChevronLeft, Search, Users, MessageCircle,
  Ban, Send, UserPlus, UserMinus, Loader2, ShieldOff, AlertTriangle, Check,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type UserInfo = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  avatarPreset?: string | null;
  isOnline?: boolean;
  lastSeenAt?: string | null;
};

type DM = {
  id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  readAt: string | null;
  createdAt: string;
};

type Conversation = {
  user: UserInfo;
  lastMessage: { content: string; createdAt: string; isFromMe: boolean } | null;
  unreadCount: number;
};

type Tab = 'friends' | 'messages' | 'search' | 'blocked';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function OnlineDot({ isOnline }: { isOnline?: boolean }) {
  if (!isOnline) return null;
  return <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-element-500 border-2 border-bunker-900" aria-label="Online" />;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function UserRow({
  user,
  onChat,
  onAddFriend,
  onRemoveFriend,
  onBlock,
  isFriend,
  requestSent,
  meta,
}: {
  user: UserInfo;
  onChat?: () => void;
  onAddFriend?: () => void;
  onRemoveFriend?: () => void;
  onBlock?: () => void;
  isFriend?: boolean;
  requestSent?: boolean;
  meta?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2 hover:bg-bunker-800/60 rounded-lg group transition-colors">
      <div className="relative flex-shrink-0">
        <Avatar src={getDisplayAvatarUrl(user)} fallback={user.displayName || user.username} size="sm" className="w-8 h-8" />
        <OnlineDot isOnline={user.isOnline} />
      </div>
      <div className="min-w-0 flex-1">
        <Link href={`/users/${user.username}`} className="text-sm font-medium text-white hover:text-blood-400 truncate block">
          {user.displayName || user.username}
        </Link>
        {meta}
      </div>
      <div className={cn('flex items-center gap-1 transition-opacity', requestSent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')}>
        {onChat && (
          <button type="button" onClick={onChat} className="p-1.5 rounded-lg text-bunker-400 hover:text-white hover:bg-bunker-700 transition-colors" title="Message">
            <MessageCircle className="w-3.5 h-3.5" />
          </button>
        )}
        {requestSent ? (
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-element-900/50 text-element-400 text-[10px] font-semibold">
            <Check className="w-3 h-3" />
            Sent
          </span>
        ) : onAddFriend && !isFriend ? (
          <button type="button" onClick={onAddFriend} className="p-1.5 rounded-lg text-bunker-400 hover:text-element-400 hover:bg-bunker-700 transition-colors" title="Add friend">
            <UserPlus className="w-3.5 h-3.5" />
          </button>
        ) : null}
        {onRemoveFriend && isFriend && (
          <button type="button" onClick={onRemoveFriend} className="p-1.5 rounded-lg text-bunker-400 hover:text-blood-400 hover:bg-bunker-700 transition-colors" title="Remove friend">
            <UserMinus className="w-3.5 h-3.5" />
          </button>
        )}
        {onBlock && (
          <button type="button" onClick={onBlock} className="p-1.5 rounded-lg text-bunker-400 hover:text-blood-400 hover:bg-bunker-700 transition-colors" title="Block user">
            <Ban className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Widget ──────────────────────────────────────────────────────────────

export function MessagingWidget() {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('messages');
  const [chatWith, setChatWith] = useState<UserInfo | null>(null);

  // Data
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [friends, setFriends] = useState<(UserInfo & { isOnline: boolean })[]>([]);
  const [messages, setMessages] = useState<DM[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<UserInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserInfo[]>([]);
  const [friendIds, setFriendIds] = useState<Set<string>>(new Set());
  const [pendingFriendIds, setPendingFriendIds] = useState<Set<string>>(new Set());

  // Chat state
  const [iBlockedThem, setIBlockedThem] = useState(false);
  const [theyBlockedMe, setTheyBlockedMe] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // UI state
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [confirmRemoveFriend, setConfirmRemoveFriend] = useState<UserInfo | null>(null);
  const [confirmBlock, setConfirmBlock] = useState<UserInfo | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ── Unread count polling (always) ──────────────────────────────────────────
  const fetchUnreadCount = useCallback(() => {
    if (!profile?.id) return;
    fetch('/api/me/messages', { credentials: 'same-origin', cache: 'no-store' })
      .then((r) => r.ok ? r.json() : { totalUnread: 0, conversations: [] })
      .then((d) => {
        setUnreadTotal(d.totalUnread ?? 0);
        if (isOpen && activeTab === 'messages') setConversations(d.conversations ?? []);
      })
      .catch(() => {});
  }, [profile?.id, isOpen, activeTab]);

  useEffect(() => {
    if (!profile?.id) return;
    fetchUnreadCount();
    const t = setInterval(fetchUnreadCount, 20 * 1000);
    return () => clearInterval(t);
  }, [profile?.id, fetchUnreadCount]);

  // ── Conversations tab ──────────────────────────────────────────────────────
  const fetchConversations = useCallback(() => {
    fetch('/api/me/messages', { credentials: 'same-origin', cache: 'no-store' })
      .then((r) => r.ok ? r.json() : { totalUnread: 0, conversations: [] })
      .then((d) => {
        setUnreadTotal(d.totalUnread ?? 0);
        setConversations(d.conversations ?? []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isOpen || activeTab !== 'messages') return;
    fetchConversations();
  }, [isOpen, activeTab, fetchConversations]);

  // ── Friends tab ────────────────────────────────────────────────────────────
  const fetchFriends = useCallback(() => {
    fetch('/api/me/friends', { credentials: 'same-origin', cache: 'no-store' })
      .then((r) => r.ok ? r.json() : { friends: [] })
      .then((d) => {
        const fs = d.friends ?? [];
        setFriends(fs);
        setFriendIds(new Set(fs.map((f: UserInfo) => f.id)));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isOpen || activeTab !== 'friends') return;
    fetchFriends();
  }, [isOpen, activeTab, fetchFriends]);

  // ── Blocked tab ────────────────────────────────────────────────────────────
  const fetchBlocked = useCallback(() => {
    fetch('/api/me/blocks', { credentials: 'same-origin', cache: 'no-store' })
      .then((r) => r.ok ? r.json() : { blocked: [] })
      .then((d) => setBlockedUsers(d.blocked ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isOpen || activeTab !== 'blocked') return;
    fetchBlocked();
  }, [isOpen, activeTab, fetchBlocked]);

  // ── Search ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'search') return;
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    const q = searchQuery.trim();
    if (!q) { setSearchResults([]); return; }
    searchTimerRef.current = setTimeout(() => {
      fetch(`/api/users/search?q=${encodeURIComponent(q)}&limit=12`, { credentials: 'same-origin' })
        .then((r) => r.ok ? r.json() : { users: [] })
        .then((d) => {
          const users: UserInfo[] = Array.isArray(d?.users) ? d.users : Array.isArray(d) ? d : [];
          setSearchResults(users.filter((u) => u.id !== profile?.id));
        })
        .catch(() => {});
    }, 300);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [searchQuery, activeTab, profile?.id]);

  // ── Chat thread ────────────────────────────────────────────────────────────
  const fetchThread = useCallback((userId: string) => {
    setLoadingMessages(true);
    fetch(`/api/me/messages/${userId}`, { credentials: 'same-origin', cache: 'no-store' })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (!d) return;
        setMessages(d.messages ?? []);
        setIBlockedThem(d.iBlockedThem ?? false);
        setTheyBlockedMe(d.theyBlockedMe ?? false);
        if (d.otherUser) {
          setChatWith((prev) => prev?.id === d.otherUser.id ? { ...prev, ...d.otherUser } : prev);
        }
        // Update unread count
        setUnreadTotal((prev) => Math.max(0, prev - (d.messages ?? []).filter((m: DM) => m.toUserId === profile?.id && !m.readAt).length));
      })
      .catch(() => {})
      .finally(() => setLoadingMessages(false));
  }, [profile?.id]);

  useEffect(() => {
    if (!chatWith) {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }
    fetchThread(chatWith.id);
    pollRef.current = setInterval(() => fetchThread(chatWith.id), 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  // chatWith object ref is stable enough via .id; full object intentionally excluded to avoid re-triggering
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatWith?.id, fetchThread]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const openChat = useCallback((user: UserInfo) => {
    setChatWith(user);
    setMessageInput('');
    setSendError(null);
    setMessages([]);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const closeChat = useCallback(() => {
    setChatWith(null);
    if (pollRef.current) clearInterval(pollRef.current);
    fetchConversations();
  }, [fetchConversations]);

  const sendMessage = useCallback(async () => {
    if (!chatWith || !messageInput.trim() || sending) return;
    setSending(true);
    setSendError(null);
    try {
      const res = await fetch(`/api/me/messages/${chatWith.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: messageInput.trim() }),
        credentials: 'same-origin',
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === 'BLOCKED_BY_RECIPIENT') {
          setTheyBlockedMe(true);
          setSendError('This user has blocked you.');
        } else {
          setSendError(data.error ?? 'Failed to send');
        }
        return;
      }
      setMessageInput('');
      setMessages((prev) => [...prev, data]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch {
      setSendError('Failed to send');
    } finally {
      setSending(false);
    }
  }, [chatWith, messageInput, sending]);

  const handleAddFriend = useCallback(async (userId: string) => {
    const res = await fetch('/api/me/friends/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toUserId: userId }),
      credentials: 'same-origin',
    }).catch(() => null);
    if (res?.ok || res?.status === 409) {
      // 409 = already sent/friends — still show as sent
      setPendingFriendIds((prev) => { const next = new Set(prev); next.add(userId); return next; });
    }
  }, []);

  const handleRemoveFriend = useCallback(async (userId: string) => {
    await fetch(`/api/me/friends/${userId}`, { method: 'DELETE', credentials: 'same-origin' }).catch(() => {});
    setFriends((prev) => prev.filter((f) => f.id !== userId));
    setFriendIds((prev) => { const s = new Set(prev); s.delete(userId); return s; });
    window.dispatchEvent(new Event('cod-tracker-friends-updated'));
    setConfirmRemoveFriend(null);
  }, []);

  const handleBlock = useCallback(async (user: UserInfo) => {
    await fetch('/api/me/blocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockedUserId: user.id }),
      credentials: 'same-origin',
    }).catch(() => {});
    setConfirmBlock(null);
    if (chatWith?.id === user.id) { setIBlockedThem(true); }
    fetchBlocked();
  }, [chatWith?.id, fetchBlocked]);

  const handleUnblock = useCallback(async (userId: string) => {
    await fetch(`/api/me/blocks/${userId}`, { method: 'DELETE', credentials: 'same-origin' }).catch(() => {});
    setBlockedUsers((prev) => prev.filter((u) => u.id !== userId));
    if (chatWith?.id === userId) setIBlockedThem(false);
  }, [chatWith?.id]);

  if (!profile) return null;

  const tabs: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: 'messages', icon: <MessageCircle className="w-4 h-4" />, label: 'Messages' },
    { id: 'friends', icon: <Users className="w-4 h-4" />, label: 'Friends' },
    { id: 'search', icon: <Search className="w-4 h-4" />, label: 'Find' },
    { id: 'blocked', icon: <Ban className="w-4 h-4" />, label: 'Blocked' },
  ];

  return (
    <>
      {/* ── Floating button ── */}
      <div className="fixed bottom-4 left-4 z-[60]">
        <button
          type="button"
          onClick={() => {
            setIsOpen((v) => !v);
            if (!isOpen) { setActiveTab('messages'); setChatWith(null); }
          }}
          className={cn(
            'relative flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-colors',
            isOpen
              ? 'bg-blood-600 hover:bg-blood-500 text-white'
              : 'bg-bunker-800 hover:bg-bunker-700 border border-bunker-600 text-bunker-200 hover:text-white'
          )}
          aria-label={isOpen ? 'Close messages' : 'Open messages'}
        >
          {isOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
          {!isOpen && unreadTotal > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-blood-500 text-white text-[10px] font-bold border border-bunker-900">
              {unreadTotal > 99 ? '99+' : unreadTotal}
            </span>
          )}
        </button>
      </div>

      {/* ── Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed bottom-20 left-2 right-2 sm:left-4 sm:right-auto sm:w-96 z-[60] flex flex-col rounded-xl border border-bunker-700 bg-bunker-900 shadow-2xl overflow-hidden"
            style={{ height: 'min(520px, calc(100vh - 6rem))' }}
          >
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-bunker-800 flex-shrink-0 bg-bunker-900">
              {chatWith ? (
                <>
                  <button type="button" onClick={closeChat} className="p-1 -ml-1 rounded-lg text-bunker-400 hover:text-white hover:bg-bunker-800 transition-colors" aria-label="Back">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="relative flex-shrink-0">
                    <Avatar src={getDisplayAvatarUrl(chatWith)} fallback={chatWith.displayName || chatWith.username} size="sm" className="w-7 h-7" />
                    <OnlineDot isOnline={chatWith.isOnline} />
                  </div>
                  <Link href={`/users/${chatWith.username}`} className="font-semibold text-sm text-white hover:text-blood-400 truncate flex-1">
                    {chatWith.displayName || chatWith.username}
                  </Link>
                  <div className="flex items-center gap-1">
                    {!iBlockedThem ? (
                      <button type="button" onClick={() => setConfirmBlock(chatWith)} className="p-1.5 rounded-lg text-bunker-500 hover:text-blood-400 hover:bg-bunker-800 transition-colors" title="Block user">
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button type="button" onClick={() => handleUnblock(chatWith.id)} className="p-1.5 rounded-lg text-blood-400 hover:text-blood-300 hover:bg-bunker-800 transition-colors" title="Unblock user">
                        <ShieldOff className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 text-blood-400 flex-shrink-0" />
                  <span className="font-semibold text-sm text-white flex-1">Messages</span>
                  <button type="button" onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg text-bunker-400 hover:text-white hover:bg-bunker-800 transition-colors" aria-label="Close">
                    <X className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Tabs (when not in chat) */}
            {!chatWith && (
              <div className="flex border-b border-bunker-800 flex-shrink-0 bg-bunker-900">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex-1 flex flex-col items-center gap-0.5 py-2 text-xs transition-colors',
                      activeTab === tab.id
                        ? 'text-blood-400 border-b-2 border-blood-500'
                        : 'text-bunker-400 hover:text-bunker-200'
                    )}
                  >
                    {tab.icon}
                    <span className="hidden sm:block">{tab.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto min-h-0">

              {/* ── Chat view ── */}
              {chatWith && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto p-3 space-y-1 min-h-0" style={{ maxHeight: 'calc(100vh - 18rem)' }}>
                    {loadingMessages && messages.length === 0 && (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-5 h-5 animate-spin text-bunker-500" />
                      </div>
                    )}
                    {!loadingMessages && messages.length === 0 && (
                      <p className="text-center text-xs text-bunker-500 py-8">No messages yet. Say hello!</p>
                    )}
                    {messages.map((msg) => {
                      const isMe = msg.fromUserId === profile.id;
                      return (
                        <div key={msg.id} className={cn('flex gap-2', isMe ? 'justify-end' : 'justify-start')}>
                          {!isMe && (
                            <Avatar src={getDisplayAvatarUrl(chatWith)} fallback={chatWith.displayName || chatWith.username} size="sm" className="w-6 h-6 flex-shrink-0 mt-1" />
                          )}
                          <div className={cn('flex flex-col gap-0.5 max-w-[75%]', isMe ? 'items-end' : 'items-start')}>
                            <div className={cn(
                              'px-3 py-2 rounded-2xl text-sm break-words leading-relaxed',
                              isMe
                                ? 'bg-blood-700/80 text-white rounded-br-sm'
                                : 'bg-bunker-800 text-bunker-100 rounded-bl-sm'
                            )}>
                              {msg.content}
                            </div>
                            <span className="text-[10px] text-bunker-600 px-1">{relativeTime(msg.createdAt)}</span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="border-t border-bunker-800 p-2 flex-shrink-0 bg-bunker-900">
                    {theyBlockedMe ? (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blood-950/50 border border-blood-800/50">
                        <AlertTriangle className="w-4 h-4 text-blood-400 flex-shrink-0" />
                        <p className="text-xs text-blood-300">You&apos;ve been blocked by this user.</p>
                      </div>
                    ) : iBlockedThem ? (
                      <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-bunker-800 border border-bunker-700">
                        <p className="text-xs text-bunker-400">You&apos;ve blocked this user.</p>
                        <button onClick={() => handleUnblock(chatWith.id)} className="text-xs text-element-400 hover:text-element-300">Unblock</button>
                      </div>
                    ) : (
                      <>
                        <div className="flex gap-2">
                          <textarea
                            ref={inputRef}
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                            placeholder="Message…"
                            maxLength={2000}
                            rows={1}
                            className="flex-1 min-w-0 resize-none px-3 py-2 rounded-lg border border-bunker-700 bg-bunker-800 text-sm text-white placeholder-bunker-500 focus:outline-none focus:border-bunker-500 focus:ring-1 focus:ring-bunker-500 max-h-28 overflow-y-auto"
                            style={{ fieldSizing: 'content' } as React.CSSProperties}
                          />
                          <button
                            type="button"
                            onClick={sendMessage}
                            disabled={sending || !messageInput.trim()}
                            className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-blood-600 hover:bg-blood-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
                            aria-label="Send"
                          >
                            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          </button>
                        </div>
                        {sendError && <p className="text-xs text-blood-400 mt-1 px-1">{sendError}</p>}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* ── Messages tab ── */}
              {!chatWith && activeTab === 'messages' && (
                <div className="py-1">
                  {conversations.length === 0 ? (
                    <p className="text-xs text-bunker-500 text-center py-10">No conversations yet.<br />Search for someone to start chatting!</p>
                  ) : (
                    conversations.map((conv) => (
                      <button
                        key={conv.user.id}
                        type="button"
                        onClick={() => openChat(conv.user)}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-bunker-800/60 transition-colors text-left"
                      >
                        <div className="relative flex-shrink-0">
                          <Avatar src={getDisplayAvatarUrl(conv.user)} fallback={conv.user.displayName || conv.user.username} size="sm" className="w-9 h-9" />
                          <OnlineDot isOnline={conv.user.isOnline} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-1">
                            <span className="text-sm font-medium text-white truncate">{conv.user.displayName || conv.user.username}</span>
                            {conv.lastMessage && <span className="text-[10px] text-bunker-500 flex-shrink-0">{relativeTime(conv.lastMessage.createdAt)}</span>}
                          </div>
                          {conv.lastMessage && (
                            <p className="text-xs text-bunker-400 truncate">
                              {conv.lastMessage.isFromMe ? 'You: ' : ''}{conv.lastMessage.content}
                            </p>
                          )}
                        </div>
                        {conv.unreadCount > 0 && (
                          <span className="flex-shrink-0 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-blood-500 text-white text-[10px] font-bold">
                            {conv.unreadCount}
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* ── Friends tab ── */}
              {!chatWith && activeTab === 'friends' && (
                <div className="py-1">
                  {friends.length === 0 ? (
                    <p className="text-xs text-bunker-500 text-center py-10">No friends yet.<br />Use Search to find people!</p>
                  ) : (
                    <>
                      <div className="px-3 pt-2 pb-2 flex items-center justify-between">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-bunker-500">Friends</span>
                        <span className="text-[11px] text-bunker-400">
                          <span className={friends.filter((f) => f.isOnline).length > 0 ? 'text-element-400 font-semibold' : ''}>
                            {friends.filter((f) => f.isOnline).length}
                          </span>
                          <span className="text-bunker-600"> / </span>
                          {friends.length} online
                        </span>
                      </div>
                      {friends.filter((f) => f.isOnline).length > 0 && (
                        <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-bunker-500">Online</p>
                      )}
                      {friends.filter((f) => f.isOnline).map((f) => (
                        <UserRow key={f.id} user={f} onChat={() => openChat(f)} onRemoveFriend={() => setConfirmRemoveFriend(f)} onBlock={() => setConfirmBlock(f)} isFriend />
                      ))}
                      {friends.filter((f) => !f.isOnline).length > 0 && (
                        <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-bunker-500">Offline</p>
                      )}
                      {friends.filter((f) => !f.isOnline).map((f) => (
                        <UserRow key={f.id} user={f} onChat={() => openChat(f)} onRemoveFriend={() => setConfirmRemoveFriend(f)} onBlock={() => setConfirmBlock(f)} isFriend />
                      ))}
                    </>
                  )}
                </div>
              )}

              {/* ── Search tab ── */}
              {!chatWith && activeTab === 'search' && (
                <div>
                  {/* Sticky search input inside the scrollable content area */}
                  <div className="sticky top-0 z-10 p-3 border-b border-bunker-800 bg-bunker-900">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bunker-500" />
                      <input
                        type="search"
                        placeholder="Search by name or username…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-bunker-700 bg-bunker-800 text-sm text-white placeholder-bunker-500 focus:outline-none focus:border-bunker-500 focus:ring-1 focus:ring-bunker-500"
                      />
                    </div>
                  </div>
                  <div className="py-1">
                    {!searchQuery.trim() && (
                      <p className="text-xs text-bunker-500 text-center py-10">Search for a player to<br />send them a message or add as a friend.</p>
                    )}
                    {searchResults.map((user) => (
                      <UserRow
                        key={user.id}
                        user={user}
                        onChat={() => openChat(user)}
                        onAddFriend={() => handleAddFriend(user.id)}
                        onBlock={() => setConfirmBlock(user)}
                        isFriend={friendIds.has(user.id)}
                        requestSent={pendingFriendIds.has(user.id)}
                        meta={<span className="text-xs text-bunker-500 truncate block">@{user.username}</span>}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* ── Blocked tab ── */}
              {!chatWith && activeTab === 'blocked' && (
                <div className="py-1">
                  {blockedUsers.length === 0 ? (
                    <p className="text-xs text-bunker-500 text-center py-10">No blocked users.</p>
                  ) : (
                    blockedUsers.map((user) => (
                      <div key={user.id} className="flex items-center gap-2.5 px-3 py-2">
                        <Avatar src={getDisplayAvatarUrl(user)} fallback={user.displayName || user.username} size="sm" className="w-8 h-8 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <span className="text-sm font-medium text-bunker-300 truncate block">{user.displayName || user.username}</span>
                          <span className="text-xs text-bunker-500">@{user.username}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUnblock(user.id)}
                          className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-bunker-600 text-xs text-bunker-300 hover:text-white hover:border-bunker-500 transition-colors"
                        >
                          <ShieldOff className="w-3 h-3" />
                          Unblock
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Confirm remove friend modal ── */}
      <Modal
        isOpen={!!confirmRemoveFriend}
        onClose={() => setConfirmRemoveFriend(null)}
        title="Remove friend?"
        description={confirmRemoveFriend ? `Remove ${confirmRemoveFriend.displayName || confirmRemoveFriend.username} from your friends?` : ''}
        size="sm"
      >
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={() => setConfirmRemoveFriend(null)}>Cancel</Button>
          <Button variant="primary" className="bg-blood-600 hover:bg-blood-700" onClick={() => confirmRemoveFriend && handleRemoveFriend(confirmRemoveFriend.id)}>
            Remove
          </Button>
        </div>
      </Modal>

      {/* ── Confirm block modal ── */}
      <Modal
        isOpen={!!confirmBlock}
        onClose={() => setConfirmBlock(null)}
        title="Block this user?"
        description={confirmBlock ? `Block ${confirmBlock.displayName || confirmBlock.username}? They won't be able to message you, and you won't see their messages.` : ''}
        size="sm"
      >
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={() => setConfirmBlock(null)}>Cancel</Button>
          <Button variant="primary" className="bg-blood-600 hover:bg-blood-700" onClick={() => confirmBlock && handleBlock(confirmBlock)}>
            <Ban className="w-4 h-4 mr-1.5" />
            Block
          </Button>
        </div>
      </Modal>
    </>
  );
}
