import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Button from '../components/Button';
import { api } from '../lib/api';
import { CUSTOMER_ROLE, resolveCustomerProfileRole, setActiveRole } from '../lib/activeRole';
import { responsivePx, responsivePy } from '../constants/responsive';

const Complete: React.FC = () => {
    const navigate = useNavigate();
    const [fullName, setFullName] = useState('');

    useEffect(() => {
      // Get user's name from profile
      const fetchProfile = async () => {
        const role = resolveCustomerProfileRole();
        const { data } = await api.getProfile(role) as { data?: { first_name?: string; last_name?: string } };
        if (data) {
          const name = `${data.first_name || ''} ${data.last_name || ''}`.trim();
          setFullName(name);
          setActiveRole(role);
        }
      };
      fetchProfile();
    }, []);

    return (
        <div 
          className={`w-full min-h-screen bg-black flex flex-col items-center justify-center ${responsivePx} ${responsivePy} gap-6`}
        >
          <img 
            src="/assets/complete%20order%20mark.svg" 
            alt="Success" 
            className="w-32 h-auto object-contain" 
          />

          <p className="text-muted-foreground text-sm mb-6 text-center">
            You're all done.
            <br />
            Enjoy your experience{fullName ? `, ${fullName}` : ''}.
          </p>

          <Button
            variant="primary"
            onClick={() => {
              setActiveRole(resolveCustomerProfileRole(CUSTOMER_ROLE));
              navigate('/home');
            }}
          >
            Explore
          </Button>
        </div>
    );
};
export default Complete;