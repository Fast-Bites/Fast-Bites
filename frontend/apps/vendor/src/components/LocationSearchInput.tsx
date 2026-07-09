import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, MapPin, Search } from 'lucide-react';

export interface LocationSearchResult {
  address: string;
  lat: number;
  lng: number;
}

interface LocationSearchInputProps {
  onLocationSelect?: (location: LocationSearchResult) => void;
  initialValue?: string;
  className?: string;
  fullscreenMode?: boolean;
  autoFocus?: boolean;
  onBackClick?: () => void;
  onHasPredictions?: (hasPredictions: boolean) => void;
}

export default function LocationSearchInput({
  onLocationSelect,
  initialValue = '',
  className = '',
  fullscreenMode = false,
  autoFocus = false,
  onBackClick,
  onHasPredictions,
}: LocationSearchInputProps) {
  const [query, setQuery] = useState(initialValue);
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [open, setOpen] = useState(false);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (window.google?.maps?.places) {
      autocompleteService.current = new google.maps.places.AutocompleteService();
      const dummyDiv = document.createElement('div');
      placesService.current = new google.maps.places.PlacesService(dummyDiv);
    }
  }, []);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const updatePredictions = useCallback(
    (results: google.maps.places.AutocompletePrediction[]) => {
      setPredictions(results);
      onHasPredictions?.(results.length > 0);
    },
    [onHasPredictions],
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    setOpen(true);

    if (!value || !autocompleteService.current) {
      updatePredictions([]);
      return;
    }

    autocompleteService.current.getPlacePredictions(
      {
        input: value,
        componentRestrictions: { country: 'ng' },
        types: ['geocode', 'establishment'],
      },
      (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          updatePredictions(results);
        } else {
          updatePredictions([]);
        }
      },
    );
  };

  const handleSelectPrediction = (prediction: google.maps.places.AutocompletePrediction) => {
    if (!placesService.current) return;

    placesService.current.getDetails(
      {
        placeId: prediction.place_id,
        fields: ['geometry', 'formatted_address'],
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          const location: LocationSearchResult = {
            address: place.formatted_address || prediction.description,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };

          setQuery(location.address);
          setOpen(false);
          updatePredictions([]);
          onLocationSelect?.(location);
        }
      },
    );
  };

  if (fullscreenMode) {
    return (
      <div className={`flex flex-col ${className}`}>
        <div className="flex items-center gap-3 rounded-full bg-white px-3 py-3 shadow-lg">
          <button type="button" onClick={onBackClick} className="shrink-0 text-black">
            <ChevronLeft size={18} />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setOpen(true)}
            placeholder="Search your location"
            className="flex-1 bg-transparent text-base text-black outline-none placeholder:text-gray-500"
          />
        </div>

        {predictions.length > 0 ? (
          <div className="mt-4 flex-1 overflow-y-auto">
            {predictions.map((prediction) => (
              <button
                key={prediction.place_id}
                type="button"
                onClick={() => handleSelectPrediction(prediction)}
                className="flex w-full items-start gap-3 border-b border-white/10 px-2 py-4 text-left transition-colors hover:bg-white/5"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
                  <MapPin size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-white">
                    {prediction.structured_formatting.main_text}
                  </span>
                  <span className="block truncate text-xs text-gray-400">
                    {prediction.structured_formatting.secondary_text}
                  </span>
                </span>
              </button>
            ))}
          </div>
        ) : null}

        {query && predictions.length === 0 ? (
          <div className="mt-8 text-center text-gray-400">
            <Search size={32} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">Type to search for locations...</p>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {open && predictions.length > 0 ? (
        <div className="absolute bottom-full z-20 mb-2 max-h-60 w-full overflow-y-auto rounded-2xl bg-white shadow-xl">
          {predictions.map((prediction) => (
            <button
              key={prediction.place_id}
              type="button"
              onClick={() => handleSelectPrediction(prediction)}
              className="flex w-full items-start gap-3 border-b border-gray-100 px-4 py-3 text-left text-sm text-gray-800 hover:bg-gray-100 last:border-0"
            >
              <MapPin className="mt-1 shrink-0 text-primary" size={16} />
              <span>
                <span className="block font-medium">{prediction.structured_formatting.main_text}</span>
                <span className="block text-xs text-gray-500">
                  {prediction.structured_formatting.secondary_text}
                </span>
              </span>
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex items-center gap-3 rounded-full bg-white px-3 py-3 shadow-lg">
        <Search size={18} className="shrink-0 text-black" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            window.setTimeout(() => setOpen(false), 200);
          }}
          placeholder="Search your location"
          className="flex-1 bg-transparent text-base text-black outline-none placeholder:text-gray-500"
        />
      </div>
    </div>
  );
}
