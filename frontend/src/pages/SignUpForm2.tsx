import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { api } from '../lib/api';

const SignUpForm2: React.FC = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isFormValid = firstName && lastName && dateOfBirth && phoneNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setError('');

    const role = sessionStorage.getItem('signup_role') || 'customer';
    
    // Create profile via backend (uses Supabase JWT for auth)
    const { error: apiError } = await api.createProfile({
      first_name: firstName,
      last_name: lastName,
      phone: phoneNumber,
      dob: dateOfBirth || undefined,
      role,
    });

    setLoading(false);

    if (apiError) {
      setError(apiError);
      return;
    }

    // Clear session storage
    sessionStorage.removeItem('signup_email');
    sessionStorage.removeItem('signup_role');

    // Success - navigate to next page
    navigate('/location');
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
        Sign Up
      </h1>
      
      {/* Subtext */}
      <p className="text-muted-foreground text-sm mb-6">
        Almost done. Just a little more
      </p>

      {/* Progress Bar - Full */}
      <div className="flex mb-10">
        <div className="flex-1 h-1 bg-primary rounded-full"></div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm mb-4">{error}</p>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col">
        {/* First Name Field */}
        <label className="text-foreground text-sm mb-2">
          First name
        </label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full p-3 bg-foreground rounded-xl text-background placeholder:text-muted-foreground mb-4"
        />

        {/* Last Name Field */}
        <label className="text-foreground text-sm mb-2">
          Last name
        </label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full p-3 bg-foreground rounded-xl text-background placeholder:text-muted-foreground mb-4"
        />

        {/* Date of Birth Field */}
        <label className="text-foreground text-sm mb-2">
          Date of birth
        </label>
        <input
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          placeholder="1/12/1997"
          className="w-full p-3 bg-foreground rounded-xl text-background placeholder:text-muted-foreground mb-4"
        />

        {/* Phone Number Field */}
        <label className="text-foreground text-sm mb-2">
          Phone number
        </label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="w-full p-3 bg-foreground rounded-xl text-background placeholder:text-muted-foreground mb-6"
        />

        {/* Continue Button */}
        <Button 
          type="submit"
          disabled={!isFormValid || loading}
          variant="primary"
          className="mb-6"
        >
          {loading ? 'Creating account...' : 'Continue'}
        </Button>
      </form>

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

export default SignUpForm2;
