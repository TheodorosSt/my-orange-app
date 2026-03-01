/* ===================================
   ORANGE Platform — Global State
   Zustand store — minimal, fast, typed.
   =================================== */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  Screen,
  ServiceId,
  EditorTab,
  AppStats,
  UploadedFile,
  OCRResult,
  TranslationResult,
} from '@/types';

// ===================================
// State Interface
// ===================================

interface AppState {
  // Navigation
  screen: Screen;
  activeService: ServiceId;
  activeEditorTab: EditorTab;

  // File
  uploadedFile: UploadedFile | null;

  // OCR
  ocrResult: OCRResult | null;
  ocrLoading: boolean;

  // Translation
  translationResult: TranslationResult | null;
  translationLoading: boolean;

  // Audiobook
  audiobookUrl: string | null;
  audiobookLoading: boolean;
  isPlaying: boolean;

  // Stats
  stats: AppStats;

  // UI
  sidebarCollapsed: boolean;
  splitRatio: number; // 0-100, left panel %

  // Actions
  setScreen: (screen: Screen) => void;
  setActiveService: (service: ServiceId) => void;
  navigateToWorkspace: (service: ServiceId) => void;
  navigateToLaunchpad: () => void;
  setEditorTab: (tab: EditorTab) => void;
  setUploadedFile: (file: UploadedFile | null) => void;
  setOCRResult: (result: OCRResult | null) => void;
  setOCRLoading: (loading: boolean) => void;
  setTranslationResult: (result: TranslationResult | null) => void;
  setTranslationLoading: (loading: boolean) => void;
  setAudiobookUrl: (url: string | null) => void;
  setAudiobookLoading: (loading: boolean) => void;
  setIsPlaying: (playing: boolean) => void;
  updateStats: (partial: Partial<AppStats>) => void;
  setSplitRatio: (ratio: number) => void;
  toggleSidebar: () => void;
  reset: () => void;
}

// ===================================
// Initial State
// ===================================

const initialStats: AppStats = {
  documentsProcessed: 0,
  documentsTotal: 0,
  wordCount: 0,
  avgProcessingTime: 0,
  successRate: 0,
};

// ===================================
// Store
// ===================================

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      // Initial values
      screen: 'launchpad',
      activeService: 'ocr',
      activeEditorTab: 'ocr-text',
      uploadedFile: null,
      ocrResult: null,
      ocrLoading: false,
      translationResult: null,
      translationLoading: false,
      audiobookUrl: null,
      audiobookLoading: false,
      isPlaying: false,
      stats: { ...initialStats },
      sidebarCollapsed: false,
      splitRatio: 50,

      // Navigation
      setScreen: (screen) => set({ screen }, false, 'setScreen'),

      setActiveService: (service) =>
        set({ activeService: service }, false, 'setActiveService'),

      navigateToWorkspace: (service) =>
        set(
          { screen: 'workspace', activeService: service },
          false,
          'navigateToWorkspace',
        ),

      navigateToLaunchpad: () =>
        set({ screen: 'launchpad' }, false, 'navigateToLaunchpad'),

      setEditorTab: (tab) =>
        set({ activeEditorTab: tab }, false, 'setEditorTab'),

      // File
      setUploadedFile: (file) =>
        set({ uploadedFile: file }, false, 'setUploadedFile'),

      // OCR
      setOCRResult: (result) =>
        set({ ocrResult: result }, false, 'setOCRResult'),
      setOCRLoading: (loading) =>
        set({ ocrLoading: loading }, false, 'setOCRLoading'),

      // Translation
      setTranslationResult: (result) =>
        set({ translationResult: result }, false, 'setTranslationResult'),
      setTranslationLoading: (loading) =>
        set({ translationLoading: loading }, false, 'setTranslationLoading'),

      // Audiobook
      setAudiobookUrl: (url) =>
        set({ audiobookUrl: url }, false, 'setAudiobookUrl'),
      setAudiobookLoading: (loading) =>
        set({ audiobookLoading: loading }, false, 'setAudiobookLoading'),
      setIsPlaying: (playing) =>
        set({ isPlaying: playing }, false, 'setIsPlaying'),

      // Stats
      updateStats: (partial) =>
        set(
          (state) => ({ stats: { ...state.stats, ...partial } }),
          false,
          'updateStats',
        ),

      // UI
      setSplitRatio: (ratio) =>
        set({ splitRatio: ratio }, false, 'setSplitRatio'),
      toggleSidebar: () =>
        set(
          (state) => ({ sidebarCollapsed: !state.sidebarCollapsed }),
          false,
          'toggleSidebar',
        ),

      // Reset
      reset: () =>
        set(
          {
            uploadedFile: null,
            ocrResult: null,
            ocrLoading: false,
            translationResult: null,
            translationLoading: false,
            audiobookUrl: null,
            audiobookLoading: false,
            isPlaying: false,
          },
          false,
          'reset',
        ),
    }),
    { name: 'OrangeStore' },
  ),
);