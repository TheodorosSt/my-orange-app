/* ===================================
   ORANGE — Vault Hook
   =================================== */

import { useCallback, useState } from 'react';
import { vaultApi } from '@/services/api';
import toast from 'react-hot-toast';
import type { VaultDocument, ServiceId } from '@/types';

export function useVault() {
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const loadDocuments = useCallback(
    async (page = 1, service?: ServiceId) => {
      setLoading(true);
      try {
        const result = await vaultApi.listDocuments(page, 20, service);
        setDocuments(result.documents);
        setTotal(result.total);
      } catch {
        toast.error('Σφάλμα φόρτωσης εγγράφων');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const uploadToVault = useCallback(
    async (file: File, serviceOrigin: ServiceId = 'ocr') => {
      const toastId = toast.loading('Αποθήκευση στη θυρίδα...');
      try {
        const doc = await vaultApi.upload(file, serviceOrigin);
        setDocuments((prev) => [doc, ...prev]);
        setTotal((prev) => prev + 1);
        toast.success(`"${doc.filename}" αποθηκεύτηκε`, { id: toastId });
        return doc;
      } catch {
        toast.error('Σφάλμα αποθήκευσης', { id: toastId });
        return null;
      }
    },
    [],
  );

  const downloadDocument = useCallback(async (docId: string) => {
    try {
      const url = await vaultApi.getDownloadUrl(docId);
      window.open(url, '_blank');
    } catch {
      toast.error('Σφάλμα λήψης');
    }
  }, []);

  const deleteDocument = useCallback(async (docId: string) => {
    const toastId = toast.loading('Διαγραφή...');
    try {
      await vaultApi.deleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      setTotal((prev) => prev - 1);
      toast.success('Διαγράφηκε', { id: toastId });
    } catch {
      toast.error('Σφάλμα διαγραφής', { id: toastId });
    }
  }, []);

  return {
    documents,
    loading,
    total,
    loadDocuments,
    uploadToVault,
    downloadDocument,
    deleteDocument,
  };
}