/* ===================================
   ORANGE — App Store Tests
   =================================== */

import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '@/stores/appStore';

describe('AppStore', () => {
  beforeEach(() => {
    useAppStore.getState().reset();
    useAppStore.setState({
      screen: 'launchpad',
      activeService: 'ocr',
      activeEditorTab: 'ocr-text',
    });
  });

  it('should start on launchpad screen', () => {
    expect(useAppStore.getState().screen).toBe('launchpad');
  });

  it('should navigate to workspace with service', () => {
    useAppStore.getState().navigateToWorkspace('translate');

    const state = useAppStore.getState();
    expect(state.screen).toBe('workspace');
    expect(state.activeService).toBe('translate');
  });

  it('should navigate back to launchpad', () => {
    useAppStore.getState().navigateToWorkspace('ocr');
    useAppStore.getState().navigateToLaunchpad();

    expect(useAppStore.getState().screen).toBe('launchpad');
  });

  it('should switch active service', () => {
    useAppStore.getState().setActiveService('audiobook');
    expect(useAppStore.getState().activeService).toBe('audiobook');
  });

  it('should switch editor tab', () => {
    useAppStore.getState().setEditorTab('translation');
    expect(useAppStore.getState().activeEditorTab).toBe('translation');
  });

  it('should update stats', () => {
    useAppStore.getState().updateStats({
      documentsProcessed: 5,
      wordCount: 1200,
    });

    const stats = useAppStore.getState().stats;
    expect(stats.documentsProcessed).toBe(5);
    expect(stats.wordCount).toBe(1200);
  });

  it('should reset state', () => {
    useAppStore.getState().setOCRResult({
      text: 'Test',
      confidence: 0.99,
      language: 'el',
      wordCount: 1,
      processingTimeMs: 100,
      pages: 1,
    });

    useAppStore.getState().reset();

    expect(useAppStore.getState().ocrResult).toBeNull();
    expect(useAppStore.getState().uploadedFile).toBeNull();
  });

  it('should set split ratio within bounds', () => {
    useAppStore.getState().setSplitRatio(75);
    expect(useAppStore.getState().splitRatio).toBe(75);
  });
});