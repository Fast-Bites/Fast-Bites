import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

const Location: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-background relative font-[var(--font-poppins)]">
      {/* Background Map Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/assets/map.png')` }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header with back button and heading */}
        <div className="relative w-full">
          {/* Black background section */}
          <div className="w-full bg-black px-6 pt-12">
            {/* Back Button */}
            <button 
              onClick={() => navigate(-1)}
              className="text-foreground text-4xl"
            >
              &#x3c;
            </button>
            
            {/* Heading */}
            <h1 className="text-[1.75rem] font-light text-foreground leading-tight text-center">
              Set your location <br />
              to start your journey
            </h1>
          </div>
          
          {/* Gradient shadow extending downward */}
          <div className="absolute -bottom-24 left-0 right-0 h-24 bg-gradient-to-b from-black via-black/60 to-transparent pointer-events-none" />
        </div>
        
        {/* Spacer to push content to bottom */}
        <div className="flex-1" />
        
        {/* Bottom Content - Part of background flow with shadow */}
        <div className="relative w-full">
          {/* Gradient shadow extending upward */}
          <div className="absolute -top-24 left-0 right-0 h-24 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />
          
          {/* Black background section */}
          <div className="w-full bg-black px-6 pb-30">
            {/* Enable Device Location Button */}
            <Button 
              variant="foreground"
            //   onClick={() => navigate('/complete')}
              className="mb-4"
            >
              Enable Device Location
            </Button>
            
            {/* Enter Location Manually Button */}
            <Button 
              variant="primary"
              onClick={() => navigate('/map')}
            >
              Enter Your Location Manually
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Location;
