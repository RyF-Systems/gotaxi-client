import { colors, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

interface LocationInputProps extends TextInputProps {
    iconName?: keyof typeof Ionicons.glyphMap;
    onMapPress?: () => void;
    containerStyle?: ViewStyle;
    showMapButton?: boolean;
}

export const LocationInput: React.FC<LocationInputProps> = ({
    iconName = 'location',
    onMapPress,
    containerStyle,
    showMapButton = true,
    ...props
}) => {
    return (
        <View style={[styles.container, containerStyle]}>
            <Ionicons
                name={iconName}
                size={20}
                color={colors.text.secondary}
                style={styles.icon}
            />
            <TextInput
                style={styles.input}
                placeholderTextColor={colors.text.secondary}
                {...props}
            />
            {showMapButton && onMapPress && (
                <TouchableOpacity onPress={onMapPress} style={styles.mapButton}>
                    <Ionicons name="map" size={24} color={colors.blue.main} />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.input,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        height: 48,
        paddingHorizontal: spacing.md,
    },
    icon: {
        marginRight: spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.primary,
    },
    mapButton: {
        padding: spacing.sm,
        marginLeft: spacing.xs,
        borderRadius: 6,
    },
});