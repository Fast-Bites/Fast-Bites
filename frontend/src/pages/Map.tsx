import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, Marker } from '@react-google-maps/api';
import Button from '../components/Button';
import BackButton from '../components/BackButton';
import LocationSearchInput from "../components/LocationSearchInput";
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

const Map: React.FC = () => {
  const navigate = useNavigate();
  const { isLoaded, loadError } = useGoogleMaps();
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    lat: number;
    lng: number;
    city: string;
    state: string;
  } | null>(null);
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);

  // All hooks must be called before any conditional returns
  const handleLocationSelect = useCallback((location: { address: string; lat: number; lng: number }) => {
    // Close the search overlay
    setSearchOverlayOpen(false);
    
    // Get city and state from the address using geocoding
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat: location.lat, lng: location.lng } }, (results, status) => {
      if (status === 'OK' && results) {
        const { city, state } = extractLocationDetails(results);
        setSelectedLocation({
          ...location,
          city,
          state,
        });
      } else {
        setSelectedLocation({
          ...location,
          city: '',
          state: '',
        });
      }
    });
    
    // Pan map to selected location
    if (mapRef) {
      mapRef.panTo({ lat: location.lat, lng: location.lng });
      mapRef.setZoom(16);
    }
  }, [mapRef]);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;

    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    // Reverse geocode to get address
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const { city, state } = extractLocationDetails(results);
        const location = {
          address: results[0].formatted_address,
          lat,
          lng,
          city,
          state,
        };
        setSelectedLocation(location);
      }
    });
  }, []);

  const handleMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;

    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    // Reverse geocode to get address
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const { city, state } = extractLocationDetails(results);
        const location = {
          address: results[0].formatted_address,
          lat,
          lng,
          city,
          state,
        };
        setSelectedLocation(location);
      }
    });
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!selectedLocation) return;

    setSaving(true);
    setError('');

    const { error: saveError } = await api.updateProfile({
      address: selectedLocation.address,
      city: selectedLocation.city,
      state: selectedLocation.state,
    });

    setSaving(false);

    if (saveError) {
      setError('Failed to save address. Please try again.');
      return;
    }

    // Store in session for immediate use
    sessionStorage.setItem('user_location', JSON.stringify(selectedLocation));
    navigate('/complete');
  }, [selectedLocation, navigate]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMapRef(map);
  }, []);

  // Conditional returns AFTER all hooks
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
          center={selectedLocation ? { lat: selectedLocation.lat, lng: selectedLocation.lng } : defaultCenter}
          zoom={selectedLocation ? 16 : 12}
          onClick={handleMapClick}
          onLoad={onMapLoad}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            styles: [
              { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
              { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
              { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
              { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
              { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
              { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
              { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
              { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
              { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
            ],
          }}
        >
          {selectedLocation && (
            <Marker 
              position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
              draggable={true}
              onDragEnd={handleMarkerDragEnd}
              animation={google.maps.Animation.DROP}
            />
          )}
        </GoogleMap>
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen pointer-events-none">
        {/* Header - Back Button + Search Trigger */}
        <div className="pt-8 px-4 pointer-events-auto">
          <div className="flex items-center gap-3">
            <BackButton variant="map" />
            {/* Search trigger button - opens fullscreen search */}
            <button
              onClick={() => setSearchOverlayOpen(true)}
              className="flex-1 min-w-0 flex items-center gap-3 bg-white rounded-full px-3 py-3 shadow-lg text-left overflow-hidden"
            >
              <svg className="w-[18px] h-[18px] text-black flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="flex-1 min-w-0 text-base font-sm truncate">
                {selectedLocation ? selectedLocation.address : 'Input your location'}
              </span>
              <svg className="w-[18px] h-[18px] text-black flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Selected Location Display */}
        {selectedLocation && (
          <div className="mx-4 mt-4 bg-black/80 backdrop-blur-sm rounded-xl p-3 pointer-events-auto">
            <p className="text-foreground text-sm font-medium">
              📍 {selectedLocation.address}
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              Drag the pin to adjust location
            </p>
          </div>
        )}
        
        {/* Spacer to push content to bottom */}
        <div className="flex-1" />
        
        {/* Bottom Content */}
        <div className="relative w-full pointer-events-auto">
          {/* Black background section */}
          <div className="w-full bg-black px-4 py-8 rounded-t-[3rem]">
            {/* Error Message */}
            {error && (
              <p className="text-red-500 text-sm text-center mb-4">{error}</p>
            )}
            
            {/* Tap to select hint */}
            <p className="text-muted-foreground text-sm text-center mb-4">
              Or tap on the map to select a location
            </p>
            
            {/* Confirm Button */}
            <Button 
              variant="primary"
              onClick={handleConfirm}
              disabled={!selectedLocation || saving}
            >
              Confirm
            </Button>
          </div>
        </div>
      </div>

      {/* Fullscreen Search Overlay */}
      {searchOverlayOpen && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
          {/* Search Header */}
          <div className="pt-8 px-4">
            <LocationSearchInput 
              onLocationSelect={handleLocationSelect}
              fullscreenMode={true}
              autoFocus={true}
              className="flex-1"
            />
          </div>
          
          {/* Spacer */}
          <div className="flex-1" />

          {/* Bottom Section */}
          <div className="px-4 py-8 space-y-1">
            {/* Progress Bar */}
            <div className="h-1 bg-foreground rounded-full" />

            {/* Choose on map */}
            <div
              className="flex items-center justify-center gap-2 w-full py-2"
            >
              <img 
                src="assets/choose-map.png" 
                alt="choose on map" 
                className="w-4 h-4"
              />
              <span className="text-muted-foreground text-sm">
                Choose on map
              </span>
            </div>
            
            {/* Back to Map Button */}
            <Button 
              variant="primary"
              onClick={() => setSearchOverlayOpen(false)}
            >
              Back to Map
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;
