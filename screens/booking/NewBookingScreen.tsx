import { Button } from '@/components/common/Button';
import { LocationInput, LocationOption } from '@/components/common/LocationInput';
import { MapRoute } from '@/components/common/MapRoute';
import { Text } from '@/components/common/Text';
import { TripInfoCard } from '@/components/common/TripInfoCard';
import { useToast } from '@/hooks/toastContext';
import { useBookingStore } from '@/store';
import { colors, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock data para testing (fuera del componente)
const MOCK_LOCATIONS: LocationOption[] = [
	{
		address: 'Centro Comercial Sambil',
		latitude: 10.7161971,
		longitude: -71.6445307,
		description: 'Maracaibo, Zulia',
		placeId: 'mock-1',
	},
	{
		address: 'Parque Ana Maria Campos',
		latitude: 10.671897,
		longitude: -71.6440949,
		description: 'Maracaibo, Zulia',
		placeId: 'mock-2',
	},
	{
		address: 'Aeropuerto Internacional La Chinita',
		latitude: 10.5566819,
		longitude: -71.7254096,
		description: 'Maracaibo, Venezuela',
		placeId: 'mock-4',
	},
	{
		address: 'Plaza de la Republica',
		latitude: 10.665835,
		longitude: -71.6086227,
		description: 'Maracaibo, Zulia',
		placeId: 'mock-5',
	},
];

const NewBookingScreen: React.FC = () => {
	const toast = useToast();
	const router = useRouter();
	const {
		pickupLocation,
		dropoffLocation,
		setPickupLocation,
		setDropoffLocation,
		removePickupLocation,
		removeDropoffLocation,
	} = useBookingStore();

	// Estados para búsqueda manual
	const [originQuery, setOriginQuery] = useState(pickupLocation?.address || '');
	const [destinationQuery, setDestinationQuery] = useState(dropoffLocation?.address || '');
	const [originResults, setOriginResults] = useState<LocationOption[]>([]);
	const [destinationResults, setDestinationResults] = useState<LocationOption[]>([]);
	const [originLoading, setOriginLoading] = useState(false);
	const [destinationLoading, setDestinationLoading] = useState(false);
	const [selectMapTextColor, setSelectMapTextColor] = useState(colors.text.secondary);
	const [, setHasLocationPermission] = useState(false);
	const [firstLoad, setFirstLoad] = useState(true);

	// Estados derivados del store y loading
	const originState = originLoading ? 'loading' : pickupLocation ? 'valid' : 'default';
	const destinationState = destinationLoading ? 'loading' : dropoffLocation ? 'valid' : 'default';

	// Sincronizar queries cuando cambie el store
	useEffect(() => {
		if (pickupLocation && originQuery !== pickupLocation.address) {
			setOriginQuery(pickupLocation.address);
		}
	}, [originQuery, pickupLocation]);

	useEffect(() => {
		if (dropoffLocation && destinationQuery !== dropoffLocation.address) {
			setDestinationQuery(dropoffLocation.address);
		}
	}, [destinationQuery, dropoffLocation]);

	// Obtener ubicación actual del usuario
	const getCurrentLocation = useCallback(async (): Promise<LocationOption | null> => {
		try {
			const { status } = await Location.requestForegroundPermissionsAsync();
			const isGranted = status === 'granted';
			setHasLocationPermission(isGranted);

			if (!isGranted) {
				toast.error('Permisos', 'Se necesita acceso a la ubicación');
				return null;
			}

			const location = await Location.getCurrentPositionAsync({});
			const { latitude, longitude } = location.coords;

			return {
				latitude,
				longitude,
				address: 'Mi ubicación actual',
				description: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
				placeId: 'current-location',
			};
		} catch (error) {
			toast.error('Error', 'No se pudo obtener la ubicación');
			return null;
		}
	}, [toast]);

	// Solicitar permisos de ubicación al montar
	useEffect(() => {
		const initializeLocation = async () => {
			const currentLocation = await getCurrentLocation();
			if (currentLocation) {
				setPickupLocation(currentLocation);
			}
		};

		initializeLocation();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Handler genérico para búsqueda de ubicaciones
	const handleLocationSearch = useCallback(
		(
			text: string,
			setQuery: (text: string) => void,
			setResults: (results: LocationOption[]) => void,
			setLoading: (loading: boolean) => void,
			clearLocation: () => void,
		) => {
			setQuery(text);
			clearLocation();

			if (text.length === 0) {
				setResults([]);
				return;
			}

			setLoading(true);

			// Simular búsqueda con delay
			setTimeout(() => {
				const filtered = MOCK_LOCATIONS.filter(
					location =>
						location.address.toLowerCase().includes(text.toLowerCase()) ||
						location.description?.toLowerCase().includes(text.toLowerCase()),
				);
				setResults(filtered);
				setLoading(false);
			}, 500);
		},
		[],
	);

	const handleOriginClear = useCallback(() => {
		setOriginQuery('');
		removePickupLocation();
	}, [removePickupLocation]);

	const handleDestinationClear = useCallback(() => {
		setDestinationQuery('');
		removeDropoffLocation();
	}, [removeDropoffLocation]);

	const handleOriginChange = useCallback(
		(text: string) => {
			handleLocationSearch(text, setOriginQuery, setOriginResults, setOriginLoading, removePickupLocation);
		},
		[handleLocationSearch, removePickupLocation],
	);

	const handleOriginMap = useCallback(() => {
		router.push('/location/selectLocation?type=origin');
	}, [router]);

	const handleConfirmTrip = useCallback(() => {
		if (!pickupLocation) {
			toast.error('Error', 'Por favor selecciona el origen');
			return;
		}
		if (!dropoffLocation) {
			toast.error('Error', 'Por favor selecciona el destino');
			return;
		}

		// Calcular distancia
		const distance = calculateDistance(
			pickupLocation.latitude,
			pickupLocation.longitude,
			dropoffLocation.latitude,
			dropoffLocation.longitude,
		);

		toast.success('¡Viaje confirmado!', `Distancia: ${distance.toFixed(2)} km`);

		// Navegar a la siguiente pantalla
		// router.push('/vehicle-selection');
	}, [pickupLocation, dropoffLocation, toast]);

	const onOriginFocused = useCallback(() => {
		setSelectMapTextColor(colors.primary.main);
	}, []);

	const onDestinationFocused = useCallback(() => {
		setSelectMapTextColor(colors.tertiary.main);
	}, []);

	const handleDestinationChange = useCallback(
		(text: string) => {
			handleLocationSearch(
				text,
				setDestinationQuery,
				setDestinationResults,
				setDestinationLoading,
				removeDropoffLocation,
			);
		},
		[handleLocationSearch, removeDropoffLocation],
	);

	const handleOriginSelected = useCallback(
		(option: LocationOption) => {
			setOriginResults([]);
			setPickupLocation(option);
		},
		[setPickupLocation],
	);

	const handleDestinationSelected = useCallback(
		(option: LocationOption) => {
			setDestinationResults([]);
			setDropoffLocation(option);
		},
		[setDropoffLocation],
	);

	const handleDestinationMap = useCallback(() => {
		router.push('/location/selectLocation?type=destination');
	}, [router]);

	return (
		<SafeAreaView style={styles.safeArea}>
			<StatusBar barStyle="dark-content" backgroundColor={colors.card} />

			<View style={styles.container}>
				{/* Location Inputs */}
				<View style={styles.locationsContainer}>
					<LocationInput
						placeholder="¿Dónde estás?"
						value={originQuery}
						onChangeText={handleOriginChange}
						iconName="location"
						mapIconColor={colors.primary.main}
						onMapPress={handleOriginMap}
						onClearPress={handleOriginClear}
						options={originResults}
						onOptionSelected={handleOriginSelected}
						state={originState}
						containerStyle={styles.locationInput}
						onFocus={onOriginFocused}
						hasValidLocation={!!pickupLocation}
					/>

					{/* Google Places Autocomplete - Para comparar */}
					{/* <GooglePlacesInput
						placeholder="¿Dónde estás? (Google Places)"
						iconName="location"
						mapIconName="map"
						mapIconColor={colors.primary.main}
						onLocationSelected={(location) => {
							setPickupLocation(location);
							toast.success('Origen seleccionado', location.address);
						}}
						onMapPress={handleOriginMap}
						onClearPress={handleOriginClear}
						containerStyle={styles.googlePlacesInput}
						locationBias={{
							latitude: 10.647818, // Maracaibo
							longitude: -71.612268,
							radius: 30000, // 30km alrededor de Maracaibo
						}}
					/> */}

					<LocationInput
						placeholder="¿A dónde vas?"
						value={destinationQuery}
						onChangeText={handleDestinationChange}
						iconName="location-sharp"
						mapIconColor={colors.tertiary.main}
						onMapPress={handleDestinationMap}
						onClearPress={handleDestinationClear}
						options={destinationResults}
						onOptionSelected={handleDestinationSelected}
						state={destinationState}
						containerStyle={styles.locationInput}
						onFocus={onDestinationFocused}
						focusedLeftIconColor={colors.tertiary.main}
						focusedBorderColor={colors.tertiary.main}
						hasValidLocation={!!dropoffLocation}
					/>

					<TouchableOpacity
						style={styles.mapHintContainer}
						onPress={() => toast.info('Mapa', 'Arrastra los marcadores para ajustar')}
					>
						<Ionicons name="map" size={20} color={selectMapTextColor} />
						<Text style={[styles.mapHintText, { color: selectMapTextColor }]}>Seleccionar la ubicación en el mapa</Text>
					</TouchableOpacity>
				</View>

				{/* Map View */}
				<View style={styles.mapContainer}>
					<MapRoute
						origin={
							pickupLocation
								? {
										latitude: pickupLocation.latitude,
										longitude: pickupLocation.longitude,
										title: 'Origen',
										description: pickupLocation.address,
								  }
								: undefined
						}
						destination={
							dropoffLocation
								? {
										latitude: dropoffLocation.latitude,
										longitude: dropoffLocation.longitude,
										title: 'Destino',
										description: dropoffLocation.address,
								  }
								: undefined
						}
						initialRegion={{
							latitude: pickupLocation?.latitude ?? 10.647818,
							longitude: pickupLocation?.longitude ?? -71.612268,
							latitudeDelta: 0.09,
							longitudeDelta: 0.04,
						}}
						onOriginDragEnd={coordinate => {
							if (pickupLocation) {
								setPickupLocation({
									...pickupLocation,
									latitude: coordinate.latitude,
									longitude: coordinate.longitude,
								});
							}
						}}
						onDestinationDragEnd={coordinate => {
							if (dropoffLocation) {
								setDropoffLocation({
									...dropoffLocation,
									latitude: coordinate.latitude,
									longitude: coordinate.longitude,
								});
							}
						}}
						showDirections={!!(pickupLocation && dropoffLocation)}
						containerStyleType="fill"
					/>

					{/* Trip Info */}
					{pickupLocation && dropoffLocation && <TripInfoCard origin={pickupLocation} destination={dropoffLocation} />}
				</View>

				{/* Footer */}
				<View style={styles.footer}>
					<Button
						title="Continuar"
						variant="primary"
						onPress={handleConfirmTrip}
						style={styles.confirmButton}
						disabled={!pickupLocation || !dropoffLocation}
					/>
				</View>
			</View>
		</SafeAreaView>
	);
};

// Función para calcular distancia usando fórmula de Haversine
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
	const R = 6371; // Radio de la Tierra en km
	const dLat = toRad(lat2 - lat1);
	const dLon = toRad(lon2 - lon1);
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
};

const toRad = (value: number): number => {
	return (value * Math.PI) / 180;
};

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: colors.card,
	},
	container: {
		flex: 1,
		backgroundColor: colors.background.default,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.md,
		backgroundColor: colors.card,
		borderBottomWidth: 1,
		borderBottomColor: colors.border,
	},
	backButton: {
		padding: spacing.sm,
	},
	headerTitle: {
		flex: 1,
		textAlign: 'center',
		marginLeft: -40,
	},
	headerSpacer: {
		width: 40,
	},
	locationsContainer: {
		paddingHorizontal: spacing.lg,
		paddingTop: spacing.lg,
		paddingBottom: spacing.md,
		backgroundColor: colors.background.default,
	},
	locationInput: {
		marginBottom: spacing.md,
		zIndex: 1,
		elevation: 1,
	},
	googlePlacesInput: {
		marginBottom: spacing.md,
		zIndex: 100,
		elevation: 100,
	},
	mapHintContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.sm,
		paddingVertical: spacing.xs,
	},
	mapHintText: {
		color: colors.blue.main,
		fontSize: typography.fontSize.sm,
	},
	mapContainer: {
		flex: 1,
		width: '100%',
		position: 'relative',
	},
	footer: {
		padding: spacing.md,
		backgroundColor: colors.card,
		borderTopWidth: 1,
		borderTopColor: colors.border,
	},
	confirmButton: {
		height: 56,
		shadowColor: colors.blue.main,
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
});

export default NewBookingScreen;
