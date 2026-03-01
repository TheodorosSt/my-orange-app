/* ===================================
   ORANGE — Premium Auth Screen
   Login, Signup, Forgot Password.
   =================================== */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';

export type AuthView = 'login' | 'signup' | 'forgot-password';

export function AuthScreen() {
  const [view, setView] = useState<AuthView>('login');

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-orange-bg-primary overflow-auto">
      {/* Background ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 30% 20%, rgba(199,173,103,0.06) 0%, transparent 50%), ' +
            'radial-gradient(ellipse at 70% 80%, rgba(199,173,103,0.04) 0%, transparent 50%)',
        }}
      />

      <motion.div
        className="relative z-10 w-full max-w-md px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <motion.img
            src="/assets/logo.svg"
            alt="ORANGE"
            className="w-48 mx-auto mb-2 drop-shadow-[0_0_30px_rgba(199,173,103,0.2)]"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 5, ease: 'easeInOut', repeat: Infinity }}
          />
        </div>

        {/* Card */}
        <div className="bg-orange-bg-secondary border border-orange-border rounded-2xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          <AnimatePresence mode="wait">
            {view === 'login' && (
              <LoginForm key="login" onNavigate={setView} />
            )}
            {view === 'signup' && (
              <SignupForm key="signup" onNavigate={setView} />
            )}
            {view === 'forgot-password' && (
              <ForgotPasswordForm key="forgot" onNavigate={setView} />
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-orange-text-muted mt-6 tracking-wide">
          © 2026 ORANGE · ΘΕΟΔΩΡΟΣ ΣΤΟΓΙΑΝΝΟΥ · Φλώρινα
        </p>
      </motion.div>
    </div>
  );
}