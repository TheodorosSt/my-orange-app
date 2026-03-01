/* ===================================
   ORANGE — Login Form
   =================================== */

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { AuthInput } from './AuthInput';
import { PremiumButton } from '@/components/shared/PremiumButton';
import type { AuthView } from './AuthScreen';

interface LoginFormProps {
  onNavigate: (view: AuthView) => void;
}

export function LoginForm({ onNavigate }: LoginFormProps) {
  const { signIn, loading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Συμπληρώστε όλα τα πεδία');
      return;
    }

    const result = await signIn(email, password);
    if (result.error) {
      setError(translateAuthError(result.error));
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <div className="text-center mb-6">
        <h2 className="text-xl font-display font-bold text-gold-gradient bg-[length:200%_auto] animate-shimmer">
          Καλωσήρθατε
        </h2>
        <p className="text-sm text-orange-text-muted mt-1">
          Συνδεθείτε στην πλατφόρμα ORANGE
        </p>
      </div>

      <AuthInput
        label="EMAIL"
        type="email"
        placeholder="info@oranged.gr"
        icon={<Mail size={16} />}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        autoFocus
      />

      <AuthInput
        label="ΚΩΔΙΚΟΣ"
        type="password"
        placeholder="••••••••"
        icon={<Lock size={16} />}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
      />

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5"
        >
          <p className="text-xs text-red-400">{error}</p>
        </motion.div>
      )}

      <PremiumButton
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        loading={loading}
        icon={<LogIn size={16} />}
      >
        Σύνδεση
      </PremiumButton>

      <div className="flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => onNavigate('forgot-password')}
          className="text-orange-text-muted hover:text-orange-gold-mid transition-colors"
        >
          Ξεχάσατε τον κωδικό;
        </button>
        <button
          type="button"
          onClick={() => onNavigate('signup')}
          className="text-orange-gold-mid hover:text-orange-gold-light transition-colors font-medium"
        >
          Δημιουργία λογαριασμού →
        </button>
      </div>
    </motion.form>
  );
}

function translateAuthError(error: string): string {
  if (error.includes('Invalid login credentials')) {
    return 'Λάθος email ή κωδικός πρόσβασης';
  }
  if (error.includes('Email not confirmed')) {
    return 'Παρακαλώ επιβεβαιώστε το email σας';
  }
  if (error.includes('Too many requests')) {
    return 'Πολλές προσπάθειες. Δοκιμάστε ξανά σε λίγο.';
  }
  return error;
}