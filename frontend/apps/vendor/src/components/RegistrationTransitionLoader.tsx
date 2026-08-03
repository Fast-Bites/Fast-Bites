import type { ReactNode } from 'react';
import Button from '@/components/Button';

/** Soft yellow → blue → peach gradient used on registration transition screens. */
export const registrationTransitionBackgroundClassName =
  'bg-[linear-gradient(135deg,#fef9c3_0%,#e0f2fe_45%,#fecaca_100%)]';

interface RegistrationTransitionLoaderProps {
  /** Destination label shown under the eyebrow (e.g. "Menu Setup"). */
  destination: string;
  /** Line above the destination. Defaults to "Proceeding to". */
  eyebrow?: string;
  error?: string | null;
  onErrorAction?: () => void;
  errorActionLabel?: string;
  children?: ReactNode;
}

/**
 * Full-screen transition between registration steps.
 * Matches the Figma “Proceeding to …” screens.
 */
export default function RegistrationTransitionLoader({
  destination,
  eyebrow = 'Proceeding to',
  error,
  onErrorAction,
  errorActionLabel = 'Go back',
  children,
}: RegistrationTransitionLoaderProps) {
  if (error) {
    return (
      <div
        className={`flex min-h-screen flex-col items-center justify-center px-8 text-center ${registrationTransitionBackgroundClassName}`}
      >
        <p className="mb-6 text-base text-gray-900">{error}</p>
        {onErrorAction ? (
          <Button type="button" variant="primary" onClick={onErrorAction}>
            {errorActionLabel}
          </Button>
        ) : null}
        {children}
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-screen flex-col items-center justify-center px-8 text-center ${registrationTransitionBackgroundClassName}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="space-y-2 text-gray-900">
        <p className="animate-fade-in text-lg font-normal">{eyebrow}</p>
        <p className="animate-fade-in-delayed text-4xl font-semibold">{destination}</p>
      </div>
      {children}
    </div>
  );
}
