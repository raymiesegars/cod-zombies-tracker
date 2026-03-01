'use client';

import { forwardRef, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'children'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, placeholder, id, value = '', onChange, disabled, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [dropdownStyle, setDropdownStyle] = useState<{
      top?: number;
      bottom?: number;
      left: number;
      minWidth: number;
      maxHeight: number;
      openUpward: boolean;
    } | null>(null);

    const selectedOption = options.find((o) => o.value === value);
    const displayLabel = selectedOption?.label ?? placeholder ?? '';

    const updatePosition = () => {
      if (typeof document === 'undefined' || !triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const padding = 8;
      const gap = 4;
      const spaceBelow = window.innerHeight - rect.bottom - gap - padding;
      const spaceAbove = rect.top - gap - padding;
      const maxHeightCap = Math.min(window.innerHeight * 0.7, 32 * 16); // 70vh or 32rem
      const openUpward = spaceBelow < 200 && spaceAbove > spaceBelow;
      const maxHeight = openUpward
        ? Math.min(spaceAbove, maxHeightCap)
        : Math.min(spaceBelow, maxHeightCap);
      let left = rect.left;
      const minWidth = rect.width;
      const maxWidth = window.innerWidth - padding * 2;
      if (left + minWidth > window.innerWidth - padding) left = window.innerWidth - padding - minWidth;
      if (left < padding) left = padding;
      setDropdownStyle({
        ...(openUpward ? { bottom: window.innerHeight - rect.top + gap } : { top: rect.bottom + gap }),
        left,
        minWidth: Math.min(minWidth, maxWidth),
        maxHeight: Math.max(120, maxHeight),
        openUpward,
      });
    };

    useEffect(() => {
      if (!open) {
        setDropdownStyle(null);
        return;
      }
      updatePosition();
      const onScrollOrResize = () => updatePosition();
      window.addEventListener('scroll', onScrollOrResize, true);
      window.addEventListener('resize', onScrollOrResize);
      return () => {
        window.removeEventListener('scroll', onScrollOrResize, true);
        window.removeEventListener('resize', onScrollOrResize);
      };
    }, [open]);

    useEffect(() => {
      if (!open) return;
      function handleClickOutside(ev: MouseEvent) {
        if (containerRef.current && !containerRef.current.contains(ev.target as Node)) {
          const target = ev.target as HTMLElement;
          if (!target.closest('[data-select-dropdown]')) setOpen(false);
        }
      }
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    const handleSelect = (option: SelectOption) => {
      onChange?.({ target: { value: option.value } } as React.ChangeEvent<HTMLSelectElement>);
      setOpen(false);
    };

    const dropdownPanel =
      open &&
      dropdownStyle &&
      typeof document !== 'undefined' &&
      createPortal(
        <div
          data-select-dropdown
          role="listbox"
          className="fixed z-[9999] py-1 bg-bunker-800 border border-bunker-600 rounded-lg shadow-xl overflow-auto"
          style={{
            ...(dropdownStyle.openUpward ? { bottom: dropdownStyle.bottom } : { top: dropdownStyle.top }),
            left: dropdownStyle.left,
            width: dropdownStyle.minWidth,
            minWidth: dropdownStyle.minWidth,
            maxHeight: dropdownStyle.maxHeight,
          }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={value === option.value}
              onClick={() => handleSelect(option)}
              className={cn(
                'w-full px-4 py-2.5 text-left text-sm transition-colors min-w-0 truncate',
                value === option.value
                  ? 'bg-blood-900/50 text-white'
                  : 'text-bunker-200 hover:bg-bunker-700 hover:text-white'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>,
        document.body
      );

    return (
      <div className={cn('w-full min-w-0', className)} ref={containerRef}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-bunker-200 mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative w-full min-w-0">
          <button
            ref={triggerRef}
            type="button"
            id={selectId}
            disabled={disabled}
            onClick={() => setOpen(!open)}
            className={cn(
              'flex items-center w-full min-w-0 bg-bunker-800 border border-bunker-600 rounded-lg pl-4 pr-10 py-2.5',
              'text-left text-white cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-blood-500/50 focus:border-blood-600',
              'transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              !displayLabel && 'text-bunker-400',
              error && 'border-blood-500 focus:ring-blood-500/50 focus:border-blood-500'
            )}
          >
            <span className="min-w-0 flex-1 truncate">{displayLabel}</span>
          </button>
          <ChevronDown
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-bunker-400 pointer-events-none flex-shrink-0 transition-transform',
              open && 'rotate-180'
            )}
          />
        </div>
        {error && <p className="mt-1.5 text-sm text-blood-500">{error}</p>}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-bunker-400">{helperText}</p>
        )}
        {dropdownPanel}
      </div>
    );
  }
);

Select.displayName = 'Select';
