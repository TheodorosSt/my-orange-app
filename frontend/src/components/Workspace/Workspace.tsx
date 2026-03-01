/* ===================================
   ORANGE — The Unified Workspace (Screen 2)
   =================================== */

import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { WorkspaceHeader } from './WorkspaceHeader';
import { WorkspaceContent } from './WorkspaceContent';
import { StatsFooter } from './StatsFooter';

export function Workspace() {
  return (
    <motion.div
      className="fixed inset-0 flex flex-row"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <WorkspaceHeader />
        <WorkspaceContent />
        <StatsFooter />
      </main>
    </motion.div>
  );
}