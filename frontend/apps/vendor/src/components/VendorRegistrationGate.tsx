import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import FullScreenLogoLoader from '@/components/FullScreenLogoLoader';
import { vendorAuth } from '@/lib/api';
import { resolveVendorPortalPath, type VendorPortalPath } from '@/lib/verification';

interface VendorRegistrationGateProps {
  children: React.ReactNode;
}

/**
 * Blocks registration UI until we know the user belongs on this step.
 * Avoids flashing the stepper when registration is already complete.
 */
export default function VendorRegistrationGate({ children }: VendorRegistrationGateProps) {
  const [status, setStatus] = useState<'loading' | 'allowed' | 'redirect'>('loading');
  const [redirectTo, setRedirectTo] = useState<VendorPortalPath>('/verify-business/documentation');

  useEffect(() => {
    let cancelled = false;

    const resolveStage = async () => {
      const { data: profile } = await vendorAuth.getProfile();
      if (cancelled) {
        return;
      }

      const path = await resolveVendorPortalPath(profile ?? null);
      if (path !== '/verify-business') {
        setRedirectTo(path);
        setStatus('redirect');
        return;
      }

      setStatus('allowed');
    };

    void resolveStage();

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === 'loading') {
    return <FullScreenLogoLoader />;
  }

  if (status === 'redirect') {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
