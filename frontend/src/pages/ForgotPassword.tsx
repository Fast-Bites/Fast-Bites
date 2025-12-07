import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { auth } from '../lib/api';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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

    setSuccess(true);
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
        Enter your email to receive a password reset link.
      </p>

      {/* Error/Success Messages */}
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {success && (
        <p className="text-green-500 text-sm mb-4">
          Reset link sent! Check your email.
        </p>
      )}

      {/* Progress Bar */}
      <div className="flex mb-10">
        <div className="flex-1 h-[1px] bg-foreground rounded-full"></div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col">
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

        {/* Continue Button */}
        <Button 
          type="submit"
          disabled={!email || loading || success}
          variant="primary"
        >
          {loading ? 'Sending...' : success ? 'Email Sent' : 'Send Reset Link'}
        </Button>
      </form>

      {/* Spacer */}
      <div className="flex-1"></div>
    </div>
  );
};

export default ForgotPassword;
