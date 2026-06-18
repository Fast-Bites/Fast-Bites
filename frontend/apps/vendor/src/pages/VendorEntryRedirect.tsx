import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { vendorAuth } from '@/lib/api';
import { redirectToCustomerRestaurantSignIn } from '@/lib/customerAuthRedirect';
import { isBusinessVerified } from '@/lib/verification';
import FullScreenLogoLoader from '@/components/FullScreenLogoLoader';

export default function VendorEntryRedirect() {
  const [target, setTarget] = useState<'/verify-business' | '/dashboard' | 'sign-in' | null>(null);

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

      if (error || !data || data.role !== 'restaurant') {
        setTarget('sign-in');
        return;
      }

      setTarget(isBusinessVerified(data) ? '/dashboard' : '/verify-business');
    };

    void resolveEntry();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (target === 'sign-in') {
      redirectToCustomerRestaurantSignIn();
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
