/* ===================================
   ORANGE — Source Panel
   Document preview + drag & drop.
   =================================== */

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import clsx from 'clsx';

export function SourcePanel() {
  const { uploadedFile, setUploadedFile } = useAppStore();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

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
    },
    [setUploadedFile],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.tiff', '.tif', '.bmp', '.webp'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    noClick: !!uploadedFile,
  });

  return (
    <div className="h-full flex flex-col border-r border-orange-border">
      {/* Header */}
      <div className="h-10 min-h-[40px] flex items-center justify-between px-4 bg-orange-bg-tertiary border-b border-orange-border">
        <span className="text-xs font-medium text-orange-text-secondary">
          📄 Source View — Πρωτότυπο Έγγραφο
        </span>
        <div className="flex gap-1">
          <button className="w-7 h-7 rounded-md flex items-center justify-center text-orange-text-muted hover:bg-orange-bg-elevated hover:text-orange-text-secondary transition-all">
            <ZoomIn size={14} />
          </button>
          <button className="w-7 h-7 rounded-md flex items-center justify-center text-orange-text-muted hover:bg-orange-bg-elevated hover:text-orange-text-secondary transition-all">
            <ZoomOut size={14} />
          </button>
          <button className="w-7 h-7 rounded-md flex items-center justify-center text-orange-text-muted hover:bg-orange-bg-elevated hover:text-orange-text-secondary transition-all">
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        {...getRootProps()}
        className={clsx(
          'flex-1 flex items-center justify-center overflow-auto scrollbar-thin transition-all duration-200',
          'bg-orange-bg-primary',
          isDragActive && 'outline-2 outline-dashed outline-orange-gold-mid outline-offset-[-8px] bg-orange-gold-mid/[0.03]',
          !uploadedFile && 'cursor-pointer',
        )}
        style={{
          background: isDragActive
            ? undefined
            : 'radial-gradient(ellipse at center, rgba(199,173,103,0.02) 0%, transparent 70%) #1a1714',
        }}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {uploadedFile ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-4 w-full h-full flex items-center justify-center"
            >
              {uploadedFile.preview ? (
                <img
                  src={uploadedFile.preview}
                  alt={uploadedFile.name}
                  className="max-w-full max-h-full rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.5)] object-contain"
                />
              ) : (
                <div className="text-center">
                  <div className="text-5xl mb-3">
                    {uploadedFile.type === 'application/pdf' ? '📑' : '📄'}
                  </div>
                  <p className="text-orange-text-primary font-semibold">
                    {uploadedFile.name}
                  </p>
                  <p className="text-orange-text-muted text-sm mt-1">
                    {(uploadedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center px-8"
            >
              {/* Document skeleton */}
              <div className="w-[280px] mx-auto mb-6 bg-orange-bg-secondary border border-orange-border rounded-lg p-6 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
                <div className="flex flex-col gap-2">
                  {[80, 60, 90, 70, 85, 40, 0, 75, 90, 65, 80, 50, 0, 85, 70, 90, 55].map(
                    (w, i) =>
                      w === 0 ? (
                        <div key={i} className="h-2" />
                      ) : (
                        <div
                          key={i}
                          className="h-1.5 bg-orange-bg-tertiary rounded-full"
                          style={{ width: `${w}%` }}
                        />
                      ),
                  )}
                </div>
              </div>
              <p className="text-sm text-orange-text-muted">
                {isDragActive
                  ? 'Αφήστε το αρχείο εδώ...'
                  : 'Σύρετε ένα αρχείο εδώ ή πατήστε «Φόρτωση»'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}