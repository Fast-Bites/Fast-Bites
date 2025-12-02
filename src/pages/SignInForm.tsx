import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

const SignInForm: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

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

      {/* Progress Bar */}
      <div className="flex mb-10">
        <div className="flex-1 h-[1px] bg-foreground rounded-full"></div>
      </div>

      {/* Form */}
      <form className="flex flex-col">
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
            className={`w-4 h-4 mr-2 border-2 border-primary rounded flex items-center justify-center transition-colors ${
              rememberMe ? 'bg-primary' : 'bg-background'
            }`}
          >
            {rememberMe && (
              <svg 
                viewBox="0 0 12 12" 
                fill="none" 
                className="w-3 h-3"
              >
                <path 
                  d="M2 6L5 9L10 3" 
                  stroke="white" 
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
          variant="primary"
          className="mb-6"
        >
          Continue
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
      {/* <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-foreground"></div>
        <span className="text-muted-foreground text-lg font-bold">Or</span>
        <div className="flex-1 h-px bg-foreground"></div>
      </div> */}

      {/* Social Sign Up Buttons */}
      {/* <div className="flex flex-col gap-4"> */}
        {/* Google Button */}
        {/* <Button 
          variant="foreground"
          size="base"
          icon="/assets/google.svg"
        >
          Sign up with Google
        </Button>
         */}
        {/* Apple Button */}
        {/* <Button 
          variant="foreground"
          size="base"
          icon="/assets/apple.svg"
        >
          Sign up with Apple
        </Button>
      </div> */}

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
