import { Button } from '@/components/common/Button';
import { InputState } from '@/components/common/InputAutocomplete';
import { LocationInput, LocationOption } from '@/components/common/LocationInput';
import { MapRoute } from '@/components/common/MapRoute';
import { Text } from '@/components/common/Text';
import { TripInfoCard } from '@/components/common/TripInfoCard';
import { useToast } from '@/hooks/toastContext';
import { useLocationSearch } from '@/hooks/useLocationSearch';
import { useBookingStore } from '@/store';
import { colors, spacing, typography } from '@/theme';
import { GOOGLE_MAPS_CONFIG } from '@/utils/config';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

	const origin = useLocationSearch(GOOGLE_MAPS_CONFIG);
	const destination = useLocationSearch(GOOGLE_MAPS_CONFIG);
	const [selectMapTextColor, setSelectMapTextColor] = useState(colors.tertiary.main);
	const [inputFocused, setInputFocused] = useState<'origin' | 'destination'>('destination');
	const [, setHasLocationPermission] = useState(false);
	const [originState, setOriginState] = useState<InputState>(
		origin.loading ? 'loading' : pickupLocation ? 'valid' : 'default',
	);
	const [destinationState, setDestinationState] = useState<InputState>(
		destination.loading ? 'loading' : dropoffLocation ? 'valid' : 'default',
	);

	useEffect(() => {
		if (pickupLocation && origin.query !== pickupLocation.address) {
			origin.setQuery(pickupLocation.address);
		}
	}, [origin, pickupLocation]);

	useEffect(() => {
		if (dropoffLocation && destination.query !== dropoffLocation.address) {
			destination.setQuery(dropoffLocation.address);
		}
	}, [destination, dropoffLocation]);

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
				setOriginState('valid');
			}
		};

		initializeLocation();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleOriginClear = useCallback(() => {
		origin.setQuery('');
		removePickupLocation();
	}, [origin, removePickupLocation]);

	const handleDestinationClear = useCallback(() => {
		destination.setQuery('');
		removeDropoffLocation();
	}, [destination, removeDropoffLocation]);

	const handleOriginChange = useCallback(
		(text: string) => {
			origin.setQuery(text);
			if (text.length === 0) {
				removePickupLocation();
			}
		},
		[origin, removePickupLocation],
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
		setInputFocused('origin');
		setOriginState('default');
	}, []);

	const onOriginBlur = useCallback(() => {
		if (pickupLocation) {
			setOriginState('valid');
		} else {
			setOriginState('invalid');
		}
	}, [pickupLocation]);

	const onDestinationFocused = useCallback(() => {
		setSelectMapTextColor(colors.tertiary.main);
		setInputFocused('destination');
		setDestinationState('default');
	}, []);

	const onDestinationBlur = useCallback(() => {
		if (dropoffLocation) {
			setDestinationState('valid');
		} else {
			setDestinationState('invalid');
		}
	}, [dropoffLocation]);

	const handleDestinationChange = useCallback(
		(text: string) => {
			destination.setQuery(text);
			if (text.length === 0) {
				removeDropoffLocation();
			}
		},
		[destination, removeDropoffLocation],
	);

	const handleOriginSelected = useCallback(
		(option: LocationOption) => {
			setPickupLocation(option);
			origin.setQuery(option.address);
			setOriginState('valid');
		},
		[setPickupLocation, origin],
	);

	const handleDestinationSelected = useCallback(
		(option: LocationOption) => {
			setDropoffLocation(option);
			destination.setQuery(option.address);
			setDestinationState('valid');
		},
		[setDropoffLocation, destination],
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
						value={origin.query}
						onChangeText={handleOriginChange}
						iconName="location"
						mapIconColor={colors.primary.main}
						onMapPress={handleOriginMap}
						onClearPress={handleOriginClear}
						options={origin.results}
						onOptionSelected={handleOriginSelected}
						state={originState}
						containerStyle={styles.locationInput}
						onFocus={onOriginFocused}
						onBlur={onOriginBlur}
						focusedLeftIconColor={colors.primary.main}
						focusedBorderColor={colors.primary.main}
						hasValidLocation={!!pickupLocation}
					/>

					<LocationInput
						placeholder="¿A dónde vas?"
						value={destination.query}
						onChangeText={handleDestinationChange}
						iconName="location-sharp"
						mapIconColor={colors.tertiary.main}
						onMapPress={handleDestinationMap}
						onClearPress={handleDestinationClear}
						options={destination.results}
						onOptionSelected={handleDestinationSelected}
						state={destinationState}
						containerStyle={styles.locationInput}
						onFocus={onDestinationFocused}
						onBlur={onDestinationBlur}
						focusedLeftIconColor={colors.tertiary.main}
						focusedBorderColor={colors.tertiary.main}
						hasValidLocation={!!dropoffLocation}
					/>

					<TouchableOpacity
						style={styles.mapHintContainer}
						onPress={() => router.push(`/location/selectLocation?type=${inputFocused}`)}
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
