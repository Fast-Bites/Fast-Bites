import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import PageLayout from '../components/PageLayout';
import {
  CUSTOMER_ROLE,
  RIDER_ROLE,
  RESTAURANT_ROLE,
  setSelectedRole,
} from '../lib/activeRole';

const RoleSelection: React.FC = () => {
  const navigate = useNavigate();

  const selectRole = (role: string) => {
    setSelectedRole(role);
    navigate('/signup');
  };

  return (
    <PageLayout showHeader={false} showFooter={true}>
      <div className="flex-1" />

      <div className="flex flex-col justify-center">
        <h1 className="text-3xl font-light text-foreground text-center mb-2">Who Are You?</h1>

        <p className="text-primary text-xs text-center mb-12">
          Pick a role according to how you use the app
        </p>

        <div className="flex flex-col gap-5">
          <Button onClick={() => void selectRole(CUSTOMER_ROLE)} variant="primary">
            Customer
          </Button>

          <Button onClick={() => void selectRole(RIDER_ROLE)} variant="foreground">
            Rider
          </Button>

          <Button onClick={() => void selectRole(RESTAURANT_ROLE)} variant="accent">
            Restaurant
          </Button>
        </div>
      </div>
    </PageLayout>
  );
};

export default RoleSelection;
