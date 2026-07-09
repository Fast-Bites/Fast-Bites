import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FullScreenLogoLoader from '../components/FullScreenLogoLoader';
import { finalizeRestaurantAuth } from '../lib/vendorRedirect';

const RestaurantAuthComplete: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    void finalizeRestaurantAuth().then((result) => {
      if (!result.ok) {
        setError(result.error || 'Could not continue to vendor portal.');
      }
    });
  }, []);

  if (error) {
    const needsVerify = error.toLowerCase().includes('verify your email');
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <p className="text-sm text-red-400">{error}</p>
        <button
          type="button"
          onClick={() => navigate(needsVerify ? '/email-sent' : '/signup')}
          className="text-sm text-primary underline"
        >
          {needsVerify ? 'Verify your email →' : 'Back to sign up'}
        </button>
      </div>
    );
  }

  return <FullScreenLogoLoader />;
};

export default RestaurantAuthComplete;
