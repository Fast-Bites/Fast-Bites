import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import PageLayout from '../components/PageLayout';

const RoleSelection: React.FC = () => {
  const navigate = useNavigate();

  const selectRole = (role: string) => {
    sessionStorage.setItem('selected_role', role);
    navigate('/signup');
  };

  return (
    <PageLayout showHeader={false} showFooter={true}>
      {/* Top spacer to balance footer */}
      <div className="flex-1" />
      
      {/* Content centered vertically */}
      <div className="flex flex-col justify-center">
        {/* Heading */}
        <h1 className="text-3xl font-light text-foreground text-center mb-2">
          Who Are You?
        </h1>
        
        {/* Subtext */}
        <p className="text-primary text-xs text-center mb-12">
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
    </PageLayout>
  );
};

export default RoleSelection;
