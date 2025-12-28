import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  /** Button style variant */
  variant?: 'default' | 'map';
  /** Additional className */
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ 
  variant = 'default',
  className = '' 
}) => {
  const navigate = useNavigate();

  if (variant === 'map') {
    return (
      <button 
        onClick={() => navigate(-1)}
        className={`text-foreground text-4xl bg-primary rounded-full w-10 h-10 flex items-center justify-center ${className}`}
      >
        &#x3c;
      </button>
    );
  }

  return (
    <button 
      onClick={() => navigate(-1)}
      className={`text-foreground text-4xl ${className}`}
    >
      &#x3c;
    </button>
  );
};

export default BackButton;

