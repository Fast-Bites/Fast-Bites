import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { auth } from '../lib/api';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const verifyOtp = useCallback(async (otpArray: string[]) => {
    const otpCode = otpArray.join('');
    if (otpCode.length !== 6) return;

    setLoading(true);
    setError('');

    const { error: authError } = await auth.verifyRecoveryOtp(email, otpCode);

    setLoading(false);

    if (authError) {
      setError(authError);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      return;
    }

    navigate('/change-password');
  }, [email, navigate]);

  // Auto-submit when all 6 digits are filled
  const isOtpComplete = showOtpInput && otp.every(digit => digit !== '');
  useEffect(() => {
    if (isOtpComplete && !loading) {
      verifyOtp(otp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOtpComplete]);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');

    const { error: authError } = await auth.forgotPassword(email);

    setLoading(false);

    if (authError) {
      setError(authError);
      return;
    }

    setEmailSent(true);
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');

    const { error: authError } = await auth.resendRecoveryEmail(email);

    setLoading(false);

    if (authError) {
      setError(authError);
      return;
    }

    alert('New code sent to your email!');
  };

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

  const handleVerifyOtp = () => {
    verifyOtp(otp);
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
        Recovery
      </h1>
      
      {/* Subtext */}
      <p className="text-muted-foreground text-sm mb-6">
        {!emailSent 
          ? 'Enter your email to receive a password reset link.' 
          : showOtpInput
            ? <>Let’s help you continue your experience.</>
            : 'Check your email for the reset link or enter the code.'}
      </p>

      {/* Error Message */}
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {/* Progress Bar */}
      <div className="flex mb-10">
        <div className="flex-1 h-[1px] bg-foreground rounded-full"></div>
      </div>

      {/* Email Form - show before email sent */}
      {!emailSent && (
        <form onSubmit={handleSendEmail} className="flex flex-col">
          <label className="text-foreground text-sm mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E.g johndoe@gmail.com"
            className="w-full p-3 bg-foreground rounded-xl text-background placeholder:text-muted-foreground mb-6"
          />

          <Button 
            type="submit"
            disabled={!email || loading}
            variant="primary"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
      )}

      {/* After email sent - show options */}
      {emailSent && !showOtpInput && (
        <div className="flex flex-col">
          {/* Success message */}
          <p className="text-green-500 text-sm mb-6">
            Reset link sent! Check your email.
          </p>

          {/* Option buttons */}
          <Button 
            onClick={() => setShowOtpInput(true)}
            variant="primary"
            className="mb-3"
          >
            Enter 6-digit Code
          </Button>

          <p className="text-muted-foreground text-xs text-center mb-6">
            Or click the link in your email to proceed directly.
          </p>

          {/* Resend option */}
          <button
            onClick={handleResend}
            disabled={loading}
            className="text-primary text-sm underline"
          >
            Didn't receive it? Resend
          </button>
        </div>
      )}

      {/* OTP Input Form - matching VerifyEmail.tsx style */}
      {emailSent && showOtpInput && (
        <div className="flex flex-col">
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
            onClick={handleVerifyOtp}
            disabled={loading || otp.some(d => !d)}
            variant="primary"
            className="mb-4"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </Button>

          <button
            type="button"
            onClick={() => setShowOtpInput(false)}
            className="text-muted-foreground text-sm mb-4"
          >
            ← Back to options
          </button>

          {/* Resend Code */}
          <button
            onClick={handleResend}
            disabled={loading}
            className="text-primary text-sm underline"
          >
            Didn't receive code? Resend
          </button>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1"></div>
    </div>
  );
};

export default ForgotPassword;
