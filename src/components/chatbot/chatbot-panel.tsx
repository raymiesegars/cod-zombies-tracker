'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, AlertCircle } from 'lucide-react';
import { getAssetUrl } from '@/lib/assets';
import { Button, Input, Modal } from '@/components/ui';
import { useChatbot, type ChatMessage } from '@/context/chatbot-context';

type ContentPart = { type: 'text'; value: string } | { type: 'link'; href: string; label: string };

function parseChatbotContent(content: string): ContentPart[] {
  const parts: ContentPart[] = [];
  const pathLabel = (path: string): string => {
    if (path === '/leaderboards') return 'Leaderboards';
    if (path === '/maps') return 'Maps';
    if (path.startsWith('/maps/')) return 'map page';
    if (path === '/rules') return 'Rules';
    if (path === '/tournaments') return 'Tournaments';
    return path;
  };
  const regex = /\[([^\]]+)\]\((https?:\/\/[^)]+|\/[^)]*)\)|(\/leaderboards|\/maps(?:\/[a-zA-Z0-9-]+)?|\/rules|\/tournaments)|(\bZombacus\b)/gi;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(content)) !== null) {
    if (m.index > lastIndex) {
      parts.push({ type: 'text', value: content.slice(lastIndex, m.index) });
    }
    if (m[1] !== undefined && m[2] !== undefined) {
      const href = m[2].startsWith('http') ? m[2] : (m[2].startsWith('/') ? m[2] : '/');
      parts.push({ type: 'link', href, label: m[1] });
    } else if (m[3] !== undefined) {
      const path = m[3];
      parts.push({ type: 'link', href: path, label: pathLabel(path) });
    } else if (m[4] !== undefined) {
      parts.push({ type: 'link', href: '/', label: 'Zombacus' });
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < content.length) {
    parts.push({ type: 'text', value: content.slice(lastIndex) });
  }
  return parts.length ? parts : [{ type: 'text', value: content }];
}

const GET_MORE_TOKENS_MESSAGE = (
  <>
    Tip for server costs and we can grant you more LeKronorium uses. Include your <strong>CZT display name</strong> when tipping, or message me on Discord.
    <br /><br />
    If you tip <strong>more than $20 total</strong> to help with server costs, I&apos;ll give you <strong>25 tokens per day for life</strong>.
  </>
);

const CHATBOT_IMAGE = getAssetUrl('/images/ranks/chatbot.png');

interface ChatbotPanelProps {
  onClose: () => void;
}

export function ChatbotPanel({ onClose }: ChatbotPanelProps) {
  const ctx = useChatbot();
  const messages = useMemo(() => ctx?.messages ?? [], [ctx?.messages]);
  const setMessages = ctx?.setMessages ?? (() => {});
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokensRemaining, setTokensRemaining] = useState<number | null>(null);
  const [nextRefillAt, setNextRefillAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [getMoreTokensOpen, setGetMoreTokensOpen] = useState(false);
  const [nextTokenIn, setNextTokenIn] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const limitsFetchedRef = useRef(false);

  const fetchLimits = useCallback((force = false) => {
    if (!force && limitsFetchedRef.current) return;
    if (!force) limitsFetchedRef.current = true;
    fetch('/api/chatbot/limits', { credentials: 'same-origin', cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        setTokensRemaining(d.remaining ?? 0);
        setNextRefillAt(d.nextRefillAt ?? null);
      })
      .catch(() => {
        setTokensRemaining(0);
        setNextRefillAt(null);
      });
  }, []);

  useEffect(() => {
    if (!nextRefillAt) {
      setNextTokenIn(null);
      return;
    }
    const update = () => {
      const ms = new Date(nextRefillAt).getTime() - Date.now();
      if (ms <= 0) {
        setNextTokenIn(null);
        setNextRefillAt(null);
        fetchLimits(true);
        return;
      }
      const totalSec = Math.ceil(ms / 1000);
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;
      if (h > 0) setNextTokenIn(`${h}h ${m}m`);
      else if (m > 0) setNextTokenIn(`${m}m ${s}s`);
      else setNextTokenIn(`${s}s`);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [nextRefillAt, fetchLimits]);

  const onInputFocus = useCallback(() => {
    fetchLimits();
  }, [fetchLimits]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    if (!limitsFetchedRef.current) fetchLimits();
    if (tokensRemaining !== null && tokensRemaining <= 0) {
      setError('No uses left. Tokens refill over time—check back later.');
      setGetMoreTokensOpen(true);
      return;
    }
    setError(null);
    setInput('');
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          message: text,
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply ?? 'No response.' }]);
        setTokensRemaining(data.tokensRemaining ?? (tokensRemaining !== null ? tokensRemaining - 1 : 0));
        fetchLimits(true);
      } else {
        if (res.status === 401) setError('Sign in to use the chatbot.');
        else if (res.status === 429) {
          setTokensRemaining(0);
          setError(data.error ?? 'No uses left. Tokens refill over time.');
          setGetMoreTokensOpen(true);
        } else setError(data.error ?? 'Something went wrong. Try again.');
      }
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[9998] flex flex-col sm:flex-row sm:justify-end"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm sm:bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 24 }}
        transition={{ type: 'spring', duration: 0.3 }}
        className="relative z-10 flex flex-col w-full h-full sm:max-w-md sm:min-w-[380px] sm:h-[85vh] sm:max-h-[85vh] sm:rounded-xl bg-bunker-900 border border-bunker-700 shadow-2xl sm:border-t-0 mt-[env(safe-area-inset-top)] mr-[env(safe-area-inset-right)] mb-[env(safe-area-inset-bottom)] ml-[env(safe-area-inset-left)] sm:mt-4 sm:mr-4 sm:mb-4 sm:ml-0"
      >
        <div className="flex items-center justify-between flex-shrink-0 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-bunker-700 bg-bunker-800/80 min-h-[52px]">
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg overflow-hidden bg-bunker-800 border border-bunker-600 shrink-0">
              {CHATBOT_IMAGE ? (
                <Image src={CHATBOT_IMAGE} alt="" fill className="object-cover" unoptimized />
              ) : (
                <div className="w-full h-full bg-blood-900/50" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-semibold text-white truncate">LeKronorium</h2>
              <p className="text-[10px] sm:text-xs text-bunker-400 truncate hidden sm:block">Exclusive zombies knowledge & strats</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-bunker-400 hover:text-white hover:bg-bunker-700 active:bg-bunker-700 transition-colors touch-manipulation -mr-1 sm:mr-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain p-3 sm:p-4 space-y-4"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {messages.length === 0 && (
            <div className="text-center py-8 text-bunker-400 text-sm">
              <p className="font-medium text-bunker-300">Ask me anything about this site.</p>
              <p className="mt-1">Maps, leaderboards, rules, easter eggs, strats—I only answer from approved knowledge and site info.</p>
              {tokensRemaining !== null && (
                <p className="mt-3 text-blood-400/90">
                  {tokensRemaining} {tokensRemaining === 1 ? 'use' : 'uses'} left (refill over time)
                </p>
              )}
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded overflow-hidden bg-bunker-800 shrink-0 flex items-center justify-center">
                  {CHATBOT_IMAGE ? (
                    <Image src={CHATBOT_IMAGE} alt="" width={28} height={28} className="object-cover" unoptimized />
                  ) : (
                    <div className="w-full h-full bg-blood-900/50" />
                  )}
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  m.role === 'user'
                    ? 'bg-blood-800/80 text-white'
                    : 'bg-bunker-800 text-bunker-200'
                }`}
              >
                {m.role === 'user' ? (
                  <p className="whitespace-pre-wrap break-words">{m.content}</p>
                ) : (
                  <p className="whitespace-pre-wrap break-words">
                    {parseChatbotContent(m.content).map((part, j) =>
                      part.type === 'text' ? (
                        <span key={j}>{part.value}</span>
                      ) : part.href.startsWith('http') ? (
                        <a
                          key={j}
                          href={part.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blood-400 hover:text-blood-300 underline"
                        >
                          {part.label}
                        </a>
                      ) : (
                        <Link key={j} href={part.href} className="text-blood-400 hover:text-blood-300 underline">
                          {part.label}
                        </Link>
                      )
                    )}
                  </p>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded overflow-hidden bg-bunker-800 shrink-0 flex items-center justify-center">
                {CHATBOT_IMAGE ? (
                  <Image src={CHATBOT_IMAGE} alt="" width={28} height={28} className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full bg-blood-900/50" />
                )}
              </div>
              <div className="bg-bunker-800 rounded-lg px-3 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-bunker-400" />
              </div>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 p-3 sm:p-4 border-t border-bunker-700 space-y-2">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-red-400"
              >
                <span className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </span>
                {(error.includes('No uses left') || error.includes('Tokens refill')) && (
                  <button
                    type="button"
                    onClick={() => setGetMoreTokensOpen(true)}
                    className="text-blood-400 hover:text-blood-300 underline text-xs min-h-[44px] flex items-center touch-manipulation"
                  >
                    Get more tokens
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={onInputFocus}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Ask about maps, rules, strats..."
              maxLength={2000}
              className="flex-1 min-h-[44px] bg-bunker-800 border-bunker-600 text-white placeholder:text-bunker-500 text-base"
              disabled={loading}
            />
            <Button
              size="sm"
              onClick={send}
              disabled={loading || !input.trim() || (tokensRemaining !== null && tokensRemaining <= 0)}
              leftIcon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              aria-label="Send"
              className="min-h-[44px] touch-manipulation shrink-0"
            >
              Send
            </Button>
          </div>
          <p className="text-[10px] sm:text-xs text-bunker-500 flex items-center gap-2 flex-wrap gap-y-1">
            <span>{tokensRemaining !== null ? `${tokensRemaining} ${tokensRemaining === 1 ? 'use' : 'uses'} left` : '— uses left'}</span>
            {nextTokenIn && (
              <span className="text-bunker-400">Next token in {nextTokenIn}</span>
            )}
            <button
              type="button"
              onClick={() => setGetMoreTokensOpen(true)}
              className="text-blood-400/90 hover:text-blood-400 text-xs underline min-h-[36px] flex items-center touch-manipulation py-1"
            >
              Get more tokens
            </button>
          </p>
        </div>
      </motion.div>

      <Modal
        isOpen={getMoreTokensOpen}
        onClose={() => setGetMoreTokensOpen(false)}
        title="Get more LeKronorium uses"
        description=""
        size="sm"
      >
        <p className="text-sm text-bunker-300 leading-relaxed">
          {GET_MORE_TOKENS_MESSAGE}
        </p>
        <div className="flex justify-end pt-4">
          <Button variant="primary" onClick={() => setGetMoreTokensOpen(false)}>
            Got it
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
}
