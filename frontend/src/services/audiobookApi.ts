import api from './api';
import type { AudiobookRequest, Voice } from '@/types';

export const audiobookApi = {
  async generate(request: AudiobookRequest): Promise<Blob> {
    const { data } = await api.post('/audiobook/generate', {
      text: request.text,
      voice_id: request.voiceId || null,
      output_format: request.outputFormat || 'mp3_44100_128',
      speed: request.speed || 1.0,
    }, { responseType: 'blob' });
    return data;
  },

  async preview(text: string, voiceId?: string): Promise<Blob> {
    const { data } = await api.post('/audiobook/preview', {
      text: text.slice(0, 500), voice_id: voiceId || null,
    }, { responseType: 'blob' });
    return data;
  },

  async getVoices(): Promise<Voice[]> {
    const { data } = await api.get('/audiobook/voices');
    return data.voices.map((v: Record<string, unknown>) => ({
      voiceId: v.voice_id, name: v.name, language: v.language,
      previewUrl: v.preview_url, category: v.category,
    }));
  },
};