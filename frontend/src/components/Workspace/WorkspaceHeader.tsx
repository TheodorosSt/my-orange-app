/* ===================================
   ORANGE — Workspace Header
   Dynamic actions per service.
   =================================== */

import {
  Upload,
  Play,
  Loader2,
  LogOut,
  Volume2,
  Languages,
  Shield,
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import { SERVICES } from '@/config/services';
import { PremiumButton } from '@/components/shared/PremiumButton';
import { useOCR } from '@/hooks/useOCR';
import { useTranslation } from '@/hooks/useTranslation';
import { useAudiobook } from '@/hooks/useAudiobook';

export function WorkspaceHeader() {
  const { activeService, setUploadedFile } = useAppStore();
  const { signOut } = useAuthStore();
  const { ocrLoading, processDocument } = useOCR();
  const { translationLoading, translate } = useTranslation();
  const { audiobookLoading, generateAudio } = useAudiobook();
  const service = SERVICES[activeService];

  const handleFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf,.doc,.docx,.txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const preview = file.type.startsWith('image/')
          ? URL.createObjectURL(file)
          : undefined;
        setUploadedFile({
          file,
          preview,
          name: file.name,
          size: file.size,
          type: file.type,
        });
      }
    };
    input.click();
  };

  const renderActions = () => {
    switch (activeService) {
      case 'ocr':
        return (
          <>
            <PremiumButton variant="secondary" size="sm" icon={<Upload size={14} />} onClick={handleFileSelect}>
              Φόρτωση
            </PremiumButton>
            <PremiumButton
              variant="primary"
              size="sm"
              icon={ocrLoading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
              onClick={processDocument}
              loading={ocrLoading}
            >
              Εκκίνηση OCR
            </PremiumButton>
          </>
        );

      case 'translate':
        return (
          <>
            <PremiumButton variant="secondary" size="sm" icon={<Upload size={14} />} onClick={handleFileSelect}>
              Φόρτωση
            </PremiumButton>
            <PremiumButton
              variant="primary"
              size="sm"
              icon={translationLoading ? <Loader2 size={14} className="animate-spin" /> : <Languages size={14} />}
              onClick={() => translate()}
              loading={translationLoading}
            >
              Μετάφραση
            </PremiumButton>
          </>
        );

      case 'audiobook':
        return (
          <PremiumButton
            variant="primary"
            size="sm"
            icon={audiobookLoading ? <Loader2 size={14} className="animate-spin" /> : <Volume2 size={14} />}
            onClick={() => generateAudio()}
            loading={audiobookLoading}
          >
            Δημιουργία Ήχου
          </PremiumButton>
        );

      case 'vault':
        return (
          <PremiumButton variant="secondary" size="sm" icon={<Shield size={14} />}>
            {/* The vault panel has its own upload */}
            Αποθήκευση
          </PremiumButton>
        );
    }
  };

  return (
    <header className="h-14 min-h-[56px] flex items-center justify-between px-6 border-b border-orange-border bg-orange-bg-secondary">
      {/* Left: Service info */}
      <div className="flex items-center gap-3">
        <img src={service.icon} alt="" className="w-7 h-7 object-contain" />
        <h2 className="text-base font-semibold text-orange-text-primary">
          {service.title}
        </h2>
        <span className="text-[0.65rem] font-semibold tracking-wider text-orange-gold-mid bg-orange-gold-mid/10 border border-orange-border-gold rounded-full px-2.5 py-0.5">
          {service.badge}
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {renderActions()}

        {/* Separator */}
        <div className="w-px h-6 bg-orange-border mx-1" />

        {/* User Menu */}
        <button
          onClick={signOut}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-orange-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
          title="Αποσύνδεση"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}