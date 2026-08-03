import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RegistrationTransitionLoader from '@/components/RegistrationTransitionLoader';

const MIN_DISPLAY_MS = 2200;

/** Short transition after documentation before Menu Setup. */
export default function VerifyBusinessMenuProcessing() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      navigate('/verify-business/menu', { replace: true });
    }, MIN_DISPLAY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [navigate]);

  return <RegistrationTransitionLoader destination="Menu Setup" />;
}
