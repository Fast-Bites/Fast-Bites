import { useMemo, useState } from 'react';
import { MapPin } from 'lucide-react';
import Button from '@/components/Button';
import { FormField, FormTextInput } from '@/components/FormField';
import LocationMapOverlay from '@/components/LocationMapOverlay';
import {
  formatCoordinate,
  parseCoordinateInput,
  type SelectedMapLocation,
} from '@/lib/locationGeocoding';

interface BusinessLocationFieldsProps {
  address: string;
  landmark: string;
  latitude: string;
  longitude: string;
  onAddressChange: (value: string) => void;
  onLandmarkChange: (value: string) => void;
  onLatitudeChange: (value: string) => void;
  onLongitudeChange: (value: string) => void;
}

export default function BusinessLocationFields({
  address,
  landmark,
  latitude,
  longitude,
  onAddressChange,
  onLandmarkChange,
  onLatitudeChange,
  onLongitudeChange,
}: BusinessLocationFieldsProps) {
  const [mapOpen, setMapOpen] = useState(false);

  const initialMapLocation = useMemo<SelectedMapLocation | null>(() => {
    const lat = parseCoordinateInput(latitude);
    const lng = parseCoordinateInput(longitude);
    if (lat == null || lng == null) {
      return null;
    }

    return {
      address: address.trim() || `${formatCoordinate(lat)}, ${formatCoordinate(lng)}`,
      lat,
      lng,
    };
  }, [address, latitude, longitude]);

  const handleMapConfirm = (location: SelectedMapLocation) => {
    onAddressChange(location.address);
    onLatitudeChange(formatCoordinate(location.lat));
    onLongitudeChange(formatCoordinate(location.lng));
    setMapOpen(false);
  };

  return (
    <>
      <div className="space-y-6 [color-scheme:light]">
        <Button type="button" variant="primary" onClick={() => setMapOpen(true)}>
          <span className="inline-flex items-center justify-center gap-2">
            <MapPin size={18} />
            Select on map
          </span>
        </Button>

        <FormField label="Address" required>
          <FormTextInput
            type="text"
            value={address}
            onChange={(event) => onAddressChange(event.target.value)}
            placeholder="#2 Abc street"
            required
          />
        </FormField>

        <FormField label="Landmark" required>
          <FormTextInput
            type="text"
            value={landmark}
            onChange={(event) => onLandmarkChange(event.target.value)}
            placeholder="Beside XYZ building"
            required
          />
        </FormField>

        <div className="grid gap-6 md:grid-cols-2">
          <FormField label="Latitude">
            <FormTextInput
              type="text"
              inputMode="decimal"
              value={latitude}
              onChange={(event) => onLatitudeChange(event.target.value)}
              placeholder="6.524400"
            />
          </FormField>

          <FormField label="Longitude">
            <FormTextInput
              type="text"
              inputMode="decimal"
              value={longitude}
              onChange={(event) => onLongitudeChange(event.target.value)}
              placeholder="3.379200"
            />
          </FormField>
        </div>
      </div>

      <LocationMapOverlay
        open={mapOpen}
        initialLocation={initialMapLocation}
        onClose={() => setMapOpen(false)}
        onConfirm={handleMapConfirm}
      />
    </>
  );
}
