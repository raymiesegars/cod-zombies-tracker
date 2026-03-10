'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { Modal, Button, Input, TimeInput } from '@/components/ui';
import { BO3_CUSTOM_CHALLENGE_TYPES, BO3_CUSTOM_DEFAULT_ROUNDS } from '@/lib/bo3-custom';
import { Loader2, Plus, Upload, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

const CHALLENGE_LABELS: Record<string, string> = {
  HIGHEST_ROUND: 'Highest Round',
  NO_DOWNS: 'No Downs',
  NO_PERKS: 'No Perks',
  NO_PACK: 'No Pack-a-Punch',
  STARTING_ROOM: 'Starting Room',
  ONE_BOX: 'One Box',
  PISTOL_ONLY: 'Pistol Only',
  NO_POWER: 'No Power',
  NO_ATS: 'No AATs',
  ROUND_5_SPEEDRUN: 'R5 Speedrun',
  ROUND_15_SPEEDRUN: 'R15 Speedrun',
  ROUND_30_SPEEDRUN: 'R30 Speedrun',
  ROUND_50_SPEEDRUN: 'R50 Speedrun',
  ROUND_70_SPEEDRUN: 'R70 Speedrun',
  ROUND_100_SPEEDRUN: 'R100 Speedrun',
  ROUND_255_SPEEDRUN: 'R255 Speedrun',
  EASTER_EGG_SPEEDRUN: 'EE Speedrun',
};

const isSpeedrun = (t: string) => t.includes('SPEEDRUN');

function ImageUploadBlock({
  label,
  required,
  hint,
  imageUrl,
  uploading,
  onChange,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  imageUrl: string | null;
  uploading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="rounded-xl border border-bunker-700 bg-bunker-800/30 overflow-hidden">
      <div className="px-4 py-3 border-b border-bunker-700">
        <div className="flex items-baseline gap-2">
          <label className="text-sm font-medium text-bunker-200">{label}</label>
          {required && <span className="text-blood-400 text-xs">Required</span>}
          {hint && <span className="text-bunker-500 text-xs font-normal">{hint}</span>}
        </div>
      </div>
      <div className="p-4">
        {imageUrl ? (
          <div className="relative group w-full h-48 rounded-lg border border-bunker-600 bg-bunker-900 overflow-hidden">
            <Image
              src={imageUrl}
              alt=""
              fill
              className="object-contain"
            />
            <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg cursor-pointer">
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onChange} disabled={uploading} />
              <span className="px-4 py-2 rounded-lg bg-blood-600 hover:bg-blood-500 text-white text-sm font-medium flex items-center gap-2">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? 'Uploading…' : 'Change image'}
              </span>
            </label>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center min-h-[140px] rounded-lg border-2 border-dashed border-bunker-600 bg-bunker-800/50 hover:border-blood-600/50 hover:bg-bunker-800/80 cursor-pointer transition-colors">
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onChange} disabled={uploading} />
            {uploading ? (
              <Loader2 className="w-10 h-10 animate-spin text-blood-400 mb-2" />
            ) : (
              <Upload className="w-10 h-10 text-bunker-500 mb-2" />
            )}
            <span className="text-sm text-bunker-400">{uploading ? 'Uploading…' : 'Click or drop image'}</span>
            <span className="text-xs text-bunker-500 mt-1">JPEG, PNG or WebP</span>
          </label>
        )}
      </div>
    </div>
  );
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function SubmitMapModal({ isOpen, onClose, onSuccess }: Props) {
  const [mapName, setMapName] = useState('');
  const [steamWorkshopUrl, setSteamWorkshopUrl] = useState('');
  const [thumbnailImageUrl, setThumbnailImageUrl] = useState<string | null>(null);
  const [mapPageImageUrl, setMapPageImageUrl] = useState<string | null>(null);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [mapPageUploading, setMapPageUploading] = useState(false);
  const [suggestedRounds, setSuggestedRounds] = useState<Record<string, number>>(() => {
    const r: Record<string, number> = {};
    for (const t of BO3_CUSTOM_CHALLENGE_TYPES) {
      r[t] = BO3_CUSTOM_DEFAULT_ROUNDS[t] ?? (isSpeedrun(t) ? 1800 : 30);
    }
    return r;
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [eeName, setEeName] = useState('');
  const [eeXp, setEeXp] = useState(250);
  const [eeSteps, setEeSteps] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setMapName('');
    setSteamWorkshopUrl('');
    setThumbnailImageUrl(null);
    setMapPageImageUrl(null);
    setSuggestedRounds(() => {
      const r: Record<string, number> = {};
      for (const t of BO3_CUSTOM_CHALLENGE_TYPES) {
        r[t] = BO3_CUSTOM_DEFAULT_ROUNDS[t] ?? (isSpeedrun(t) ? 1800 : 30);
      }
      return r;
    });
    setShowAdvanced(false);
    setEeName('');
    setEeXp(250);
    setEeSteps('');
    setSubmitted(false);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onSuccess?.();
    onClose();
  }, [resetState, onSuccess, onClose]);

  const uploadImage = useCallback(async (file: File, type: 'thumbnail' | 'mapPage') => {
    const fd = new FormData();
    fd.set('file', file);
    fd.set('type', type);
    const res = await fetch('/api/map-submissions/upload', {
      method: 'POST',
      credentials: 'same-origin',
      body: fd,
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error || 'Upload failed');
    }
    const json = await res.json();
    return json.url as string;
  }, []);

  const handleThumbnailChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;
      setThumbnailUploading(true);
      setError(null);
      try {
        const url = await uploadImage(f, 'thumbnail');
        setThumbnailImageUrl(url);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setThumbnailUploading(false);
        e.target.value = '';
      }
    },
    [uploadImage]
  );

  const handleMapPageChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;
      setMapPageUploading(true);
      setError(null);
      try {
        const url = await uploadImage(f, 'mapPage');
        setMapPageImageUrl(url);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setMapPageUploading(false);
        e.target.value = '';
      }
    },
    [uploadImage]
  );

  const handleSubmit = useCallback(async () => {
    setError(null);
    const name = mapName.trim();
    const url = steamWorkshopUrl.trim();
    if (!name || name.length < 2) {
      setError('Map name must be at least 2 characters');
      return;
    }
    if (!url || !url.includes('steamcommunity.com') || !url.includes('filedetails')) {
      setError('Valid Steam Workshop URL required');
      return;
    }
    if (!thumbnailImageUrl && !mapPageImageUrl) {
      setError('At least one image is required (thumbnail or banner)');
      return;
    }
    setSubmitting(true);
    try {
      const suggestedAchievements: Record<string, number> = {};
      for (const t of BO3_CUSTOM_CHALLENGE_TYPES) {
        const v = suggestedRounds[t];
        if (v != null && !Number.isNaN(v) && v > 0) {
          suggestedAchievements[t] = Math.floor(Number(v));
        }
      }

      let suggestedEasterEgg: { name: string; xpReward: number; steps?: string[] } | null = null;
      if (eeName.trim()) {
        suggestedEasterEgg = {
          name: eeName.trim(),
          xpReward: Math.max(0, Math.floor(Number(eeXp) || 250)),
          steps: eeSteps.trim() ? eeSteps.trim().split('\n').filter(Boolean) : undefined,
        };
      }

      const res = await fetch('/api/map-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          mapName: name,
          steamWorkshopUrl: url,
          thumbnailImageUrl: thumbnailImageUrl || mapPageImageUrl || undefined,
          mapPageImageUrl: mapPageImageUrl || thumbnailImageUrl || undefined,
          suggestedAchievements: Object.keys(suggestedAchievements).length > 0 ? suggestedAchievements : undefined,
          suggestedEasterEgg,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Submission failed');
      }
      setSubmitted(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }, [
    mapName,
    steamWorkshopUrl,
    thumbnailImageUrl,
    mapPageImageUrl,
    suggestedRounds,
    eeName,
    eeXp,
    eeSteps,
  ]);

  return (
    <Modal isOpen={isOpen} onClose={submitted ? handleClose : () => { resetState(); onClose(); }} title="Submit a New Map" size="xl" contentScroll={true}>
      {submitted ? (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="rounded-full bg-green-900/50 p-4">
            <CheckCircle2 className="w-12 h-12 text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Map submitted successfully</h3>
          <p className="text-sm text-bunker-400 max-w-sm">
            Your map is in the queue for review. An admin will approve it shortly—you&apos;ll see it on the maps page once it&apos;s live.
          </p>
          <Button variant="primary" onClick={handleClose} className="mt-4">
            Done
          </Button>
        </div>
      ) : (
      <div className="space-y-4">
        <Input
          label="Map Name"
          placeholder="e.g. Leviathan"
          value={mapName}
          onChange={(e) => setMapName(e.target.value.slice(0, 100))}
          maxLength={100}
        />
        <Input
          label="Steam Workshop URL"
          placeholder="https://steamcommunity.com/sharedfiles/filedetails/?id=123456789"
          value={steamWorkshopUrl}
          onChange={(e) => setSteamWorkshopUrl(e.target.value)}
        />

        <div className="space-y-6">
          <ImageUploadBlock
            label="Thumbnail (map list)"
            required
            imageUrl={thumbnailImageUrl}
            uploading={thumbnailUploading}
            onChange={handleThumbnailChange}
          />
          <ImageUploadBlock
            label="Banner (map page)"
            hint="Optional — uses thumbnail if empty"
            imageUrl={mapPageImageUrl}
            uploading={mapPageUploading}
            onChange={handleMapPageChange}
          />
        </div>

        <div className="border-t border-bunker-700 pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm font-medium text-bunker-300 hover:text-blood-400"
          >
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Suggested achievement rounds & optional Easter Egg
          </button>
          {showAdvanced && (
            <div className="mt-4 space-y-6 pl-0">
              <p className="text-xs text-bunker-500">Optional: suggest rounds for each challenge. Admins can edit before approving.</p>

              <div>
                <p className="text-sm font-medium text-bunker-300 mb-3">Round challenges</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {BO3_CUSTOM_CHALLENGE_TYPES.filter((t) => !isSpeedrun(t)).map((t) => (
                    <div key={t}>
                      <label className="block text-xs text-bunker-400 mb-1 truncate" title={CHALLENGE_LABELS[t] ?? t}>
                        {CHALLENGE_LABELS[t] ?? t}
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={255}
                        placeholder="round"
                        value={(suggestedRounds[t] ?? 0) > 0 ? String(suggestedRounds[t]) : ''}
                        onChange={(e) => {
                          const raw = e.target.value;
                          setSuggestedRounds((prev) => ({
                            ...prev,
                            [t]: raw === '' ? 0 : Math.max(0, parseInt(raw, 10) || 0),
                          }));
                        }}
                        className="w-full px-2 py-1.5 text-sm bg-bunker-800 border border-bunker-600 rounded text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-bunker-300 mb-3">Timed challenges (h:m:s)</p>
                <div className="grid grid-cols-1 gap-4">
                  {BO3_CUSTOM_CHALLENGE_TYPES.filter(isSpeedrun).map((t) => (
                    <div key={t} className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4">
                      <label className="shrink-0 text-xs sm:text-sm text-bunker-400 sm:min-w-[7rem]" title={CHALLENGE_LABELS[t] ?? t}>
                        {CHALLENGE_LABELS[t] ?? t}
                      </label>
                      <div className="flex-1 min-w-0">
                        <TimeInput
                          valueSeconds={suggestedRounds[t] ?? 0}
                          onChange={(seconds) =>
                            setSuggestedRounds((prev) => ({
                              ...prev,
                              [t]: seconds ?? 0,
                            }))
                          }
                          className="[&_p]:hidden"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-bunker-700 pt-4 mt-4">
                <p className="text-sm font-medium text-bunker-200 mb-2">Optional Easter Egg</p>
                <Input label="EE Name" placeholder="Main Quest" value={eeName} onChange={(e) => setEeName(e.target.value)} />
                <div className="mt-2">
                  <label className="block text-xs text-bunker-400 mb-1">XP Reward</label>
                  <input
                    type="number"
                    min={0}
                    value={eeXp}
                    onChange={(e) => setEeXp(parseInt(e.target.value, 10) || 0)}
                    className="w-24 px-2 py-1.5 text-sm bg-bunker-800 border border-bunker-600 rounded text-white"
                  />
                </div>
                <div className="mt-2">
                  <label className="block text-xs text-bunker-400 mb-1">Steps (one per line)</label>
                  <textarea
                    rows={4}
                    placeholder="Step 1: Turn on power\nStep 2: ..."
                    value={eeSteps}
                    onChange={(e) => setEeSteps(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-bunker-800 border border-bunker-600 rounded text-white resize-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-blood-400">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={submitting} leftIcon={submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}>
            Submit
          </Button>
        </div>
      </div>
      )}
    </Modal>
  );
}
