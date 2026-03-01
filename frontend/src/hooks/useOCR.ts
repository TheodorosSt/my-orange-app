/* ===================================
   ORANGE — OCR Hook
   =================================== */

import { useCallback } from 'react';
import { useAppStore } from '@/stores/appStore';
import { ocrApi } from '@/services/api';
import toast from 'react-hot-toast';

export function useOCR() {
  const {
    ocrResult,
    ocrLoading,
    uploadedFile,
    setOCRResult,
    setOCRLoading,
    updateStats,
    setEditorTab,
  } = useAppStore();

  const processDocument = useCallback(async () => {
    if (!uploadedFile) {
      toast.error('Παρακαλώ φορτώστε ένα αρχείο πρώτα');
      return;
    }

    setOCRLoading(true);
    setOCRResult(null);

    const toastId = toast.loading('Αναγνώριση κειμένου...');

    try {
      const result = await ocrApi.processDocument(uploadedFile.file);

      setOCRResult(result);
      setEditorTab('ocr-text');

      updateStats({
        documentsProcessed: useAppStore.getState().stats.documentsProcessed + 1,
        documentsTotal: useAppStore.getState().stats.documentsTotal + 1,
        wordCount: result.wordCount,
        avgProcessingTime: result.processingTimeMs,
        successRate: Math.round(result.confidence * 100),
      });

      toast.success(
        `Ολοκληρώθηκε! ${result.wordCount} λέξεις, ${(result.confidence * 100).toFixed(1)}% ακρίβεια`,
        { id: toastId },
      );
    } catch {
      toast.error('Σφάλμα κατά την αναγνώριση', { id: toastId });
    } finally {
      setOCRLoading(false);
    }
  }, [uploadedFile, setOCRResult, setOCRLoading, updateStats, setEditorTab]);

  return {
    ocrResult,
    ocrLoading,
    processDocument,
  };
}