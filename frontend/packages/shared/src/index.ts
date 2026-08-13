export const colors = {
  background: '#000000',
  foreground: '#ffffff',
  primary: '#ea580c',
  accent: '#ffff00',
  appGreen: '#00af00',
  popupGreen: '#00ff00',
} as const;

export type UserRole = 'customer' | 'rider' | 'vendor';

/** Neutral singular/plural — use whenever an upload is still in progress. */
export const UPLOADS_IN_PROGRESS_MESSAGE = 'Please wait for upload(s) to finish.';

/** Stored image uploads (profile avatar, logos, covers). Match backend Cloudinary caps. */
export const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024;
export const MAX_IMAGE_UPLOAD_LABEL = '5MB';

export const MAX_DOCUMENT_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MAX_DOCUMENT_UPLOAD_LABEL = '10MB';
