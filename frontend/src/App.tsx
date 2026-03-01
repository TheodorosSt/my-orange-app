/* ===================================
   ORANGE Platform — App Root (Final)
   =================================== */

import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import { GoldGradientDefs } from '@/components/shared/GoldGradient';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { AuthScreen } from '@/components/Auth/AuthScreen';
import { Launchpad } from '@/components/Launchpad/Launchpad';
import { Workspace } from '@/components/Workspace/Workspace';
import { SplashScreen } from '@/components/shared/SplashScreen';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export function App() {
  const screen = useAppStore((s) => s.screen);
  const { user, initialized, initialize } = useAuthStore();

  useKeyboardShortcuts();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!initialized) {
    return <SplashScreen />;
  }

  return (
    <ErrorBoundary>
      <GoldGradientDefs />

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#231f1b',
            color: '#e8e0d4',
            border: '1px solid #3a3228',
            borderRadius: '12px',
            fontSize: '0.85rem',
            boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
          },
          success: {
            iconTheme: { primary: '#c7ad67', secondary: '#1a1714' },
          },
          error: {
            iconTheme: { primary: '#e74c3c', secondary: '#1a1714' },
          },
        }}
      />

      <AnimatePresence mode="wait">
        {!user ? (
          <AuthScreen key="auth" />
        ) : screen === 'launchpad' ? (
          <ErrorBoundary>
            <Launchpad key="launchpad" />
          </ErrorBoundary>
        ) : (
          <ErrorBoundary>
            <Workspace key="workspace" />
          </ErrorBoundary>
        )}
      </AnimatePresence>
    </ErrorBoundary>
  );
}