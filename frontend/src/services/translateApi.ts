import api from './api';
import type { TranslationRequest, TranslationResult, SupportedLanguage } from '@/types';

export const translateApi = {
  async translateText(request: TranslationRequest): Promise<TranslationResult> {
    const { data } = await api.post('/translate/text', {
      text: request.text,
      source_lang: request.sourceLang || null,
      target_lang: request.targetLang,
    });

    return {
      originalText: data.original_text,
      translatedText: data.translated_text,
      sourceLang: data.source_lang,
      targetLang: data.target_lang,
      wordCount: data.word_count,
      processingTimeMs: data.processing_time_ms,
    };
  },

  async getLanguages(): Promise<{ source: SupportedLanguage[]; target: SupportedLanguage[] }> {
    const { data } = await api.get('/translate/languages');
    return {
      source: data.source_languages.map((l: Record<string, unknown>) => ({
        code: l.code, name: l.name, supportsFormality: l.supports_formality,
      })),
      target: data.target_languages.map((l: Record<string, unknown>) => ({
        code: l.code, name: l.name, supportsFormality: l.supports_formality,
      })),
    };
  },

  async getUsage() {
    const { data } = await api.get('/translate/usage');
    return { characterCount: data.character_count, characterLimit: data.character_limit, limitReached: data.limit_reached };
  },
};