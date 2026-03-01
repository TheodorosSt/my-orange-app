/* ===================================
   ORANGE — Split View
   Source panel + resizer + editor panel.
   =================================== */

import { useRef, useCallback, useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { SourcePanel } from './SourcePanel';
import { EditorPanel } from './EditorPanel';

export function SplitView() {
  const { splitRatio, setSplitRatio } = useAppStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const pct = ((moveEvent.clientX - rect.left) / rect.width) * 100;
        setSplitRatio(Math.max(20, Math.min(80, pct)));
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    },
    [setSplitRatio],
  );

  return (
    <div ref={containerRef} className="flex-1 flex overflow-hidden">
      {/* Source Panel */}
      <div style={{ flex: `0 0 ${splitRatio}%` }} className="min-w-0">
        <SourcePanel />
      </div>

      {/* Resizer */}
      <div
        onMouseDown={handleMouseDown}
        className={`w-[5px] cursor-col-resize transition-colors duration-200 ${
          isResizing
            ? 'bg-orange-gold-mid'
            : 'bg-orange-border hover:bg-orange-gold-mid'
        }`}
      />

      {/* Editor Panel */}
      <div style={{ flex: `0 0 ${100 - splitRatio}%` }} className="min-w-0">
        <EditorPanel />
      </div>
    </div>
  );
}