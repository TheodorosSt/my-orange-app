/* ===================================
   ORANGE — Signup Form
   =================================== */

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { AuthInput } from './AuthInput';
import { PremiumButton } from '@/components/shared/PremiumButton';
import type { AuthView } from './AuthScreen';

interface SignupFormProps {
  onNavigate: (view: AuthView) => void;
}

export function SignupForm({ onNavigate }: SignupFormProps) {
  const { signUp, loading } = useAuthStore();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName || !email || !password || !confirmPassword) {
      setError('Συμπληρώστε όλα τα πεδία');
      return;
    }

    if (password.length < 8) {
      setError('Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες');
      return;
    }

    if (password !== confirmPassword) {
      setError('Οι κωδικοί δεν ταιριάζουν');
      return;
    }

    const result = await signUp(email, password, fullName);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-6"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-gold-mid/10 border border-orange-border-gold flex items-center justify-center">
          <Mail size={28} className="text-orange-gold-mid" />
        </div>
        <h3 className="text-lg font-semibold text-orange-text-primary mb-2">
          Ελέγξτε το email σας
        </h3>
        <p className="text-sm text-orange-text-muted mb-6 leading-relaxed">
          Σας στείλαμε ένα link επιβεβαίωσης στο{' '}
          <span className="text-orange-gold-mid">{email}</span>.
          <br />
          Πατήστε το για να ενεργοποιήσετε τον λογαριασμό σας.
        </p>
        <PremiumButton
          variant="secondary"
          onClick={() => onNavigate('login')}
        >
          Επιστροφή στη σύνδεση
        </PremiumButton>
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="text-center mb-5">
        <h2 className="text-xl font-display font-bold text-gold-gradient bg-[length:200%_auto] animate-shimmer">
          Εγγραφή
        </h2>
        <p className="text-sm text-orange-text-muted mt-1">
          Δημιουργήστε τον λογαριασμό σας στην ORANGE
        </p>
      </div>

      <AuthInput
        label="ΟΝΟΜΑΤΕΠΩΝΥΜΟ"
        type="text"
        placeholder="Θεόδωρος Στογιάννου"
        icon={<User size={16} />}
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        autoComplete="name"
        autoFocus
      />

      <AuthInput
        label="EMAIL"
        type="email"
        placeholder="info@oranged.gr"
        icon={<Mail size={16} />}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
      />

      <AuthInput
        label="ΚΩΔΙΚΟΣ"
        type="password"
        placeholder="Τουλάχιστον 8 χαρακτήρες"
        icon={<Lock size={16} />}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
      />

      <AuthInput
        label="ΕΠΙΒΕΒΑΙΩΣΗ ΚΩΔΙΚΟΥ"
        type="password"
        placeholder="••••••••"
        icon={<Lock size={16} />}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        autoComplete="new-password"
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
        icon={<UserPlus size={16} />}
      >
        Δημιουργία Λογαριασμού
      </PremiumButton>

      <p className="text-center text-xs text-orange-text-muted">
        Έχετε ήδη λογαριασμό;{' '}
        <button
          type="button"
          onClick={() => onNavigate('login')}
          className="text-orange-gold-mid hover:text-orange-gold-light transition-colors font-medium"
        >
          Σύνδεση
        </button>
      </p>
    </motion.form>
  );
}