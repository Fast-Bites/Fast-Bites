import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/api';
import FullScreenLogoLoader from '../components/FullScreenLogoLoader';

/**
 * Full-screen loading UI (matches ProtectedRoute auth check), signs out via Supabase,
 * then redirects to role selection.
 */
const Logout: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      await auth.signout();
      if (!cancelled) {
        navigate('/role-selection', { replace: true });
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return <FullScreenLogoLoader />;
};

export default Logout;
