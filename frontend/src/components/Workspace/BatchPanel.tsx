/* ===================================
   ORANGE — Batch Processing Panel
   Upload multiple files, track progress.
   =================================== */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  Layers,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  FileText,
  Zap,
  ChevronDown,
} from 'lucide-react';
import { PremiumButton } from '@/components/shared/PremiumButton';
import api from '@/services/api';
import clsx from 'clsx';

interface BatchJob {
  id: string;
  status: string;
  progressPercent: number;
  totalFiles: number;
  processedFiles: number;
  failedFiles: number;
  results: Record<string, unknown>[];
  errors: Record<string, unknown>[];
}

type PipelineStep = 'ocr' | 'translate' | 'tts';

const PIPELINE_OPTIONS: { value: string; label: string; steps: PipelineStep[]; description: string }[] = [
  {
    value: 'ocr',
    label: 'Μόνο OCR',
    steps: ['ocr'],
    description: 'Αναγνώριση κειμένου από εικόνες/PDF',
  },
  {
    value: 'ocr,translate',
    label: 'OCR → Μετάφραση',
    steps: ['ocr', 'translate'],
    description: 'OCR και αυτόματη μετάφραση',
  },
  {
    value: 'ocr,translate,tts',
    label: 'OCR → Μετάφραση → Audiobook',
    steps: ['ocr', 'translate', 'tts'],
    description: 'Πλήρες pipeline: OCR → Μετάφραση → Ήχος',
  },
];

export function BatchPanel() {
  const [files, setFiles] = useState<File[]>([]);
  const [pipeline, setPipeline] = useState('ocr');
  const [targetLang, setTargetLang] = useState('EN-GB');
  const [activeJob, setActiveJob] = useState<BatchJob | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<ReturnType<typeof setInterval> | null>(null);

  const onDrop = useCallback((accepted: File[]) => {
    setFiles((prev) => [...prev, ...accepted]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.tiff', '.bmp', '.webp'],
      'application/pdf': ['.pdf'],
      'application/zip': ['.zip'],
    },
    multiple: true,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const startBatch = async () => {
    if (files.length === 0) return;

    setIsStarting(true);

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('files', f));

      const { data } = await api.post(
        `/batch/start?pipeline=${pipeline}&target_lang=${targetLang}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );

      // Start polling
      const jobId = data.job_id;
      setActiveJob({
        id: jobId,
        status: 'queued',
        progressPercent: 0,
        totalFiles: data.total_files,
        processedFiles: 0,
        failedFiles: 0,
        results: [],
        errors: [],
      });

      const interval = setInterval(async () => {
        try {
          const { data: status } = await api.get(`/batch/status/${jobId}`);
          setActiveJob({
            id: status.id,
            status: status.status,
            progressPercent: status.progress_percent,
            totalFiles: status.total_files,
            processedFiles: status.processed_files,
            failedFiles: status.failed_files,
            results: status.results,
            errors: status.errors,
          });

          if (status.status === 'completed' || status.status === 'failed') {
            clearInterval(interval);
            setPollingInterval(null);
          }
        } catch {
          // Silent polling error
        }
      }, 2000);

      setPollingInterval(interval);
      setFiles([]);
    } catch {
      // Error handled by interceptor
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-orange-bg-primary overflow-auto scrollbar-thin">
      {/* Pipeline Selector */}
      <div className="p-6 border-b border-orange-border bg-orange-bg-secondary">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-orange-text-primary mb-4">
          <Layers size={16} className="text-orange-gold-mid" />
          Batch Processing Pipeline
        </h3>

        <div className="space-y-2">
          {PIPELINE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPipeline(opt.value)}
              className={clsx(
                'w-full text-left p-3 rounded-lg border transition-all',
                pipeline === opt.value
                  ? 'border-orange-gold-mid/50 bg-orange-gold-mid/5'
                  : 'border-orange-border hover:border-orange-border-gold',
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-orange-text-primary">
                  {opt.label}
                </span>
                <div className="flex gap-1">
                  {opt.steps.map((step, i) => (
                    <span key={step} className="flex items-center gap-1">
                      {i > 0 && <span className="text-orange-text-muted text-xs">→</span>}
                      <span className="text-[0.6rem] px-1.5 py-0.5 rounded bg-orange-bg-tertiary text-orange-text-secondary border border-orange-border">
                        {step.toUpperCase()}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-xs text-orange-text-muted mt-1">
                {opt.description}
              </p>
            </button>
          ))}
        </div>

        {pipeline.includes('translate') && (
          <div className="mt-4 flex items-center gap-3">
            <span className="text-xs text-orange-text-muted">Γλώσσα στόχος:</span>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="bg-orange-bg-tertiary border border-orange-border rounded-lg px-3 py-1.5 text-sm text-orange-text-primary focus:outline-none focus:ring-2 focus:ring-orange-gold-mid/30"
            >
              <option value="EN-GB">English (UK)</option>
              <option value="DE">Deutsch</option>
              <option value="FR">Français</option>
              <option value="IT">Italiano</option>
              <option value="ES">Español</option>
              <option value="PT-PT">Português</option>
              <option value="NL">Nederlands</option>
              <option value="RU">Русский</option>
              <option value="ZH">中文</option>
              <option value="JA">日本語</option>
            </select>
          </div>
        )}
      </div>

      {/* File Upload Area */}
      <div className="p-6 border-b border-orange-border">
        <div
          {...getRootProps()}
          className={clsx(
            'border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer',
            isDragActive
              ? 'border-orange-gold-mid bg-orange-gold-mid/5'
              : 'border-orange-border hover:border-orange-border-gold',
          )}
        >
          <input {...getInputProps()} />
          <Upload size={32} className="mx-auto mb-3 text-orange-text-muted" />
          <p className="text-sm text-orange-text-secondary">
            {isDragActive
              ? 'Αφήστε τα αρχεία εδώ...'
              : 'Σύρετε αρχεία ή πατήστε για επιλογή'}
          </p>
          <p className="text-xs text-orange-text-muted mt-1">
            Εικόνες, PDF, ή ZIP. Μέχρι 100 αρχεία.
          </p>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-orange-text-secondary">
                {files.length} αρχεία ({(files.reduce((s, f) => s + f.size, 0) / (1024 * 1024)).toFixed(1)} MB)
              </span>
              <button
                onClick={() => setFiles([])}
                className="text-xs text-orange-text-muted hover:text-red-400 transition-colors"
              >
                Καθαρισμός
              </button>
            </div>

            <div className="max-h-40 overflow-auto scrollbar-thin space-y-1">
              {files.map((file, i) => (
                <div
                  key={`${file.name}-${i}`}
                  className="flex items-center gap-2 px-3 py-1.5 bg-orange-bg-secondary rounded-lg"
                >
                  <FileText size={12} className="text-orange-text-muted flex-shrink-0" />
                  <span className="text-xs text-orange-text-primary truncate flex-1">
                    {file.name}
                  </span>
                  <span className="text-[0.6rem] text-orange-text-muted">
                    {(file.size / 1024).toFixed(0)}KB
                  </span>
                  <button
                    onClick={() => removeFile(i)}
                    className="text-orange-text-muted hover:text-red-400 transition-colors"
                  >
                    <XCircle size={12} />
                  </button>
                </div>
              ))}
            </div>

            <PremiumButton
              variant="primary"
              className="w-full mt-3"
              onClick={startBatch}
              loading={isStarting}
              disabled={files.length === 0}
              icon={<Zap size={16} />}
            >
              Εκκίνηση Batch ({files.length} αρχεία)
            </PremiumButton>
          </div>
        )}
      </div>

      {/* Active Job Progress */}
      {activeJob && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6"
        >
          <div className="bg-orange-bg-secondary border border-orange-border rounded-xl p-5">
            {/* Status header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {activeJob.status === 'completed' ? (
                  <CheckCircle2 size={18} className="text-green-400" />
                ) : activeJob.status === 'failed' ? (
                  <XCircle size={18} className="text-red-400" />
                ) : (
                  <Loader2 size={18} className="text-orange-gold-mid animate-spin" />
                )}
                <span className="text-sm font-semibold text-orange-text-primary">
                  {activeJob.status === 'completed'
                    ? 'Ολοκληρώθηκε!'
                    : activeJob.status === 'failed'
                      ? 'Αποτυχία'
                      : 'Επεξεργασία...'}
                </span>
              </div>
              <span className="text-xs font-mono text-orange-text-muted">
                {activeJob.processedFiles}/{activeJob.totalFiles}
              </span>
            </div>

            {/* Progress bar */}
            <div className="relative h-3 bg-orange-bg-tertiary rounded-full overflow-hidden mb-3">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #9d742e, #c7ad67, #dad395)',
                }}
                initial={{ width: '0%' }}
                animate={{ width: `${activeJob.progressPercent}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-orange-text-muted">
              <span>{activeJob.progressPercent}%</span>
              {activeJob.failedFiles > 0 && (
                <span className="text-red-400">
                  {activeJob.failedFiles} αποτυχίες
                </span>
              )}
            </div>

            {/* Results preview */}
            {activeJob.results.length > 0 && (
              <div className="mt-4 space-y-1.5 max-h-48 overflow-auto scrollbar-thin">
                {activeJob.results.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-1.5 bg-orange-bg-primary rounded-lg text-xs"
                  >
                    <CheckCircle2 size={12} className="text-green-400 flex-shrink-0" />
                    <span className="text-orange-text-primary truncate">
                      {String(r.file || `File ${i + 1}`)}
                    </span>
                    <span className="text-orange-text-muted ml-auto">
                      {String(r.step || '')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}