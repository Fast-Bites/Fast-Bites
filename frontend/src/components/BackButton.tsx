import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  /** Button style variant */
  variant?: 'default' | 'map';
  /** Additional className */
  className?: string;
  /** If provided, navigate to this path instead of history back */
  to?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ 
  variant = 'default',
  className = '',
  to
}) => {
  const navigate = useNavigate();
  const handleClick = () => to ? navigate(to) : navigate(-1);

  if (variant === 'map') {
    return (
      <button 
        onClick={handleClick}
        className={`bg-primary rounded-full w-10 h-10 flex items-center justify-center ${className}`}
      >
        <img src="/assets/Back.svg" alt="Back" className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button 
      onClick={handleClick}
      className={`${className}`}
    >
      <img src="/assets/Back.svg" alt="Back" className="w-5 h-5" />
    </button>
  );
};

export default BackButton;

