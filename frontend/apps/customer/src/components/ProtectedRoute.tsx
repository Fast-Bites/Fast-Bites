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
  const [status, setStatus] = useState<'checking' | 'authenticated' | 'redirecting'>('checking');

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      if (guard === 'session') {
        const { data: session } = await auth.getSession();
        if (cancelled) return;

        if (!session) {
          setStatus('redirecting');
          setTimeout(() => {
            if (!cancelled) navigate('/role-selection', { replace: true });
          }, 5000);
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

        setStatus('redirecting');
        if (result.status === 'vendor_portal') {
          redirectToVendorPortal();
          return;
        }
        if (result.status === 'needs_role_selection') {
          navigate('/role-selection', { replace: true });
          return;
        }
        setTimeout(() => {
          if (!cancelled) navigate('/role-selection', { replace: true });
        }, 5000);
        return;
      }

      const result = await checkCustomerRouteAccess();
      if (cancelled) return;

      if (result.status === 'ok') {
        setStatus('authenticated');
        return;
      }

      setStatus('redirecting');

      if (result.status === 'vendor_portal') {
        redirectToVendorPortal();
        return;
      }

      if (result.status === 'needs_customer_signin') {
        navigate('/signin-form', { replace: true });
        return;
      }

      setTimeout(() => {
        if (!cancelled) navigate('/role-selection', { replace: true });
      }, 5000);
    };

    void checkAuth();

    return () => {
      cancelled = true;
    };
  }, [guard, navigate]);

  if (status === 'checking') {
    return <FullScreenLogoLoader />;
  }

  if (status === 'redirecting') {
    return (
      <div className="w-full min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-24 h-24 rounded-xl bg-primary flex items-center justify-center">
            <img src="/assets/lock.svg" alt="lock" className="object-contain p-4" />
          </div>
          <h2 className="text-foreground font-semibold text-xl">Sign in required</h2>
          <p className="text-foreground/80 text-sm max-w-xs">
            You need to be signed in to access this page. Redirecting you to sign in...
          </p>
        </div>

        <div className="w-48 h-1 bg-foreground/10 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-progress" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
