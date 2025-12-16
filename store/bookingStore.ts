import { BookingRequest, bookingService, Driver, Location } from '@/services/bookingService';
import { create } from 'zustand';

interface BookingState {
  // Estado
  pickupLocation: Location | null;
  dropoffLocation: Location | null;
  nearbyDrivers: Driver[];
  selectedDriver: Driver | null;
  estimatedPrice: number;
  estimatedDistance: number;
  currentBookingId: string | null;
  bookingStatus: 'idle' | 'searching' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  isLoading: boolean;
  error: string | null;

  // Acciones
  setPickupLocation: (location: Location) => void;
  setDropoffLocation: (location: Location) => void;
  removePickupLocation: () => void;
  removeDropoffLocation: () => void;
  searchNearbyDrivers: (location: Location) => Promise<void>;
  calculateEstimate: (pickup: Location, dropoff: Location) => Promise<void>;
  createBooking: (bookingData: BookingRequest) => Promise<void>;
  selectDriver: (driver: Driver) => void;
  cancelBooking: () => Promise<void>;
  resetBooking: () => void;
  clearError: () => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  // Estado inicial
  pickupLocation: null,
  dropoffLocation: null,
  nearbyDrivers: [],
  selectedDriver: null,
  estimatedPrice: 0,
  estimatedDistance: 0,
  currentBookingId: null,
  bookingStatus: 'idle',
  isLoading: false,
  error: null,

  // Establecer ubicación de recogida
  setPickupLocation: (location) => {
    set({ pickupLocation: location });

    console.log('location', location);
    
    // Auto-buscar conductores cercanos
    const { dropoffLocation } = get();
    if (dropoffLocation) {
      get().calculateEstimate(location, dropoffLocation);
    }
  },

  // Establecer destino
  setDropoffLocation: (location) => {
    set({ dropoffLocation: location });
    
    // Auto-calcular precio
    const { pickupLocation } = get();
    if (pickupLocation) {
      get().calculateEstimate(pickupLocation, location);
    }
  },

  // Eliminar ubicación de recogida
  removePickupLocation: () => {
    set({ 
      pickupLocation: null,
      estimatedPrice: 0,
      estimatedDistance: 0,
      nearbyDrivers: [],
    });
  },

  // Eliminar destino
  removeDropoffLocation: () => {
    set({ 
      dropoffLocation: null,
      estimatedPrice: 0,
      estimatedDistance: 0,
    });
  },

  // Buscar conductores cercanos
  searchNearbyDrivers: async (location) => {
    try {
      set({ isLoading: true, error: null });

      const drivers = await bookingService.findNearbyDrivers(location);

      set({
        nearbyDrivers: drivers,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Error al buscar conductores',
        isLoading: false,
      });
    }
  },

  // Calcular precio estimado
  calculateEstimate: async (pickup, dropoff) => {
    try {
      set({ isLoading: true, error: null });

      const estimate = await bookingService.calculatePrice(pickup, dropoff);

      set({
        estimatedPrice: estimate.price,
        estimatedDistance: estimate.distance,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Error al calcular precio',
        isLoading: false,
      });
    }
  },

  // Crear reserva
  createBooking: async (bookingData) => {
    try {
      set({ isLoading: true, bookingStatus: 'searching', error: null });

      const booking = await bookingService.createBooking(bookingData);

      set({
        currentBookingId: booking.bookingId,
        selectedDriver: booking.driver,
        estimatedPrice: booking.estimatedPrice,
        bookingStatus: 'confirmed',
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Error al crear reserva',
        bookingStatus: 'idle',
        isLoading: false,
      });
      throw error;
    }
  },

  // Seleccionar conductor
  selectDriver: (driver) => set({ selectedDriver: driver }),

  // Cancelar reserva
  cancelBooking: async () => {
    const { currentBookingId } = get();
    if (!currentBookingId) return;

    try {
      set({ isLoading: true, error: null });

      await bookingService.cancelBooking(currentBookingId);

      set({
        bookingStatus: 'cancelled',
        isLoading: false,
      });

      // Reset después de 2 segundos
      setTimeout(() => {
        get().resetBooking();
      }, 2000);
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Error al cancelar reserva',
        isLoading: false,
      });
    }
  },

  // Resetear reserva
  resetBooking: () => set({
    pickupLocation: null,
    dropoffLocation: null,
    nearbyDrivers: [],
    selectedDriver: null,
    estimatedPrice: 0,
    estimatedDistance: 0,
    currentBookingId: null,
    bookingStatus: 'idle',
    error: null,
  }),

  // Limpiar error
  clearError: () => set({ error: null }),
}));