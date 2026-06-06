import { useEffect, useState, useCallback } from 'react';
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

const EmailSent: React.FC = () => {
  const navigate = useNavigate();
  const email = sessionStorage.getItem('signup_email') || '';
  
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState('');
  const [overlaySeconds, setOverlaySeconds] = useState<number | undefined>();
  const [overlayType, setOverlayType] = useState<'warning' | 'success'>('warning');

  useEffect(() => {
    if (!email) {
      navigate('/signup-form');
    }
  }, [email, navigate]);

  const closeOverlay = useCallback(() => {
    setOverlayVisible(false);
  }, []);

  const handleResend = async () => {
    const { error: resendError } = await auth.resendConfirmation(email);
    
    if (resendError) {
      const seconds = extractSecondsFromError(resendError);
      if (seconds) {
        setOverlayMessage('Try again after');
        setOverlaySeconds(seconds);
        setOverlayType('warning');
      } else {
        setOverlayMessage(resendError);
        setOverlaySeconds(undefined);
        setOverlayType('warning');
      }
      setOverlayVisible(true);
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
        subtitle={<>A verification code has been sent to <span className="text-primary">{email}</span></>} 
      />

      {/* Progress Bar */}
      <div className="flex mb-6">
        <div className="flex-1 h-[1px] bg-foreground rounded-full"></div>
      </div>

      {/* Choose how to verify */}
      <p className="text-muted-foreground text-lg mb-4 text-left">
        Choose how to verify:
      </p>

      {/* Enter Code Button */}
      <Button 
        type="button"
        onClick={() => navigate('/verify-email')}
        variant="primary"
        className="mb-4"
      >
        Enter 6-digit Code
      </Button>

      {/* Or use link text */}
      <p className="text-muted-foreground text-xs text-center mb-6">
        — or click the link in your email —
      </p>

      {/* Resend Code */}
      <button
        onClick={handleResend}
        className="text-primary text-xs underline mb-6"
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

export default EmailSent;

