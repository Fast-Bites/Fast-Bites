import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import LocationSearchInput from "../components/LocationSearchInput";

const Map: React.FC = () => {
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
        {/* Back Button */}
        <div className="pt-12 px-6 ">
          <button 
            onClick={() => navigate(-1)}
            className="text-foreground text-4xl bg-primary rounded-full w-10 h-10 flex items-center justify-center"
          >
            &#x3c;
          </button>
        </div>
        
        {/* Spacer to push content to bottom */}
        <div className="flex-1" />
        
        {/* Bottom Content - Part of background flow with shadow */}
        <div className="relative w-full">
          
          {/* Black background section */}
          <div className="w-full bg-black px-6 py-12 rounded-t-[3rem]">
            {/* Enable Device Location Button */}
            <LocationSearchInput />
            
            {/* Enter Location Manually Button */}
            <Button 
              variant="primary"
              onClick={() => navigate('/complete')}
            >
              Confirm
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
