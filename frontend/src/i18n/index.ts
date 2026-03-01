/* ===================================
   ORANGE — Internationalization System
   Lightweight, type-safe i18n.
   =================================== */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Locale = 'el' | 'en' | 'de' | 'fr';

type TranslationKey = keyof typeof translations.el;

// ===================================
// Translations
// ===================================

const translations = {
  el: {
    // Auth
    'auth.welcome': 'Καλωσήρθατε',
    'auth.login': 'Σύνδεση',
    'auth.signup': 'Εγγραφή',
    'auth.email': 'Email',
    'auth.password': 'Κωδικός',
    'auth.confirmPassword': 'Επιβεβαίωση Κωδικού',
    'auth.fullName': 'Ονοματεπώνυμο',
    'auth.forgotPassword': 'Ξεχάσατε τον κωδικό;',
    'auth.createAccount': 'Δημιουργία Λογαριασμού',
    'auth.haveAccount': 'Έχετε ήδη λογαριασμό;',
    'auth.signOut': 'Αποσύνδεση',

    // Services
    'service.ocr': 'Ψηφιοποίηση & OCR',
    'service.translate': 'Μετάφραση - Επιμέλεια',
    'service.audiobook': 'Παραγωγή Audiobook',
    'service.vault': 'Ψηφιακή Θυρίδα',

    // Actions
    'action.upload': 'Φόρτωση',
    'action.start': 'Εκκίνηση',
    'action.translate': 'Μετάφραση',
    'action.generate': 'Δημιουργία',
    'action.download': 'Λήψη',
    'action.delete': 'Διαγραφή',
    'action.cancel': 'Ακύρωση',
    'action.save': 'Αποθήκευση',
    'action.copy': 'Αντιγραφή',
    'action.export': 'Εξαγωγή',
    'action.back': 'Πίσω',
    'action.next': 'Επόμενο',
    'action.settings': 'Ρυθμίσεις',

    // Workspace
    'workspace.sourcePanel': 'Πρωτότυπο Έγγραφο',
    'workspace.dropFile': 'Σύρετε ένα αρχείο εδώ ή πατήστε «Φόρτωση»',
    'workspace.ocrText': 'Αναγνωρισμένο Κείμενο',
    'workspace.translation': 'Μετάφραση',
    'workspace.documents': 'Έγγραφα',
    'workspace.words': 'Λέξεις',
    'workspace.avgTime': 'Μ.Ο. Χρόνου',
    'workspace.accuracy': 'Επιτυχία',

    // Vault
    'vault.title': 'Ψηφιακή Θυρίδα',
    'vault.search': 'Αναζήτηση εγγράφων...',
    'vault.noDocuments': 'Δεν υπάρχουν έγγραφα ακόμα',
    'vault.all': 'Όλα',

    // Audiobook
    'audiobook.voice': 'Φωνή',
    'audiobook.speed': 'Ταχύτητα',
    'audiobook.generate': 'Δημιουργία Audiobook',
    'audiobook.noText': 'Πρώτα κάντε OCR ή μετάφραση ενός κειμένου',

    // Batch
    'batch.title': 'Batch Processing',
    'batch.pipeline': 'Pipeline',
    'batch.start': 'Εκκίνηση Batch',

    // Billing
    'billing.plans': 'Πλάνα',
    'billing.usage': 'Χρήση',
    'billing.managePlan': 'Διαχείριση Πλάνου',
    'billing.freeTrial': 'Ξεκινήστε Δωρεάν — 14 ημέρες',

    // Footer
    'footer.founder': 'ΘΕΟΔΩΡΟΣ ΣΤΟΓΙΑΝΝΟΥ',
    'footer.role': 'Founder & CEO',

    // Misc
    'misc.loading': 'Φόρτωση...',
    'misc.error': 'Σφάλμα',
    'misc.success': 'Επιτυχία',
    'misc.copied': 'Αντιγράφηκε στο πρόχειρο',
  },

  en: {
    'auth.welcome': 'Welcome',
    'auth.login': 'Sign In',
    'auth.signup': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.fullName': 'Full Name',
    'auth.forgotPassword': 'Forgot password?',
    'auth.createAccount': 'Create Account',
    'auth.haveAccount': 'Already have an account?',
    'auth.signOut': 'Sign Out',

    'service.ocr': 'Digitize & OCR',
    'service.translate': 'Translation & Editing',
    'service.audiobook': 'Audiobook Production',
    'service.vault': 'Digital Vault',

    'action.upload': 'Upload',
    'action.start': 'Start',
    'action.translate': 'Translate',
    'action.generate': 'Generate',
    'action.download': 'Download',
    'action.delete': 'Delete',
    'action.cancel': 'Cancel',
    'action.save': 'Save',
    'action.copy': 'Copy',
    'action.export': 'Export',
    'action.back': 'Back',
    'action.next': 'Next',
    'action.settings': 'Settings',

    'workspace.sourcePanel': 'Source Document',
    'workspace.dropFile': 'Drop a file here or click "Upload"',
    'workspace.ocrText': 'Recognized Text',
    'workspace.translation': 'Translation',
    'workspace.documents': 'Documents',
    'workspace.words': 'Words',
    'workspace.avgTime': 'Avg Time',
    'workspace.accuracy': 'Accuracy',

    'vault.title': 'Digital Vault',
    'vault.search': 'Search documents...',
    'vault.noDocuments': 'No documents yet',
    'vault.all': 'All',

    'audiobook.voice': 'Voice',
    'audiobook.speed': 'Speed',
    'audiobook.generate': 'Generate Audiobook',
    'audiobook.noText': 'First run OCR or translate a text',

    'batch.title': 'Batch Processing',
    'batch.pipeline': 'Pipeline',
    'batch.start': 'Start Batch',

    'billing.plans': 'Plans',
    'billing.usage': 'Usage',
    'billing.managePlan': 'Manage Plan',
    'billing.freeTrial': 'Start Free — 14 days',

    'footer.founder': 'THEODOROS STOGIANNOY',
    'footer.role': 'Founder & CEO',

    'misc.loading': 'Loading...',
    'misc.error': 'Error',
    'misc.success': 'Success',
    'misc.copied': 'Copied to clipboard',
  },

  de: {
    'auth.welcome': 'Willkommen',
    'auth.login': 'Anmelden',
    'auth.signup': 'Registrieren',
    'auth.email': 'E-Mail',
    'auth.password': 'Passwort',
    'auth.confirmPassword': 'Passwort bestätigen',
    'auth.fullName': 'Vollständiger Name',
    'auth.forgotPassword': 'Passwort vergessen?',
    'auth.createAccount': 'Konto erstellen',
    'auth.haveAccount': 'Bereits ein Konto?',
    'auth.signOut': 'Abmelden',

    'service.ocr': 'Digitalisierung & OCR',
    'service.translate': 'Übersetzung & Lektorat',
    'service.audiobook': 'Hörbuch-Produktion',
    'service.vault': 'Digitaler Tresor',

    'action.upload': 'Hochladen',
    'action.start': 'Starten',
    'action.translate': 'Übersetzen',
    'action.generate': 'Generieren',
    'action.download': 'Herunterladen',
    'action.delete': 'Löschen',
    'action.cancel': 'Abbrechen',
    'action.save': 'Speichern',
    'action.copy': 'Kopieren',
    'action.export': 'Exportieren',
    'action.back': 'Zurück',
    'action.next': 'Weiter',
    'action.settings': 'Einstellungen',

    'workspace.sourcePanel': 'Quelldokument',
    'workspace.dropFile': 'Datei hierher ziehen oder "Hochladen" klicken',
    'workspace.ocrText': 'Erkannter Text',
    'workspace.translation': 'Übersetzung',
    'workspace.documents': 'Dokumente',
    'workspace.words': 'Wörter',
    'workspace.avgTime': 'Ø Zeit',
    'workspace.accuracy': 'Genauigkeit',

    'vault.title': 'Digitaler Tresor',
    'vault.search': 'Dokumente suchen...',
    'vault.noDocuments': 'Noch keine Dokumente',
    'vault.all': 'Alle',

    'audiobook.voice': 'Stimme',
    'audiobook.speed': 'Geschwindigkeit',
    'audiobook.generate': 'Hörbuch erstellen',
    'audiobook.noText': 'Zuerst OCR oder Übersetzung durchführen',

    'batch.title': 'Stapelverarbeitung',
    'batch.pipeline': 'Pipeline',
    'batch.start': 'Batch starten',

    'billing.plans': 'Pläne',
    'billing.usage': 'Nutzung',
    'billing.managePlan': 'Plan verwalten',
    'billing.freeTrial': 'Kostenlos starten — 14 Tage',

    'footer.founder': 'THEODOROS STOGIANNOY',
    'footer.role': 'Gründer & CEO',

    'misc.loading': 'Laden...',
    'misc.error': 'Fehler',
    'misc.success': 'Erfolg',
    'misc.copied': 'In Zwischenablage kopiert',
  },

  fr: {
    'auth.welcome': 'Bienvenue',
    'auth.login': 'Connexion',
    'auth.signup': 'Inscription',
    'auth.email': 'E-mail',
    'auth.password': 'Mot de passe',
    'auth.confirmPassword': 'Confirmer le mot de passe',
    'auth.fullName': 'Nom complet',
    'auth.forgotPassword': 'Mot de passe oublié?',
    'auth.createAccount': 'Créer un compte',
    'auth.haveAccount': 'Vous avez déjà un compte?',
    'auth.signOut': 'Déconnexion',

    'service.ocr': 'Numérisation & OCR',
    'service.translate': 'Traduction & Édition',
    'service.audiobook': 'Production de Livre Audio',
    'service.vault': 'Coffre-fort Numérique',

    'action.upload': 'Télécharger',
    'action.start': 'Démarrer',
    'action.translate': 'Traduire',
    'action.generate': 'Générer',
    'action.download': 'Télécharger',
    'action.delete': 'Supprimer',
    'action.cancel': 'Annuler',
    'action.save': 'Enregistrer',
    'action.copy': 'Copier',
    'action.export': 'Exporter',
    'action.back': 'Retour',
    'action.next': 'Suivant',
    'action.settings': 'Paramètres',

    'workspace.sourcePanel': 'Document Source',
    'workspace.dropFile': 'Déposez un fichier ici ou cliquez sur «Télécharger»',
    'workspace.ocrText': 'Texte Reconnu',
    'workspace.translation': 'Traduction',
    'workspace.documents': 'Documents',
    'workspace.words': 'Mots',
    'workspace.avgTime': 'Temps Moy.',
    'workspace.accuracy': 'Précision',

    'vault.title': 'Coffre-fort Numérique',
    'vault.search': 'Rechercher des documents...',
    'vault.noDocuments': 'Pas encore de documents',
    'vault.all': 'Tous',

    'audiobook.voice': 'Voix',
    'audiobook.speed': 'Vitesse',
    'audiobook.generate': 'Générer le Livre Audio',
    'audiobook.noText': 'D\'abord faire OCR ou traduction',

    'batch.title': 'Traitement par Lots',
    'batch.pipeline': 'Pipeline',
    'batch.start': 'Démarrer le Lot',

    'billing.plans': 'Plans',
    'billing.usage': 'Utilisation',
    'billing.managePlan': 'Gérer le Plan',
    'billing.freeTrial': 'Commencez Gratuitement — 14 jours',

    'footer.founder': 'THEODOROS STOGIANNOY',
    'footer.role': 'Fondateur & CEO',

    'misc.loading': 'Chargement...',
    'misc.error': 'Erreur',
    'misc.success': 'Succès',
    'misc.copied': 'Copié dans le presse-papiers',
  },
} as const;

// ===================================
// Store
// ===================================

interface I18nState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

export const useI18n = create<I18nState>()(
  persist(
    (set, get) => ({
      locale: 'el',

      setLocale: (locale) => set({ locale }),

      t: (key) => {
        const locale = get().locale;
        const dict = translations[locale];
        return (dict as Record<string, string>)[key] || key;
      },
    }),
    { name: 'orange-locale' },
  ),
);

// ===================================
// Language Options
// ===================================

export const LOCALE_OPTIONS: { code: Locale; name: string; flag: string }[] = [
  { code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];