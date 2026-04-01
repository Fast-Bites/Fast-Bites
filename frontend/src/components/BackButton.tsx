import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  /** Button style variant */
  variant?: 'default' | 'map';
  /** Additional className on the back button only */
  className?: string;
  /** If provided, navigate to this path instead of history back */
  to?: string;
  /**
   * When `variant="map"` and `title` is a non-empty string, renders a row:
   * [circular back] + [centered title]. Omit or leave empty for button only.
   */
  title?: string;
  /** Class names for the title element (map + title only) */
  titleClassName?: string;
  /** Class names for the outer flex row (map + title only) */
  rowClassName?: string;
}

const BackButton: React.FC<BackButtonProps> = ({
  variant = 'default',
  className = '',
  to,
  title,
  titleClassName = '',
  rowClassName = '',
}) => {
  const navigate = useNavigate();
  const handleClick = () => (to ? navigate(to) : navigate(-1));

  const mapButton = (
    <button
      type="button"
      onClick={handleClick}
      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary ${className}`}
    >
      <img src="/assets/Back.svg" alt="Back" className="h-5 w-5" />
    </button>
  );

  if (variant === 'map') {
    const showTitle = Boolean(title?.trim());
    if (showTitle) {
      return (
        <div className={`flex w-full items-center ${rowClassName}`}>
          {mapButton}
          <h1
            className={`pointer-events-none flex-1 text-center text-3xl font-bold text-foreground -ml-10 ${titleClassName}`}
          >
            {title}
          </h1>
        </div>
      );
    }
    return mapButton;
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      <img src="/assets/Back.svg" alt="Back" className="h-5 w-5" />
    </button>
  );
};

export default BackButton;
