export const DEFAULT_MAP_CENTER = {
  lat: 6.5244,
  lng: 3.3792,
};

export interface SelectedMapLocation {
  address: string;
  lat: number;
  lng: number;
}

export function extractLocationDetails(results: google.maps.GeocoderResult[]) {
  let city = '';
  let state = '';

  for (const result of results) {
    for (const component of result.address_components) {
      if (
        component.types.includes('locality') ||
        component.types.includes('administrative_area_level_2')
      ) {
        city = city || component.long_name;
      }
      if (component.types.includes('administrative_area_level_1')) {
        state = state || component.long_name;
      }
    }
  }

  return { city, state };
}

export function formatCoordinate(value: number): string {
  return value.toFixed(6);
}

export function parseCoordinateInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}
