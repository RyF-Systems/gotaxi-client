import { colors } from '@/theme';
// eslint-disable-next-line import/no-unresolved
import { GOOGLE_MAPS_API_KEY as googleMapsApiKey } from '@env';
import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';

/**
 * Interfaz que define la estructura de una ubicación en el mapa
 */
export interface MapRouteLocation {
	/** Latitud de la ubicación (coordenada geográfica) */
	latitude: number;
	/** Longitud de la ubicación (coordenada geográfica) */
	longitude: number;
	/** Título que se mostrará en el marcador del mapa (ej: "Origen", "Destino") */
	title?: string;
	/** Descripción adicional que aparecerá debajo del título en el marcador */
	description?: string;
}

/**
 * Estilos predefinidos para el contenedor del MapRoute
 * 
 * - `fill`: Usa flex: 1 para ocupar todo el espacio disponible del padre
 * - `fixed`: Usa dimensiones fijas (width y height deben especificarse via containerStyle)
 * - `custom`: El usuario controla completamente los estilos via containerStyle
 */
export type MapRouteContainerStyle = 'fill' | 'fixed' | 'custom';

/**
 * Props del componente MapRoute
 */
interface MapRouteProps {
	/**
	 * Ubicación de origen del viaje.
	 * Si se proporciona, se mostrará un marcador azul en el mapa.
	 * @example
	 * origin={{
	 *   latitude: 10.647818,
	 *   longitude: -71.612268,
	 *   title: 'Mi ubicación',
	 *   description: 'Centro de la ciudad'
	 * }}
	 */
	origin?: MapRouteLocation;

	/**
	 * Ubicación de destino del viaje.
	 * Si se proporciona, se mostrará un marcador verde en el mapa.
	 * @example
	 * destination={{
	 *   latitude: 10.652139,
	 *   longitude: -71.611751,
	 *   title: 'Destino',
	 *   description: 'Aeropuerto'
	 * }}
	 */
	destination?: MapRouteLocation;

	/**
	 * Región inicial del mapa (posición de la cámara al cargar).
	 * Si no se especifica, se usará la ubicación del origen o una ubicación por defecto.
	 * @default { latitude: origin?.latitude || 10.647818, longitude: origin?.longitude || -71.612268, latitudeDelta: 0.09, longitudeDelta: 0.04 }
	 */
	initialRegion?: Region;

	/**
	 * Callback que se ejecuta cuando el usuario arrastra el marcador de origen.
	 * Recibe las nuevas coordenadas como parámetro.
	 * @param coordinate - Nuevas coordenadas { latitude, longitude }
	 */
	onOriginDragEnd?: (coordinate: { latitude: number; longitude: number }) => void;

	/**
	 * Callback que se ejecuta cuando el usuario arrastra el marcador de destino.
	 * Recibe las nuevas coordenadas como parámetro.
	 * @param coordinate - Nuevas coordenadas { latitude, longitude }
	 */
	onDestinationDragEnd?: (coordinate: { latitude: number; longitude: number }) => void;

	/**
	 * Determina si el marcador de origen puede ser arrastrado por el usuario.
	 * @default true
	 */
	originDraggable?: boolean;

	/**
	 * Determina si el marcador de destino puede ser arrastrado por el usuario.
	 * @default true
	 */
	destinationDraggable?: boolean;

	/**
	 * Muestra la ruta entre origen y destino usando Google Directions API.
	 * Solo se dibujará si ambas ubicaciones (origin y destination) están definidas.
	 * @default true
	 */
	showDirections?: boolean;

	/**
	 * Tipo de estilo del contenedor del mapa:
	 * - `'fill'` (default): El mapa ocupará todo el espacio disponible usando flex: 1.
	 *   Ideal cuando está dentro de un contenedor con flex: 1.
	 * - `'fixed'`: El mapa usará dimensiones fijas. Debes especificar width y height en containerStyle.
	 * - `'custom'`: Control total de estilos via containerStyle.
	 * 
	 * @default 'fill'
	 * @example
	 * // Llenar todo el espacio disponible
	 * containerStyleType="fill"
	 * 
	 * // Dimensiones fijas de 300x400
	 * containerStyleType="fixed"
	 * containerStyle={{ width: 300, height: 400 }}
	 */
	containerStyleType?: MapRouteContainerStyle;

	/**
	 * Estilos personalizados para el contenedor del mapa (View wrapper).
	 * 
	 * **Según el containerStyleType:**
	 * - Con `'fill'`: Solo agrega estilos adicionales como margin, padding, borderRadius, etc.
	 * - Con `'fixed'`: Debes especificar width y height aquí.
	 * - Con `'custom'`: Control total de todos los estilos (flex, position, dimensions, etc.).
	 * 
	 * @example
	 * // Con containerStyleType='fill'
	 * containerStyle={{ borderRadius: 12, margin: 10 }}
	 * 
	 * // Con containerStyleType='fixed'
	 * containerStyle={{ width: 300, height: 400, borderRadius: 8 }}
	 */
	containerStyle?: StyleProp<ViewStyle>;

	/**
	 * Estilos personalizados para el componente MapView interno.
	 * Generalmente no necesitas modificar esto a menos que requieras
	 * ajustes muy específicos del mapa.
	 * 
	 * @example
	 * mapViewStyle={{ opacity: 0.8 }}
	 */
	mapViewStyle?: StyleProp<ViewStyle>;
}

/**
 * MapRoute - Componente de mapa reutilizable con marcadores y rutas
 * 
 * Muestra un mapa de Google Maps con marcadores personalizables para origen y destino,
 * y puede trazar una ruta entre ellos usando Google Directions API.
 * 
 * @component
 * @example
 * // Ejemplo básico - Mapa que llena todo el espacio disponible
 * <MapRoute
 *   origin={{ latitude: 10.647, longitude: -71.612, title: 'Origen' }}
 *   destination={{ latitude: 10.652, longitude: -71.611, title: 'Destino' }}
 * />
 * 
 * @example
 * // Mapa con dimensiones fijas en un card
 * <MapRoute
 *   containerStyleType="fixed"
 *   containerStyle={{ width: 300, height: 200, borderRadius: 8 }}
 *   origin={{ latitude: 10.647, longitude: -71.612 }}
 * />
 * 
 * @example
 * // Mapa con callbacks de drag
 * <MapRoute
 *   origin={origin}
 *   destination={destination}
 *   onOriginDragEnd={(coord) => setOrigin(coord)}
 *   onDestinationDragEnd={(coord) => setDestination(coord)}
 *   showDirections={true}
 * />
 */
export const MapRoute: React.FC<MapRouteProps> = ({
	origin,
	destination,
	initialRegion,
	onOriginDragEnd,
	onDestinationDragEnd,
	originDraggable = true,
	destinationDraggable = true,
	showDirections = true,
	containerStyleType = 'fill',
	containerStyle,
	mapViewStyle,
}) => {
	// Región por defecto si no se especifica una
	const defaultRegion: Region = {
		latitude: origin?.latitude || 10.647818,
		longitude: origin?.longitude || -71.612268,
		latitudeDelta: 0.09,
		longitudeDelta: 0.04,
	};

	const region = initialRegion || defaultRegion;

	/**
	 * Determina el estilo base del contenedor según el tipo especificado.
	 * @returns ViewStyle - Objeto de estilos de React Native
	 */
	const getContainerBaseStyle = (): ViewStyle => {
		switch (containerStyleType) {
			case 'fill':
				// flex: 1 para ocupar todo el espacio disponible
				return styles.containerFill;
			case 'fixed':
				// Sin flex, el usuario controla width/height via containerStyle
				return styles.containerFixed;
			case 'custom':
				// Sin estilos base, control total del usuario
				return {};
			default:
				return styles.containerFill;
		}
	};

	return (
		<View style={[getContainerBaseStyle(), containerStyle]}>
			<MapView
				style={[styles.mapView, mapViewStyle]}
				initialRegion={region}
				provider={PROVIDER_GOOGLE}
				showsBuildings={false}
				showsPointsOfInterest={false}
				showsIndoors={false}
			>
				{/* Marcador de origen - Solo se muestra si origin está definido */}
				{origin && (
					<Marker
						coordinate={{
							latitude: origin.latitude,
							longitude: origin.longitude,
						}}
						title={origin.title || 'Origen'}
						description={origin.description}
						pinColor={colors.blue.main}
						draggable={originDraggable}
						onDragEnd={e => {
							if (onOriginDragEnd) {
								onOriginDragEnd(e.nativeEvent.coordinate);
							}
						}}
					/>
				)}

				{/* Marcador de destino - Solo se muestra si destination está definido */}
				{destination && (
					<Marker
						coordinate={{
							latitude: destination.latitude,
							longitude: destination.longitude,
						}}
						title={destination.title || 'Destino'}
						description={destination.description}
						pinColor={colors.success}
						draggable={destinationDraggable}
						onDragEnd={e => {
							if (onDestinationDragEnd) {
								onDestinationDragEnd(e.nativeEvent.coordinate);
							}
						}}
					/>
				)}

				{/* Ruta entre origen y destino - Solo se dibuja si ambos existen y showDirections es true */}
				{showDirections && origin && destination && (
					<MapViewDirections
						origin={{
							latitude: origin.latitude,
							longitude: origin.longitude,
						}}
						destination={{
							latitude: destination.latitude,
							longitude: destination.longitude,
						}}
						apikey={googleMapsApiKey}
						strokeColor={colors.blue.main}
						strokeWidth={3}
						onError={error => {
							console.log('Directions error:', error);
						}}
					/>
				)}
			</MapView>
		</View>
	);
};

const styles = StyleSheet.create({
	/**
	 * Estilo para cuando el mapa debe llenar todo el espacio disponible.
	 * Usa flex: 1 para expandirse dentro de su contenedor padre.
	 * Ideal para pantallas completas o secciones con flex.
	 */
	containerFill: {
		flex: 1,
		width: '100%',
		overflow: 'hidden',
	},
	/**
	 * Estilo base para dimensiones fijas.
	 * El usuario debe especificar width y height via containerStyle prop.
	 * Ideal para cards, previews, o componentes con tamaño específico.
	 */
	containerFixed: {
		overflow: 'hidden',
	},
	/**
	 * Estilo del MapView interno.
	 * Siempre ocupa el 100% del contenedor para asegurar que el mapa
	 * llene completamente el espacio asignado.
	 */
	mapView: {
		width: '100%',
		height: '100%',
	},
});