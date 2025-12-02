import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');

  const isPasswordValid = newPassword.length >= 6;
  const doPasswordsMatch = newPassword === repeatPassword && repeatPassword.length > 0;
  const canProceed = isPasswordValid && doPasswordsMatch;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canProceed) {
      return;
    }
    // TODO: Implement password change logic
    console.log('Password changed successfully');
  };

  return (
    <div className="w-full min-h-screen bg-background flex flex-col font-[var(--font-poppins)] px-4">
      {/* Back Button */}
      <div className="pt-12">
        <button 
          onClick={() => navigate(-1)}
          className="text-foreground text-4xl"
        >
          &#x3c;
        </button>
      </div>

      {/* Logo */}
      <div className="mt-6 mb-2">
        <img 
          src="/logo/Fast bite transparent I.png" 
          alt="Fast Bites" 
          className="h-[5rem] object-contain"
        />
      </div>

      {/* Heading */}
      <h1 className="text-3xl font-bold text-foreground mb-1">
        Change Password
      </h1>
      
      {/* Subtext */}
      <p className="text-muted-foreground text-sm mb-6">
        Don’t forget it this time, John Doe.
      </p>

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
          disabled={!canProceed}
          variant="primary"
          className="mb-6"
        >
          Continue
        </Button>
      </form>
    </div>
  );
};

export default ChangePassword;