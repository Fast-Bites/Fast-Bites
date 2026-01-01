import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

const Intro2: React.FC = () => {
  const navigate = useNavigate();
  const steps = [0, 1, 2, 3];
  const currentStep = 1;

  return (
    <div className="w-full min-h-screen bg-background relative font-[var(--font-poppins)]">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/assets/joshua-lawrence-o_kNmj-6acM-unsplash 1.png')` }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header with progress and skip */}
        <div className="flex items-center pt-8 p-6 gap-3">
          {/* Progress Indicator */}
          <div className="flex gap-3 flex-1">
            {steps.map((step) => (
              <div
                key={step}
                className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                  step === currentStep 
                    ? 'bg-foreground' 
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
          
          {/* Skip Button */}
          <button 
            onClick={() => navigate('/role-selection')}
            className="text-foreground text-sm font-normal hover:opacity-80 transition-opacity">
            Skip
          </button>
        </div>
        
        {/* Spacer to push content to bottom */}
        <div className="flex-1" />
        
        {/* Main Content - Part of background flow with shadow */}
        <div className="relative w-full">
          {/* Gradient shadow extending upward */}
          <div className="absolute -top-24 left-0 right-0 h-24 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />
          
          {/* Black background section */}
          <div className="w-full bg-black px-6 pb-8">
            {/* Heading */}
            <h1 className="text-[1.75rem] font-light text-foreground leading-tight mb-3">
              Delivered in minutes,{' '}
              <span className="text-accent">avoid delay.</span>{' '}
            </h1>
            
            {/* Subtext */}
            <p className="text-muted-foreground text-xs mb-16">
              We put the <strong>fast</strong> in food. Enjoy your hot meals.
            </p>
            
            {/* Next Button */}
            <Button 
              variant="primary"
              onClick={() => navigate('/intro3')}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Intro2;

