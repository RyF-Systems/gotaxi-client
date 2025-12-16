import { colors, spacing } from '@/theme';
// eslint-disable-next-line import/no-unresolved
import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Animated, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { Button } from './Button';

/**
 * Interfaz para la ubicación seleccionada
 */
export interface SelectedLocation {
	/** Latitud de la ubicación seleccionada */
	latitude: number;
	/** Longitud de la ubicación seleccionada */
	longitude: number;
}

/**
 * Props del componente MapLocationPicker
 */
interface MapLocationPickerProps {
	/**
	 * Región inicial del mapa (posición de la cámara al cargar).
	 * @default { latitude: 10.647818, longitude: -71.612268, latitudeDelta: 0.09, longitudeDelta: 0.04 }
	 */
	initialRegion?: Region;

	/**
	 * Callback que se ejecuta cuando el usuario confirma la ubicación seleccionada.
	 * Recibe las coordenadas del centro del mapa.
	 * @param location - Ubicación seleccionada { latitude, longitude }
	 */
	onLocationSelected: (location: SelectedLocation) => void;

	/**
	 * Texto del botón de confirmación.
	 * @default 'Seleccionar ubicación'
	 */
	buttonText?: string;

	/**
	 * Color del pin central.
	 * @default colors.primary.main
	 */
	pinColor?: string;

	/**
	 * Tamaño del icono del pin.
	 * @default 40
	 */
	pinSize?: number;

	/**
	 * Estilos personalizados para el contenedor principal.
	 */
	containerStyle?: StyleProp<ViewStyle>;

	/**
	 * Estilos personalizados para el botón de confirmación.
	 */
	buttonContainerStyle?: StyleProp<ViewStyle>;

	/**
	 * Callback que se ejecuta cuando el mapa está listo.
	 * Útil para obtener la referencia del mapa.
	 */
	onMapReady?: () => void;

	/**
	 * Callback que se ejecuta cada vez que el usuario mueve el mapa.
	 * Recibe la región actual del mapa.
	 * @param region - Región actual del mapa
	 */
	onRegionChange?: (region: Region) => void;
}

/**
 * MapLocationPicker - Componente para seleccionar una ubicación en el mapa
 * 
 * Este componente muestra un mapa de pantalla completa con un pin fijo en el centro.
 * El usuario puede desplazar el mapa para posicionar el pin sobre la ubicación deseada
 * y luego confirmar la selección con un botón.
 * 
 * @component
 * @example
 * // Ejemplo básico
 * <MapLocationPicker
 *   onLocationSelected={(location) => {
 *     console.log('Ubicación seleccionada:', location);
 *     navigation.goBack();
 *   }}
 * />
 * 
 * @example
 * // Con región inicial personalizada
 * <MapLocationPicker
 *   initialRegion={{
 *     latitude: 10.647818,
 *     longitude: -71.612268,
 *     latitudeDelta: 0.05,
 *     longitudeDelta: 0.05,
 *   }}
 *   buttonText="Confirmar ubicación"
 *   onLocationSelected={handleLocationSelect}
 * />
 */
export const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
	initialRegion,
	onLocationSelected,
	buttonText = 'Seleccionar ubicación',
	pinColor = colors.primary.main,
	pinSize = 40,
	containerStyle,
	buttonContainerStyle,
	onMapReady,
	onRegionChange,
}) => {
	const mapRef = useRef<MapView>(null);
	const [currentRegion, setCurrentRegion] = useState<Region>(
		initialRegion || {
			latitude: 10.647818,
			longitude: -71.612268,
			latitudeDelta: 0.09,
			longitudeDelta: 0.04,
		}
	);

	// Animación del pin cuando el usuario arrastra el mapa
	const pinAnimation = useRef(new Animated.Value(0)).current;
	const [isMoving, setIsMoving] = useState(false);

	/**
	 * Se ejecuta cuando el usuario comienza a arrastrar el mapa
	 */
	const handleRegionChangeStart = () => {
		setIsMoving(true);
		// Anima el pin hacia arriba cuando se mueve el mapa
		Animated.timing(pinAnimation, {
			toValue: 1,
			duration: 200,
			useNativeDriver: true,
		}).start();
	};

	/**
	 * Se ejecuta cuando el usuario termina de arrastrar el mapa
	 */
	const handleRegionChangeComplete = (region: Region) => {
		setIsMoving(false);
		setCurrentRegion(region);
		
		// Anima el pin hacia abajo cuando el mapa se detiene
		Animated.spring(pinAnimation, {
			toValue: 0,
			friction: 8,
			tension: 100,
			useNativeDriver: true,
		}).start();

		onRegionChange?.(region);
	};

	/**
	 * Maneja la confirmación de la ubicación seleccionada
	 */
	const handleConfirmLocation = () => {
		onLocationSelected({
			latitude: currentRegion.latitude,
			longitude: currentRegion.longitude,
		});
	};

	// Calcula la transformación del pin durante la animación
	const pinTranslateY = pinAnimation.interpolate({
		inputRange: [0, 1],
		outputRange: [0, -20], // Mueve el pin 20 unidades hacia arriba
	});

	const pinScale = pinAnimation.interpolate({
		inputRange: [0, 1],
		outputRange: [1, 1.1], // Aumenta el tamaño del pin ligeramente
	});

	return (
		<View style={[styles.container, containerStyle]}>
			{/* Mapa de fondo */}
			<MapView
				ref={mapRef}
				style={styles.map}
				initialRegion={currentRegion}
				provider={PROVIDER_GOOGLE}
				showsBuildings={false}
				showsPointsOfInterest={true}
				showsIndoors={false}
				showsUserLocation={true}
				showsMyLocationButton={true}
				onRegionChangeStart={handleRegionChangeStart}
				onRegionChangeComplete={handleRegionChangeComplete}
				onMapReady={onMapReady}
			/>

			{/* Pin central fijo */}
			<View style={styles.pinContainer} pointerEvents="none">
				<Animated.View
					style={[
						styles.pinWrapper,
						{
							transform: [
								{ translateY: pinTranslateY },
								{ scale: pinScale },
							],
						},
					]}
				>
					<Ionicons name="location-sharp" size={pinSize} color={pinColor} />
					{/* Sombra del pin */}
					<View
						style={[
							styles.pinShadow,
							{
								width: pinSize * 0.5,
								opacity: isMoving ? 0.2 : 0.4,
							},
						]}
					/>
				</Animated.View>
			</View>

			{/* Botón de confirmación */}
			<View style={[styles.buttonContainer, buttonContainerStyle]}>
				<Button
					title={buttonText}
					onPress={handleConfirmLocation}
					leftIcon="checkmark-circle"
					variant="primary"
					size="large"
				/>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.background.default,
	},
	map: {
		...StyleSheet.absoluteFillObject,
	},
	pinContainer: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: 'center',
		alignItems: 'center',
		// Ajusta el pin hacia arriba para que apunte al centro exacto
		paddingBottom: 40,
	},
	pinWrapper: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	pinShadow: {
		height: 4,
		borderRadius: 50,
		backgroundColor: '#000',
		marginTop: -8,
	},
	buttonContainer: {
		position: 'absolute',
		bottom: spacing.xl,
		left: spacing.lg,
		right: spacing.lg,
		// Sombra para el botón
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
});
