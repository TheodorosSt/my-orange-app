/* ===================================
   ORANGE Platform — Type Definitions
   =================================== */

// ===================================
// Services
// ===================================

export type ServiceId = 'ocr' | 'translate' | 'audiobook' | 'vault';

export interface ServiceConfig {
  id: ServiceId;
  title: string;
  titleEn: string;
  badge: string;
  description: string;
  icon: string;
}

// ===================================
// OCR
// ===================================

export interface OCRResult {
  text: string;
  confidence: number;
  language: string;
  wordCount: number;
  processingTimeMs: number;
  pages: number;
}

export interface OCRBlock {
  text: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// ===================================
// Translation
// ===================================

export interface TranslationRequest {
  text: string;
  sourceLang?: string;
  targetLang: string;
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  wordCount: number;
  processingTimeMs: number;
}

export interface SupportedLanguage {
  code: string;
  name: string;
  supportsFormality: boolean;
}

// ===================================
// Audiobook
// ===================================

export type AudioFormat = 'mp3_44100_128' | 'pcm_44100' | 'ogg_vorbis';

export interface AudiobookRequest {
  text: string;
  voiceId?: string;
  outputFormat?: AudioFormat;
  speed?: number;
}

export interface AudiobookResult {
  audioUrl: string;
  durationSeconds: number;
  format: string;
  voiceId: string;
  characterCount: number;
  processingTimeMs: number;
}

export interface Voice {
  voiceId: string;
  name: string;
  language: string;
  previewUrl?: string;
  category: string;
}

// ===================================
// Vault
// ===================================

export interface VaultDocument {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  serviceOrigin: ServiceId;
  createdAt: string;
  updatedAt: string;
  downloadUrl?: string;
  metadata: Record<string, unknown>;
}

// ===================================
// App State
// ===================================

export type Screen = 'launchpad' | 'workspace';

export type EditorTab = 'ocr-text' | 'translation';

export interface AppStats {
  documentsProcessed: number;
  documentsTotal: number;
  wordCount: number;
  avgProcessingTime: number;
  successRate: number;
}

// ===================================
// File Upload
// ===================================

export interface UploadedFile {
  file: File;
  preview?: string;
  name: string;
  size: number;
  type: string;
}