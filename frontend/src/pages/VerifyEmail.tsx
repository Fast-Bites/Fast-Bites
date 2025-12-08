import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { auth } from '../lib/api';

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const email = sessionStorage.getItem('signup_email') || '';

  useEffect(() => {
    if (!email) {
      navigate('/signup-form');
    }
  }, [email, navigate]);

  useEffect(() => {
    // Auto-submit when all 6 digits are filled
    if (otp.every(digit => digit !== '')) {
      handleSubmit();
    }
  }, [otp]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) return;

    setLoading(true);
    setError('');

    const { data, error: verifyError } = await auth.verifyOtp(email, otpCode);

    setLoading(false);

    if (verifyError) {
      setError(verifyError);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      return;
    }

    if (data) {
      // Verified! Go to complete profile
      navigate('/signup-form-2');
    }
  };

  const handleResend = async () => {
    setLoading(true);
    const { error: resendError } = await auth.resendConfirmation(email);
    setLoading(false);
    
    if (resendError) {
      setError(resendError);
      return;
    }
    
    alert('New code sent to your email!');
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
        Verify Email
      </h1>
      
      {/* Subtext */}
      <p className="text-muted-foreground text-sm mb-6">
        Enter the 6-digit code sent to <span className="text-primary">{email}</span>
      </p>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm mb-4">{error}</p>
      )}

      {/* Progress Bar */}
      <div className="flex mb-10">
        <div className="flex-1 h-[1px] bg-foreground rounded-full"></div>
      </div>

      {/* OTP Input Boxes */}
      <div className="flex mb-8 justify-between">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={el => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-12 h-12 bg-[hsl(0_0%_19%)] border-2 border-primary rounded-xl text-foreground text-center text-xl font-semibold focus:outline-none focus:border-primary"
          />
        ))}
      </div>

      {/* Verify Button */}
      <Button 
        type="button"
        onClick={handleSubmit}
        disabled={loading || otp.some(d => !d)}
        variant="primary"
        className="mb-4"
      >
        {loading ? 'Verifying...' : 'Verify'}
      </Button>

      {/* Resend Code */}
      <button
        onClick={handleResend}
        disabled={loading}
        className="text-primary text-sm underline mb-6"
      >
        Didn't receive code? Resend
      </button>

      {/* Spacer */}
      <div className="flex-1"></div>
    </div>
  );
};

export default VerifyEmail;

