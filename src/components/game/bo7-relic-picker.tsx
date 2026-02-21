'use client';

import { useRef, useState, useEffect } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BO7_RELICS } from '@/lib/bo7';

interface Bo7RelicPickerProps {
  value: string[];
  onChange: (relics: string[]) => void;
  className?: string;
  placeholder?: string;
}

export function Bo7RelicPicker({
  value,
  onChange,
  className,
  placeholder = 'Any relics',
}: Bo7RelicPickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);

  const toggle = (relic: string) => {
    if (value.includes(relic)) {
      onChange(value.filter((r) => r !== relic));
    } else {
      onChange([...value, relic]);
    }
  };

  const label =
    value.length === 0
      ? placeholder
      : value.length === 1
        ? value[0]
        : `${value.length} relics selected`;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center justify-between gap-2 w-full px-3 py-2 rounded-lg border text-sm transition-colors min-h-[38px]',
          open || value.length > 0
            ? 'border-blood-500/50 bg-bunker-800 text-white'
            : 'border-bunker-600 bg-bunker-800 text-bunker-400 hover:border-bunker-500 hover:text-bunker-300'
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate text-left">{label}</span>
        <span className="flex items-center gap-1 shrink-0">
          {value.length > 0 && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onChange([]);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                  onChange([]);
                }
              }}
              className="text-bunker-400 hover:text-blood-400 transition-colors p-0.5 rounded"
              aria-label="Clear relics"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={cn('w-4 h-4 text-bunker-400 transition-transform duration-150', open && 'rotate-180')}
          />
        </span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute z-50 mt-1 w-full min-w-[200px] max-h-60 overflow-y-auto rounded-lg border border-bunker-600 bg-bunker-900 shadow-2xl"
          role="listbox"
          aria-multiselectable="true"
          aria-label="Select relics"
        >
          {BO7_RELICS.map((relic) => {
            const selected = value.includes(relic);
            return (
              <button
                key={relic}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => toggle(relic)}
                className={cn(
                  'flex items-center gap-2.5 w-full px-3 py-2 text-sm text-left transition-colors',
                  selected
                    ? 'bg-blood-950/70 text-white'
                    : 'text-bunker-300 hover:bg-bunker-800 hover:text-white'
                )}
              >
                <span
                  className={cn(
                    'flex items-center justify-center w-4 h-4 rounded border shrink-0 transition-colors',
                    selected
                      ? 'border-blood-500 bg-blood-600'
                      : 'border-bunker-500 bg-bunker-800'
                  )}
                >
                  {selected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3.5} />}
                </span>
                {relic}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
