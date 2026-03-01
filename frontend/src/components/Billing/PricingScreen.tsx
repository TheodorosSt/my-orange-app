/* ===================================
   ORANGE — Premium Pricing Screen
   Three-tier plan selection.
   =================================== */

import { motion } from 'framer-motion';
import { Check, X, Zap, Crown, Building2 } from 'lucide-react';
import { PremiumButton } from '@/components/shared/PremiumButton';
import api from '@/services/api';
import clsx from 'clsx';

interface Plan {
  id: string;
  name: string;
  price: number;
  icon: React.ReactNode;
  description: string;
  features: { name: string; included: boolean }[];
  highlighted?: boolean;
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    icon: <Zap size={24} />,
    description: 'Για μεμονωμένους επαγγελματίες',
    features: [
      { name: '100 σελίδες OCR / μήνα', included: true },
      { name: '50.000 λέξεις μετάφραση', included: true },
      { name: '30 λεπτά audiobook', included: true },
      { name: '5 GB ψηφιακή θυρίδα', included: true },
      { name: 'Batch processing', included: false },
      { name: 'Real-time collaboration', included: false },
      { name: 'API access', included: false },
      { name: 'Priority support', included: false },
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 79,
    icon: <Crown size={24} />,
    description: 'Για ομάδες & μεσαίες επιχειρήσεις',
    highlighted: true,
    features: [
      { name: '500 σελίδες OCR / μήνα', included: true },
      { name: '200.000 λέξεις μετάφραση', included: true },
      { name: '120 λεπτά audiobook', included: true },
      { name: '25 GB ψηφιακή θυρίδα', included: true },
      { name: 'Batch processing', included: true },
      { name: 'Real-time collaboration', included: true },
      { name: 'API access', included: false },
      { name: 'Priority support', included: false },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    icon: <Building2 size={24} />,
    description: 'Για μεγάλους οργανισμούς',
    features: [
      { name: 'Απεριόριστες σελίδες OCR', included: true },
      { name: '1.000.000 λέξεις μετάφραση', included: true },
      { name: '500 λεπτά audiobook', included: true },
      { name: '100 GB ψηφιακή θυρίδα', included: true },
      { name: 'Batch processing', included: true },
      { name: 'Real-time collaboration', included: true },
      { name: 'Full API access', included: true },
      { name: 'Priority support 24/7', included: true },
    ],
  },
];

export function PricingScreen() {
  const handleSubscribe = async (planId: string) => {
    try {
      const { data } = await api.post('/billing/checkout', {
        plan: planId,
        success_url: `${window.location.origin}/?subscription=success`,
        cancel_url: `${window.location.origin}/pricing`,
      });

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch {
      // Error handled by interceptor
    }
  };

  return (
    <div className="min-h-screen bg-orange-bg-primary py-16 px-6">
      {/* Header */}
      <div className="text-center mb-12">
        <motion.img
          src="/assets/logo.svg"
          alt="ORANGE"
          className="w-36 mx-auto mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        />
        <h1 className="text-3xl font-display font-bold text-gold-gradient bg-[length:200%_auto] animate-shimmer mb-3">
          Επιλέξτε το πλάνο σας
        </h1>
        <p className="text-orange-text-muted max-w-lg mx-auto">
          Ξεκλειδώστε τη πλήρη δύναμη της πλατφόρμας ORANGE.
          Όλα τα πλάνα περιλαμβάνουν 14 ημέρες δωρεάν δοκιμή.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, idx) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={clsx(
              'relative rounded-2xl border p-7 flex flex-col',
              plan.highlighted
                ? 'border-orange-gold-mid/50 bg-orange-bg-secondary shadow-glow-strong scale-[1.03]'
                : 'border-orange-border bg-orange-bg-secondary',
            )}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-orange-gold-dark to-orange-gold-mid text-orange-bg-primary">
                ΔΗΜΟΦΙΛΕΣ
              </div>
            )}

            {/* Plan Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className={clsx(
                'w-10 h-10 rounded-xl flex items-center justify-center',
                plan.highlighted
                  ? 'bg-orange-gold-mid/15 text-orange-gold-mid'
                  : 'bg-orange-bg-tertiary text-orange-text-muted',
              )}>
                {plan.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-orange-text-primary">
                  {plan.name}
                </h3>
                <p className="text-xs text-orange-text-muted">{plan.description}</p>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <span className="text-4xl font-bold text-orange-text-primary">
                €{plan.price}
              </span>
              <span className="text-sm text-orange-text-muted">/μήνα</span>
            </div>

            {/* Features */}
            <ul className="space-y-2.5 mb-8 flex-1">
              {plan.features.map((feature) => (
                <li
                  key={feature.name}
                  className="flex items-start gap-2.5 text-sm"
                >
                  {feature.included ? (
                    <Check size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <X size={16} className="text-orange-text-muted/30 flex-shrink-0 mt-0.5" />
                  )}
                  <span
                    className={
                      feature.included
                        ? 'text-orange-text-secondary'
                        : 'text-orange-text-muted/50'
                    }
                  >
                    {feature.name}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <PremiumButton
              variant={plan.highlighted ? 'primary' : 'secondary'}
              size="lg"
              className="w-full"
              onClick={() => handleSubscribe(plan.id)}
            >
              Ξεκινήστε Δωρεάν
            </PremiumButton>
          </motion.div>
        ))}
      </div>

      {/* Footer note */}
      <p className="text-center text-xs text-orange-text-muted mt-10">
        Ασφαλείς πληρωμές μέσω Stripe · Ακύρωση οποτεδήποτε · VAT δεν περιλαμβάνεται
      </p>
    </div>
  );
}