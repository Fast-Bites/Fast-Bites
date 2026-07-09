import { useCallback, useEffect, useMemo, useState } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { ChevronLeft, MapPin } from 'lucide-react';
import Button from '@/components/Button';
import LocationSearchInput, { type LocationSearchResult } from '@/components/LocationSearchInput';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import {
  DEFAULT_MAP_CENTER,
  formatCoordinate,
  type SelectedMapLocation,
} from '@/lib/locationGeocoding';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const mapStyles: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
];

interface LocationMapOverlayProps {
  open: boolean;
  initialLocation?: SelectedMapLocation | null;
  onClose: () => void;
  onConfirm: (location: SelectedMapLocation) => void;
}

function reverseGeocodeLocation(lat: number, lng: number): Promise<SelectedMapLocation> {
  return new Promise((resolve) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        resolve({
          address: results[0].formatted_address,
          lat,
          lng,
        });
        return;
      }

      resolve({
        address: `${formatCoordinate(lat)}, ${formatCoordinate(lng)}`,
        lat,
        lng,
      });
    });
  });
}

export default function LocationMapOverlay({
  open,
  initialLocation,
  onClose,
  onConfirm,
}: LocationMapOverlayProps) {
  const { isLoaded, loadError } = useGoogleMaps();
  const [selectedLocation, setSelectedLocation] = useState<SelectedMapLocation | null>(
    initialLocation ?? null,
  );
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const [searchHasPredictions, setSearchHasPredictions] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedLocation(initialLocation ?? null);
      setSearchOverlayOpen(false);
      setSearchHasPredictions(false);
    }
  }, [open, initialLocation]);

  const mapCenter = useMemo(
    () =>
      selectedLocation
        ? { lat: selectedLocation.lat, lng: selectedLocation.lng }
        : DEFAULT_MAP_CENTER,
    [selectedLocation],
  );

  const applyLocation = useCallback(
    async (location: LocationSearchResult) => {
      setSearchOverlayOpen(false);
      setSelectedLocation({
        address: location.address,
        lat: location.lat,
        lng: location.lng,
      });

      if (mapRef) {
        mapRef.panTo({ lat: location.lat, lng: location.lng });
        mapRef.setZoom(16);
      }
    },
    [mapRef],
  );

  const handleMapClick = useCallback(async (event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;

    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    const location = await reverseGeocodeLocation(lat, lng);
    setSelectedLocation(location);
  }, []);

  const handleMarkerDragEnd = useCallback(async (event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;

    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    const location = await reverseGeocodeLocation(lat, lng);
    setSelectedLocation(location);
  }, []);

  if (!open) {
    return null;
  }

  if (loadError) {
    return (
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black px-6 text-center text-white">
        <div>
          <p className="mb-4 text-sm">Maps could not be loaded. Check VITE_GOOGLE_MAPS_API_KEY.</p>
          <Button type="button" variant="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black text-white">
        Loading maps...
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[80] bg-black font-[var(--font-poppins)]">
      <div className="absolute inset-0">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={selectedLocation ? 16 : 12}
          onClick={handleMapClick}
          onLoad={setMapRef}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            styles: mapStyles,
          }}
        >
          {selectedLocation ? (
            <Marker
              position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
              draggable
              onDragEnd={handleMarkerDragEnd}
              animation={google.maps.Animation.DROP}
            />
          ) : null}
        </GoogleMap>
      </div>

      <div className="relative z-10 flex min-h-screen flex-col pointer-events-none">
        <div className="px-4 pb-4 pt-10 pointer-events-auto">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-lg"
              aria-label="Close map"
            >
              <ChevronLeft size={20} className="text-black" />
            </button>
            <button
              type="button"
              onClick={() => setSearchOverlayOpen(true)}
              className="flex min-w-0 flex-1 items-center gap-3 rounded-full bg-white px-4 py-3 text-left shadow-lg"
            >
              <MapPin size={18} className="shrink-0 text-black" />
              <span className="truncate text-sm text-black">
                {selectedLocation?.address || 'Search or tap the map'}
              </span>
            </button>
          </div>
        </div>

        {selectedLocation ? (
          <div className="mx-4 mt-2 rounded-xl bg-black/80 p-3 text-sm text-white backdrop-blur-sm pointer-events-auto">
            <p className="font-medium">{selectedLocation.address}</p>
            <p className="mt-1 text-xs text-gray-300">
              {formatCoordinate(selectedLocation.lat)}, {formatCoordinate(selectedLocation.lng)}
            </p>
          </div>
        ) : null}

        <div className="flex-1" />

        <div className="pointer-events-auto rounded-t-[2rem] bg-black px-4 pb-8 pt-6">
          <p className="mb-4 text-center text-sm text-gray-400">
            Tap the map, drag the pin, or search for your business location
          </p>
          <Button
            type="button"
            variant="primary"
            disabled={!selectedLocation}
            onClick={() => {
              if (selectedLocation) {
                onConfirm(selectedLocation);
              }
            }}
          >
            Use this location
          </Button>
        </div>
      </div>

      {searchOverlayOpen ? (
        <div className="fixed inset-0 z-[90] flex flex-col bg-black">
          <div className="px-4 pt-10">
            <LocationSearchInput
              onLocationSelect={applyLocation}
              fullscreenMode
              autoFocus
              className="flex-1"
              onBackClick={() => {
                setSearchOverlayOpen(false);
                setSearchHasPredictions(false);
              }}
              onHasPredictions={setSearchHasPredictions}
            />
          </div>

          {!searchHasPredictions ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 pb-8 text-gray-400">
              <MapPin size={48} className="opacity-50" />
              <p className="text-xs">Search for your business location</p>
            </div>
          ) : (
            <div className="flex-1" />
          )}

          <div className="space-y-3 px-4 pb-8">
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                setSearchOverlayOpen(false);
                setSearchHasPredictions(false);
              }}
            >
              Back to map
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
