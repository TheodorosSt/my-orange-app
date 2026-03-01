/* ===================================
   ORANGE — Splash Screen
   Shown during auth initialization.
   =================================== */

import { motion } from 'framer-motion';

export function SplashScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-orange-bg-primary">
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.img
          src="/assets/logo.svg"
          alt="ORANGE"
          className="w-32 mx-auto mb-6"
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [0.98, 1.02, 0.98],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="flex items-center justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-orange-gold-mid"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}