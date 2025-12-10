import { useState, useRef, useEffect } from "react";
import { FiSearch, FiMapPin } from "react-icons/fi";

interface LocationSearchInputProps {
  onLocationSelect?: (location: {
    address: string;
    lat: number;
    lng: number;
  }) => void;
  initialValue?: string;
}

const LocationSearchInput: React.FC<LocationSearchInputProps> = ({ 
  onLocationSelect,
  initialValue = ''
}) => {
  const [query, setQuery] = useState(initialValue);
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [open, setOpen] = useState(false);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize Google services
    if (window.google && window.google.maps && window.google.maps.places) {
      autocompleteService.current = new google.maps.places.AutocompleteService();
      // Create a dummy div for PlacesService (required but not displayed)
      const dummyDiv = document.createElement('div');
      placesService.current = new google.maps.places.PlacesService(dummyDiv);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setOpen(true);

    if (!value || !autocompleteService.current) {
      setPredictions([]);
      return;
    }

    // Get predictions from Google Places
    autocompleteService.current.getPlacePredictions(
      {
        input: value,
        componentRestrictions: { country: 'ng' }, // Restrict to Nigeria
        types: ['geocode', 'establishment'],
      },
      (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          setPredictions(results);
        } else {
          setPredictions([]);
        }
      }
    );
  };

  const handleSelectPrediction = (prediction: google.maps.places.AutocompletePrediction) => {
    if (!placesService.current) return;

    // Get place details including coordinates
    placesService.current.getDetails(
      {
        placeId: prediction.place_id,
        fields: ['geometry', 'formatted_address'],
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place && place.geometry?.location) {
          const location = {
            address: place.formatted_address || prediction.description,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          
          setQuery(location.address);
          setOpen(false);
          setPredictions([]);
          
          // Notify parent component
          onLocationSelect?.(location);
          
          // Store in session
          sessionStorage.setItem('user_location', JSON.stringify(location));
        }
      }
    );
  };

  return (
    <div className="relative mb-24">
      {/* Dropdown (appears above input) */}
      {open && predictions.length > 0 && (
        <div className="absolute bottom-full mb-2 w-full bg-white rounded-2xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
          {predictions.map((prediction) => (
            <div
              key={prediction.place_id}
              onClick={() => handleSelectPrediction(prediction)}
              className="flex items-start gap-3 px-4 py-3 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
            >
              <FiMapPin className="text-primary mt-1 flex-shrink-0" size={16} />
              <div>
                <div className="font-medium">{prediction.structured_formatting.main_text}</div>
                <div className="text-xs text-gray-500">{prediction.structured_formatting.secondary_text}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input Container */}
      <div className="flex items-center gap-3 bg-white rounded-full px-5 py-4 shadow-lg">
        {/* Search Icon */}
        <FiSearch size={18} />

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // Delay to allow click on predictions
            setTimeout(() => setOpen(false), 200);
          }}
          placeholder="Input your location"
          className="flex-1 outline-none text-background placeholder:text-background text-base font-medium"
        />
      </div>

      {/* No results message */}
      {open && query && predictions.length === 0 && (
        <div className="absolute bottom-full mb-2 w-full bg-white rounded-2xl shadow-xl px-5 py-3 text-sm text-gray-400">
          Type to search for locations...
        </div>
      )}
    </div>
  );
};

export default LocationSearchInput;
