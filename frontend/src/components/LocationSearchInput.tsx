import { useState, useRef, useEffect } from "react";
import { FiSearch, FiMapPin, FiChevronDown, FiChevronLeft } from "react-icons/fi";

interface LocationSearchInputProps {
  onLocationSelect?: (location: {
    address: string;
    lat: number;
    lng: number;
  }) => void;
  initialValue?: string;
  /** Additional className for the container */
  className?: string;
  /** Enable fullscreen search mode (for Map page) */
  fullscreenMode?: boolean;
  /** Auto-focus the input */
  autoFocus?: boolean;
}

const LocationSearchInput: React.FC<LocationSearchInputProps> = ({ 
  onLocationSelect,
  initialValue = '',
  className = '',
  fullscreenMode = false,
  autoFocus = false,
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

  useEffect(() => {
    // Auto-focus input when in fullscreen mode
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

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

  // Fullscreen mode - suggestions appear below input
  if (fullscreenMode) {
    return (
      <div className={`flex flex-col ${className}`}>
        {/* Input Container */}
        <div className="flex items-center gap-5 bg-white rounded-full px-3 py-3 shadow-lg">
          {/* Left Icon */}
          <FiChevronLeft size={18} className="text-black flex-shrink-0" />

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setOpen(true)}
            placeholder="Input your location"
            className="flex-1 outline-none text-background placeholder:text-black text-base font-sm"
          />
        </div>

        {/* Suggestions - appear below in fullscreen mode */}
        {predictions.length > 0 && (
          <div className="mt-4 flex-1 overflow-y-auto">
            {predictions.map((prediction) => (
              <div
                key={prediction.place_id}
                onClick={() => handleSelectPrediction(prediction)}
                className="flex items-start gap-3 px-2 py-4 text-foreground hover:bg-white/5 cursor-pointer border-b border-white/10 last:border-0 transition-colors"
              >
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <img src="/assets/maps-and-flags 2 1.png" alt="" className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground truncate">
                    {prediction.structured_formatting.main_text}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {prediction.structured_formatting.secondary_text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {query && predictions.length === 0 && (
          <div className="mt-8 text-center text-muted-foreground">
            <FiSearch size={32} className="mx-auto mb-3 opacity-50" />
            <p>Type to search for locations...</p>
          </div>
        )}
      </div>
    );
  }

  // Default mode - suggestions appear above input
  return (
    <div className={`relative ${className}`}>
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
      <div className="flex items-center gap-3 bg-white rounded-full px-3 py-3 shadow-lg">
        {/* Search Icon */}
        <FiSearch size={18} className="text-black flex-shrink-0" />

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

        {/* Dropdown Icon */}
        <FiChevronDown size={18} className="text-black flex-shrink-0" />
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
