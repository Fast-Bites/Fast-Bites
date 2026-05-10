import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import PageLayout from '../components/PageLayout';
import LogoHeader from '../components/LogoHeader';
import { auth } from '../lib/api';
import { getRememberMeCheckboxPreference, persistRememberMeCheckboxPreference } from '../lib/supabase';

const SignUpForm: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => getRememberMeCheckboxPreference() ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSignInLink, setShowSignInLink] = useState(false);

  const isPasswordValid = password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) return;

    setLoading(true);
    setError('');
    setShowSignInLink(false);

    // Sign up with Supabase Auth
    const { data, error: authError } = await auth.signup(email, password, rememberMe);

    console.log('Signup response:', { data, authError }); // Debug

    setLoading(false);

    if (authError) {
      const lower = authError.toLowerCase();
      if (
        lower.includes('already registered') ||
        lower.includes('already exists') ||
        lower.includes('user already')
      ) {
        setError('This email is already registered. Please sign in instead.');
        setShowSignInLink(true);
        return;
      }
      setError(authError);
      return;
    }

    if (data) {
      // Check if email already exists (Supabase returns user with empty identities)
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setError('This email is already registered. Please sign in instead.');
        setShowSignInLink(true);
        return;
      }

      persistRememberMeCheckboxPreference(rememberMe);

      // Store email for verification/profile steps
      sessionStorage.setItem('signup_email', email);

      // Check if email confirmation is required
      if (data.user && !data.session) {
        // Navigate to email sent page
        navigate('/email-sent');
        return;
      }

      // No confirmation needed - go straight to profile
      navigate('/signup-form-2');
    }
  };


  return (
    <PageLayout showHeader={true} showFooter={true}>
      <LogoHeader title="Sign Up" subtitle="Create an account" />

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
        <div className="relative mb-2">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum of 6 characters"
            minLength={6}
            className="w-full p-3 pr-12 bg-foreground rounded-xl text-background placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
          >
            <img 
              src={showPassword ? '/assets/closed_eye.png' : '/assets/opened_eyes.png'} 
              alt={showPassword ? 'Hide password' : 'Show password'}
              className="w-5 h-5"
            />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4">
            <p className="text-xs text-red-500">{error}</p>
            {showSignInLink && (
              <button
                type="button"
                onClick={() => navigate('/signin-form')}
                className="mt-1 text-xs text-primary underline"
              >
                Sign in →
              </button>
            )}
          </div>
        )}

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
