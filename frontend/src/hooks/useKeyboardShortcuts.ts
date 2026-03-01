/* ===================================
   ORANGE — Keyboard Shortcuts
   =================================== */

import { useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';
import type { ServiceId } from '@/types';

const SERVICE_KEYS: ServiceId[] = ['ocr', 'translate', 'audiobook', 'vault'];

export function useKeyboardShortcuts() {
  const { screen, navigateToLaunchpad, navigateToWorkspace, setActiveService } =
    useAppStore();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if typing in an input/textarea/contenteditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Escape → Launchpad
      if (e.key === 'Escape' && screen === 'workspace') {
        navigateToLaunchpad();
        return;
      }

      // Ctrl+1-4 → Switch services
      if (e.ctrlKey && e.key >= '1' && e.key <= '4') {
        e.preventDefault();
        const idx = parseInt(e.key) - 1;
        const service = SERVICE_KEYS[idx];
        if (service) {
          if (screen === 'workspace') {
            setActiveService(service);
          } else {
            navigateToWorkspace(service);
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, navigateToLaunchpad, navigateToWorkspace, setActiveService]);
}