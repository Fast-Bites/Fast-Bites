import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import PageLayout from '../components/PageLayout';
import LogoHeader from '../components/LogoHeader';
import { auth } from '../lib/api';

const SignUpForm: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmationSent, setConfirmationSent] = useState(false);

  const isPasswordValid = password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) return;

    setLoading(true);
    setError('');

    // Sign up with Supabase Auth
    const { data, error: authError } = await auth.signup(email, password);

    console.log('Signup response:', { data, authError }); // Debug

    setLoading(false);

    if (authError) {
      // If user already exists, show sign in option
      if (authError.includes('already registered') || authError.includes('already exists')) {
        setError('This email is already registered. Please sign in instead.');
        return;
      }
      setError(authError);
      return;
    }

    if (data) {
      // Check if email already exists (Supabase returns user with empty identities)
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setError('This email is already registered. Please sign in instead.');
        return;
      }
      
      // Store email for verification/profile steps
      sessionStorage.setItem('signup_email', email);
      
      // Check if email confirmation is required
      if (data.user && !data.session) {
        setConfirmationSent(true);
        return;
      }
      
      // No confirmation needed - go straight to profile
      navigate('/signup-form-2');
    }
  };


  return (
    <PageLayout showHeader={true} showFooter={true}>
      <LogoHeader title="Sign Up" subtitle="Create an account" />

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm mb-4">{error}</p>
      )}

      {/* Confirmation Sent Message */}
      {confirmationSent && (
        <div className="bg-green-900/30 border border-green-500 rounded-xl p-4 mb-6">
          <p className="text-green-400 text-sm mb-3">
            ✓ Verification email sent to <strong>{email}</strong>
          </p>
          <p className="text-muted-foreground text-xs mb-4">
            Choose how to verify:
          </p>
          <div className="flex flex-col gap-3">
            <Button 
              type="button"
              onClick={() => navigate('/verify-email')}
              variant="primary"
              className="w-full"
            >
              Enter 6-digit Code
            </Button>
            <p className="text-muted-foreground text-xs text-center">
              — or click the link in your email —
            </p>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="flex mb-10">
        <div className="flex-1 h-1 bg-primary rounded-full"></div>
        <div className="flex-1 h-1 bg-foreground rounded-full"></div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col">
        {/* Email Field */}
        <label className="text-foreground text-sm mb-2">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E.g johndoe@gmail.com"
          className="w-full p-3 bg-foreground rounded-xl text-background placeholder:text-muted-foreground mb-4"
        />

        {/* Password Field */}
        <label className="text-foreground text-sm mb-2">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimum of 6 characters"
          minLength={6}
          className="w-full p-3 bg-foreground rounded-xl text-background placeholder:text-muted-foreground mb-6"
        />

        {/* Remember Me Checkbox */}
        <div className="flex items-center mb-6">
          <button
            type="button"
            onClick={() => setRememberMe(!rememberMe)}
            className={`w-5 h-5 mr-2 border border-primary rounded flex items-center justify-center p-0.5 transition-colors bg-transparent`}
          >
            {rememberMe && (
              <svg 
                viewBox="0 0 12 12" 
                fill="none" 
                className="w-full h-full text-primary"
              >
                <path 
                  d="M2 6L5 9L10 3" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
          <label className="text-foreground text-sm">
            Remember me
          </label>
        </div>

        {/* Continue Button */}
        <Button 
          type="submit"
          disabled={!isPasswordValid || loading}
          variant="primary"
          className="mb-6"
        >
          {loading ? 'Creating account...' : 'Continue'}
        </Button>
      </form>
    </PageLayout>
  );
};

export default SignUpForm;
