import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/api';
import FullScreenLogoLoader from './FullScreenLogoLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'checking' | 'authenticated' | 'redirecting'>('checking');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: session } = await auth.getSession();
      
      if (!session) {
        // Not logged in - show message then redirect
        setStatus('redirecting');
        
        // Wait a moment so user can read the message
        setTimeout(() => {
          navigate('/role-selection', { replace: true });
        }, 5000);
      } else {
        setStatus('authenticated');
      }
    };

    checkAuth();
  }, [navigate]);

  // Loading state - checking authentication
  if (status === 'checking') {
    return <FullScreenLogoLoader />;
  }

  // Not authenticated - show message before redirect
  if (status === 'redirecting') {
    return (
      <div className="w-full min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-8">   
        {/* Access message */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-24 h-24 rounded-xl bg-primary flex items-center justify-center">
            {/* Lock */}
            <img 
              src="/assets/lock.svg" 
              alt="lock" 
              className="object-contain p-4"
            />
          </div>
          <h2 className="text-foreground font-semibold text-xl">Sign in required</h2>
          <p className="text-foreground/80 text-sm max-w-xs">
            You need to be signed in to access this page. Redirecting you to sign in...
          </p>
        </div>

        {/* Progress indicator */}
        <div className="w-48 h-1 bg-foreground/10 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-progress" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;

