import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import PageLayout from '../components/PageLayout';
import LogoHeader from '../components/LogoHeader';
import { api, auth } from '../lib/api';
import {
  clearSelectedRole,
  getSelectedRole,
  isValidRole,
  setActiveRole,
} from '../lib/activeRole';
import { finalizeRestaurantAuth, isRestaurantRole } from '../lib/vendorRedirect';
import FullScreenLogoLoader from '../components/FullScreenLogoLoader';

const SignUpForm2: React.FC = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [dobError, setDobError] = useState('');
  const [profileRole, setProfileRole] = useState<string | null>(null);

  useEffect(() => {
    const selectedRole = getSelectedRole();
    if (!selectedRole || !isValidRole(selectedRole)) {
      navigate('/role-selection', { replace: true });
      return;
    }

    if (isRestaurantRole(selectedRole)) {
      void (async () => {
        const { data: user } = await auth.getUser();
        if (user && !user.email_confirmed_at) {
          navigate('/email-sent', { replace: true });
          return;
        }
        await finalizeRestaurantAuth();
      })();
      return;
    }

    setProfileRole(selectedRole);
  }, [navigate]);

  const today = new Date().toISOString().split('T')[0];
  const minDate = new Date(new Date().getFullYear() - 120, 0, 1).toISOString().split('T')[0];

  const isFormValid = firstName && lastName && dateOfBirth && phoneNumber && !dobError;

  const normalizePhoneNumber = (phone: string): string => {
    let cleaned = phone.replace(/[^\d+]/g, '');

    if (cleaned.startsWith('0')) {
      cleaned = '+234' + cleaned.substring(1);
    } else if (cleaned.startsWith('234') && !cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }

    return cleaned;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !profileRole) return;

    setLoading(true);
    setError('');
    setPhoneError('');

    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    const { error: apiError } = await api.createProfile({
      first_name: firstName,
      last_name: lastName,
      phone: normalizedPhone,
      dob: dateOfBirth || undefined,
      role: profileRole,
    });

    if (apiError) {
      setLoading(false);
      if (apiError.toLowerCase().includes('phone')) {
        setPhoneError(apiError);
      } else {
        setError(apiError);
      }
      return;
    }

    sessionStorage.removeItem('signup_email');
    clearSelectedRole();
    setActiveRole(profileRole);

    navigate('/location');
  };

  if (!profileRole) {
    return null;
  }

  if (loading) {
    return <FullScreenLogoLoader />;
  }

  return (
    <PageLayout showHeader={true} showFooter={true}>
      <LogoHeader title="Sign Up" subtitle="Almost done. Just a little more" />

      <div className="flex mb-10">
        <div className="flex-1 h-1 bg-primary rounded-full"></div>
      </div>

      {error && !phoneError && (
        <p className="text-red-500 text-sm mb-4">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col">
        <label className="text-foreground text-sm mb-2">
          First name
        </label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full p-3 bg-foreground rounded-xl text-background placeholder:text-muted-foreground mb-4"
        />

        <label className="text-foreground text-sm mb-2">
          Last name
        </label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full p-3 bg-foreground rounded-xl text-background placeholder:text-muted-foreground mb-4"
        />

        <label className="text-foreground text-sm mb-2">
          Date of birth
        </label>
        <input
          type="date"
          value={dateOfBirth}
          onChange={(e) => {
            const selectedDate = e.target.value;
            setDateOfBirth(selectedDate);

            if (selectedDate) {
              const selected = new Date(selectedDate);
              const todayDate = new Date();
              todayDate.setHours(0, 0, 0, 0);

              if (selected > todayDate) {
                setDobError('Date of birth cannot be in the future');
              } else {
                setDobError('');
              }
            } else {
              setDobError('');
            }
          }}
          max={today}
          min={minDate}
          className={`w-full p-3 bg-foreground rounded-xl text-background placeholder:text-muted-foreground ${dobError ? 'mb-2' : 'mb-4'}`}
        />
        {dobError && (
          <p className="text-red-500 text-xs mb-2">{dobError}</p>
        )}

        <label className="text-foreground text-sm mb-2">
          Phone number
        </label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => {
            const value = e.target.value.replace(/[^\d+]/g, '');
            const cleaned = value.replace(/\+/g, (match, index) => index === 0 ? match : '');
            setPhoneNumber(cleaned);
            if (phoneError) setPhoneError('');
          }}
          placeholder="+234..."
          className={`w-full p-3 bg-foreground rounded-xl text-background placeholder:text-muted-foreground ${phoneError ? 'mb-2' : 'mb-6'}`}
        />
        {phoneError && (
          <p className="text-red-500 text-xs mb-4">{phoneError}</p>
        )}

        <Button
          type="submit"
          disabled={!isFormValid || loading}
          variant="primary"
          className="mb-6"
        >
          {loading ? 'Creating account...' : 'Continue'}
        </Button>
      </form>
    </PageLayout>
  );
};

export default SignUpForm2;
