/* ===================================
   ORANGE — Unified Sidebar
   Logo + 4 service nav buttons.
   =================================== */

import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Settings } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { SERVICE_ORDER, SERVICES } from '@/config/services';
import type { ServiceId } from '@/types';

export function Sidebar() {
  const { activeService, setActiveService, navigateToLaunchpad } = useAppStore();

  return (
    <aside className="w-[84px] min-w-[84px] h-screen bg-orange-bg-secondary border-r border-orange-border flex flex-col items-center py-3 z-10">
      {/* Logo → Launchpad */}
      <button
        onClick={navigateToLaunchpad}
        className="mb-4 pb-4 border-b border-orange-border w-full flex justify-center hover:opacity-75 transition-opacity"
        title="Επιστροφή στο Launchpad"
      >
        <img
          src="/assets/logo.svg"
          alt="ORANGE"
          className="w-14 h-auto drop-shadow-[0_0_6px_rgba(199,173,103,0.2)]"
        />
      </button>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col items-center gap-1 w-full px-2">
        {SERVICE_ORDER.map((id) => {
          const service = SERVICES[id];
          const isActive = activeService === id;

          return (
            <motion.button
              key={id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveService(id as ServiceId)}
              title={service.title}
              className={clsx(
                'relative w-16 h-14 rounded-xl flex flex-col items-center justify-center gap-0.5',
                'transition-all duration-200 cursor-pointer border-none outline-none',
                isActive
                  ? 'bg-orange-bg-tertiary text-orange-gold-mid shadow-[inset_0_0_15px_rgba(199,173,103,0.06)]'
                  : 'text-orange-text-muted hover:bg-orange-bg-tertiary hover:text-orange-text-secondary',
              )}
            >
              {/* Active indicator bar */}
              {isActive && (
                <motion.div
                  layoutId="sidebarIndicator"
                  className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                  style={{
                    background: 'linear-gradient(180deg, #dad395, #b28636)',
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}

              <img
                src={service.icon}
                alt={service.title}
                className={clsx(
                  'w-[26px] h-[26px] object-contain transition-all duration-200',
                  isActive
                    ? 'opacity-100 drop-shadow-[0_0_4px_rgba(199,173,103,0.3)]'
                    : 'opacity-45 hover:opacity-70',
                )}
              />
              <span className="text-[0.52rem] font-medium tracking-tight">
                {service.badge}
              </span>
            </motion.button>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="pt-3 border-t border-orange-border w-full flex justify-center">
        <button
          className="w-11 h-11 rounded-xl flex items-center justify-center text-orange-text-muted hover:bg-orange-bg-tertiary hover:text-orange-text-secondary transition-all"
          title="Ρυθμίσεις"
        >
          <Settings size={20} />
        </button>
      </div>
    </aside>
  );
}