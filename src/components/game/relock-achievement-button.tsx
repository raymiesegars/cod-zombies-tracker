'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
import { Button, Modal } from '@/components/ui';

interface RelockAchievementButtonProps {
  achievementId: string;
  achievementName: string;
  xpReward: number;
  onRelocked: () => void | Promise<void>;
  disabled?: boolean;
  className?: string;
}

export function RelockAchievementButton({
  achievementId,
  achievementName,
  xpReward,
  onRelocked,
  disabled = false,
  className,
}: RelockAchievementButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/achievements/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ achievementId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Failed to re-lock achievement');
      }
      setOpen(false);
      await onRelocked();
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled}
        className={className}
        title="Re-lock achievement (you will lose the XP)"
        aria-label={`Re-lock ${achievementName}`}
      >
        <Lock className="w-4 h-4 text-bunker-400 hover:text-blood-400 transition-colors" />
      </button>
      <Modal
        isOpen={open}
        onClose={() => !loading && setOpen(false)}
        title="Re-lock achievement?"
        description={`You will lose the +${xpReward} XP from this achievement. You can earn it again by meeting the requirement.`}
        size="sm"
      >
        <div className="flex flex-col gap-3">
          <p className="text-sm text-bunker-300">
            <span className="font-medium text-white">{achievementName}</span>
            <span className="text-bunker-400"> — +{xpReward} XP will be removed from your total.</span>
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              disabled={loading}
              leftIcon={<Lock className="w-4 h-4" />}
            >
              {loading ? 'Re-locking…' : 'Re-lock'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
