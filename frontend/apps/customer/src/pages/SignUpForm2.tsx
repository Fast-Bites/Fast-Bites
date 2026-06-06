import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import PageLayout from '../components/PageLayout';
import LogoHeader from '../components/LogoHeader';
import { api } from '../lib/api';

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

  // Get today's date in YYYY-MM-DD format for max attribute
  const today = new Date().toISOString().split('T')[0];
  // Minimum date (e.g., 120 years ago)
  const minDate = new Date(new Date().getFullYear() - 120, 0, 1).toISOString().split('T')[0];

  const isFormValid = firstName && lastName && dateOfBirth && phoneNumber && !dobError;

  // Normalize phone number to international format (+234...)
  const normalizePhoneNumber = (phone: string): string => {
    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // If starts with 0, replace with +234 (Nigerian format)
    if (cleaned.startsWith('0')) {
      cleaned = '+234' + cleaned.substring(1);
    }
    // If starts with 234 without +, add +
    else if (cleaned.startsWith('234') && !cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }
    
    return cleaned;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setError('');
    setPhoneError('');

    const role = sessionStorage.getItem('selected_role') || 'customer';
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    
    // Create profile via backend (uses Supabase JWT for auth)
    const { error: apiError } = await api.createProfile({
      first_name: firstName,
      last_name: lastName,
      phone: normalizedPhone,
      dob: dateOfBirth || undefined,
      role,
    });

    setLoading(false);

    if (apiError) {
      // Check if it's a phone-related error
      if (apiError.toLowerCase().includes('phone')) {
        setPhoneError(apiError);
      } else {
        setError(apiError);
      }
      return;
    }

    // Clear session storage
    sessionStorage.removeItem('signup_email');
    sessionStorage.removeItem('selected_role');

    // Success - navigate to next page
    navigate('/location');
  };

  return (
    <PageLayout showHeader={true} showFooter={true}>
      <LogoHeader title="Sign Up" subtitle="Almost done. Just a little more" />

      {/* Progress Bar - Full */}
      <div className="flex mb-10">
        <div className="flex-1 h-1 bg-primary rounded-full"></div>
      </div>

      {/* General Error Message */}
      {error && !phoneError && (
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
          onChange={(e) => {
            const selectedDate = e.target.value;
            setDateOfBirth(selectedDate);
            
            // Validate date
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
        {/* DOB Error Message */}
        {dobError && (
          <p className="text-red-500 text-xs mb-2">{dobError}</p>
        )}

        {/* Phone Number Field */}
        <label className="text-foreground text-sm mb-2">
          Phone number
        </label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => {
            // Only allow + and digits
            const value = e.target.value.replace(/[^\d+]/g, '');
            // Ensure + can only appear at the start
            const cleaned = value.replace(/\+/g, (match, index) => index === 0 ? match : '');
            setPhoneNumber(cleaned);
            // Clear phone error when user types
            if (phoneError) setPhoneError('');
          }}
          placeholder="+234..."
          className={`w-full p-3 bg-foreground rounded-xl text-background placeholder:text-muted-foreground ${phoneError ? 'mb-2' : 'mb-6'}`}
        />
        {/* Phone Error Message */}
        {phoneError && (
          <p className="text-red-500 text-xs mb-4">{phoneError}</p>
        )}

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
    </PageLayout>
  );
};

export default SignUpForm2;
