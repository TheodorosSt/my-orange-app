/* ===================================
   ORANGE Platform — API Client (Updated)
   Auto-injects Supabase JWT token.
   =================================== */

import axios, { type AxiosInstance, type AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { supabase } from '@/services/auth';

// ===================================
// Client Setup
// ===================================

const api: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 120_000,
  headers: { Accept: 'application/json' },
});

// Request interceptor — attach JWT
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }

  return config;
});

// Response interceptor — error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string; error?: string }>) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.detail ||
      error.response?.data?.error ||
      error.message;

    if (status === 401) {
      toast.error('Η σύνδεσή σας έχει λήξει. Παρακαλώ συνδεθείτε ξανά.');
      // Force sign out
      supabase.auth.signOut();
    } else if (status === 413) {
      toast.error('Το αρχείο είναι πολύ μεγάλο. Μέγιστο: 50MB');
    } else if (status === 415) {
      toast.error('Μη υποστηριζόμενος τύπος αρχείου');
    } else if (status === 429) {
      toast.error('Υπερβολικά αιτήματα. Δοκιμάστε ξανά σε λίγο.');
    } else if (status && status >= 500) {
      toast.error('Σφάλμα διακομιστή. Δοκιμάστε ξανά.');
    } else {
      toast.error(message || 'Unexpected error');
    }

    return Promise.reject(error);
  },
);

export default api;

// ===================================
// Re-export all service APIs
// (same as before, using this api instance)
// ===================================

export { ocrApi } from './ocrApi';
export { translateApi } from './translateApi';
export { audiobookApi } from './audiobookApi';
export { vaultApi } from './vaultApi';
export { healthApi } from './healthApi';