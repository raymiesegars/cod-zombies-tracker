'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Card, CardContent, Input } from '@/components/ui';
import { Heart, Loader2, ExternalLink } from 'lucide-react';
import { ZCS3_SLUG } from '@/lib/events/zcs3';

type Campaign = {
  amountCents: number;
  goalCents: number;
  merchUrl: string | null;
  updatedAt: string | null;
};

export default function AdminZcs3Page() {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [amountDollars, setAmountDollars] = useState('');
  const [goalDollars, setGoalDollars] = useState('');
  const [merchUrl, setMerchUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/charity/${ZCS3_SLUG}`, { credentials: 'same-origin', cache: 'no-store' })
      .then(async (res) => {
        if (res.status === 403) {
          setForbidden(true);
          return null;
        }
        if (!res.ok) return null;
        return res.json() as Promise<Campaign & { slug: string }>;
      })
      .then((d) => {
        if (!d) return;
        setCampaign({
          amountCents: d.amountCents,
          goalCents: d.goalCents,
          merchUrl: d.merchUrl,
          updatedAt: d.updatedAt,
        });
        setAmountDollars((d.amountCents / 100).toFixed(d.amountCents % 100 === 0 ? 0 : 2));
        setGoalDollars((d.goalCents / 100).toFixed(d.goalCents % 100 === 0 ? 0 : 2));
        setMerchUrl(d.merchUrl ?? '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // Gate: only super admins can PATCH; page is listed as superAdminOnly in layout.
    fetch('/api/admin/me', { credentials: 'same-origin', cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d?.admin?.isSuperAdmin) {
          setForbidden(true);
          setLoading(false);
          return;
        }
        load();
      })
      .catch(() => {
        setForbidden(true);
        setLoading(false);
      });
  }, [load]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    const amount = parseFloat(amountDollars);
    const goal = parseFloat(goalDollars);
    if (!Number.isFinite(amount) || amount < 0) {
      setError('Enter a valid amount raised.');
      setSaving(false);
      return;
    }
    if (!Number.isFinite(goal) || goal < 0) {
      setError('Enter a valid goal.');
      setSaving(false);
      return;
    }
    try {
      const r = await fetch(`/api/charity/${ZCS3_SLUG}`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountDollars: amount,
          goalDollars: goal,
          merchUrl: merchUrl.trim() || null,
        }),
      });
      if (r.status === 403 || r.status === 401) {
        setForbidden(true);
        return;
      }
      const data = await r.json();
      if (!r.ok) {
        setError(data?.error || 'Failed to save');
        return;
      }
      setCampaign({
        amountCents: data.amountCents,
        goalCents: data.goalCents,
        merchUrl: data.merchUrl,
        updatedAt: data.updatedAt,
      });
      setSaved(true);
    } catch {
      setError('Failed to save');
    } finally {
      setSaving(false);
    }
  }

  if (forbidden) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-bunker-400">Super admin only.</p>
        <Link href="/admin/verification" className="text-blood-400 hover:underline mt-2 inline-block">
          Back to admin
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-zombies text-white tracking-wide flex items-center gap-2">
          <Heart className="w-6 h-6 text-orange-500" />
          ZCS-3 Charity
        </h1>
        <p className="text-sm text-bunker-400 mt-1">
          Update the homepage money raised total and merch link. Public page:{' '}
          <Link href="/" className="text-sky-400 hover:underline inline-flex items-center gap-1">
            Home <ExternalLink className="w-3 h-3" />
          </Link>
        </p>
      </div>

      {loading ? (
        <Card variant="bordered" className="border-bunker-700">
          <CardContent className="py-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </CardContent>
        </Card>
      ) : (
        <Card variant="bordered" className="border-bunker-700">
          <CardContent className="pt-6">
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-bunker-300 mb-1.5">
                  Amount raised (USD)
                </label>
                <Input
                  id="amount"
                  type="number"
                  min={0}
                  step="0.01"
                  value={amountDollars}
                  onChange={(e) => setAmountDollars(e.target.value)}
                  className="font-mono"
                />
              </div>
              <div>
                <label htmlFor="goal" className="block text-sm font-medium text-bunker-300 mb-1.5">
                  Goal (USD)
                </label>
                <Input
                  id="goal"
                  type="number"
                  min={0}
                  step="0.01"
                  value={goalDollars}
                  onChange={(e) => setGoalDollars(e.target.value)}
                  className="font-mono"
                />
              </div>
              <div>
                <label htmlFor="merch" className="block text-sm font-medium text-bunker-300 mb-1.5">
                  Merch URL
                </label>
                <Input
                  id="merch"
                  type="url"
                  placeholder="https://… (leave empty for Coming Soon)"
                  value={merchUrl}
                  onChange={(e) => setMerchUrl(e.target.value)}
                />
                <p className="mt-1 text-xs text-bunker-500">
                  When set, merch buttons unlock on the homepage. Empty = Coming Soon.
                </p>
              </div>

              {campaign?.updatedAt && (
                <p className="text-xs text-bunker-500">
                  Last updated {new Date(campaign.updatedAt).toLocaleString()}
                </p>
              )}

              {error && <p className="text-sm text-blood-400">{error}</p>}
              {saved && <p className="text-sm text-military-400">Saved.</p>}

              <Button type="submit" disabled={saving} className="bg-orange-600 hover:bg-orange-500 border-orange-500/40">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
