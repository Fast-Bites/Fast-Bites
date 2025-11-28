import { useState, useEffect } from 'react';
import Intro1 from './Intro1';

const Landing: React.FC = () => {
  const [showIntro1, setShowIntro1] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setShowIntro1(true);
      }, 500); // Transition duration
    }, 2000); // Loading duration (2 seconds)

    return () => clearTimeout(timer);
  }, []);

  if (showIntro1) {
    return <Intro1 />;
  }

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

