import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import PageLayout from '../components/PageLayout';

const SignUp: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageLayout showHeader={true} showFooter={true} paddingX="px-4">
      {/* Top spacer to balance footer */}
      <div className="flex-1" />
      
      {/* Content centered vertically */}
      <div className="flex flex-col justify-center">
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
        <div className="flex flex-col gap-5">
          {/* Google Button */}
          <Button 
            variant="foreground"
            size="base"
            icon="/assets/google.svg"
          >
            Sign up with Google
          </Button>

          {/* Manual signup Button */}
          <Button 
            onClick={() => navigate('/signup-form')}
            variant="foreground"
            size="base"
            icon="assets/Fast bite transparent I 1.svg"
            iconSize="w-8 h-8 -my-1"
          >
            Sign up with Fast Bites
          </Button>
        </div>


        {/* Divider with Or */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-foreground"></div>
          <span className="text-muted-foreground text-lg font-bold">Or</span>
          <div className="flex-1 h-px bg-foreground"></div>
        </div>

        {/* Sign up text */}
        <p className="text-foreground text-sm text-center mb-2">
          Already have an account?
        </p>

        {/* Log In Button */}
        <Button 
          onClick={() => navigate('/signin-form')}
          variant="primary"
        >
          Sign In
        </Button>
      </div>
    </PageLayout>
  );
};

export default SignUp;
