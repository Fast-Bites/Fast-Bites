import { useRef } from 'react';
import { Plus } from 'lucide-react';
import { formLabelClassName } from '@/components/FormField';

const UPLOAD_BORDER_DASH = '10 10';

/** Matches empty state: py-12 + icon + gap + label text */
export const uploadFieldMinHeightClassName = 'min-h-[11.5rem]';

interface UploadFieldProps {
  label: string;
  required?: boolean;
  previewUrl?: string | null;
  uploading?: boolean;
  error?: string | null;
  accept?: string;
  onFileSelect: (file: File | null) => void;
}

export default function UploadField({
  label,
  required = false,
  previewUrl,
  uploading,
  error,
  accept = 'image/*',
  onFileSelect,
}: UploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isImagePreview =
    previewUrl && !previewUrl.toLowerCase().endsWith('.pdf') && !previewUrl.includes('/raw/upload/');

  return (
    <div>
      <p className={`mb-1 ${formLabelClassName}`}>
        {required ? (
          <span className="text-red-500" aria-hidden="true">
            *{' '}
          </span>
        ) : null}
        {label}
      </p>
      <div className="relative rounded-xl">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={`relative flex w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-xl bg-white px-5 py-12 transition hover:bg-white disabled:cursor-wait disabled:opacity-80 ${uploadFieldMinHeightClassName}`}
        >
          {previewUrl ? (
            isImagePreview ? (
              <img
                src={previewUrl}
                alt={label}
                className="absolute inset-0 z-0 h-full w-full object-cover"
              />
            ) : (
              <span className="relative z-0 px-4 text-center text-sm font-medium text-gray-700">
                Document uploaded
              </span>
            )
          ) : (
            <>
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/25 text-primary">
                <Plus size={46} strokeWidth={1.0} />
              </span>
              <span className="text-sm text-gray-400">
                {uploading ? 'Uploading…' : 'Click to upload'}
              </span>
            </>
          )}
          {previewUrl && uploading ? (
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
      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => onFileSelect(event.target.files?.[0] ?? null)}
      />
    </div>
  );
}
