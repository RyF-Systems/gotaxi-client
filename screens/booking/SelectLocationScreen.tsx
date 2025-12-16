import { MapLocationPicker } from '@/components/common/MapLocationPicker';
import { useBookingStore } from '@/store/bookingStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type LocationType = 'origin' | 'destination';

/**
 * Pantalla para seleccionar ubicación de origen o destino
 * 
 * @example
 * // Seleccionar origen
 * router.push('/location/selectLocation?type=origin');
 * 
 * // Seleccionar destino
 * router.push('/location/selectLocation?type=destination');
 */
export default function SelectLocationScreen() {
	const router = useRouter();
	const params = useLocalSearchParams<{ type: LocationType }>();
	const type = params.type || 'origin';

	const { 
		pickupLocation, 
		dropoffLocation, 
		setPickupLocation, 
		setDropoffLocation 
	} = useBookingStore();

	// Configurar título del header dinámicamente
	useEffect(() => {
		router.setParams({
			title: type === 'origin' ? 'Seleccionar origen' : 'Seleccionar destino',
		});
	}, [router, type]);

	// Determinar ubicación inicial según el tipo
	const initialRegion = type === 'origin' && pickupLocation
		? {
				latitude: pickupLocation.latitude,
				longitude: pickupLocation.longitude,
				latitudeDelta: 0.05,
				longitudeDelta: 0.05,
		  }
		: type === 'destination' && dropoffLocation
		? {
				latitude: dropoffLocation.latitude,
				longitude: dropoffLocation.longitude,
				latitudeDelta: 0.05,
				longitudeDelta: 0.05,
		  }
		: undefined;

	const handleLocationSelected = (location: { latitude: number; longitude: number }) => {
		const formattedLocation = {
			latitude: location.latitude,
			longitude: location.longitude,
			address: '', // Se puede obtener con geocoding reverso
		};

		if (type === 'origin') {
			setPickupLocation(formattedLocation);
		} else {
			setDropoffLocation(formattedLocation);
		}

		router.back();
	};

	return (
		<SafeAreaView style={styles.container}>
			<MapLocationPicker
				initialRegion={initialRegion}
				onLocationSelected={handleLocationSelected}
				buttonText={type === 'origin' ? 'Confirmar origen' : 'Confirmar destino'}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
