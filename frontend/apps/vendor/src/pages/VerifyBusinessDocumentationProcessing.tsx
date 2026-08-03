import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegistrationTransitionLoader from '@/components/RegistrationTransitionLoader';
import { vendorApi } from '@/lib/api';
import { clearDocumentationSkipped } from '@/lib/menuSetup';

const MIN_DISPLAY_MS = 2200;

/** Transition when returning from Menu Setup to Documentation. */
export default function VerifyBusinessDocumentationProcessing() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    clearDocumentationSkipped();
    const startedAt = Date.now();

    const run = async () => {
      const result = await vendorApi.getBusinessRegistration();
      if (cancelled) {
        return;
      }

      if (result.error || !result.data?.business_type) {
        setError(result.error ?? 'Could not load your business details.');
        return;
      }

      const elapsed = Date.now() - startedAt;
      const waitMs = Math.max(0, MIN_DISPLAY_MS - elapsed);

      window.setTimeout(() => {
        if (cancelled) {
          return;
        }
        navigate('/verify-business/documentation', {
          replace: true,
          state: { businessType: result.data!.business_type },
        });
      }, waitMs);
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <RegistrationTransitionLoader
      eyebrow="Going back to"
      destination="Documentation"
      error={error}
      onErrorAction={() => navigate('/verify-business/menu', { replace: true })}
      errorActionLabel="Back to menu"
    />
  );
}
