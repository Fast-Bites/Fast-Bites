import { useEffect, useState } from 'react';

interface ResendOverlayProps {
  visible: boolean;
  message: string;
  secondsLeft?: number;
  onClose: () => void;
  type?: 'warning' | 'success';
}

const ResendOverlay: React.FC<ResendOverlayProps> = ({ 
  visible, 
  message, 
  secondsLeft: initialSeconds,
  onClose,
  type = 'warning'
}) => {
  const [countdown, setCountdown] = useState(initialSeconds || 0);

  useEffect(() => {
    if (initialSeconds) {
      setCountdown(initialSeconds);
    }
  }, [initialSeconds]);

  useEffect(() => {
    if (!visible || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [visible, countdown]);

  // Auto-close after countdown reaches 0 or after 3 seconds for success messages
  useEffect(() => {
    if (!visible) return;

    if (type === 'success') {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, type, onClose]);

  if (!visible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Blurred backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
      
      {/* Centered content wrapper */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Glassy Content Container */}
        <div 
          className="flex flex-col items-center px-6 py-4 max-w-lg mx-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icon */}
          <img 
            src={type === 'warning' ? '/assets/warning 1.svg' : '/assets/checked 1.png'} 
            alt={type === 'warning' ? 'Warning' : 'Success'} 
            className="w-8 h-8 mb-4"
          />
          
          {/* Message with Countdown */}
          <p className="text-foreground text-center text-sm font-regular">
            {message}{type === 'warning' && countdown > 0 && ` ${countdown} seconds`}
          </p>
        </div>

        {/* Tap to close hint - outside the container */}
        <p className="text-muted-foreground text-xs mt-4">
          Tap anywhere to close
        </p>
      </div>
    </div>
  );
};

export default ResendOverlay;

