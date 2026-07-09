import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '@/components/Button';
import {
  type BusinessRegistrationFormData,
} from '@/lib/businessRegistration';
import { vendorApi, vendorAuth } from '@/lib/api';
import { resolveVendorPortalPath } from '@/lib/verification';

const MIN_DISPLAY_MS = 2200;

export default function VerifyBusinessProcessing() {
  const navigate = useNavigate();
  const location = useLocation();
  const formData = location.state as BusinessRegistrationFormData | null;
  const startedRef = useRef(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!formData) {
        const { data: profile } = await vendorAuth.getProfile();
        if (cancelled) {
          return;
        }
        navigate(await resolveVendorPortalPath(profile ?? null), { replace: true });
        return;
      }

      if (startedRef.current) {
        return;
      }

      startedRef.current = true;
      const startedAt = Date.now();

      const submit = async () => {
        const result = await vendorApi.submitBusinessRegistration(formData);

        const elapsed = Date.now() - startedAt;
        const waitMs = Math.max(0, MIN_DISPLAY_MS - elapsed);

        window.setTimeout(() => {
          if (result.error) {
            setError(result.error);
            return;
          }

          navigate('/verify-business/documentation', {
            replace: true,
            state: { businessType: formData.businessType },
          });
        }, waitMs);
      };

      void submit();
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [formData, navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[linear-gradient(135deg,#fef9c3_0%,#e0f2fe_45%,#fecaca_100%)] px-8 text-center">
        <p className="mb-6 text-base text-gray-900">{error}</p>
        <Button type="button" variant="primary" onClick={() => navigate('/verify-business')}>
          Back to form
        </Button>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-[linear-gradient(135deg,#fef9c3_0%,#e0f2fe_45%,#fecaca_100%)] px-8 text-center"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="animate-zoom-pulse space-y-2 text-gray-900">
        <p className="text-lg font-normal">Proceeding to</p>
        <p className="text-4xl font-semibold">Documentation</p>
      </div>
    </div>
  );
}
