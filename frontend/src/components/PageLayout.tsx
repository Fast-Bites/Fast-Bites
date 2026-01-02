import { useNavigate } from 'react-router-dom';
import BackButton from './BackButton';
import { responsivePx, responsivePt, responsivePb } from '../constants/responsive';

interface PageLayoutProps {
  children: React.ReactNode;
  /** Show back button header - default: true */
  showHeader?: boolean;
  /** Show Terms & Privacy footer - default: true */
  showFooter?: boolean;
  /** Header variant style */
  headerVariant?: 'default' | 'map';
  /** Custom padding-x for content - overrides responsive defaults */
  paddingX?: string;
  /** Additional className for the container */
  className?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  showHeader = true,
  showFooter = true,
  headerVariant = 'default',
  paddingX,
  className = '',
}) => {
  const navigate = useNavigate();
  
  // Use custom paddingX if provided, otherwise use responsive defaults
  const appliedPadding = paddingX ?? responsivePx;

  return (
    <div className={`w-full min-h-screen bg-background flex flex-col font-[var(--font-poppins)] ${appliedPadding} ${className}`}>
      {/* Header with Back Button */}
      {showHeader && (
        <div className={responsivePt}>
          <BackButton variant={headerVariant} />
        </div>
      )}

      {/* Main Content */}
      {children}

      {/* Footer with Terms & Privacy */}
      {showFooter && (
        <>
          {/* Spacer */}
          <div className="flex-1" />
          
          <div className={`${responsivePb} pt-12`}>
            <p className="text-muted-foreground text-xs text-center leading-relaxed">
              By using this application, you agree to our{' '}
              <button 
                onClick={() => navigate('/terms')}
                className="text-primary"
              >
                Terms
              </button>
              {' '}
              and
              {' '}
              {/* <br /> */}
              <button 
                onClick={() => navigate('/privacy-policy')}
                className="text-primary"
              >
                Privacy policy
              </button>.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default PageLayout;

