import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RegistrationTransitionLoader from '@/components/RegistrationTransitionLoader';
import { getCachedBusinessType } from '@/lib/businessDocumentation';
import { catalogCopyFor } from '@/lib/catalogCopy';

const MIN_DISPLAY_MS = 2200;

/** Short transition after documentation before catalog setup. */
export default function VerifyBusinessMenuProcessing() {
  const navigate = useNavigate();
  const destination = catalogCopyFor(getCachedBusinessType()).pageTitle;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      navigate('/verify-business/catalog', { replace: true });
    }, MIN_DISPLAY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [navigate]);

  return <RegistrationTransitionLoader destination={destination} />;
}
