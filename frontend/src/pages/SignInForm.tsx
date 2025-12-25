import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { auth, api } from '../lib/api';

const SignInForm: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegisterLink, setShowRegisterLink] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError('');
    setShowRegisterLink(false);

    const { data, error: authError } = await auth.signin(email, password);

    setLoading(false);

    if (authError) {
      // Supabase returns generic "Invalid login credentials" for security
      // We show a user-friendly message that covers both cases
      if (authError.toLowerCase().includes('invalid')) {
        setError('Invalid email or password. Please try again.');
        setShowRegisterLink(true);
      } else if (authError.toLowerCase().includes('email not confirmed')) {
        setError('Please confirm your email before signing in.');
      } else {
        setError(authError);
      }
      return;
    }

    if (data) {
      // Wait a moment for session to be fully established
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check if user has a profile
      const { data: profile, error: profileError } = await api.getProfile() as { 
        data?: { role?: string; address?: string }; 
        error?: string 
      };
      
      console.log('Profile check:', { profile, profileError }); // Debug log
      
      if (profileError) {
        // No profile yet - go to complete signup
        navigate('/signup-form-2');
      } else {
        // Check if role matches
        const selectedRole = sessionStorage.getItem('selected_role');
        console.log('Role check:', { selectedRole, profileRole: profile?.role }); // Debug
        
        if (selectedRole && profile?.role) {
          if (profile.role !== selectedRole) {
            // Role mismatch - sign out and show error
            await auth.signout();
            setError(`Incorrect role. Please select the correct role.`);
            return;
          }
        }
        
        // Check if user has completed setup (has address)
        if (profile?.address) {
          // Fully set up - go to home
          navigate('/home');
        } else {
          // Needs to set location
          navigate('/location');
        }
      }
    }
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
        Sign in
      </h1>
      
      {/* Subtext */}
      <p className="text-muted-foreground text-sm mb-6">
        Welcome back
      </p>

      {/* Error Message */}
      {error && (
        <div className="mb-4">
          <p className="text-red-500 text-sm">{error}</p>
          {showRegisterLink && (
            <button
              onClick={() => navigate('/signup')}
              className="text-primary text-sm underline mt-2"
            >
              Don't have an account? Sign up →
            </button>
          )}
        </div>
      )}

      {/* Progress Bar */}
      <div className="flex mb-10">
        <div className="flex-1 h-[1px] bg-foreground rounded-full"></div>
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
          placeholder="E.g joHnoE123@"
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
          disabled={!email || !password || loading}
          variant="primary"
          className="mb-6"
        >
          {loading ? 'Signing in...' : 'Continue'}
        </Button>
      </form>

      {/* Forgot Password */}
        <button
          onClick={() => navigate('/forgot-password')}
          className="text-foreground text-sm text-primary mb-5 text-left"
        >
          Forgot Password?
        </button>

      {/* Divider with Or */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-foreground"></div>
        <span className="text-muted-foreground text-lg font-bold">Or</span>
        <div className="flex-1 h-px bg-foreground"></div>
      </div>

      {/* Social Sign In Buttons */}
      <div className="flex flex-col gap-4">
        {/* Google Button */}
        <Button 
          variant="foreground"
          size="base"
          icon="/assets/google.svg"
        >
          Sign in with Google
        </Button>
      </div>

      {/* Spacer */}
      <div className="flex-1"></div>
      
      {/* Footer */}
      <div className="pb-8 pt-12">
        <p className="text-muted-foreground text-xs text-center">
          By using this application, you agree to our{' '}
          <button 
            onClick={() => navigate('/terms')}
            className="text-primary"
          >
            Terms
          </button>{' '}
          and
          <br />
          <button 
            onClick={() => navigate('/privacy-policy')}
            className="text-primary"
          >
            Privacy policy
          </button>.
        </p>
      </div>
    </div>
  );
};

export default SignInForm;
