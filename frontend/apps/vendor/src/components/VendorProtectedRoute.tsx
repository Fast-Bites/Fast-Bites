import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { vendorAuth, type VendorProfile } from '@/lib/api';
import { redirectToCustomerVendorSignIn } from '@/lib/customerAuthRedirect';
import { isVendorRole } from '@/lib/roles';
import { isBusinessVerified, resolveVendorPortalPath, vendorVerificationPath, type VendorPortalPath } from '@/lib/verification';
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

      if (error || !data || !isVendorRole(data.role)) {
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
      redirectToCustomerVendorSignIn();
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
  const [redirectPath, setRedirectPath] = useState<VendorPortalPath>('/verify-business');

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

      if (error || !data || !isVendorRole(data.role)) {
        setStatus('denied');
        return;
      }

      if (!isBusinessVerified(data as VendorProfile)) {
        const path = await resolveVendorPortalPath(data);
        if (path === '/verify-business' || path === '/verify-business/documentation') {
          setRedirectPath(path);
          setStatus('unverified');
          return;
        }
        if (path === '/verify-business/catalog') {
          setRedirectPath(path);
          setStatus('unverified');
          return;
        }
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
      redirectToCustomerVendorSignIn();
    }
  }, [status]);

  if (status === 'checking') {
    return <FullScreenLogoLoader />;
  }

  if (status === 'denied') {
    return null;
  }

  if (status === 'unverified') {
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}
