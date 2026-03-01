/* ===================================
   ORANGE — Stats Footer
   Persistent bottom bar with metrics.
   =================================== */

import { useAppStore } from '@/stores/appStore';

export function StatsFooter() {
  const stats = useAppStore((s) => s.stats);

  const items = [
    { label: 'Έγγραφα', value: `${stats.documentsProcessed} / ${stats.documentsTotal || 1}` },
    { label: 'Λέξεις', value: String(stats.wordCount) },
    { label: 'Μ.Ο. Χρόνου', value: `${stats.avgProcessingTime ? (stats.avgProcessingTime / 1000).toFixed(1) : '0'}s` },
    { label: 'Επιτυχία', value: `${stats.successRate}%`, highlight: true },
  ];

  return (
    <footer className="h-10 min-h-[40px] flex items-center px-6 bg-orange-bg-secondary border-t border-orange-border">
      {items.map((item, idx) => (
        <div key={item.label} className="flex items-center">
          {idx > 0 && (
            <div className="w-px h-4 bg-orange-border mx-3" />
          )}
          <div className="flex items-center gap-1.5 px-1">
            <span className="text-[0.7rem] font-medium text-orange-text-muted">
              {item.label}
            </span>
            <span
              className={`text-xs font-semibold font-mono ${
                item.highlight
                  ? 'text-orange-gold-mid'
                  : 'text-orange-text-secondary'
              }`}
            >
              {item.value}
            </span>
          </div>
        </div>
      ))}

      <div className="flex-1" />

      <div className="flex items-center gap-1.5">
        <span className="text-[0.7rem] font-medium text-orange-text-muted">
          ORANGE
        </span>
        <span className="text-xs font-semibold font-mono text-orange-gold-mid">
          v2.0
        </span>
      </div>
    </footer>
  );
}