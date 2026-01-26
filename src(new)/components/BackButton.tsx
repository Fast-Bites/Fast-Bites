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
        className={`bg-primary rounded-full w-10 h-10 flex items-center justify-center ${className}`}
      >
        <img src="/assets/Back.svg" alt="Back" className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button 
      onClick={() => navigate(-1)}
      className={`${className}`}
    >
      <img src="/assets/Back.svg" alt="Back" className="w-5 h-5" />
    </button>
  );
};

export default BackButton;

