/* ===================================
   ORANGE — Service Configuration
   =================================== */

import type { ServiceConfig } from '@/types';

export const SERVICES: Record<string, ServiceConfig> = {
  ocr: {
    id: 'ocr',
    title: 'Ψηφιοποίηση & OCR',
    titleEn: 'Digitize & OCR',
    badge: 'Digitize',
    description: 'Σάρωση & αναγνώριση κειμένου',
    icon: '/assets/icon-ocr.svg',
  },
  translate: {
    id: 'translate',
    title: 'Μετάφραση - Επιμέλεια',
    titleEn: 'Translation & Editing',
    badge: 'Translate',
    description: 'Μετάφραση & γλωσσική επιμέλεια',
    icon: '/assets/icon-translate.svg',
  },
  audiobook: {
    id: 'audiobook',
    title: 'Παραγωγή Audiobook',
    titleEn: 'Audiobook Production',
    badge: 'Narrate',
    description: 'Text-to-speech & ηχητικά βιβλία',
    icon: '/assets/icon-audiobook.svg',
  },
  vault: {
    id: 'vault',
    title: 'Ψηφιακή Θυρίδα',
    titleEn: 'Digital Vault',
    badge: 'Vault',
    description: 'Ασφαλής αποθήκευση εγγράφων',
    icon: '/assets/icon-vault.svg',
  },
};

export const SERVICE_ORDER: string[] = ['ocr', 'translate', 'audiobook', 'vault'];