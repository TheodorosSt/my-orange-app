/* ===================================
   ORANGE — The Launchpad (Screen 1)
   Premium landing with 4 service tiles.
   =================================== */

import { motion } from 'framer-motion';
import { ServiceTile } from './ServiceTile';
import { SERVICE_ORDER, SERVICES } from '@/config/services';
import { useAppStore } from '@/stores/appStore';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: { duration: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  },
};

export function Launchpad() {
  const { activeService, navigateToWorkspace } = useAppStore();

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-orange-bg-primary"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{
        background:
          'radial-gradient(ellipse at center, rgba(199,173,103,0.04) 0%, transparent 60%), #1a1714',
      }}
    >
      <div className="text-center max-w-[820px] w-full px-6">
        {/* Logo */}
        <motion.div className="mb-12" variants={itemVariants}>
          <motion.div
            className="flex justify-center"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity }}
          >
            <img
              src="/assets/logo.svg"
              alt="ORANGE — Digitize • Translate • Narrate"
              className="w-[420px] max-w-[80vw] h-auto drop-shadow-[0_0_30px_rgba(199,173,103,0.2)]"
            />
          </motion.div>
        </motion.div>

        {/* Service Tiles */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12"
          variants={containerVariants}
        >
          {SERVICE_ORDER.map((id) => (
            <ServiceTile
              key={id}
              service={SERVICES[id]}
              isActive={activeService === id}
              onClick={() => navigateToWorkspace(id as 'ocr' | 'translate' | 'audiobook' | 'vault')}
            />
          ))}
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-xs text-orange-text-muted tracking-widest"
          variants={itemVariants}
        >
          <span>ΘΕΟΔΩΡΟΣ ΣΤΟΓΙΑΝΝΟΥ</span>
          <span className="mx-3 opacity-40">|</span>
          <span>Founder & CEO</span>
          <span className="mx-3 opacity-40">|</span>
          <span>www.oranged.gr</span>
        </motion.div>
      </div>
    </motion.div>
  );
}