/* ===================================
   ORANGE — Usage Dashboard
   Shows current plan usage.
   =================================== */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Languages, Volume2, HardDrive, TrendingUp, ExternalLink } from 'lucide-react';
import api from '@/services/api';
import { PremiumButton } from '@/components/shared/PremiumButton';
import clsx from 'clsx';

interface UsageItem {
  used: number;
  limit: number;
  unit: string;
}

interface UsageData {
  month: string;
  plan: string;
  ocr: UsageItem;
  translate: UsageItem;
  tts: UsageItem;
  vault: UsageItem;
}

const SERVICE_CONFIG = [
  { key: 'ocr', label: 'OCR', icon: FileText, color: '#3498db' },
  { key: 'translate', label: 'Μετάφραση', icon: Languages, color: '#2ecc71' },
  { key: 'tts', label: 'Audiobook', icon: Volume2, color: '#9b59b6' },
  { key: 'vault', label: 'Θυρίδα', icon: HardDrive, color: '#f39c12' },
];

export function UsageDashboard() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get('/billing/usage');
        setUsage(data);
      } catch {
        // Silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const openPortal = async () => {
    try {
      const { data } = await api.post('/billing/portal');
      window.location.href = data.url;
    } catch {
      // Error handled
    }
  };

  if (loading || !usage) {
    return (
      <div className="p-8 text-center text-orange-text-muted">
        Φόρτωση χρήσης...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-orange-text-primary flex items-center gap-2">
            <TrendingUp size={18} className="text-orange-gold-mid" />
            Χρήση & Πλάνο
          </h3>
          <p className="text-sm text-orange-text-muted mt-0.5">
            Περίοδος: {usage.month} · Πλάνο:{' '}
            <span className="text-orange-gold-mid font-medium capitalize">{usage.plan}</span>
          </p>
        </div>
        <PremiumButton variant="secondary" size="sm" icon={<ExternalLink size={14} />} onClick={openPortal}>
          Διαχείριση Πλάνου
        </PremiumButton>
      </div>

      {/* Usage Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SERVICE_CONFIG.map((svc) => {
          const item = usage[svc.key as keyof UsageData] as UsageItem;
          const isUnlimited = item.limit === -1;
          const pct = isUnlimited ? 0 : item.limit > 0 ? Math.min((item.used / item.limit) * 100, 100) : 0;
          const isWarning = pct >= 80;
          const isDanger = pct >= 95;
          const Icon = svc.icon;

          return (
            <motion.div
              key={svc.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-orange-bg-secondary border border-orange-border rounded-xl p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${svc.color}15` }}
                >
                  <Icon size={18} style={{ color: svc.color }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-text-primary">
                    {svc.label}
                  </p>
                  <p className="text-xs text-orange-text-muted">
                    {isUnlimited
                      ? `${item.used.toLocaleString()} ${item.unit} (Απεριόριστο)`
                      : `${item.used.toLocaleString()} / ${item.limit.toLocaleString()} ${item.unit}`}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              {!isUnlimited && (
                <div className="relative h-2 bg-orange-bg-tertiary rounded-full overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{
                      backgroundColor: isDanger
                        ? '#e74c3c'
                        : isWarning
                          ? '#f39c12'
                          : svc.color,
                    }}
                  />
                </div>
              )}

              {isUnlimited && (
                <div className="h-2 bg-orange-bg-tertiary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full opacity-30"
                    style={{
                      width: '100%',
                      background: `repeating-linear-gradient(90deg, ${svc.color} 0px, ${svc.color} 4px, transparent 4px, transparent 8px)`,
                    }}
                  />
                </div>
              )}

              <div className="flex justify-between mt-2">
                <span className={clsx(
                  'text-[0.65rem] font-medium',
                  isDanger ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-orange-text-muted',
                )}>
                  {isUnlimited ? 'Unlimited' : `${Math.round(pct)}%`}
                </span>
                {!isUnlimited && item.limit - item.used > 0 && (
                  <span className="text-[0.65rem] text-orange-text-muted">
                    {(item.limit - item.used).toLocaleString()} {item.unit} remaining
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}