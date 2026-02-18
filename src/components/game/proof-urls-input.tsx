'use client';

import { Input } from '@/components/ui';
import { PROOF_URL_FORMAT_HELP, PROOF_URLS_MAX, validateProofUrl } from '@/lib/utils';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui';

interface ProofUrlsInputProps {
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  max?: number;
  placeholder?: string;
  error?: string;
  /** Optional: show preview thumbnails below each valid URL */
  showPreviews?: boolean;
  className?: string;
}

export function ProofUrlsInput({
  value,
  onChange,
  label = 'Proof URLs',
  max = PROOF_URLS_MAX,
  placeholder = 'https://youtube.com/watch?v=... or Twitch / image link',
  error,
  showPreviews = false,
  className,
}: ProofUrlsInputProps) {
  const hasTrailingEmpty = value.length > 0 && value[value.length - 1] === '';
  const urls = hasTrailingEmpty ? value : (value.length < max ? [...value, ''] : value);

  const setUrl = (index: number, url: string) => {
    const next = urls.map((u, i) => (i === index ? url.trim() : u.trim()));
    const filled = next.filter(Boolean);
    if (filled.length < max) onChange([...filled, '']);
    else onChange(filled);
  };

  const remove = (index: number) => {
    const next = urls.filter((_, i) => i !== index).map((u) => u.trim()).filter(Boolean);
    onChange(next);
  };

  const add = () => {
    if (value.length >= max) return;
    onChange([...value.filter(Boolean), '']);
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-bunker-200 mb-1.5">{label}</label>
      )}
      <p className="text-xs text-bunker-500 mb-2">{PROOF_URL_FORMAT_HELP}</p>
      <div className="space-y-2">
        {urls.map((url, index) => (
          <ProofUrlRow
            key={index}
            url={url}
            onChange={(u) => setUrl(index, u)}
            onRemove={urls.length > 1 ? () => remove(index) : undefined}
            placeholder={placeholder}
          />
        ))}
        {urls.length < max && urls.some((u) => !u.trim()) === false && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={add}
          >
            Add proof URL
          </Button>
        )}
      </div>
      {error && <p className="text-sm text-blood-400 mt-1.5">{error}</p>}
    </div>
  );
}

function ProofUrlRow({
  url,
  onChange,
  onRemove,
  placeholder,
}: {
  url: string;
  onChange: (value: string) => void;
  onRemove?: () => void;
  placeholder?: string;
}) {
  const validationError = url.trim() ? validateProofUrl(url) : null;
  return (
    <div className="flex gap-2 items-start">
      <div className="flex-1 min-w-0">
        <Input
          type="url"
          value={url}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          error={validationError ?? undefined}
          className="font-mono text-sm"
        />
      </div>
      {onRemove && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="shrink-0 text-bunker-400 hover:text-blood-400 p-2"
          onClick={onRemove}
          aria-label="Remove proof URL"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
