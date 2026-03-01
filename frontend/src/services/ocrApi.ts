import api from './api';
import type { OCRResult } from '@/types';

export const ocrApi = {
  async processDocument(file: File): Promise<OCRResult> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post('/ocr/process', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60_000,
    });

    return {
      text: data.text,
      confidence: data.confidence,
      language: data.language,
      wordCount: data.word_count,
      processingTimeMs: data.processing_time_ms,
      pages: data.pages,
    };
  },
};