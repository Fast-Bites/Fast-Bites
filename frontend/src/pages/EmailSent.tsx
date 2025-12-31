import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import PageLayout from '../components/PageLayout';
import LogoHeader from '../components/LogoHeader';
import { auth } from '../lib/api';

const EmailSent: React.FC = () => {
  const navigate = useNavigate();
  const email = sessionStorage.getItem('signup_email') || '';

  useEffect(() => {
    if (!email) {
      navigate('/signup-form');
    }
  }, [email, navigate]);

  const handleResend = async () => {
    const { error: resendError } = await auth.resendConfirmation(email);
    
    if (resendError) {
      alert(resendError);
      return;
    }
    
    alert('New code sent to your email!');
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
        className="text-primary text-sm underline mb-6"
      >
        Didn't receive code? Resend
      </button>

      {/* Spacer */}
      <div className="flex-1"></div>
    </PageLayout>
  );
};

export default EmailSent;

