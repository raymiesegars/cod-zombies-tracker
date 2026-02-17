'use client';

import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const STORAGE_VOLUME = 'aether-music-volume';
const STORAGE_MUTED = 'aether-music-muted';
const DEFAULT_VOLUME = 0.25; // Low on load so it's not loud
const AUDIO_SRC = '/audio/zombies-menu-theme.mp3';

function getStoredVolume(): number {
  if (typeof window === 'undefined') return DEFAULT_VOLUME;
  const v = localStorage.getItem(STORAGE_VOLUME);
  if (v == null) return DEFAULT_VOLUME;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 && n <= 1 ? n : DEFAULT_VOLUME;
}

function getStoredMuted(): boolean {
  if (typeof window === 'undefined') return false;
  const m = localStorage.getItem(STORAGE_MUTED);
  if (m == null) return false;
  return m === 'true';
}

export function MusicPlayer() {
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [hover, setHover] = useState(false);
  const [ready, setReady] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const userHasToggledMuteRef = useRef(false);

  // Hydrate from localStorage, create audio, and start playback. Default to playing (unmuted) on first load.
  useEffect(() => {
    const storedVol = getStoredVolume();
    const storedMuted = getStoredMuted();
    setVolume(storedVol);
    setMuted(storedMuted);
    const audio = new Audio(AUDIO_SRC);
    audio.loop = true;
    audio.volume = storedMuted ? 0 : storedVol;
    audio.muted = storedMuted;
    audio.onerror = () => {
      audioRef.current = null;
    };
    audioRef.current = audio;
    setReady(true);

    // Try to play with sound first. If browser blocks autoplay, fall back to muted play (don't persist that mute).
    audio.play().then(() => {
      // Playback started with sound
    }).catch(() => {
      setAutoplayBlocked(true);
      audio.muted = true;
      setMuted(true);
      audio.play().catch(() => {});
    });

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  // Sync volume/muted to audio and localStorage (only persist muted when user explicitly toggled, so autoplay-blocked mute isn't saved)
  useEffect(() => {
    if (!ready) return;
    const audio = audioRef.current;
    if (audio) {
      audio.muted = muted;
      audio.volume = muted ? 0 : volume;
    }
    try {
      localStorage.setItem(STORAGE_VOLUME, String(volume));
      if (userHasToggledMuteRef.current) {
        localStorage.setItem(STORAGE_MUTED, String(muted));
      }
    } catch {
      // ignore
    }
  }, [ready, volume, muted]);

  const ensurePlay = () => {
    audioRef.current?.play().catch(() => {});
  };

  const toggleMute = () => {
    userHasToggledMuteRef.current = true;
    ensurePlay();
    setAutoplayBlocked(false);
    setMuted((m) => !m);
  };

  const onVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    if (!Number.isFinite(v)) return;
    userHasToggledMuteRef.current = true;
    ensurePlay();
    setAutoplayBlocked(false);
    const clamped = Math.max(0, Math.min(1, v));
    setVolume(clamped);
    setMuted(clamped === 0);
  };

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex items-center gap-0"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Volume slider – visible on hover */}
      {hover && (
        <div className="mr-2 flex items-center gap-2 rounded-lg bg-bunker-900/95 border border-bunker-700/60 px-3 py-2 shadow-lg">
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={onVolumeChange}
            className="h-1.5 w-24 accent-blood-500 cursor-pointer rounded"
            aria-label="Volume"
          />
        </div>
      )}
      {/* Mute / unmute button */}
      <button
        type="button"
        onClick={toggleMute}
        title={autoplayBlocked ? 'Click to enable sound (browser policy)' : muted ? 'Unmute music' : 'Mute music'}
        className="flex h-10 w-10 items-center justify-center rounded-lg bg-bunker-900/95 border border-bunker-700/60 text-bunker-300 hover:border-blood-800/50 hover:text-blood-400 transition-colors shadow-lg"
        aria-label={muted ? 'Unmute music' : 'Mute music'}
      >
        {muted ? (
          <VolumeX className="h-5 w-5" />
        ) : (
          <Volume2 className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}
