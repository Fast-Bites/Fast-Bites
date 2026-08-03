import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { vendorAuth } from '@/lib/api';
import { redirectToCustomerVendorSignIn } from '@/lib/customerAuthRedirect';
import { isVendorRole } from '@/lib/roles';
import { resolveVendorPortalPath, type VendorPortalPath } from '@/lib/verification';
import FullScreenLogoLoader from '@/components/FullScreenLogoLoader';

export default function VendorEntryRedirect() {
  const [target, setTarget] = useState<VendorPortalPath | 'sign-in' | null>(null);

  useEffect(() => {
    let cancelled = false;

    const resolveEntry = async () => {
      const { data: sessionData } = await vendorAuth.getSession();
      if (!sessionData.session) {
        if (!cancelled) setTarget('sign-in');
        return;
      }

      const { data, error } = await vendorAuth.getProfile();
      if (cancelled) return;

      if (error || !data || !isVendorRole(data.role)) {
        setTarget('sign-in');
        return;
      }

      setTarget(await resolveVendorPortalPath(data));
    };

    void resolveEntry();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (target === 'sign-in') {
      redirectToCustomerVendorSignIn();
    }
  }, [target]);

  if (!target) {
    return <FullScreenLogoLoader />;
  }

  if (target === 'sign-in') {
    return null;
  }

  return <Navigate to={target} replace />;
}
