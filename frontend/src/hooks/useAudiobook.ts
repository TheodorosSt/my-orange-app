/* ===================================
   ORANGE — Audiobook Hook
   =================================== */

import { useCallback, useRef, useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { audiobookApi } from '@/services/api';
import toast from 'react-hot-toast';
import type { Voice } from '@/types';

export function useAudiobook() {
  const {
    ocrResult,
    translationResult,
    audiobookUrl,
    audiobookLoading,
    isPlaying,
    setAudiobookUrl,
    setAudiobookLoading,
    setIsPlaying,
  } = useAppStore();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string | undefined>();
  const [speed, setSpeed] = useState(1.0);

  const generateAudio = useCallback(
    async (text?: string) => {
      const sourceText =
        text || translationResult?.translatedText || ocrResult?.text;

      if (!sourceText) {
        toast.error('Δεν υπάρχει κείμενο για ηχητική παραγωγή');
        return;
      }

      setAudiobookLoading(true);

      const toastId = toast.loading('Δημιουργία ήχου...');

      try {
        const blob = await audiobookApi.generate({
          text: sourceText,
          voiceId: selectedVoice,
          speed,
        });

        // Revoke previous URL
        if (audiobookUrl) {
          URL.revokeObjectURL(audiobookUrl);
        }

        const url = URL.createObjectURL(blob);
        setAudiobookUrl(url);

        toast.success('Ο ήχος είναι έτοιμος!', { id: toastId });
      } catch {
        toast.error('Σφάλμα κατά τη δημιουργία ήχου', { id: toastId });
      } finally {
        setAudiobookLoading(false);
      }
    },
    [
      ocrResult,
      translationResult,
      selectedVoice,
      speed,
      audiobookUrl,
      setAudiobookUrl,
      setAudiobookLoading,
    ],
  );

  const play = useCallback(() => {
    if (!audiobookUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(audiobookUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    } else {
      audioRef.current.src = audiobookUrl;
    }

    audioRef.current.play();
    setIsPlaying(true);
  }, [audiobookUrl, setIsPlaying]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, [setIsPlaying]);

  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const loadVoices = useCallback(async () => {
    try {
      const v = await audiobookApi.getVoices();
      setVoices(v);
    } catch {
      // Silent
    }
  }, []);

  return {
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
    play,
    pause,
    loadVoices,
  };
}