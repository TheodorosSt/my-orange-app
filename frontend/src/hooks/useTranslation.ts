/* ===================================
   ORANGE — Translation Hook
   =================================== */

import { useCallback, useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { translateApi } from '@/services/api';
import toast from 'react-hot-toast';
import type { SupportedLanguage } from '@/types';

export function useTranslation() {
  const {
    ocrResult,
    translationResult,
    translationLoading,
    setTranslationResult,
    setTranslationLoading,
    setEditorTab,
  } = useAppStore();

  const [targetLang, setTargetLang] = useState('EN-GB');
  const [languages, setLanguages] = useState<SupportedLanguage[]>([]);

  const translate = useCallback(
    async (text?: string, target?: string) => {
      const sourceText = text || ocrResult?.text;
      if (!sourceText) {
        toast.error('Δεν υπάρχει κείμενο για μετάφραση');
        return;
      }

      setTranslationLoading(true);

      const toastId = toast.loading('Μετάφραση σε εξέλιξη...');

      try {
        const result = await translateApi.translateText({
          text: sourceText,
          targetLang: target || targetLang,
        });

        setTranslationResult(result);
        setEditorTab('translation');

        toast.success(
          `Μεταφράστηκαν ${result.wordCount} λέξεις (${result.processingTimeMs}ms)`,
          { id: toastId },
        );
      } catch {
        toast.error('Σφάλμα κατά τη μετάφραση', { id: toastId });
      } finally {
        setTranslationLoading(false);
      }
    },
    [ocrResult, targetLang, setTranslationResult, setTranslationLoading, setEditorTab],
  );

  const loadLanguages = useCallback(async () => {
    try {
      const { target } = await translateApi.getLanguages();
      setLanguages(target);
    } catch {
      // Silently fail — languages are optional
    }
  }, []);

  return {
    translationResult,
    translationLoading,
    targetLang,
    setTargetLang,
    languages,
    translate,
    loadLanguages,
  };
}