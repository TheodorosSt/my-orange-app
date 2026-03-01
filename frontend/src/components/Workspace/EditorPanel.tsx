/* ===================================
   ORANGE — Editor Panel
   OCR text + Translation tabs.
   =================================== */

import { motion } from 'framer-motion';
import { Copy, Download, Languages, Zap } from 'lucide-react';
import clsx from 'clsx';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/hooks/useTranslation';
import { PremiumButton } from '@/components/shared/PremiumButton';
import toast from 'react-hot-toast';
import type { EditorTab } from '@/types';

export function EditorPanel() {
  const { activeEditorTab, setEditorTab, ocrResult } = useAppStore();
  const { translationResult, translationLoading, translate } = useTranslation();

  const tabs: { id: EditorTab; label: string; emoji: string }[] = [
    { id: 'ocr-text', label: 'Αναγνωρισμένο Κείμενο', emoji: '📝' },
    { id: 'translation', label: 'Μετάφραση', emoji: '🌐' },
  ];

  const handleCopy = () => {
    const text =
      activeEditorTab === 'translation'
        ? translationResult?.translatedText
        : ocrResult?.text;

    if (text) {
      navigator.clipboard.writeText(text);
      toast.success('Αντιγράφηκε στο πρόχειρο');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tabs Header */}
      <div className="h-10 min-h-[40px] flex items-center justify-between px-4 bg-orange-bg-tertiary border-b border-orange-border">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setEditorTab(tab.id)}
              className={clsx(
                'px-3 py-2 text-xs font-medium transition-all duration-200 border-b-2',
                activeEditorTab === tab.id
                  ? 'text-orange-gold-mid border-orange-gold-mid'
                  : 'text-orange-text-muted border-transparent hover:text-orange-text-secondary',
              )}
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1">
          <button
            onClick={handleCopy}
            className="w-7 h-7 rounded-md flex items-center justify-center text-orange-text-muted hover:bg-orange-bg-elevated hover:text-orange-text-secondary transition-all"
            title="Αντιγραφή"
          >
            <Copy size={14} />
          </button>
          <button
            className="w-7 h-7 rounded-md flex items-center justify-center text-orange-text-muted hover:bg-orange-bg-elevated hover:text-orange-text-secondary transition-all"
            title="Εξαγωγή"
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-orange-bg-primary">
        {/* OCR Tab */}
        {activeEditorTab === 'ocr-text' && (
          <motion.div
            key="ocr"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 overflow-auto scrollbar-thin"
          >
            <div
              className="p-6 font-mono text-sm leading-relaxed outline-none min-h-full text-orange-text-primary whitespace-pre-wrap"
              contentEditable
              suppressContentEditableWarning
              spellCheck={false}
            >
              {ocrResult?.text || (
                <span className="text-orange-text-muted italic">
                  Το αναγνωρισμένο κείμενο θα εμφανιστεί εδώ μετά την επεξεργασία...
                </span>
              )}
            </div>
          </motion.div>
        )}

        {/* Translation Tab */}
        {activeEditorTab === 'translation' && (
          <motion.div
            key="translation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Language selector bar */}
            <div className="flex items-center justify-between px-6 py-3 bg-orange-bg-secondary border-b border-orange-border">
              <div className="flex items-center gap-2 text-orange-text-muted">
                <span className="text-xs font-semibold px-2 py-1 bg-orange-bg-tertiary border border-orange-border rounded-md text-orange-text-secondary">
                  {ocrResult?.language?.toUpperCase() || 'EL'}
                </span>
                <Languages size={16} />
                <span className="text-xs font-semibold px-2 py-1 bg-orange-bg-tertiary border border-orange-border rounded-md text-orange-text-secondary">
                  EN
                </span>
              </div>

              <PremiumButton
                variant="secondary"
                size="sm"
                icon={<Zap size={14} />}
                onClick={() => translate()}
                loading={translationLoading}
              >
                Μετάφραση
              </PremiumButton>
            </div>

            {/* Translated text */}
            <div className="flex-1 overflow-auto scrollbar-thin">
              <div
                className="p-6 font-mono text-sm leading-relaxed outline-none min-h-full whitespace-pre-wrap"
                contentEditable
                suppressContentEditableWarning
                spellCheck={false}
                style={{ color: '#a8c8b8' }}
              >
                {translationResult?.translatedText || (
                  <span className="text-orange-text-muted italic">
                    Η μετάφραση θα εμφανιστεί εδώ...
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}