import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import PageLayout from '../components/PageLayout';
import LogoHeader from '../components/LogoHeader';
import { auth, api } from '../lib/api';

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchUserName = async () => {
      const { data: profile } = await api.getProfile() as { 
        data?: { first_name?: string; last_name?: string } 
      };
      if (profile?.first_name) {
        const fullName = `${profile.first_name}${profile.last_name ? ' ' + profile.last_name : ''}`;
        setUserName(fullName);
      }
    };
    fetchUserName();
  }, []);

  const isPasswordValid = newPassword.length >= 6;
  const doPasswordsMatch = newPassword === repeatPassword && repeatPassword.length > 0;
  const canProceed = isPasswordValid && doPasswordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canProceed) return;

    setLoading(true);
    setError('');

    const { error: authError } = await auth.updatePassword(newPassword);

    setLoading(false);

    if (authError) {
      setError(authError);
      return;
    }

    // Success - navigate to sign in
    navigate('/signin-form');
  };

  return (
    <PageLayout showHeader={true} showFooter={false}>
      <LogoHeader 
        title="Change Password" 
        subtitle={userName ? `Don't forget it this time, ${userName}.` : "Create a new secure password."} 
      />

      {/* Progress Bar */}
      <div className="flex mb-10">
        <div className="flex-1 h-[1px] bg-foreground rounded-full"></div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col">
        
        {/* New Password Field */}
        <label className="text-foreground text-sm mb-2">
          New password
        </label>
        <div className="relative mb-2">
          <input
            type={showNewPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimum of 6 characters"
            minLength={6}
            className="w-full p-3 pr-12 bg-foreground rounded-xl text-background placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
          >
            <img 
              src={showNewPassword ? '/assets/closed_eye.png' : '/assets/opened_eyes.png'} 
              alt={showNewPassword ? 'Hide password' : 'Show password'}
              className="w-5 h-5"
            />
          </button>
        </div>

        {newPassword.length > 0 && !isPasswordValid && (
          <p className="text-red-500 text-xs mb-2">Password must be at least 6 characters</p>
        )}

        {/* Repeat Password Field */}
        <label className="text-foreground text-sm mb-2">
          Repeat password
        </label>
        <div className="relative mb-2">
          <input
            type={showRepeatPassword ? 'text' : 'password'}
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            placeholder="Minimum of 6 characters"
            minLength={6}
            className="w-full p-3 pr-12 bg-foreground rounded-xl text-background placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={() => setShowRepeatPassword(!showRepeatPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
          >
            <img 
              src={showRepeatPassword ? '/assets/closed_eye.png' : '/assets/opened_eyes.png'} 
              alt={showRepeatPassword ? 'Hide password' : 'Show password'}
              className="w-5 h-5"
            />
          </button>
        </div>
        {repeatPassword.length > 0 && !doPasswordsMatch && (
          <p className="text-red-500 text-xs mb-2">Passwords do not match</p>
        )}
        {doPasswordsMatch && (
          <p className="text-green-500 text-xs mb-2">Passwords match ✓</p>
        )}

        {/* Error Message */}
        {error && <p className="text-red-500 text-xs mb-4">{error}</p>}

        {/* Continue Button */}
        <Button 
          type="submit"
          disabled={!canProceed || loading}
          variant="primary"
          className="mt-6"
        >
          {loading ? 'Continue' : 'Continue'}
        </Button>
      </form>

      {/* Spacer */}
      <div className="flex-1"></div>
    </PageLayout>
  );
};

export default ChangePassword;