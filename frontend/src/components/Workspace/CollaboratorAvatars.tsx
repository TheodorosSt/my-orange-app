/* ===================================
   ORANGE — Collaborator Avatars
   Live presence indicators.
   =================================== */

import { motion, AnimatePresence } from 'framer-motion';
import type { Collaborator } from '@/hooks/useCollaboration';

interface CollaboratorAvatarsProps {
  collaborators: Collaborator[];
}

export function CollaboratorAvatars({ collaborators }: CollaboratorAvatarsProps) {
  if (collaborators.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      <AnimatePresence>
        {collaborators.slice(0, 5).map((collab) => (
          <motion.div
            key={collab.userId}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="relative group"
          >
            {/* Avatar */}
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[0.6rem] font-bold text-white border-2 border-orange-bg-secondary cursor-default"
              style={{ backgroundColor: collab.color }}
              title={collab.fullName}
            >
              {getInitials(collab.fullName)}
            </div>

            {/* Online indicator */}
            <div
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-orange-bg-secondary"
              style={{ backgroundColor: '#2ecc71' }}
            />

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-orange-bg-elevated border border-orange-border rounded-md text-xs text-orange-text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {collab.fullName}
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-orange-bg-elevated border-r border-b border-orange-border rotate-45 -mt-1" />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {collaborators.length > 5 && (
        <div className="w-7 h-7 rounded-full bg-orange-bg-tertiary border border-orange-border flex items-center justify-center text-[0.6rem] font-medium text-orange-text-muted">
          +{collaborators.length - 5}
        </div>
      )}

      <span className="text-[0.6rem] text-orange-text-muted ml-1">
        {collaborators.length} online
      </span>
    </div>
  );
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}