/* ===================================
   ORANGE — Language Switcher
   =================================== */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe2 } from 'lucide-react';
import { useI18n, LOCALE_OPTIONS, type Locale } from '@/i18n';

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LOCALE_OPTIONS.find((l) => l.code === locale)!;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-orange-text-muted hover:text-orange-text-secondary hover:bg-orange-bg-tertiary transition-all"
        title="Change language"
      >
        <Globe2 size={14} />
        <span>{current.flag}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            className="absolute bottom-full left-0 mb-2 bg-orange-bg-elevated border border-orange-border rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] overflow-hidden min-w-[150px] z-50"
          >
            {LOCALE_OPTIONS.map((opt) => (
              <button
                key={opt.code}
                onClick={() => {
                  setLocale(opt.code);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2.5 transition-colors ${
                  locale === opt.code
                    ? 'bg-orange-gold-mid/10 text-orange-gold-mid'
                    : 'text-orange-text-secondary hover:bg-orange-bg-tertiary'
                }`}
              >
                <span>{opt.flag}</span>
                <span>{opt.name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}