import { useJsApiLoader } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const libraries: ("places")[] = ['places'];

export const useGoogleMaps = () => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API key is missing. Add VITE_GOOGLE_MAPS_API_KEY to your .env file');
  }

  return { isLoaded, loadError };
};

