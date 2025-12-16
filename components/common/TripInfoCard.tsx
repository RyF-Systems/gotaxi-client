import { colors, spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { LocationOption } from './LocationInput';
import { Text } from './Text';

interface TripInfoCardProps {
	origin: LocationOption;
	destination: LocationOption;
}

export const TripInfoCard: React.FC<TripInfoCardProps> = ({ origin, destination }) => {
	// Memoizar cálculos para evitar recalcular en cada render
	const tripDetails = useMemo(() => {
		const distance = calculateDistance(
			origin.latitude,
			origin.longitude,
			destination.latitude,
			destination.longitude,
		);
		const time = calculateTime(distance);
		const price = calculatePrice(distance);
		
		return { distance, time, price };
	}, [origin.latitude, origin.longitude, destination.latitude, destination.longitude]);

	return (
		<View style={styles.tripInfoCard}>
			<View style={styles.tripInfoRow}>
				<Ionicons name="navigate-outline" size={20} color={colors.text.secondary} />
				<Text variant="caption" color={colors.text.secondary}>
					Distancia: {tripDetails.distance.toFixed(2)} km
				</Text>
			</View>
			<View style={styles.tripInfoRow}>
				<Ionicons name="time-outline" size={20} color={colors.text.secondary} />
				<Text variant="caption" color={colors.text.secondary}>
					Tiempo estimado: {tripDetails.time} min
				</Text>
			</View>
			<View style={styles.tripInfoRow}>
				<Ionicons name="cash-outline" size={20} color={colors.text.secondary} />
				<Text variant="caption" color={colors.text.secondary}>
					Precio estimado:{' '}
					<Text weight="semiBold" color={colors.text.primary}>
						{tripDetails.price}
					</Text>
				</Text>
			</View>
		</View>
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

// Calcular precio basado en distancia
const calculatePrice = (distance: number): string => {
	const basePrice = 3.0;
	const pricePerKm = 1.5;
	const minPrice = basePrice + distance * pricePerKm;
	const maxPrice = minPrice * 1.2;
	return `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`;
};

// Calcular tiempo estimado (velocidad promedio 40 km/h)
const calculateTime = (distance: number): string => {
	const averageSpeed = 40;
	const timeInHours = distance / averageSpeed;
	const timeInMinutes = Math.round(timeInHours * 60);
	return `${timeInMinutes}`;
};

const styles = StyleSheet.create({
	tripInfoCard: {
		position: 'absolute',
		bottom: spacing.md,
		left: spacing.lg,
		right: spacing.lg,
		backgroundColor: colors.card,
		borderRadius: 12,
		padding: spacing.md,
		gap: spacing.md,
		borderWidth: 1,
		borderColor: colors.border,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	tripInfoRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.sm,
	},
});
