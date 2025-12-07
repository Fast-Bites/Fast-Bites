import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

const RoleSelection: React.FC = () => {
  const navigate = useNavigate();

  const selectRole = (role: string) => {
    sessionStorage.setItem('signup_role', role);
    navigate('/signup');
  };

  return (
    <div className="w-full min-h-screen bg-background flex flex-col font-[var(--font-poppins)] px-6">
      {/* Spacer to center content vertically */}
      <div className="flex-1 flex flex-col justify-center">
        {/* Heading */}
        <h1 className="text-3xl font-light text-foreground text-center mb-2">
          Who Are You?
        </h1>
        
        {/* Subtext */}
        <p className="text-primary text-xs text-center mb-16">
          Pick a role according to how you use the app
        </p>
        
        {/* Role Buttons */}
        <div className="flex flex-col gap-5">
          {/* Customer Button - Primary filled */}
          <Button 
            onClick={() => selectRole('customer')}
            variant="primary"
          >
            Customer
          </Button>
          
          {/* Rider Button - White outline */}
          <Button 
            onClick={() => selectRole('rider')}
            variant="foreground"
          >
            Rider
          </Button>
          
          {/* Restaurant Button - Accent */}
          <Button 
            onClick={() => selectRole('restaurant')}
            variant="accent"
          >
            Restaurant
          </Button>
        </div>
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

export default RoleSelection;
