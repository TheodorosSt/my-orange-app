/* ===================================
   ORANGE — Forgot Password Form
   =================================== */

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { AuthInput } from './AuthInput';
import { PremiumButton } from '@/components/shared/PremiumButton';
import type { AuthView } from './AuthScreen';

interface ForgotPasswordFormProps {
  onNavigate: (view: AuthView) => void;
}

export function ForgotPasswordForm({ onNavigate }: ForgotPasswordFormProps) {
  const { resetPassword, loading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Εισάγετε το email σας');
      return;
    }

    const result = await resetPassword(email);
    if (result.error) {
      setError(result.error);
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-6"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-gold-mid/10 border border-orange-border-gold flex items-center justify-center">
          <Send size={24} className="text-orange-gold-mid" />
        </div>
        <h3 className="text-lg font-semibold text-orange-text-primary mb-2">
          Email Εστάλη
        </h3>
        <p className="text-sm text-orange-text-muted mb-6 leading-relaxed">
          Αν υπάρχει λογαριασμός με το <span className="text-orange-gold-mid">{email}</span>,
          θα λάβετε link επαναφοράς κωδικού.
        </p>
        <PremiumButton
          variant="secondary"
          onClick={() => onNavigate('login')}
          icon={<ArrowLeft size={14} />}
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
      className="space-y-5"
    >
      <div className="text-center mb-5">
        <h2 className="text-xl font-display font-bold text-orange-text-primary">
          Επαναφορά Κωδικού
        </h2>
        <p className="text-sm text-orange-text-muted mt-1">
          Θα σας στείλουμε link επαναφοράς
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
        icon={<Send size={16} />}
      >
        Αποστολή Link
      </PremiumButton>

      <button
        type="button"
        onClick={() => onNavigate('login')}
        className="flex items-center gap-1.5 mx-auto text-xs text-orange-text-muted hover:text-orange-gold-mid transition-colors"
      >
        <ArrowLeft size={12} />
        Επιστροφή στη σύνδεση
      </button>
    </motion.form>
  );
}