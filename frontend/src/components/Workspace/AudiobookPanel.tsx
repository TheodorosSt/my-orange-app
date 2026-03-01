/* ===================================
   ORANGE — Audiobook Player Panel
   Voice selector, speed control, waveform.
   =================================== */

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  Mic2,
  Gauge,
  Download,
  Loader2,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import { useAudiobook } from '@/hooks/useAudiobook';
import { useAppStore } from '@/stores/appStore';
import { PremiumButton } from '@/components/shared/PremiumButton';
import clsx from 'clsx';

export function AudiobookPanel() {
  const {
    audiobookUrl,
    audiobookLoading,
    isPlaying,
    voices,
    selectedVoice,
    speed,
    setSelectedVoice,
    setSpeed,
    generateAudio,
    togglePlayback,
    loadVoices,
  } = useAudiobook();

  const { ocrResult, translationResult } = useAppStore();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const progressRef = useRef<HTMLDivElement>(null);

  // Load voices on mount
  useEffect(() => {
    loadVoices();
  }, [loadVoices]);

  // Audio element sync
  useEffect(() => {
    if (!audiobookUrl || !audioRef.current) return;
    audioRef.current.src = audiobookUrl;
  }, [audiobookUrl]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !audioRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pct * duration;
  };

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  const handleToggle = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      useAppStore.getState().setIsPlaying(false);
    } else {
      audioRef.current.play();
      useAppStore.getState().setIsPlaying(true);
    }
  };

  const skip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        0,
        Math.min(duration, audioRef.current.currentTime + seconds),
      );
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const sourceText = translationResult?.translatedText || ocrResult?.text;
  const hasText = !!sourceText;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="h-full flex flex-col bg-orange-bg-primary">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => useAppStore.getState().setIsPlaying(false)}
      />

      {/* Controls Bar */}
      <div className="p-6 border-b border-orange-border bg-orange-bg-secondary">
        {/* Voice selector */}
        <div className="flex items-center gap-4 mb-5">
          <div className="flex items-center gap-2 text-xs text-orange-text-muted">
            <Mic2 size={14} />
            <span className="font-medium">Φωνή:</span>
          </div>
          <select
            value={selectedVoice || ''}
            onChange={(e) => setSelectedVoice(e.target.value || undefined)}
            className="flex-1 max-w-xs bg-orange-bg-tertiary border border-orange-border rounded-lg px-3 py-2 text-sm text-orange-text-primary focus:outline-none focus:ring-2 focus:ring-orange-gold-mid/30 focus:border-orange-gold-mid/50"
          >
            <option value="">Προεπιλεγμένη φωνή</option>
            {voices.map((v) => (
              <option key={v.voiceId} value={v.voiceId}>
                {v.name} ({v.category})
              </option>
            ))}
          </select>
        </div>

        {/* Speed control */}
        <div className="flex items-center gap-4 mb-5">
          <div className="flex items-center gap-2 text-xs text-orange-text-muted">
            <Gauge size={14} />
            <span className="font-medium">Ταχύτητα:</span>
          </div>
          <div className="flex gap-1.5">
            {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={clsx(
                  'px-2.5 py-1 text-xs rounded-md border transition-all',
                  speed === s
                    ? 'border-orange-gold-mid bg-orange-gold-mid/10 text-orange-gold-mid'
                    : 'border-orange-border text-orange-text-muted hover:border-orange-border-gold hover:text-orange-text-secondary',
                )}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <PremiumButton
          variant="primary"
          className="w-full"
          onClick={() => generateAudio()}
          loading={audiobookLoading}
          disabled={!hasText}
          icon={audiobookLoading ? <Loader2 size={16} className="animate-spin" /> : <Volume2 size={16} />}
        >
          {audiobookLoading ? 'Δημιουργία ήχου...' : 'Δημιουργία Audiobook'}
        </PremiumButton>

        {!hasText && (
          <p className="text-xs text-orange-text-muted text-center mt-2">
            Πρώτα κάντε OCR ή μετάφραση ενός κειμένου
          </p>
        )}
      </div>

      {/* Player */}
      {audiobookUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6"
        >
          {/* Waveform / Progress */}
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="relative h-16 mb-4 cursor-pointer rounded-lg overflow-hidden bg-orange-bg-tertiary"
          >
            {/* Waveform visualization (simplified bars) */}
            <div className="absolute inset-0 flex items-center justify-center gap-[2px] px-2">
              {Array.from({ length: 80 }, (_, i) => {
                const barProgress = (i / 80) * 100;
                const height = 20 + Math.sin(i * 0.3) * 15 + Math.cos(i * 0.7) * 10;
                const isPast = barProgress <= progress;
                return (
                  <div
                    key={i}
                    className={clsx(
                      'w-[2px] rounded-full transition-colors duration-100',
                      isPast ? 'bg-orange-gold-mid' : 'bg-orange-border',
                    )}
                    style={{ height: `${Math.max(8, height)}%` }}
                  />
                );
              })}
            </div>

            {/* Progress overlay */}
            <div
              className="absolute inset-y-0 left-0 bg-orange-gold-mid/5 pointer-events-none"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Time display */}
          <div className="flex justify-between text-xs text-orange-text-muted font-mono mb-4">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Playback controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => skip(-10)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-orange-text-muted hover:text-orange-text-secondary hover:bg-orange-bg-tertiary transition-all"
            >
              <SkipBack size={18} />
            </button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleToggle}
              className="w-14 h-14 rounded-full flex items-center justify-center btn-premium"
            >
              {isPlaying ? (
                <Pause size={22} className="text-orange-bg-primary" />
              ) : (
                <Play size={22} className="text-orange-bg-primary ml-0.5" />
              )}
            </motion.button>

            <button
              onClick={() => skip(10)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-orange-text-muted hover:text-orange-text-secondary hover:bg-orange-bg-tertiary transition-all"
            >
              <SkipForward size={18} />
            </button>
          </div>

          {/* Volume + Download */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-2">
              <Volume2 size={14} className="text-orange-text-muted" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-24 h-1 accent-orange-gold-mid cursor-pointer"
              />
            </div>

            <a
              href={audiobookUrl}
              download="orange-audiobook.mp3"
              className="flex items-center gap-1.5 text-xs text-orange-text-muted hover:text-orange-gold-mid transition-colors"
            >
              <Download size={14} />
              Λήψη MP3
            </a>
          </div>
        </motion.div>
      )}

      {/* Text preview */}
      <div className="flex-1 overflow-auto scrollbar-thin p-6 border-t border-orange-border">
        <h4 className="text-xs font-medium text-orange-text-muted mb-3 tracking-wider uppercase">
          Κείμενο προς εκφώνηση
        </h4>
        <p className="text-sm text-orange-text-secondary leading-relaxed whitespace-pre-wrap">
          {sourceText || (
            <span className="italic text-orange-text-muted">
              Δεν υπάρχει κείμενο ακόμα...
            </span>
          )}
        </p>
      </div>
    </div>
  );
}