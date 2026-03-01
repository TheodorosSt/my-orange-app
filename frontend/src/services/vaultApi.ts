import api from './api';
import type { VaultDocument, ServiceId } from '@/types';

export const vaultApi = {
  async upload(file: File, serviceOrigin: string = 'ocr'): Promise<VaultDocument> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post(`/vault/upload?service_origin=${serviceOrigin}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const doc = data.document;
    return {
      id: doc.id, filename: doc.filename, mimeType: doc.mime_type,
      sizeBytes: doc.size_bytes, serviceOrigin: doc.service_origin,
      createdAt: doc.created_at, updatedAt: doc.updated_at, metadata: doc.metadata || {},
    };
  },

  async listDocuments(page = 1, perPage = 20, service?: string) {
    const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
    if (service) params.set('service', service);
    const { data } = await api.get(`/vault/documents?${params}`);
    return {
      documents: data.documents.map((doc: Record<string, unknown>) => ({
        id: doc.id, filename: doc.filename, mimeType: doc.mime_type,
        sizeBytes: doc.size_bytes, serviceOrigin: doc.service_origin,
        createdAt: doc.created_at, updatedAt: doc.updated_at, metadata: doc.metadata || {},
      })),
      total: data.total,
    };
  },

  async getDownloadUrl(docId: string): Promise<string> {
    const { data } = await api.get(`/vault/documents/${docId}/download`);
    return data.download_url;
  },

  async deleteDocument(docId: string): Promise<void> {
    await api.delete(`/vault/documents/${docId}`);
  },
};