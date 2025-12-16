import { LocationOption } from '@/components/common/LocationInput';
import { googlePlacesService } from '@/services/googlePlacesService';
import { useCallback, useEffect, useState } from 'react';

const MIN_SEARCH_LENGTH = 3;
const SEARCH_DEBOUNCE_MS = 500;

interface UseLocationSearchOptions {
  minLength?: number;
  debounceMs?: number;
  countryCode?: string;
  location?: { lat: number; lng: number };
  radius?: number;
}

export const useLocationSearch = (options?: UseLocationSearchOptions) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const minLength = options?.minLength || MIN_SEARCH_LENGTH;
  const debounceMs = options?.debounceMs || SEARCH_DEBOUNCE_MS;

  const searchPlaces = useCallback(
    async (searchQuery: string) => {
      setLoading(true);
      setError(null);

      try {
        const predictions = await googlePlacesService.autocomplete(searchQuery, {
          countryCode: options?.countryCode,
          location: options?.location,
          radius: options?.radius,
        });

        const locations: LocationOption[] = await Promise.all(
          predictions.slice(0, 8).map(async (prediction) => {
            const details = await googlePlacesService.getPlaceDetails(prediction.place_id, [
              'geometry',
            ]);
            return {
              address: prediction.structured_formatting.main_text,
              description:
                prediction.structured_formatting.secondary_text || prediction.description,
              latitude: details.geometry.location.lat,
              longitude: details.geometry.location.lng,
              placeId: prediction.place_id,
            };
          })
        );

        setResults(locations);
      } catch (err) {
        console.error('Error en búsqueda de lugares:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [options?.countryCode, options?.location, options?.radius]
  );

  useEffect(() => {
    if (query.length < minLength) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchPlaces(query);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [debounceMs, minLength, query, searchPlaces]);

  const reset = () => {
    setQuery('');
    setResults([]);
    setError(null);
    setLoading(false);
  };

  return { query, setQuery, results, loading, error, reset };
};