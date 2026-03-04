'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, Button, Select } from '@/components/ui';
import { useAuth } from '@/context/auth-context';
import { MessageSquare, Bug, Send, Loader2, CheckCircle2 } from 'lucide-react';

const MAX_MESSAGE_LENGTH = 2000;

export default function FeedbackPage() {
  const { user, profile, isLoading: authLoading, signInWithGoogle } = useAuth();
  const [type, setType] = useState<'bug' | 'feedback'>('feedback');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = message.trim();
    if (!trimmed) {
      setError('Please enter your message.');
      return;
    }
    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      setError(`Message must be ${MAX_MESSAGE_LENGTH} characters or less.`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ message: trimmed, type }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Failed to submit. Try again.');
        return;
      }
      setSubmitted(true);
      setMessage('');
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-bunker-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blood-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-bunker-950">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <h1 className="text-2xl sm:text-3xl font-zombies text-white tracking-wide flex items-center gap-2">
            <MessageSquare className="w-8 h-8 text-blood-500" />
            Feedback & Bug Reports
          </h1>
          <p className="text-bunker-400 mt-2">
            Sign in to submit feedback or report a bug. We read every submission.
          </p>
          <Button
            className="mt-6"
            onClick={signInWithGoogle}
            leftIcon={<MessageSquare className="w-4 h-4" />}
          >
            Sign in to submit feedback
          </Button>
          <p className="text-sm text-bunker-500 mt-6">
            <Link href="/" className="text-blood-400 hover:underline">Back to home</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bunker-950">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h1 className="text-2xl sm:text-3xl font-zombies text-white tracking-wide flex items-center gap-2">
          <MessageSquare className="w-8 h-8 text-blood-500" />
          Feedback & Bug Reports
        </h1>
        <p className="text-bunker-400 mt-2">
          Found a bug or have a suggestion? Your feedback helps us improve CoD Zombies Tracker.
        </p>

        {submitted ? (
          <Card variant="bordered" className="border-blood-500/50 mt-8">
            <CardContent className="py-8 flex flex-col items-center gap-3 text-center">
              <CheckCircle2 className="w-12 h-12 text-blood-500" />
              <p className="text-white font-medium">Thanks! We received your feedback.</p>
              <p className="text-sm text-bunker-400">You can submit another below or head back to the site.</p>
              <Button variant="secondary" size="sm" onClick={() => setSubmitted(false)}>
                Submit more feedback
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card variant="bordered" className="border-bunker-700 mt-8">
            <CardContent className="py-6 sm:py-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-bunker-200 mb-2">Type</label>
                  <Select
                    value={type}
                    onChange={(e) => setType(e.target.value as 'bug' | 'feedback')}
                    options={[
                      { value: 'feedback', label: 'General feedback' },
                      { value: 'bug', label: 'Bug report' },
                    ]}
                  />
                </div>
                <div>
                  <label htmlFor="feedback-message" className="block text-sm font-medium text-bunker-200 mb-2">
                    Message
                  </label>
                  <textarea
                    id="feedback-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={type === 'bug' ? 'Describe the bug and how to reproduce it…' : 'Share your feedback or suggestion…'}
                    maxLength={MAX_MESSAGE_LENGTH + 100}
                    rows={6}
                    className="w-full bg-bunker-800 border border-bunker-600 rounded-lg px-4 py-3 text-white placeholder:text-bunker-500 focus:outline-none focus:ring-2 focus:ring-blood-500/50 focus:border-blood-600 resize-y min-h-[120px]"
                  />
                  <p className="text-xs text-bunker-500 mt-1">
                    {message.length} / {MAX_MESSAGE_LENGTH} characters
                  </p>
                </div>
                {error && (
                  <p className="text-sm text-blood-400">{error}</p>
                )}
                <Button
                  type="submit"
                  disabled={submitting || !message.trim()}
                  leftIcon={submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (type === 'bug' ? <Bug className="w-4 h-4" /> : <Send className="w-4 h-4" />)}
                >
                  {submitting ? 'Sending…' : 'Submit feedback'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <p className="text-sm text-bunker-500 mt-8">
          <Link href="/" className="text-blood-400 hover:underline">Back to home</Link>
        </p>
      </div>
    </div>
  );
}
