import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        navigate('/intro1');
      }, 500); // Transition duration
    }, 2000); // Loading duration (2 seconds)

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div 
      className={`w-full min-h-screen bg-black flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out ${
        isTransitioning ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <img 
        src="/logo/Fast bite transparent I.png" 
        alt="Fast Bites" 
        className="w-1/2 h-1/2 object-contain" 
      />
    </div>
  );
};

export default Landing;

