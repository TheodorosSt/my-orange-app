/* ===================================
   ORANGE — Guided Onboarding
   First-time user experience.
   =================================== */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Languages,
  Headphones,
  Shield,
  ArrowRight,
  ArrowLeft,
  Upload,
  Sparkles,
} from 'lucide-react';
import { PremiumButton } from '@/components/shared/PremiumButton';
import { useAppStore } from '@/stores/appStore';

interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
  image: string;
  action?: string;
}

const steps: Step[] = [
  {
    title: 'Καλωσήρθατε στην ORANGE!',
    description: 'Η premium πλατφόρμα ψηφιακών υπηρεσιών σας. Ας κάνουμε μια γρήγορη ξενάγηση στις δυνατότητες.',
    icon: <Sparkles size={28} className="text-orange-gold-mid" />,
    image: '/assets/logo.svg',
  },
  {
    title: 'Ψηφιοποίηση & OCR',
    description: 'Φορτώστε μια εικόνα ή PDF και η πλατφόρμα θα αναγνωρίσει αυτόματα το κείμενο με ακρίβεια 99%+. Υποστηρίζει ελληνικά, αγγλικά, και 30+ γλώσσες.',
    icon: <FileText size={28} />,
    image: '/assets/icon-ocr.svg',
    action: 'Δοκιμάστε: Σύρετε ένα αρχείο στο Source Panel',
  },
  {
    title: 'Μετάφραση - Επιμέλεια',
    description: 'Μεταφράστε αυτόματα το κείμενο σε οποιαδήποτε γλώσσα μέσω DeepL Pro — τον κορυφαίο μεταφραστή στον κόσμο. Η   οιότητα είναι σχεδόν ανθρώπινη.',
    icon: <Languages size={28} />,
    image: '/assets/icon-translate.svg',
    action: 'Δοκιμάστε: Πατήστε το tab «Μετάφραση» στον editor',
  },
  {
    title: 'Παραγωγή Audiobook',
    description: 'Μετατρέψτε οποιοδήποτε κείμενο σε φυσική ομιλία μέσω ElevenLabs. Επιλέξτε φωνή, ρυθμίστε ταχύτητα, κατεβάστε σε MP3.',
    icon: <Headphones size={28} />,
    image: '/assets/icon-audiobook.svg',
    action: 'Δοκιμάστε: Πατήστε «Audiobook» στο sidebar',
  },
  {
    title: 'Ψηφιακή Θυρίδα',
    description: 'Όλα τα αρχεία σας αποθηκεύονται ασφαλώς με κρυπτογράφηση AES-256. Μπορείτε να τα κατεβάσετε, μοιραστείτε ή διαγράψετε ανά πάσα στιγμή.',
    icon: <Shield size={28} />,
    image: '/assets/icon-vault.svg',
    action: 'Δοκιμάστε: Πατήστε «Θυρίδα» στο sidebar',
  },
  {
    title: 'Είστε έτοιμοι!',
    description: 'Φορτώστε το πρώτο σας έγγραφο και δείτε τη μαγεία. Αν χρειαστείτε βοήθεια, πατήστε το ⚙️ στο sidebar.',
    icon: <Sparkles size={28} className="text-orange-gold-mid" />,
    image: '/assets/logo.svg',
  },
];

export function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  const next = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const prev = () => {
    if (!isFirst) setCurrentStep((s) => s - 1);
  };

  const skip = () => onComplete();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-orange-bg-primary/95 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-lg px-6">
        {/* Skip */}
        <button
          onClick={skip}
          className="absolute -top-10 right-6 text-xs text-orange-text-muted hover:text-orange-gold-mid transition-colors"
        >
          Παράλειψη →
        </button>

        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-orange-bg-secondary border border-orange-border rounded-2xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)] text-center"
          >
            {/* Image */}
            <motion.img
              src={step.image}
              alt=""
              className="w-20 h-20 mx-auto mb-6 object-contain"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            />

            {/* Title */}
            <h2 className="text-xl font-display font-bold text-orange-text-primary mb-3">
              {step.title}
            </h2>

            {/* Description */}
            <p className="text-sm text-orange-text-muted leading-relaxed mb-4 max-w-sm mx-auto">
              {step.description}
            </p>

            {/* Action hint */}
            {step.action && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-gold-mid/5 border border-orange-border-gold text-xs text-orange-gold-mid mb-6">
                <Upload size={12} />
                {step.action}
              </div>
            )}

            {/* Progress dots */}
            <div className="flex justify-center gap-2 mb-6">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentStep
                      ? 'w-6 bg-orange-gold-mid'
                      : idx < currentStep
                        ? 'bg-orange-gold-mid/40'
                        : 'bg-orange-border'
                  }`}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={prev}
                disabled={isFirst}
                className={`flex items-center gap-1 text-sm ${
                  isFirst
                    ? 'text-orange-text-muted/30 cursor-not-allowed'
                    : 'text-orange-text-muted hover:text-orange-gold-mid transition-colors'
                }`}
              >
                <ArrowLeft size={14} />
                Πίσω
              </button>

              <PremiumButton
                variant="primary"
                size="md"
                onClick={next}
                icon={isLast ? <Sparkles size={14} /> : <ArrowRight size={14} />}
              >
                {isLast ? 'Ας ξεκινήσουμε!' : 'Επόμενο'}
              </PremiumButton>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}