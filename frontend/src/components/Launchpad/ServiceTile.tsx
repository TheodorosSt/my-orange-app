/* ===================================
   ORANGE — Service Tile Component
   Premium interactive card with glow.
   =================================== */

import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { ServiceConfig } from '@/types';

interface ServiceTileProps {
  service: ServiceConfig;
  isActive: boolean;
  onClick: () => void;
}

const tileVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  },
};

export function ServiceTile({ service, isActive, onClick }: ServiceTileProps) {
  return (
    <motion.button
      variants={tileVariants}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={clsx(
        'relative group w-full text-left rounded-2xl p-5 pt-6 overflow-hidden',
        'border transition-all duration-300 cursor-pointer',
        'bg-orange-bg-secondary',
        isActive
          ? 'border-orange-border-gold shadow-glow'
          : 'border-orange-border hover:border-orange-border-gold hover:shadow-premium',
      )}
    >
      {/* Radial glow background */}
      <div
        className={clsx(
          'absolute inset-0 transition-opacity duration-300 pointer-events-none',
          'bg-[radial-gradient(circle_at_center,rgba(199,173,103,0.12)_0%,transparent_70%)]',
          isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        )}
      />

      {/* Icon */}
      <div className="relative z-10 w-[100px] h-[100px] mx-auto mb-3 transition-transform duration-300 group-hover:scale-110">
        <img
          src={service.icon}
          alt={service.title}
          className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(199,173,103,0.2)]"
        />
      </div>

      {/* Title */}
      <h3 className="relative z-10 text-center text-base font-semibold text-orange-text-primary mb-1">
        {service.title}
      </h3>

      {/* Description */}
      <p className="relative z-10 text-center text-sm text-orange-text-muted">
        {service.description}
      </p>
    </motion.button>
  );
}