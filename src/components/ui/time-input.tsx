'use client';

import { useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function secondsToHms(totalSeconds: number | null | undefined): { h: number; m: number; s: number } {
  const n = totalSeconds != null ? Number(totalSeconds) : NaN;
  if (!Number.isFinite(n) || n < 0) {
    return { h: 0, m: 0, s: 0 };
  }
  const sec = Math.floor(n);
  const s = sec % 60;
  const m = Math.floor((sec / 60) % 60);
  const h = Math.floor(sec / 3600);
  return { h, m, s };
}

export function hmsToSeconds(h: number, m: number, s: number): number {
  return (clamp(h, 0, 999) || 0) * 3600 + (clamp(m, 0, 59) || 0) * 60 + (clamp(s, 0, 59) || 0);
}

export function formatCompletionTime(totalSeconds: number | null | undefined): string {
  if (totalSeconds == null || totalSeconds < 0 || !Number.isFinite(totalSeconds)) return '—';
  const { h, m, s } = secondsToHms(totalSeconds);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const inputBase =
  'w-full bg-bunker-800 border border-bunker-600 rounded-lg px-3 py-2.5 text-center text-white placeholder:text-bunker-500 focus:outline-none focus:ring-2 focus:ring-blood-500/50 focus:border-blood-600 transition-colors disabled:opacity-50';

interface TimeInputProps {
  valueSeconds: number | null;
  onChange: (totalSeconds: number | null) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function TimeInput({
  valueSeconds,
  onChange,
  label,
  className,
  disabled,
}: TimeInputProps) {
  const { h, m, s } = useMemo(
    () =>
      secondsToHms(
        valueSeconds != null && Number.isFinite(Number(valueSeconds))
          ? Math.floor(Number(valueSeconds))
          : null
      ),
    [valueSeconds]
  );

  const update = useCallback(
    (field: 'h' | 'm' | 's', raw: string) => {
      const num = raw === '' ? 0 : parseInt(raw, 10);
      if (Number.isNaN(num) && raw !== '') return;
      let nh = h,
        nm = m,
        ns = s;
      if (field === 'h') nh = clamp(raw === '' ? 0 : num, 0, 999);
      if (field === 'm') nm = clamp(raw === '' ? 0 : num, 0, 59);
      if (field === 's') ns = clamp(raw === '' ? 0 : num, 0, 59);
      const total = hmsToSeconds(nh, nm, ns);
      onChange(total > 0 ? total : null);
    },
    [h, m, s, onChange]
  );

  const displayH = h > 0 ? String(h) : '';
  const displayM = String(m).padStart(2, '0');
  const displayS = String(s).padStart(2, '0');

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-bunker-200 mb-2">{label}</label>
      )}
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          min={0}
          max={999}
          placeholder="0"
          value={displayH}
          onChange={(e) => update('h', e.target.value)}
          disabled={disabled}
          className={cn(inputBase, 'max-w-[4rem]')}
          aria-label="Hours"
        />
        <span className="text-bunker-500 font-medium select-none">:</span>
        <input
          type="number"
          min={0}
          max={59}
          placeholder="00"
          value={displayM}
          onChange={(e) => update('m', e.target.value)}
          disabled={disabled}
          className={cn(inputBase, 'max-w-[3.5rem]')}
          aria-label="Minutes"
        />
        <span className="text-bunker-500 font-medium select-none">:</span>
        <input
          type="number"
          min={0}
          max={59}
          placeholder="00"
          value={displayS}
          onChange={(e) => update('s', e.target.value)}
          disabled={disabled}
          className={cn(inputBase, 'max-w-[3.5rem]')}
          aria-label="Seconds"
        />
      </div>
      <p className="mt-1.5 text-xs text-bunker-500">Hours : Minutes : Seconds (optional)</p>
    </div>
  );
}
