import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import PageLayout from '../components/PageLayout';
import LogoHeader from '../components/LogoHeader';
import { auth } from '../lib/api';

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      <LogoHeader title="Change Password" subtitle="Create a new secure password." />

      {/* Error Message */}
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

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
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Minimum of 6 characters"
          minLength={6}
          className="w-full p-3 bg-foreground rounded-xl text-background placeholder:text-muted-foreground mb-6"
        />
        {newPassword.length > 0 && !isPasswordValid && (
          <p className="text-red-500 text-xs mb-4">Password must be at least 6 characters</p>
        )}
        {isPasswordValid && (
          <div className="mb-4"></div>
        )}

        {/* Repeat Password Field */}
        <label className="text-foreground text-sm mb-2">
          Repeat password
        </label>
        <input
          type="password"
          value={repeatPassword}
          onChange={(e) => setRepeatPassword(e.target.value)}
          placeholder="Minimum of 6 characters"
          minLength={6}
          className="w-full p-3 bg-foreground rounded-xl text-background placeholder:text-muted-foreground mb-6"
        />
        {repeatPassword.length > 0 && !doPasswordsMatch && (
          <p className="text-red-500 text-xs mb-4">Passwords do not match</p>
        )}
        {doPasswordsMatch && (
          <p className="text-green-500 text-xs mb-4">Passwords match ✓</p>
        )}

        {/* Continue Button */}
        <Button 
          type="submit"
          disabled={!canProceed || loading}
          variant="primary"
          className="mb-6"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </Button>
      </form>

      {/* Spacer */}
      <div className="flex-1"></div>
    </PageLayout>
  );
};

export default ChangePassword;