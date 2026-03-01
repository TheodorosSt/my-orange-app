/* ===================================
   ORANGE — Service-aware workspace content
   Renders different UI per active service.
   =================================== */

import { useAppStore } from '@/stores/appStore';
import { SplitView } from './SplitView';
import { AudiobookPanel } from './AudiobookPanel';
import { VaultPanel } from './VaultPanel';

export function WorkspaceContent() {
  const activeService = useAppStore((s) => s.activeService);

  switch (activeService) {
    case 'ocr':
    case 'translate':
      // OCR and Translate share the split-view editor
      return <SplitView />;

    case 'audiobook':
      return <AudiobookPanel />;

    case 'vault':
      return <VaultPanel />;

    default:
      return <SplitView />;
  }
}