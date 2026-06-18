import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import PageLayout from '../components/PageLayout';
import LogoHeader from '../components/LogoHeader';
import { auth } from '../lib/api';
import { getRememberMeCheckboxPreference, persistRememberMeCheckboxPreference } from '../lib/supabase';
import {
  applyRoleAuthResult,
  continueWithRole,
} from '../lib/roleAuthFlow';
import { getSelectedRole, isValidRole } from '../lib/activeRole';
import FullScreenLogoLoader from '../components/FullScreenLogoLoader';

const SignInForm: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => getRememberMeCheckboxPreference() ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegisterLink, setShowRegisterLink] = useState(false);
  const [showVerifyLink, setShowVerifyLink] = useState(false);

  const selectedRole = getSelectedRole();

  useEffect(() => {
    if (!selectedRole || !isValidRole(selectedRole)) {
      navigate('/role-selection', { replace: true });
    }
  }, [navigate, selectedRole]);

  const clearMessages = () => {
    setError('');
    setShowRegisterLink(false);
    setShowVerifyLink(false);
  };

  const applyResult = (result: Parameters<typeof applyRoleAuthResult>[0]) => {
    applyRoleAuthResult(result, {
      setError,
      setShowVerifyLink,
      setShowRegisterLink,
    });
  };

  const runRoleFlow = async () => {
    if (!selectedRole) return false;

    const result = await continueWithRole(selectedRole, navigate);
    if (result.status === 'verify_email') {
      navigate('/email-sent', { replace: true });
      return true;
    }
    applyResult(result);
    return result.status === 'ok' || result.status === 'complete_signup';
  };

  useEffect(() => {
    let cancelled = false;

    void auth.getSession().then(({ data: session }) => {
      if (cancelled || !session?.user?.email) return;
      setEmail(session.user.email);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    clearMessages();

    const { data, error: authError } = await auth.signin(email, password, rememberMe);

    if (authError) {
      setLoading(false);
      if (authError.toLowerCase().includes('invalid')) {
        setError('Invalid email or password. Please try again.');
        setShowRegisterLink(true);
      } else if (authError.toLowerCase().includes('email not confirmed')) {
        setError('Please verify your email before signing in.');
        setShowVerifyLink(true);
        sessionStorage.setItem('signup_email', email);
      } else {
        setError(authError);
      }
      return;
    }

    if (data) {
      persistRememberMeCheckboxPreference(rememberMe);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    await runRoleFlow();
    setLoading(false);
  };

  if (!selectedRole || !isValidRole(selectedRole)) {
    return null;
  }

  if (loading) {
    return <FullScreenLogoLoader />;
  }

  return (
    <PageLayout showHeader={true} showFooter={true}>
      <LogoHeader title="Sign in" subtitle="Welcome back" />

      <div className="flex mb-10">
        <div className="flex-1 h-[1px] bg-foreground rounded-full"></div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col">
        <label className="text-foreground text-sm mb-2">Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E.g johndoe@gmail.com"
          className="w-full p-3 bg-foreground rounded-xl text-background placeholder:text-muted-foreground mb-4"
        />

        <label className="text-foreground text-sm mb-2">Password</label>
        <div className="relative mb-2">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="E.g joHnoE123@"
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

        {error && (
          <div className="mb-2">
            <p className="text-red-500 text-xs">{error}</p>
            {showRegisterLink && (
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="text-primary text-xs underline mt-1"
              >
                Don&apos;t have an account? Sign up →
              </button>
            )}
            {showVerifyLink && (
              <button
                type="button"
                onClick={() => navigate('/email-sent')}
                className="text-primary text-xs underline mt-1"
              >
                Verify your email →
              </button>
            )}
          </div>
        )}

        <div className="flex items-center mb-6">
          <button
            type="button"
            onClick={() => setRememberMe(!rememberMe)}
            className="w-5 h-5 mr-2 border border-primary rounded flex items-center justify-center p-0.5 transition-colors bg-transparent"
          >
            {rememberMe && (
              <svg viewBox="0 0 12 12" fill="none" className="w-full h-full text-primary">
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
          <label className="text-foreground text-sm">Remember me</label>
        </div>

        <Button
          type="submit"
          disabled={loading || !email || !password}
          variant="primary"
          className="mb-6"
        >
          Continue
        </Button>
      </form>

      <button
        onClick={() => navigate('/forgot-password')}
        className="text-foreground text-sm text-primary mb-5 text-left"
      >
        Forgot Password?
      </button>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-foreground"></div>
        <span className="text-muted-foreground text-lg font-bold">Or</span>
        <div className="flex-1 h-px bg-foreground"></div>
      </div>

      <div className="flex flex-col gap-4">
        <Button variant="foreground" size="base" icon="/assets/google.svg">
          Sign in with Google
        </Button>
      </div>
    </PageLayout>
  );
};

export default SignInForm;
