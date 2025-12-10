import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, Marker } from '@react-google-maps/api';
import Button from '../components/Button';
import { useGoogleMaps } from '../hooks/useGoogleMaps';
import api from '../lib/api';

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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
    city: string;
    state: string;
  } | null>(null);
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMapRef(map);
  }, []);

  const reverseGeocode = useCallback((lat: number, lng: number) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      { location: { lat, lng } },
      (results, status) => {
        setLoading(false);
        if (status === 'OK' && results && results[0]) {
          const { city, state } = extractLocationDetails(results);
          setUserLocation({
            lat,
            lng,
            address: results[0].formatted_address,
            city,
            state,
          });
          
          // Pan map to location
          if (mapRef) {
            mapRef.panTo({ lat, lng });
            mapRef.setZoom(16);
          }
        } else {
          setError('Could not get address for your location');
        }
      }
    );
  }, [mapRef]);

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

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng || !userLocation) return; // Only allow adjusting after initial location

    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    setLoading(true);
    reverseGeocode(lat, lng);
  }, [userLocation, reverseGeocode]);

  const handleMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;

    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    setLoading(true);
    reverseGeocode(lat, lng);
  }, [reverseGeocode]);

  const handleSaveAddress = async () => {
    if (!userLocation) return;

    setSaving(true);
    setError('');

    const { error: saveError } = await api.updateProfile({
      address: userLocation.address,
      city: userLocation.city,
      state: userLocation.state,
    });

    setSaving(false);

    if (saveError) {
      setError('Failed to save address. Please try again.');
      return;
    }

    // Store in session for immediate use
    sessionStorage.setItem('user_location', JSON.stringify(userLocation));
    navigate('/complete');
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
      {/* Live Google Map Background */}
      <div className="absolute inset-0">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : defaultCenter}
          zoom={userLocation ? 16 : 12}
          onClick={handleMapClick}
          onLoad={onMapLoad}
          options={{
            disableDefaultUI: true,
            zoomControl: userLocation ? true : false,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            styles: [
              { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
              { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
              { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
              { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
              { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
              { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
            ],
          }}
        >
          {userLocation && (
            <Marker 
              position={{ lat: userLocation.lat, lng: userLocation.lng }}
              draggable={true}
              onDragEnd={handleMarkerDragEnd}
              animation={google.maps.Animation.DROP}
            />
          )}
        </GoogleMap>
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen pointer-events-none">
        {/* Header with back button and heading */}
        <div className="relative w-full pointer-events-auto">
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
              {userLocation ? 'Confirm your location' : 'Set your location'} <br />
              {userLocation ? '' : 'to start your journey'}
            </h1>
          </div>
          
          {/* Gradient shadow extending downward */}
          <div className="absolute -bottom-24 left-0 right-0 h-24 bg-gradient-to-b from-black via-black/60 to-transparent" />
        </div>

        {/* Selected Location Display - only show when location is set */}
        {userLocation && (
          <div className="mx-6 mt-4 bg-black/80 backdrop-blur-sm rounded-xl p-3 pointer-events-auto">
            <p className="text-foreground text-sm font-medium">
              📍 {userLocation.address}
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              Drag the pin or tap the map to adjust
            </p>
          </div>
        )}
        
        {/* Spacer to push content to bottom */}
        <div className="flex-1" />
        
        {/* Bottom Content - Part of background flow with shadow */}
        <div className="relative w-full pointer-events-auto">
          {/* Gradient shadow extending upward */}
          <div className="absolute -top-24 left-0 right-0 h-24 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />
          
          {/* Black background section */}
          <div className="w-full bg-black px-6 pb-30">
            {/* Error Message */}
            {error && (
              <p className="text-red-500 text-sm text-center mb-4">{error}</p>
            )}
            
            {/* Before location is set */}
            {!userLocation && (
              <>
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
              </>
            )}

            {/* After location is set */}
            {userLocation && (
              <>
                {/* Save Address Button */}
                <Button 
                  variant="primary"
                  onClick={handleSaveAddress}
                  disabled={saving || loading}
                  className="mb-4"
                >
                  {saving ? 'Saving...' : loading ? 'Updating...' : 'Save Address'}
                </Button>
                
                {/* Change to manual entry */}
                <Button 
                  variant="foreground"
                  onClick={() => navigate('/map')}
                >
                  Enter Your Location Manually
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Location;
