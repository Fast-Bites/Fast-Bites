import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap } from '@react-google-maps/api';
import Button from '../components/Button';
import BackButton from '../components/BackButton';
import { useGoogleMaps } from '../hooks/useGoogleMaps';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 6.5244, // Lagos, Nigeria
  lng: 3.3792,
};

// Helper to extract city and state from geocoding results
const extractLocationDetails = (results: google.maps.GeocoderResult[]) => {
  let city = '';
  let state = '';
  
  for (const result of results) {
    for (const component of result.address_components) {
      if (component.types.includes('locality') || component.types.includes('administrative_area_level_2')) {
        city = city || component.long_name;
      }
      if (component.types.includes('administrative_area_level_1')) {
        state = state || component.long_name;
      }
    }
  }
  
  return { city, state };
};

const Location: React.FC = () => {
  const navigate = useNavigate();
  const { isLoaded, loadError } = useGoogleMaps();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reverseGeocode = useCallback((lat: number, lng: number) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      { location: { lat, lng } },
      (results, status) => {
        setLoading(false);
        if (status === 'OK' && results && results[0]) {
          const { city, state } = extractLocationDetails(results);
          const location = {
            lat,
            lng,
            address: results[0].formatted_address,
            city,
            state,
          };
          
          // Store location in session and navigate to map page for interaction
          sessionStorage.setItem('detected_location', JSON.stringify(location));
          navigate('/map');
        } else {
          setError('Could not get address for your location');
        }
      }
    );
  }, [navigate]);

  const handleEnableLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        reverseGeocode(latitude, longitude);
      },
      (err) => {
        setLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Location permission denied. Please enable it in your browser settings.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Location information unavailable.');
            break;
          case err.TIMEOUT:
            setError('Location request timed out.');
            break;
          default:
            setError('An error occurred while getting your location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  if (loadError) {
    return (
      <div className="w-full min-h-screen bg-background flex items-center justify-center">
        <p className="text-red-500">Error loading maps</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Loading maps...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background relative font-[var(--font-poppins)]">
      {/* Non-interactive Google Map Background */}
      <div className="absolute inset-0">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={defaultCenter}
          zoom={12}
          options={{
            disableDefaultUI: true,
            zoomControl: false,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            draggable: false,
            scrollwheel: false,
            disableDoubleClickZoom: true,
            clickableIcons: false,
            gestureHandling: 'none',
            styles: [
              { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
              { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
              { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
              { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
              { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
              { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
            ],
          }}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen pointer-events-none">
        {/* Header with back button and heading */}
        <div className="relative w-full pointer-events-auto">
          {/* Black background section */}
          <div className="w-full bg-black px-4 pt-8">
            {/* Back Button */}
            <BackButton />
            
            {/* Heading */}
            <h1 className="text-[1.75rem] font-light text-foreground leading-tight text-center">
              Set your location <br />
              to start your journey
            </h1>
          </div>
          
          {/* Gradient shadow extending downward */}
          <div className="absolute -bottom-24 left-0 right-0 h-24 bg-gradient-to-b from-black via-black/60 to-transparent" />
        </div>
        
        {/* Spacer to push content to bottom */}
        <div className="flex-1" />
        
        {/* Bottom Content - Part of background flow with shadow */}
        <div className="relative w-full pointer-events-auto">
          {/* Gradient shadow extending upward */}
          <div className="absolute -top-24 left-0 right-0 h-24 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />
          
          {/* Black background section */}
          <div className="w-full bg-black px-4 pb-30">
            {/* Error Message */}
            {error && (
              <p className="text-red-500 text-sm text-center mb-4">{error}</p>
            )}
            
            {/* Enable Device Location Button */}
            <Button 
              variant="foreground"
              onClick={handleEnableLocation}
              disabled={loading}
              className="mb-4"
            >
              {loading ? 'Getting Location...' : 'Enable Device Location'}
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
