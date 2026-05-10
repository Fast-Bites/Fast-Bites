import React from 'react';

/** Same asset as ProtectedRoute auth check. */
const APP_LOGO_SRC = '/logo/Fast bite transparent I.png';

export interface FullScreenLogoLoaderProps {
  /** Shown under the logo. Omit for auth-check style (logo + optional spinner only). */
  message?: string;
  /** When true, `fixed inset-0` with high z-index so it sits above modals and nav. */
  overlay?: boolean;
  /**
   * Extra ring spinner below the logo. Defaults to true when `message` is set,
   * false when omitted (matches bare auth-check screen).
   */
  showSpinner?: boolean;
}

/**
 * Full-screen black screen + pulsing app logo (same layout as `ProtectedRoute` “checking”).
 * Optional spinner + short status line for long-running actions (e.g. delete account).
 */
const FullScreenLogoLoader: React.FC<FullScreenLogoLoaderProps> = ({
  message,
  overlay = false,
  showSpinner,
}) => {
  const spinnerOn = showSpinner ?? Boolean(message);

  const rootClass = overlay
    ? 'fixed inset-0 z-[100] flex min-h-screen w-full flex-col items-center justify-center bg-black px-8'
    : 'flex min-h-screen w-full flex-col items-center justify-center bg-black px-8';

  return (
    <div className={rootClass} role="status" aria-live="polite" aria-busy="true">
      <img
        src={APP_LOGO_SRC}
        alt="Fast Bites"
        className="h-1/2 w-1/2 object-contain animate-zoom-pulse"
      />
      {spinnerOn ? (
        <div
          className="mt-8 h-10 w-10 shrink-0 rounded-full border-2 border-white/20 border-t-primary animate-spin"
          aria-hidden
        />
      ) : null}
      {message ? (
        <p className="mt-6 max-w-sm text-center text-sm leading-relaxed text-white/85">{message}</p>
      ) : null}
    </div>
  );
};

export default FullScreenLogoLoader;
