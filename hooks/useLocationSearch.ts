import { LocationOption } from '@/components/common/LocationInput';
// eslint-disable-next-line import/no-unresolved
import { GOOGLE_MAPS_API_KEY } from '@env';
import { useEffect, useState } from 'react';

// Configuración
const MIN_SEARCH_LENGTH = 3;
const SEARCH_DEBOUNCE_MS = 500;

interface UseLocationSearchOptions {
  apiKey?: string;
  minLength?: number;
  debounceMs?: number;
  countryCode?: string; // Para restringir búsqueda a un país (ej: 've' para Venezuela)
  locationBias?: {
    latitude: number;
    longitude: number;
    radius?: number; // Radio en metros (default: 50000)
  };
  strictBounds?: boolean; // Si true, solo resultados dentro del radio
}

export const useLocationSearch = (options?: UseLocationSearchOptions) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiKey = options?.apiKey || GOOGLE_MAPS_API_KEY;
  const minLength = options?.minLength || MIN_SEARCH_LENGTH;
  const debounceMs = options?.debounceMs || SEARCH_DEBOUNCE_MS;
  const countryCode = options?.countryCode;
  const locationBias = options?.locationBias;
  const strictBounds = options?.strictBounds;

  useEffect(() => {
    // Si el query es muy corto, limpiar resultados
    if (query.length < minLength) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    // Debounce para evitar muchas llamadas a la API
    const timeoutId = setTimeout(() => {
      searchPlaces(query);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounceMs, minLength, query]);

  const searchPlaces = async (searchQuery: string) => {
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      // Modo desarrollo - usar datos mock
      console.log('🧪 Usando mock data (no hay API key)');
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setResults(getMockResults(searchQuery));
      setLoading(false);
      return;
    }

    // SI HAY API KEY → Usar Google Places Autocomplete API directamente
    console.log('🌍 Usando Google Places API');
    setLoading(true);
    setError(null);

    try {
      // Construir URL para Autocomplete API
      const autocompleteUrl = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
      autocompleteUrl.searchParams.append('input', searchQuery);
      autocompleteUrl.searchParams.append('key', apiKey);
      autocompleteUrl.searchParams.append('language', 'es');
      
      if (countryCode) {
        autocompleteUrl.searchParams.append('components', `country:${countryCode}`);
      }

      // Agregar locationBias si está configurado
      if (locationBias) {
        autocompleteUrl.searchParams.append(
          'location',
          `${locationBias.latitude},${locationBias.longitude}`
        );
        autocompleteUrl.searchParams.append(
          'radius',
          String(locationBias.radius || 50000)
        );

        if (strictBounds) {
          autocompleteUrl.searchParams.append('strictbounds', 'true');
        }
      }

      const response = await fetch(autocompleteUrl.toString());
      
      if (!response.ok) {
        throw new Error('Error al buscar ubicaciones');
      }

      const data = await response.json();

      if (data.status === 'ZERO_RESULTS') {
        setResults([]);
        setLoading(false);
        return;
      }

      if (data.status !== 'OK') {
        throw new Error(data.error_message || `Error de API: ${data.status}`);
      }

      // Convertir predicciones a LocationOptions
      // Obtener detalles (lat/lng) para cada predicción
      const locations: LocationOption[] = await Promise.all(
        data.predictions.slice(0, 8).map(async (prediction: any) => {
          const details = await getPlaceDetails(prediction.place_id);
          return {
            address: prediction.structured_formatting.main_text,
            description: prediction.structured_formatting.secondary_text || prediction.description,
            latitude: details.lat,
            longitude: details.lng,
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
  };

  const getPlaceDetails = async (placeId: string) => {
    try {
      const params = new URLSearchParams({
        place_id: placeId,
        key: apiKey,
        fields: 'geometry',
      });

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?${params}`
      );

      const data = await response.json();

      if (data.status === 'OK') {
        return {
          lat: data.result.geometry.location.lat,
          lng: data.result.geometry.location.lng,
        };
      }

      // Fallback si no se pueden obtener coordenadas
      return { lat: 0, lng: 0 };
    } catch {
      return { lat: 0, lng: 0 };
    }
  };

  const reset = () => {
    setQuery('');
    setResults([]);
    setError(null);
    setLoading(false);
  };

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    reset,
  };
};

// Datos mock para desarrollo (Venezuela/Maracaibo)
const getMockResults = (query: string): LocationOption[] => {
  const mockLocations: LocationOption[] = [
    {
      address: 'Centro Comercial Costa Verde',
      latitude: 10.6480,
      longitude: -71.6130,
      description: 'Bella Vista, Maracaibo',
      placeId: 'mock-1',
    },
    {
      address: 'Centro 99',
      latitude: 10.6512,
      longitude: -71.6180,
      description: 'Centro, Maracaibo',
      placeId: 'mock-2',
    },
    {
      address: 'Centro Comercial Lago Mall',
      latitude: 10.6422,
      longitude: -71.6389,
      description: 'La Lago, Maracaibo',
      placeId: 'mock-3',
    },
    {
      address: 'Universidad del Zulia',
      latitude: 10.6520,
      longitude: -71.6260,
      description: 'Belloso, Maracaibo',
      placeId: 'mock-4',
    },
    {
      address: 'Aeropuerto La Chinita',
      latitude: 10.5582,
      longitude: -71.7289,
      description: 'Maracaibo, Zulia',
      placeId: 'mock-5',
    },
    {
      address: 'Parque Vereda del Lago',
      latitude: 10.6360,
      longitude: -71.6520,
      description: 'Vereda del Lago, Maracaibo',
      placeId: 'mock-6',
    },
    {
      address: 'Plaza Baralt',
      latitude: 10.6380,
      longitude: -71.6380,
      description: 'Centro Histórico, Maracaibo',
      placeId: 'mock-7',
    },
    {
      address: 'Sambil Maracaibo',
      latitude: 10.6698,
      longitude: -71.6036,
      description: 'Circunvalación 2, Maracaibo',
      placeId: 'mock-8',
    },
  ];

  return mockLocations.filter(
    location =>
      location.address.toLowerCase().includes(query.toLowerCase()) ||
      location.description?.toLowerCase().includes(query.toLowerCase())
  );
};