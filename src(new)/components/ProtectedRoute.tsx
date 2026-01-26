import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/api';

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
    return (
      <div className="w-full min-h-screen bg-black flex flex-col items-center justify-center">
        <img 
          src="/logo/Fast bite transparent I.png" 
          alt="Fast Bites" 
          className="w-1/2 h-1/2 object-contain animate-zoom-pulse"
        />
      </div>
    );
  }

  // Not authenticated - show message before redirect
  if (status === 'redirecting') {
    return (
      <div className="w-full min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-8">
        {/* Logo */}
        <img 
          src="/logo/Fast bite transparent I.png" 
          alt="Fast Bites" 
          className="w-28 h-28 object-contain opacity-50"
        />
        
        {/* Access message */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <svg 
              className="w-6 h-6 text-primary" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
              />
            </svg>
          </div>
          <h2 className="text-foreground font-semibold text-xl">Sign in required</h2>
          <p className="text-foreground/60 text-sm max-w-xs">
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

