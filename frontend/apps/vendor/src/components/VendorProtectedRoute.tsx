import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { vendorAuth, type VendorProfile } from '@/lib/api';
import { redirectToCustomerRestaurantSignIn } from '@/lib/customerAuthRedirect';
import { isBusinessVerified } from '@/lib/verification';
import FullScreenLogoLoader from '@/components/FullScreenLogoLoader';

interface VendorProtectedRouteProps {
  children: React.ReactNode;
}

export default function VendorProtectedRoute({ children }: VendorProtectedRouteProps) {
  const [status, setStatus] = useState<'checking' | 'allowed' | 'denied'>('checking');

  useEffect(() => {
    let cancelled = false;

    const checkAccess = async () => {
      const { data: sessionData } = await vendorAuth.getSession();
      if (!sessionData.session) {
        if (!cancelled) setStatus('denied');
        return;
      }

      const { data, error } = await vendorAuth.getProfile();
      if (cancelled) return;

      if (error || !data || data.role !== 'restaurant') {
        setStatus('denied');
        return;
      }

      setStatus('allowed');
    };

    void checkAccess();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (status === 'denied') {
      redirectToCustomerRestaurantSignIn();
    }
  }, [status]);

  if (status === 'checking') {
    return <FullScreenLogoLoader />;
  }

  if (status === 'denied') {
    return null;
  }

  return <>{children}</>;
}

interface VendorVerifiedRouteProps {
  children: React.ReactNode;
}

export function VendorVerifiedRoute({ children }: VendorVerifiedRouteProps) {
  const [status, setStatus] = useState<'checking' | 'allowed' | 'unverified' | 'denied'>('checking');

  useEffect(() => {
    let cancelled = false;

    const checkAccess = async () => {
      const { data: sessionData } = await vendorAuth.getSession();
      if (!sessionData.session) {
        if (!cancelled) setStatus('denied');
        return;
      }

      const { data, error } = await vendorAuth.getProfile();
      if (cancelled) return;

      if (error || !data || data.role !== 'restaurant') {
        setStatus('denied');
        return;
      }

      if (!isBusinessVerified(data as VendorProfile)) {
        setStatus('unverified');
        return;
      }

      setStatus('allowed');
    };

    void checkAccess();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (status === 'denied') {
      redirectToCustomerRestaurantSignIn();
    }
  }, [status]);

  if (status === 'checking') {
    return <FullScreenLogoLoader />;
  }

  if (status === 'denied') {
    return null;
  }

  if (status === 'unverified') {
    return <Navigate to="/verify-business" replace />;
  }

  return <>{children}</>;
}
