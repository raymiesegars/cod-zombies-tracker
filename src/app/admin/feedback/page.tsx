'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui';
import { MessageSquare, Bug, Loader2, User } from 'lucide-react';

type FeedbackItem = {
  id: string;
  userId: string;
  userName: string;
  username: string;
  message: string;
  type: string;
  createdAt: string;
};

type FeedbackFilter = 'all' | 'merge' | 'bug' | 'general';
const MERGE_REQUEST_PREFIX = '[PROFILE MERGE REQUEST]';

function isMergeRequest(item: FeedbackItem): boolean {
  return item.message.trim().startsWith(MERGE_REQUEST_PREFIX);
}

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [filter, setFilter] = useState<FeedbackFilter>('all');

  const fetchFeedback = useCallback(() => {
    fetch('/api/admin/feedback', { credentials: 'same-origin', cache: 'no-store' })
      .then((res) => {
        if (res.status === 403) {
          setForbidden(true);
          return { feedback: [] };
        }
        return res.ok ? res.json() : { feedback: [] };
      })
      .then((data) => setFeedback(data.feedback ?? []))
      .catch(() => setFeedback([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchFeedback();
  }, [fetchFeedback]);

  useEffect(() => {
    const t = setInterval(fetchFeedback, 12000);
    return () => clearInterval(t);
  }, [fetchFeedback]);

  const counts = {
    all: feedback.length,
    merge: feedback.filter(isMergeRequest).length,
    bug: feedback.filter((f) => f.type === 'bug').length,
    general: feedback.filter((f) => f.type !== 'bug' && !isMergeRequest(f)).length,
  };

  const filteredFeedback = feedback.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'merge') return isMergeRequest(item);
    if (filter === 'bug') return item.type === 'bug';
    return item.type !== 'bug' && !isMergeRequest(item);
  });

  if (forbidden) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-bunker-400">You don’t have access to this page.</p>
        <Link href="/" className="text-blood-400 hover:underline mt-2 inline-block">Back to home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-zombies text-white tracking-wide flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-blood-500" />
          Admin — Feedback
        </h1>
        <p className="text-sm text-bunker-400 mt-1">
          Bug reports and feedback submitted by users. Sorted by newest first.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {([
            { id: 'all', label: 'All' },
            { id: 'merge', label: 'Merge Requests' },
            { id: 'bug', label: 'Bug Reports' },
            { id: 'general', label: 'General Feedback' },
          ] as Array<{ id: FeedbackFilter; label: string }>).map((opt) => {
            const active = filter === opt.id;
            const count = counts[opt.id];
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setFilter(opt.id)}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs sm:text-sm transition-colors ${
                  active
                    ? 'border-blood-500 bg-blood-950/30 text-white'
                    : 'border-bunker-700 bg-bunker-900/60 text-bunker-300 hover:border-bunker-600'
                }`}
              >
                <span>{opt.label}</span>
                <span className="text-bunker-400">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <Card variant="bordered" className="border-bunker-700">
          <CardContent className="py-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blood-500 animate-spin" />
          </CardContent>
        </Card>
      ) : filteredFeedback.length === 0 ? (
        <Card variant="bordered" className="border-bunker-700">
          <CardContent className="py-12 text-center text-bunker-400 text-sm">
            No items for this filter.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredFeedback.map((item) => (
            <Card key={item.id} variant="bordered" className="border-bunker-700 overflow-hidden">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 text-white font-medium">
                      <User className="w-4 h-4 text-bunker-500" />
                      {item.userName}
                    </span>
                    <Link
                      href={`/users/${item.username}`}
                      className="text-xs text-bunker-500 hover:text-blood-400 transition-colors"
                    >
                      @{item.username}
                    </Link>
                    {isMergeRequest(item) && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-element-950/40 text-element-300 border border-element-700/60">
                        Merge request
                      </span>
                    )}
                    {item.type === 'bug' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blood-950/50 text-blood-400 border border-blood-800">
                        <Bug className="w-3 h-3" />
                        Bug report
                      </span>
                    )}
                  </div>
                  <time
                    dateTime={item.createdAt}
                    className="text-xs text-bunker-500 shrink-0"
                  >
                    {new Date(item.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                </div>
                <p className="text-sm text-bunker-300 whitespace-pre-wrap break-words">{item.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
