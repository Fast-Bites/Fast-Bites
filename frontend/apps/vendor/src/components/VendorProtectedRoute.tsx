import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { vendorAuth } from '@/lib/api';

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

  if (status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-foreground/70">Loading vendor portal...</p>
        </div>
      </div>
    );
  }

  if (status === 'denied') {
    return <Navigate to="/sign-in" replace />;
  }

  return <>{children}</>;
}
