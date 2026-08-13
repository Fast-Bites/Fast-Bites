/** Client-side limits for files that are stored (Cloudinary). Match backend. */

export {
  MAX_DOCUMENT_UPLOAD_BYTES,
  MAX_DOCUMENT_UPLOAD_LABEL,
  MAX_IMAGE_UPLOAD_BYTES,
  MAX_IMAGE_UPLOAD_LABEL,
  UPLOADS_IN_PROGRESS_MESSAGE,
} from '@fast-bites/shared';

import {
  MAX_DOCUMENT_UPLOAD_BYTES,
  MAX_IMAGE_UPLOAD_BYTES,
  MAX_DOCUMENT_UPLOAD_LABEL,
  MAX_IMAGE_UPLOAD_LABEL,
} from '@fast-bites/shared';

export function formatUploadSizeLimit(maxBytes: number): string {
  if (maxBytes === MAX_IMAGE_UPLOAD_BYTES) return MAX_IMAGE_UPLOAD_LABEL;
  if (maxBytes === MAX_DOCUMENT_UPLOAD_BYTES) return MAX_DOCUMENT_UPLOAD_LABEL;
  const mb = maxBytes / (1024 * 1024);
  return Number.isInteger(mb) ? `${mb}MB` : `${mb.toFixed(1)}MB`;
}

/** Returns an error message when over limit; null when ok. */
export function validateUploadFileSize(
  file: File,
  maxBytes: number,
): string | null {
  if (file.size <= maxBytes) {
    return null;
  }
  return `File must be ${formatUploadSizeLimit(maxBytes)} or smaller`;
}
