import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import PageLayout from '../components/PageLayout';
import LogoHeader from '../components/LogoHeader';
import ResendOverlay from '../components/ResendOverlay';
import { auth } from '../lib/api';

// Helper to extract seconds from error message like "...after 58 seconds"
const extractSecondsFromError = (error: string): number | null => {
  const match = error.match(/after\s+(\d+)\s+second/i);
  return match ? parseInt(match[1], 10) : null;
};

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState('');
  const [overlaySeconds, setOverlaySeconds] = useState<number | undefined>();
  const [overlayType, setOverlayType] = useState<'warning' | 'success'>('warning');
  
  const email = sessionStorage.getItem('signup_email') || '';

  const closeOverlay = useCallback(() => {
    setOverlayVisible(false);
  }, []);

  const handleSubmit = useCallback(async (otpArray: string[]) => {
    const otpCode = otpArray.join('');
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
  }, [email, navigate]);

  useEffect(() => {
    if (!email) {
      navigate('/signup-form');
    }
  }, [email, navigate]);

  // Auto-submit when all 6 digits are filled
  const isOtpComplete = otp.every(digit => digit !== '');
  useEffect(() => {
    if (isOtpComplete) {
      handleSubmit(otp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOtpComplete]);

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

  const handleResend = async () => {
    setLoading(true);
    const { error: resendError } = await auth.resendConfirmation(email);
    setLoading(false);
    
    if (resendError) {
      const seconds = extractSecondsFromError(resendError);
      if (seconds) {
        setOverlayMessage('Try again after');
        setOverlaySeconds(seconds);
        setOverlayType('warning');
        setOverlayVisible(true);
      } else {
        setError(resendError);
      }
      return;
    }
    
    setOverlayMessage('New code sent to your email!');
    setOverlaySeconds(undefined);
    setOverlayType('success');
    setOverlayVisible(true);
  };

  return (
    <PageLayout showHeader={true} showFooter={false}>
      <LogoHeader 
        title="Email Verification" 
        subtitle="" 
      />

      {/* Progress Bar */}
      <div className="flex mb-6">
        <div className="flex-1 h-[1px] bg-foreground rounded-full"></div>
      </div>

      {/* Choose how to verify */}
      <p className="text-muted-foreground text-lg mb-4 text-left">
      Enter 6-digit code
      </p>

      {/* OTP Input Boxes */}
      <div className="flex mb-2 justify-between">
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

      {/* Error Message */}
      {error && <p className="text-red-500 text-xs mb-4">{error}</p>}
      {!error && <div className="mb-6"></div>}

      {/* Continue Button */}
      <Button 
        type="button"
        onClick={() => handleSubmit(otp)}
        disabled={loading || otp.some(d => !d)}
        disabledStyle={false}
        variant="primary"
        className="mb-4"
      >
        Continue
      </Button>

      {/* Resend Code */}
      <button
        onClick={handleResend}
        disabled={loading}
        className="text-primary text-xs underline mb-6 text-center"
      >
        Didn't receive code? Resend
      </button>

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* Resend Overlay */}
      <ResendOverlay
        visible={overlayVisible}
        message={overlayMessage}
        secondsLeft={overlaySeconds}
        onClose={closeOverlay}
        type={overlayType}
      />
    </PageLayout>
  );
};

export default VerifyEmail;

