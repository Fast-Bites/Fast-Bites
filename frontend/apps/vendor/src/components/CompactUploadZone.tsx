import { useRef } from 'react';
import { FileText, Plus } from 'lucide-react';
import { menuSetupUploadMinHeightClassName } from '@/components/MenuSetupOptionList';
import { menuFileTypeTheme } from '@/lib/menuSetup';

const UPLOAD_BORDER_DASH = '10 10';

interface CompactUploadZoneProps {
  accept?: string;
  /** Prefer device camera when set (e.g. "environment" for rear camera). */
  capture?: 'environment' | 'user';
  emptyLabel?: string;
  uploading?: boolean;
  /** Object URL or remote URL — used for image previews only. */
  previewUrl?: string | null;
  /** Non-image files: document-style type preview with name overlaid. */
  fileName?: string | null;
  fileTypeLabel?: string | null;
  /** Extra-small accepted-formats line under the tile. */
  acceptHint?: string | null;
  error?: string | null;
  onFileSelect: (file: File | null) => void;
}

/**
 * Label-less dashed upload tile used beside Menu Setup option list.
 * Reuses the same visual language as UploadField.
 */
export default function CompactUploadZone({
  accept = 'image/*,application/pdf',
  capture,
  emptyLabel = 'Click to upload',
  uploading,
  previewUrl,
  fileName,
  fileTypeLabel,
  acceptHint,
  error,
  onFileSelect,
}: CompactUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasImagePreview = Boolean(previewUrl);
  const hasFileMeta = Boolean(fileName);
  const theme = menuFileTypeTheme(fileTypeLabel);

  return (
    <div className="w-full h-full">
      <div className="relative h-full rounded-xl">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={`relative flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-xl bg-white px-5 py-12 transition hover:bg-white disabled:cursor-wait disabled:opacity-80 ${menuSetupUploadMinHeightClassName}`}
        >
          {hasImagePreview ? (
            <img
              src={previewUrl!}
              alt="Uploaded menu"
              className="absolute inset-0 z-0 h-full w-full object-cover"
            />
          ) : hasFileMeta ? (
            <span className={`absolute inset-0 z-0 flex items-center justify-center p-4 ${theme.backdrop}`}>
              <span
                className={`relative flex h-full max-h-40 w-full max-w-[7.5rem] flex-col overflow-hidden rounded-lg border shadow-sm ${theme.shell}`}
              >
                <span
                  className={`flex shrink-0 items-center justify-center gap-1.5 border-b px-2 py-1.5 ${theme.header}`}
                >
                  <FileText className={`h-3.5 w-3.5 ${theme.icon}`} strokeWidth={2} aria-hidden />
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${theme.headerText}`}
                  >
                    {fileTypeLabel || 'FILE'}
                  </span>
                </span>
                <span
                  className={`relative flex min-h-0 flex-1 flex-col items-center justify-center bg-gradient-to-b px-2 py-3 ${theme.body}`}
                >
                  <span
                    className={`pointer-events-none absolute inset-0 flex items-center justify-center text-5xl font-black uppercase leading-none ${theme.watermark}`}
                    aria-hidden
                  >
                    {fileTypeLabel || 'FILE'}
                  </span>
                  <span className="relative z-[1] line-clamp-4 w-full break-all text-center text-xs font-semibold leading-snug text-gray-800">
                    {fileName}
                  </span>
                </span>
              </span>
            </span>
          ) : (
            <>
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/25 text-primary">
                <Plus size={46} strokeWidth={1.0} />
              </span>
              <span className="text-sm text-gray-400">
                {uploading ? 'Uploading…' : emptyLabel}
              </span>
            </>
          )}
          {(hasImagePreview || hasFileMeta) && uploading ? (
            <span className="relative z-10 rounded-full bg-black/60 px-3 py-1 text-sm text-white">
              Uploading…
            </span>
          ) : null}
        </button>
        <svg
          className="pointer-events-none absolute inset-0 z-10 h-full w-full"
          preserveAspectRatio="none"
          aria-hidden
        >
          <rect
            width="100%"
            height="100%"
            rx="12"
            ry="12"
            fill="none"
            className="stroke-primary"
            strokeWidth="3"
            strokeDasharray={UPLOAD_BORDER_DASH}
          />
        </svg>
      </div>
      {acceptHint ? (
        <p className="mt-1 text-[10px] leading-tight text-gray-400">{acceptHint}</p>
      ) : null}
      {error ? <p className="mt-0.5 text-sm text-red-600">{error}</p> : null}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        capture={capture}
        className="hidden"
        onChange={(event) => onFileSelect(event.target.files?.[0] ?? null)}
      />
    </div>
  );
}
