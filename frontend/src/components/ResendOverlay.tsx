import { useEffect, useState } from 'react';
import OverlayModalBackdropLayer from './OverlayModalBackdropLayer';

interface ResendOverlayProps {
  visible: boolean;
  message: string;
  secondsLeft?: number;
  onClose: () => void;
  type?: 'warning' | 'success';
  iconSrc?: string;
  title?: string;
  align?: 'center' | 'left';
}

const ResendOverlay: React.FC<ResendOverlayProps> = ({ 
  visible, 
  message, 
  secondsLeft: initialSeconds,
  onClose,
  type = 'warning',
  iconSrc,
  title,
  align = 'center',
}) => {
  const [countdown, setCountdown] = useState(initialSeconds || 0);

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
  const resolvedIconSrc = iconSrc ?? (type === 'warning' ? '/assets/warning 1.svg' : '/assets/checked 1.png');
  const resolvedIconAlt = type === 'warning' ? 'Warning' : 'Success';
  const isLeftAligned = align === 'left';
  const messageLines = message.split('\n');
  const isMultilineMessage = messageLines.length > 1;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <OverlayModalBackdropLayer />

      {/* Centered content wrapper */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Panel — bg from @theme: overlay-panel-background (see src/constants/colors.ts) */}
        <div 
          className={`flex flex-col px-6 py-4 max-w-lg mx-4 rounded-xl border border-white/15 bg-overlay-panel-background shadow-lg backdrop-blur-md ${
            isLeftAligned ? 'items-start' : 'items-center'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {title ? (
            <div className="mb-3 flex items-center gap-2">
              <img src={resolvedIconSrc} alt={resolvedIconAlt} className="h-5 w-5 shrink-0 opacity-80" />
              <span className="text-lg font-semibold text-foreground">{title}</span>
            </div>
          ) : (
            <img 
              src={resolvedIconSrc} 
              alt={resolvedIconAlt} 
              className="w-8 h-8 mb-4"
            />
          )}
          
          {/* Message with Countdown — multiline gets slightly larger gaps between lines (gap-2) */}
          {isMultilineMessage ? (
            <div
              className={`flex w-full flex-col gap-2 text-sm font-regular text-foreground ${
                isLeftAligned ? 'text-left' : 'text-center items-center'
              }`}
            >
              {messageLines.map((line, i) => (
                <p key={i} className={isLeftAligned ? 'text-left' : 'text-center'}>
                  {line}
                  {i === messageLines.length - 1 &&
                    type === 'warning' &&
                    countdown > 0 &&
                    ` ${countdown} seconds`}
                </p>
              ))}
            </div>
          ) : (
            <p className={`whitespace-pre-line text-foreground text-sm font-regular ${isLeftAligned ? 'text-left' : 'text-center'}`}>
              {message}{type === 'warning' && countdown > 0 && ` ${countdown} seconds`}
            </p>
          )}
        </div>

        {/* Tap to close — mt-4 = gap under card; increase for more space */}
        <p className="mt-4 text-xs text-muted-foreground">
          Tap anywhere to close
        </p>
      </div>
    </div>
  );
};

export default ResendOverlay;

