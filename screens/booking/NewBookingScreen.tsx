import { Button } from '@/components/common/Button';
import { LocationInput } from '@/components/common/LocationInput';
import { Text } from '@/components/common/Text';
import { useToast } from '@/hooks/toastContext';
import { colors, spacing, typography } from '@/theme';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import { Link, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    View
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from 'react-native-maps-directions';
import { SafeAreaView } from 'react-native-safe-area-context';

interface NewBookingScreenProps {
    navigation?: any;
}

const NewBookingScreen: React.FC<NewBookingScreenProps> = ({ navigation }) => {
    const [origin, setOrigin] = useState({
        latitude: 10.647818,
        longitude: -71.612268,
    });
    const [destination, setDestination] = useState({
        latitude: 10.652139,
        longitude: -71.611751,
    });
    const [originAddress, setOriginAddress] = useState('');
    const [destinationAddress, setDestinationAddress] = useState('');
    const toast = useToast();
    const router = useRouter();
    const googleMapsApiKey = Constants.expoConfig?.extra?.GOOGLE_MAPS_API_KEY;

    const checkLocationPermission = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.log('Permission to access location was denied');
            return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        setOrigin({ latitude, longitude });
    };

    useEffect(() => {
        checkLocationPermission();
    }, []);

    const handleBack = () => {
        router.back();
    };

    const handleOriginMap = () => {
        toast.info('Seleccionar ubicación', 'Abriendo mapa para origen...');
        // Aquí irías a una pantalla de mapa
    };

    const handleDestinationMap = () => {
        toast.info('Seleccionar ubicación', 'Abriendo mapa para destino...');
        // Aquí irías a una pantalla de mapa
    };

    const handleSelectVehicle = () => {
        // Navegar a pantalla de selección de vehículo
        console.log('Seleccionar tipo de vehículo');
    };

    const handleConfirmTrip = () => {
        if (!originAddress.trim()) {
            toast.error('Error', 'Por favor ingresa el origen');
            return;
        }
        if (!destinationAddress.trim()) {
            toast.error('Error', 'Por favor ingresa el destino');
            return;
        }

        toast.success('¡Viaje confirmado!', 'Buscando conductor...');
        // Aquí enviarías la solicitud del viaje
        console.log('Confirmar viaje:', { origin, destination });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.card} />

            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Link href="/" asChild>
                        <Pressable style={styles.backButton}>
                            <Ionicons
                                name="arrow-back"
                                size={24}
                                color={colors.text.secondary}
                            />
                        </Pressable>
                    </Link>
                    <Text variant="h3" weight="semiBold" style={styles.headerTitle}>
                        Solicitar Viaje
                    </Text>
                    <View style={styles.headerSpacer} />
                </View>

                {/* Main Content */}
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Location Inputs */}
                    <View style={styles.locationsContainer}>
                        <LocationInput
                            placeholder="Origen"
                            value={originAddress}
                            onChangeText={setOriginAddress}
                            iconName="location"
                            onMapPress={handleOriginMap}
                            containerStyle={styles.locationInput}
                        />

                        <LocationInput
                            placeholder="Destino"
                            value={destinationAddress}
                            onChangeText={setDestinationAddress}
                            iconName="location-sharp"
                            onMapPress={handleDestinationMap}
                            containerStyle={styles.locationInput}
                        />
                        <View style={{
                            flexDirection: 'row',
                            gap: 8
                        }}>
                            <Text>
                                <FontAwesome
                                    name="map-pin"
                                    size={20}
                                    color={colors.blue.main}
                                />
                            </Text>
                            <Text style={{ color: colors.blue.main }}>
                                Direccion en el mapa
                            </Text>
                        </View>
                    </View>

                    {/* Map View */}
                    <View style={styles.mapContainer}>
                        <MapView
                            style={styles.mapView}
                            initialRegion={{
                                latitude: origin.latitude,
                                longitude: origin.longitude,
                                latitudeDelta: 0.09,
                                longitudeDelta: 0.04,
                            }}
                            provider={PROVIDER_GOOGLE}
                            showsBuildings={false}
                            showsPointsOfInterest={false}
                            showsIndoors={false}
                        >
                            <Marker
                                coordinate={origin}
                                title="Origen"
                                pinColor={colors.blue.main}
                                draggable
                                onDragEnd={(e) => {
                                    setOrigin(e.nativeEvent.coordinate);
                                }}
                            />
                            <Marker
                                coordinate={destination}
                                title="Destino"
                                pinColor={colors.success}
                                draggable
                                onDragEnd={(e) => {
                                    setDestination(e.nativeEvent.coordinate);
                                }}
                            />
                            <MapViewDirections
                                origin={origin}
                                destination={destination}
                                apikey={googleMapsApiKey}
                                strokeColor={colors.blue.main}
                                strokeWidth={2}
                            />
                        </MapView>
                    </View>

                    {/* Vehicle Selection Card */}
                    {/* <TouchableOpacity
                        style={styles.vehicleCard}
                        onPress={handleSelectVehicle}
                        activeOpacity={0.7}
                    >
                        <View style={styles.vehicleInfo}>
                            <View style={styles.vehicleIconContainer}>
                                <Ionicons name="car" size={32} color={colors.blue.main} />
                            </View>
                            <View style={styles.vehicleDetails}>
                                <Text weight="semiBold" style={styles.vehicleType}>
                                    Viaje Estándar
                                </Text>
                                <Text
                                    variant="caption"
                                    color={colors.text.secondary}
                                    style={styles.vehicleSubtext}
                                >
                                    Opción más popular
                                </Text>
                            </View>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={colors.text.secondary}
                            />
                        </View>

                        <View style={styles.priceDivider} />

                        <View style={styles.priceContainer}>
                            <Text color={colors.text.secondary}>Precio estimado</Text>
                            <Text variant="h2" weight="bold" style={styles.price}>
                                $10.00 - $12.50
                            </Text>
                        </View>
                    </TouchableOpacity> */}

                    {/* Additional Info */}
                    {/* <View style={styles.infoContainer}>
                        <View style={styles.infoRow}>
                            <Ionicons
                                name="time-outline"
                                size={20}
                                color={colors.text.secondary}
                            />
                            <Text variant="caption" color={colors.text.secondary} style={styles.infoText}>
                                Tiempo estimado: 15-20 min
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons
                                name="shield-checkmark-outline"
                                size={20}
                                color={colors.text.secondary}
                            />
                            <Text variant="caption" color={colors.text.secondary} style={styles.infoText}>
                                Viaje seguro y verificado
                            </Text>
                        </View>
                    </View> */}
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                    <Button
                        title="Siguiente"
                        variant="primary"
                        onPress={handleConfirmTrip}
                        style={styles.confirmButton}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
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
    mapContainer: {
        height: 300,
        width: '100%',
        marginBottom: spacing.lg,
        backgroundColor: 'red',
    },
    mapView: {
        width: '100%',
        height: '100%',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: spacing.lg,
    },
    locationsContainer: {
        marginBottom: spacing.lg,
    },
    locationInput: {
        marginBottom: spacing.md,
    },
    vehicleCard: {
        backgroundColor: colors.blue.light,
        borderRadius: 12,
        padding: spacing.md,
        marginBottom: spacing.lg,
    },
    vehicleInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    vehicleIconContainer: {
        width: 48,
        height: 48,
        backgroundColor: colors.card,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    vehicleDetails: {
        flex: 1,
        marginLeft: spacing.md,
    },
    vehicleType: {
        fontSize: typography.fontSize.base,
        marginBottom: 2,
    },
    vehicleSubtext: {
        fontSize: typography.fontSize.sm,
    },
    priceDivider: {
        height: 1,
        backgroundColor: '#bfdbfe',
        marginVertical: spacing.md,
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: typography.fontSize['2xl'],
    },
    infoContainer: {
        gap: spacing.md,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    infoText: {
        flex: 1,
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