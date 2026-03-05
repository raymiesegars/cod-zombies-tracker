'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, Button, Input } from '@/components/ui';
import { Bot, Loader2, Send, CheckCircle2, XCircle, MessageCircleQuestion, Gift } from 'lucide-react';

const CATEGORIES = [
  { value: '', label: '— Select category (optional) —' },
  { value: 'easter_eggs', label: 'Easter eggs & quests' },
  { value: 'rules', label: 'Rules & verification' },
  { value: 'strats', label: 'Strats & tips' },
  { value: 'maps', label: 'Maps & games' },
  { value: 'general', label: 'General' },
];

type PendingSubmission = {
  id: string;
  title: string | null;
  category: string | null;
  content: string;
  createdAt: string;
  submittedBy: string;
  submittedByUsername: string;
};

type UnansweredItem = {
  id: string;
  question: string;
  createdAt: string;
  askedBy: string;
  askedByUsername: string;
};

export default function AdminChatbotPage() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitDone, setSubmitDone] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [pending, setPending] = useState<PendingSubmission[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [unanswered, setUnanswered] = useState<UnansweredItem[]>([]);
  const [unansweredLoading, setUnansweredLoading] = useState(false);
  const [contributorUsername, setContributorUsername] = useState('');
  const [grantingContributor, setGrantingContributor] = useState(false);

  const fetchPending = useCallback(() => {
    setPendingLoading(true);
    fetch('/api/admin/chatbot/submissions', { credentials: 'same-origin', cache: 'no-store' })
      .then((r) => {
        if (r.status === 403) return { submissions: [] };
        return r.ok ? r.json() : { submissions: [] };
      })
      .then((d) => {
        setPending(d.submissions ?? []);
        if (d.submissions && (d as { isSuperAdmin?: boolean }).isSuperAdmin !== undefined) {
          setIsSuperAdmin((d as { isSuperAdmin: boolean }).isSuperAdmin);
        }
      })
      .catch(() => setPending([]))
      .finally(() => setPendingLoading(false));
  }, []);

  useEffect(() => {
    fetch('/api/admin/me', { credentials: 'same-origin', cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.resolve({ admin: null })))
      .then((d: { admin?: { isSuperAdmin?: boolean } | null }) => {
        const admin = d.admin;
        if (!admin) setForbidden(true);
        else setIsSuperAdmin(admin.isSuperAdmin === true);
      })
      .catch(() => setForbidden(true));
  }, []);

  useEffect(() => {
    if (isSuperAdmin) fetchPending();
  }, [isSuperAdmin, fetchPending]);

  const fetchUnanswered = useCallback(() => {
    setUnansweredLoading(true);
    fetch('/api/admin/chatbot/unanswered', { credentials: 'same-origin', cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { questions: [] }))
      .then((d) => setUnanswered(d.questions ?? []))
      .catch(() => setUnanswered([]))
      .finally(() => setUnansweredLoading(false));
  }, []);

  useEffect(() => {
    fetchUnanswered();
  }, [fetchUnanswered]);

  const handleGrantContributor = async (e: React.FormEvent) => {
    e.preventDefault();
    const username = contributorUsername.trim();
    if (!username) return;
    setGrantingContributor(true);
    try {
      const res = await fetch('/api/admin/grant-contributor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ username }),
      });
      const data = (await res.json().catch(() => null)) as { username?: string; error?: string } | null;
      if (res.ok && data?.username) {
        setContributorUsername('');
        alert(`Granted contributor status to @${data.username}`);
      } else {
        alert(data?.error || (res.status === 404 ? 'Grant contributor API not found. Deploy the latest code.' : 'Failed'));
      }
    } catch {
      alert('Failed');
    } finally {
      setGrantingContributor(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setSubmitDone(false);
    try {
      const res = await fetch('/api/admin/chatbot/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ title: title.trim() || null, category: category.trim() || null, content: content.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setTitle('');
        setCategory('');
        setContent('');
        setSubmitDone(true);
        fetchPending();
      } else {
        alert(data.error || 'Failed to submit');
      }
    } catch {
      alert('Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReview = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setReviewingId(id);
    try {
      const res = await fetch(`/api/admin/chatbot/knowledge/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchPending();
      else alert((await res.json().catch(() => ({}))).error || 'Failed');
    } catch {
      alert('Failed');
    } finally {
      setReviewingId(null);
    }
  };

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
          <Bot className="w-6 h-6 text-blood-500" />
          LeKronorium — Knowledge
        </h1>
        <p className="text-sm text-bunker-400 mt-1">
          Submit text to train the chatbot. Approved content is used as context when answering. Super admins can approve or reject pending submissions.
        </p>
      </div>

      <div className="space-y-8">
        <Card variant="bordered" className="border-bunker-700">
          <CardContent className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-white mb-3">Submit knowledge</h2>
            {submitDone && (
              <p className="text-green-400 text-sm mb-3">Submitted. It will be reviewed by a super admin before the bot can use it.</p>
            )}
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                label="Title (optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Der Eisendrache setup tips"
                maxLength={200}
                className="bg-bunker-900 border-bunker-600"
              />
              <div>
                <label className="block text-xs font-medium text-bunker-400 mb-1">Category (optional)</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-bunker-600 bg-bunker-900 px-3 py-2 text-sm text-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value || 'none'} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-bunker-400 mb-1">Content *</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste or type the knowledge text the bot should use. Max 100,000 characters."
                  rows={12}
                  maxLength={100_000}
                  required
                  className="w-full rounded-lg border border-bunker-600 bg-bunker-900 px-3 py-2 text-sm text-white placeholder:text-bunker-500 resize-y min-h-[200px]"
                />
                <p className="text-xs text-bunker-500 mt-1">{content.length.toLocaleString()} / 100,000</p>
              </div>
              <Button
                type="submit"
                disabled={submitting || !content.trim()}
                leftIcon={submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              >
                {submitting ? 'Submitting…' : 'Submit for review'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {isSuperAdmin && (pending.length > 0 || pendingLoading) && (
          <Card variant="bordered" className="border-bunker-700">
            <CardContent className="p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-white mb-3">Pending knowledge (super admin)</h2>
              {pendingLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 text-blood-500 animate-spin" />
                </div>
              ) : (
                <ul className="space-y-4">
                  {pending.map((s) => (
                    <li key={s.id} className="border border-bunker-700 rounded-lg p-4 bg-bunker-900/50">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className="font-medium text-white">{s.title || 'Untitled'}</span>
                        <span className="text-xs text-bunker-500">
                          {s.category || '—'} · by {s.submittedBy} · {new Date(s.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-bunker-300 whitespace-pre-wrap break-words line-clamp-4">{s.content.slice(0, 500)}{s.content.length > 500 ? '…' : ''}</p>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleReview(s.id, 'APPROVED')}
                          disabled={reviewingId !== null}
                          leftIcon={reviewingId === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleReview(s.id, 'REJECTED')}
                          disabled={reviewingId !== null}
                          leftIcon={reviewingId === s.id ? undefined : <XCircle className="w-4 h-4" />}
                          className="text-red-400 hover:text-red-300"
                        >
                          Reject
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}

        {isSuperAdmin && !pendingLoading && pending.length === 0 && (
          <Card variant="bordered" className="border-bunker-700">
            <CardContent className="py-6 text-center text-bunker-500 text-sm">
              No pending knowledge submissions. Submissions from admins will appear here for super admins to approve or reject.
            </CardContent>
          </Card>
        )}

        <Card variant="bordered" className="border-bunker-700">
          <CardContent className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <MessageCircleQuestion className="w-5 h-5 text-blood-500" />
              Unanswered questions (forwarded to learn)
            </h2>
            <p className="text-sm text-bunker-400 mb-3">
              Questions the bot could not answer from context. Use these to add knowledge submissions.
            </p>
            {unansweredLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-8 h-8 text-blood-500 animate-spin" />
              </div>
            ) : unanswered.length === 0 ? (
              <p className="text-bunker-500 text-sm py-4">No unanswered questions yet.</p>
            ) : (
              <ul className="space-y-3 max-h-80 overflow-y-auto">
                {unanswered.map((q) => (
                  <li key={q.id} className="border border-bunker-700 rounded-lg p-3 bg-bunker-900/50">
                    <p className="text-sm text-white whitespace-pre-wrap break-words">{q.question}</p>
                    <p className="text-xs text-bunker-500 mt-1">
                      Asked by <Link href={`/users/${q.askedByUsername}`} className="text-blood-400 hover:underline">{q.askedBy}</Link> · {new Date(q.createdAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {isSuperAdmin && (
          <Card variant="bordered" className="border-bunker-700">
            <CardContent className="p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-500" />
                Grant contributor status
              </h2>
              <p className="text-sm text-bunker-400 mb-3">
                Contributors get 25 extra LeKronorium tokens per 24h. Enter username to grant.
              </p>
              <form onSubmit={handleGrantContributor} className="flex gap-2 flex-wrap items-end">
                <Input
                  label="Username"
                  value={contributorUsername}
                  onChange={(e) => setContributorUsername(e.target.value)}
                  placeholder="username"
                  className="bg-bunker-900 border-bunker-600 w-48"
                />
                <Button
                  type="submit"
                  disabled={grantingContributor || !contributorUsername.trim()}
                  leftIcon={grantingContributor ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
                >
                  {grantingContributor ? 'Granting…' : 'Grant contributor'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
