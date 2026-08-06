import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import RegistrationTransitionLoader from '@/components/RegistrationTransitionLoader';
import { type BusinessRegistrationFormData } from '@/lib/businessRegistration';
import { setCachedBusinessType } from '@/lib/businessDocumentation';
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

          setCachedBusinessType(formData.businessType);
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

  return (
    <RegistrationTransitionLoader
      destination="Documentation"
      error={error}
      onErrorAction={() => navigate('/verify-business')}
      errorActionLabel="Back to form"
    />
  );
}
