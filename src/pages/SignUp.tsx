import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

const SignUp: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-background flex flex-col font-[var(--font-poppins)] px-6">
      {/* Back Button */}
      <div className="pt-12">
        <button 
          onClick={() => navigate(-1)}
          className="text-foreground text-4xl"
        >
          &#x3c;
        </button>
      </div>

      {/* Spacer to center content */}
      <div className="flex-1 flex flex-col justify-center">
        {/* Heading */}
        <h1 className="text-3xl font-light text-foreground text-center mb-2">
          Welcome to Fast Bites
        </h1>
        
        {/* Subtext */}
        <p className="text-muted-foreground text-xs text-center mb-12">
          Getting meals can be a hassle, get yours on time with us.
          <br />
          Sign up to start
        </p>
        
        {/* Social Sign Up Buttons */}
        <div className="flex flex-col gap-4">
          {/* Google Button */}
          <Button 
            variant="foreground"
            size="base"
            icon="/assets/google.svg"
          >
            Sign up with Google
          </Button>
        </div>

        {/* Divider with Or */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-foreground"></div>
          <span className="text-muted-foreground text-lg font-bold">Or</span>
          <div className="flex-1 h-px bg-foreground"></div>
        </div>

        {/* Sign up text */}
        <p className="text-foreground text-sm text-center mb-8">
          Don't have an account? <button onClick={() => navigate('/signup-form')} className="font-semibold">Sign up</button>
        </p>

        {/* Log In Button */}
        <Button 
          onClick={() => navigate('/signin-form')}
          variant="primary"
        >
          Sign In
        </Button>
      </div>
      
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

export default SignUp;
