import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/api';
import {
  checkCustomerRouteAccess,
  checkOnboardingRouteAccess,
  redirectToVendorPortal,
} from '../lib/customerRoleGuard';
import FullScreenLogoLoader from './FullScreenLogoLoader';

export type ProtectedRouteGuard = 'session' | 'customer' | 'onboarding';

interface ProtectedRouteProps {
  children: React.ReactNode;
  guard?: ProtectedRouteGuard;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, guard = 'customer' }) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'checking' | 'authenticated'>('checking');

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      if (guard === 'session') {
        const { data: session } = await auth.getSession();
        if (cancelled) return;

        if (!session) {
          navigate('/role-selection', { replace: true });
          return;
        }

        setStatus('authenticated');
        return;
      }

      if (guard === 'onboarding') {
        const result = await checkOnboardingRouteAccess();
        if (cancelled) return;

        if (result.status === 'ok') {
          setStatus('authenticated');
          return;
        }

        if (result.status === 'vendor_portal') {
          redirectToVendorPortal();
          return;
        }

        navigate('/role-selection', { replace: true });
        return;
      }

      const result = await checkCustomerRouteAccess();
      if (cancelled) return;

      if (result.status === 'ok') {
        setStatus('authenticated');
        return;
      }

      if (result.status === 'vendor_portal') {
        redirectToVendorPortal();
        return;
      }

      navigate('/role-selection', { replace: true });
    };

    void checkAuth();

    return () => {
      cancelled = true;
    };
  }, [guard, navigate]);

  if (status === 'checking') {
    return <FullScreenLogoLoader />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
