// eslint-disable-next-line import/no-unresolved
import { GOOGLE_MAPS_API_KEY } from '@env';
import axios, { AxiosInstance } from 'axios';

// Tipos
export interface PlaceAutocompleteResult {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  terms: {
    offset: number;
    value: string;
  }[];
}

export interface PlaceDetails {
  place_id: string;
  formatted_address: string;
  name: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  address_components: {
    long_name: string;
    short_name: string;
    types: string[];
  }[];
  types: string[];
}

export interface GeocodeResult {
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  place_id: string;
  address_components: {
    long_name: string;
    short_name: string;
    types: string[];
  }[];
}

export interface DirectionsResult {
  routes: {
    legs: {
      distance: {
        text: string;
        value: number; // en metros
      };
      duration: {
        text: string;
        value: number; // en segundos
      };
      start_address: string;
      end_address: string;
      start_location: {
        lat: number;
        lng: number;
      };
      end_location: {
        lat: number;
        lng: number;
      };
      steps: {
        distance: {
          text: string;
          value: number;
        };
        duration: {
          text: string;
          value: number;
        };
        html_instructions: string;
        polyline: {
          points: string;
        };
        start_location: {
          lat: number;
          lng: number;
        };
        end_location: {
          lat: number;
          lng: number;
        };
      }[];
    }[];
    overview_polyline: {
      points: string;
    };
    bounds: {
      northeast: { lat: number; lng: number };
      southwest: { lat: number; lng: number };
    };
  }[];
}

// Cliente axios para Google Maps API
const googleMapsClient: AxiosInstance = axios.create({
  baseURL: 'https://maps.googleapis.com/maps/api',
  timeout: 10000,
  params: {
    key: GOOGLE_MAPS_API_KEY,
    language: 'es',
  },
});

// Interceptor para logging
googleMapsClient.interceptors.request.use(
  (config) => {
    console.log('🗺️ Google Maps Request:', config.url);
    return config;
  },
  (error) => {
    console.error('❌ Google Maps Request Error:', error);
    return Promise.reject(error);
  }
);

googleMapsClient.interceptors.response.use(
  (response) => {
    console.log('✅ Google Maps Response:', response.config.url, response.data.status);
    return response;
  },
  (error) => {
    console.error('❌ Google Maps Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const googlePlacesService = {
  /**
   * Buscar lugares con autocompletado
   * @param input - Texto de búsqueda
   * @param options - Opciones adicionales
   */
  autocomplete: async (
    input: string,
    options?: {
      countryCode?: string; // Ejemplo: 've', 'pa', 'co'
      locationBias?: {
        latitude: number;
        longitude: number;
        radius?: number; // Radio en metros (default: 50000 = 50km)
      };
      types?: string; // Tipos de lugares: 'geocode', 'establishment', etc.
      strictBounds?: boolean; // Si true, solo devuelve resultados dentro del radio
    }
  ): Promise<PlaceAutocompleteResult[]> => {
    try {
      const params: any = {
        input,
      };

      if (options?.countryCode) {
        params.components = `country:${options.countryCode}`;
      }

      if (options?.locationBias) {
        params.location = `${options.locationBias.latitude},${options.locationBias.longitude}`;
        params.radius = options.locationBias.radius || 50000; // 50km por defecto
        
        if (options.strictBounds) {
          params.strictbounds = true;
        }
      }

      if (options?.types) {
        params.types = options.types;
      }

      const response = await googleMapsClient.get('/place/autocomplete/json', {
        params,
      });

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        throw new Error(`Google Places API Error: ${response.data.status}`);
      }

      return response.data.predictions || [];
    } catch (error) {
      console.error('Error en autocomplete:', error);
      throw error;
    }
  },

  /**
   * Obtener detalles completos de un lugar
   * @param placeId - ID del lugar
   * @param fields - Campos a obtener (para optimizar costos)
   */
  getPlaceDetails: async (
    placeId: string,
    fields?: string[]
  ): Promise<PlaceDetails> => {
    try {
      const response = await googleMapsClient.get('/place/details/json', {
        params: {
          place_id: placeId,
          fields: fields?.join(',') || 'geometry,formatted_address,name,address_components,types',
        },
      });

      if (response.data.status !== 'OK') {
        throw new Error(`Google Places API Error: ${response.data.status}`);
      }

      return response.data.result;
    } catch (error) {
      console.error('Error obteniendo detalles del lugar:', error);
      throw error;
    }
  },

  /**
   * Geocodificación: Convertir dirección a coordenadas
   * @param address - Dirección a geocodificar
   */
  geocodeAddress: async (address: string): Promise<GeocodeResult> => {
    try {
      const response = await googleMapsClient.get('/geocode/json', {
        params: {
          address,
        },
      });

      if (response.data.status !== 'OK') {
        throw new Error(`Geocoding Error: ${response.data.status}`);
      }

      return response.data.results[0];
    } catch (error) {
      console.error('Error en geocoding:', error);
      throw error;
    }
  },

  /**
   * Geocodificación inversa: Convertir coordenadas a dirección
   * @param lat - Latitud
   * @param lng - Longitud
   */
  reverseGeocode: async (lat: number, lng: number): Promise<GeocodeResult> => {
    try {
      const response = await googleMapsClient.get('/geocode/json', {
        params: {
          latlng: `${lat},${lng}`,
        },
      });

      if (response.data.status !== 'OK') {
        throw new Error(`Reverse Geocoding Error: ${response.data.status}`);
      }

      return response.data.results[0];
    } catch (error) {
      console.error('Error en reverse geocoding:', error);
      throw error;
    }
  },

  /**
   * Obtener direcciones entre dos puntos
   * @param origin - Origen (lat,lng o place_id o dirección)
   * @param destination - Destino (lat,lng o place_id o dirección)
   * @param options - Opciones adicionales
   */
  getDirections: async (
    origin: string | { lat: number; lng: number },
    destination: string | { lat: number; lng: number },
    options?: {
      mode?: 'driving' | 'walking' | 'bicycling' | 'transit';
      alternatives?: boolean; // Rutas alternativas
      waypoints?: (string | { lat: number; lng: number })[]; // Puntos intermedios
      avoid?: 'tolls' | 'highways' | 'ferries'; // Evitar
      trafficModel?: 'best_guess' | 'pessimistic' | 'optimistic';
      departureTime?: number; // Timestamp para tráfico en tiempo real
    }
  ): Promise<DirectionsResult> => {
    try {
      const formatLocation = (loc: string | { lat: number; lng: number }) => {
        if (typeof loc === 'string') return loc;
        return `${loc.lat},${loc.lng}`;
      };

      const params: any = {
        origin: formatLocation(origin),
        destination: formatLocation(destination),
        mode: options?.mode || 'driving',
      };

      if (options?.alternatives) {
        params.alternatives = true;
      }

      if (options?.waypoints && options.waypoints.length > 0) {
        params.waypoints = options.waypoints.map(formatLocation).join('|');
      }

      if (options?.avoid) {
        params.avoid = options.avoid;
      }

      if (options?.trafficModel) {
        params.traffic_model = options.trafficModel;
      }

      if (options?.departureTime) {
        params.departure_time = options.departureTime;
      }

      const response = await googleMapsClient.get('/directions/json', {
        params,
      });

      if (response.data.status !== 'OK') {
        throw new Error(`Directions Error: ${response.data.status}`);
      }

      return response.data;
    } catch (error) {
      console.error('Error obteniendo direcciones:', error);
      throw error;
    }
  },

  /**
   * Calcular matriz de distancias entre múltiples orígenes y destinos
   * @param origins - Array de orígenes
   * @param destinations - Array de destinos
   */
  getDistanceMatrix: async (
    origins: (string | { lat: number; lng: number })[],
    destinations: (string | { lat: number; lng: number })[],
    options?: {
      mode?: 'driving' | 'walking' | 'bicycling' | 'transit';
      avoid?: 'tolls' | 'highways' | 'ferries';
    }
  ) => {
    try {
      const formatLocation = (loc: string | { lat: number; lng: number }) => {
        if (typeof loc === 'string') return loc;
        return `${loc.lat},${loc.lng}`;
      };

      const response = await googleMapsClient.get('/distancematrix/json', {
        params: {
          origins: origins.map(formatLocation).join('|'),
          destinations: destinations.map(formatLocation).join('|'),
          mode: options?.mode || 'driving',
          ...(options?.avoid && { avoid: options.avoid }),
        },
      });

      if (response.data.status !== 'OK') {
        throw new Error(`Distance Matrix Error: ${response.data.status}`);
      }

      return response.data;
    } catch (error) {
      console.error('Error en distance matrix:', error);
      throw error;
    }
  },

  /**
   * Buscar lugares cercanos (nearby search)
   * @param location - Coordenadas del centro de búsqueda
   * @param radius - Radio de búsqueda en metros
   * @param type - Tipo de lugar (restaurant, gas_station, etc.)
   */
  searchNearby: async (
    location: { lat: number; lng: number },
    radius: number,
    type?: string
  ) => {
    try {
      const params: any = {
        location: `${location.lat},${location.lng}`,
        radius,
      };

      if (type) {
        params.type = type;
      }

      const response = await googleMapsClient.get('/place/nearbysearch/json', {
        params,
      });

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        throw new Error(`Nearby Search Error: ${response.data.status}`);
      }

      return response.data.results || [];
    } catch (error) {
      console.error('Error en nearby search:', error);
      throw error;
    }
  },

  /**
   * Helper: Calcular precio estimado basado en distancia
   * @param distanceInMeters - Distancia en metros
   * @param basePrice - Precio base
   * @param pricePerKm - Precio por kilómetro
   */
  calculateEstimatedPrice: (
    distanceInMeters: number,
    basePrice: number = 3.0,
    pricePerKm: number = 1.5
  ): { min: number; max: number; average: number } => {
    const distanceInKm = distanceInMeters / 1000;
    const baseCalculation = basePrice + distanceInKm * pricePerKm;
    const min = baseCalculation;
    const max = baseCalculation * 1.3; // 30% más para hora pico
    const average = (min + max) / 2;

    return {
      min: Number(min.toFixed(2)),
      max: Number(max.toFixed(2)),
      average: Number(average.toFixed(2)),
    };
  },

  /**
   * Helper: Formatear duración en texto legible
   * @param seconds - Duración en segundos
   */
  formatDuration: (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes} min`;
  },

  /**
   * Helper: Formatear distancia en texto legible
   * @param meters - Distancia en metros
   */
  formatDistance: (meters: number): string => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${meters} m`;
  },
};