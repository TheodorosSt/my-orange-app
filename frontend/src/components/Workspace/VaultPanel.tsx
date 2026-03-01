/* ===================================
   ORANGE — Vault Manager Panel
   Secure document list + management.
   =================================== */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Download,
  Trash2,
  Search,
  Filter,
  Clock,
  HardDrive,
  Shield,
  Loader2,
} from 'lucide-react';
import { useVault } from '@/hooks/useVault';
import { PremiumButton } from '@/components/shared/PremiumButton';
import clsx from 'clsx';
import type { ServiceId, VaultDocument } from '@/types';

const SERVICE_LABELS: Record<string, { label: string; color: string }> = {
  ocr: { label: 'OCR', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  translate: { label: 'Μετάφραση', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  audiobook: { label: 'Audiobook', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  vault: { label: 'Θυρίδα', color: 'text-orange-gold-mid bg-orange-gold-mid/10 border-orange-border-gold' },
};

export function VaultPanel() {
  const { documents, loading, total, loadDocuments, downloadDocument, deleteDocument } = useVault();
  const [filter, setFilter] = useState<ServiceId | 'all'>('all');
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments(1, filter === 'all' ? undefined : filter);
  }, [filter, loadDocuments]);

  const filtered = documents.filter((doc) =>
    doc.filename.toLowerCase().includes(search.toLowerCase()),
  );

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('el-GR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = async (docId: string) => {
    await deleteDocument(docId);
    setDeleteConfirm(null);
  };

  return (
    <div className="h-full flex flex-col bg-orange-bg-primary">
      {/* Header */}
      <div className="p-6 border-b border-orange-border bg-orange-bg-secondary space-y-4">
        {/* Stats */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-orange-gold-mid" />
            <span className="text-sm font-medium text-orange-text-primary">
              Ψηφιακή Θυρίδα
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-orange-text-muted">
            <HardDrive size={12} />
            <span>{total} έγγραφα</span>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-text-muted" />
            <input
              type="text"
              placeholder="Αναζήτηση εγγράφων..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-orange-bg-tertiary border border-orange-border rounded-lg pl-9 pr-4 py-2 text-sm text-orange-text-primary placeholder:text-orange-text-muted/50 focus:outline-none focus:ring-2 focus:ring-orange-gold-mid/30 focus:border-orange-gold-mid/50"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter size={14} className="text-orange-text-muted" />
            {(['all', 'ocr', 'translate', 'audiobook'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={clsx(
                  'px-2.5 py-1.5 text-xs rounded-md border transition-all',
                  filter === f
                    ? 'border-orange-gold-mid bg-orange-gold-mid/10 text-orange-gold-mid'
                    : 'border-orange-border text-orange-text-muted hover:border-orange-border-gold',
                )}
              >
                {f === 'all' ? 'Όλα' : SERVICE_LABELS[f]?.label || f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-auto scrollbar-thin">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={24} className="animate-spin text-orange-gold-mid" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <FileText size={48} className="text-orange-text-muted/30 mb-4" />
            <p className="text-sm text-orange-text-muted">
              {search ? 'Δεν βρέθηκαν αποτελέσματα' : 'Δεν υπάρχουν έγγραφα ακόμα'}
            </p>
            <p className="text-xs text-orange-text-muted/60 mt-1">
              Τα έγγραφα που επεξεργάζεστε αποθηκεύονται εδώ αυτόματα
            </p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="divide-y divide-orange-border">
              {filtered.map((doc, idx) => (
                <DocumentRow
                  key={doc.id}
                  doc={doc}
                  index={idx}
                  isDeleteConfirm={deleteConfirm === doc.id}
                  onDownload={() => downloadDocument(doc.id)}
                  onDeleteClick={() => setDeleteConfirm(doc.id)}
                  onDeleteConfirm={() => handleDelete(doc.id)}
                  onDeleteCancel={() => setDeleteConfirm(null)}
                  formatSize={formatSize}
                  formatDate={formatDate}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

// ===================================
// Document Row Sub-component
// ===================================

interface DocumentRowProps {
  doc: VaultDocument;
  index: number;
  isDeleteConfirm: boolean;
  onDownload: () => void;
  onDeleteClick: () => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
  formatSize: (bytes: number) => string;
  formatDate: (date: string) => string;
}

function DocumentRow({
  doc,
  index,
  isDeleteConfirm,
  onDownload,
  onDeleteClick,
  onDeleteConfirm,
  onDeleteCancel,
  formatSize,
  formatDate,
}: DocumentRowProps) {
  const serviceInfo = SERVICE_LABELS[doc.serviceOrigin] || SERVICE_LABELS.vault;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.03 }}
      className="flex items-center gap-4 px-6 py-4 hover:bg-orange-bg-secondary/50 transition-colors group"
    >
      {/* Icon */}
      <div className="w-10 h-10 rounded-lg bg-orange-bg-tertiary border border-orange-border flex items-center justify-center flex-shrink-0">
        <FileText size={18} className="text-orange-text-muted" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-orange-text-primary truncate">
          {doc.filename}
        </p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className={clsx('text-[0.65rem] font-medium px-1.5 py-0.5 rounded border', serviceInfo.color)}>
            {serviceInfo.label}
          </span>
          <span className="text-xs text-orange-text-muted flex items-center gap-1">
            <HardDrive size={10} />
            {formatSize(doc.sizeBytes)}
          </span>
          <span className="text-xs text-orange-text-muted flex items-center gap-1">
            <Clock size={10} />
            {formatDate(doc.createdAt)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {isDeleteConfirm ? (
          <div className="flex items-center gap-1.5">
            <PremiumButton variant="ghost" size="sm" onClick={onDeleteCancel}>
              Άκυρο
            </PremiumButton>
            <PremiumButton
              variant="secondary"
              size="sm"
              className="!border-red-500/30 !text-red-400 hover:!bg-red-500/10"
              onClick={onDeleteConfirm}
            >
              Διαγραφή
            </PremiumButton>
          </div>
        ) : (
          <>
            <button
              onClick={onDownload}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-orange-text-muted hover:text-orange-gold-mid hover:bg-orange-bg-tertiary transition-all"
              title="Λήψη"
            >
              <Download size={15} />
            </button>
            <button
              onClick={onDeleteClick}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-orange-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Διαγραφή"
            >
              <Trash2 size={15} />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}