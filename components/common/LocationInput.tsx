import { colors, spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, TextInputProps, View, ViewStyle } from 'react-native';
import {
  AutocompleteOption,
  InputAutocomplete,
  InputState,
} from './InputAutocomplete';
import { Text } from './Text';

export interface LocationOption {
  address: string;
  latitude: number;
  longitude: number;
  placeId?: string;
  description?: string;
}

interface LocationInputProps extends Omit<TextInputProps, 'onChangeText' | 'onFocus'> {
  iconName?: keyof typeof Ionicons.glyphMap;
  mapIconName?: keyof typeof Ionicons.glyphMap;
  mapIconColor?: string;
  onMapPress?: () => void;
  onClearPress?: () => void;
  containerStyle?: ViewStyle;
  showMapButton?: boolean;
  options?: LocationOption[];
  onOptionSelected?: (option: LocationOption) => void;
  onChangeText?: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  state?: InputState;
  errorMessage?: string;
  helperText?: string;
  focusedBorderColor?: string;
  focusedLeftIconColor?: string;
  hasValidLocation?: boolean;
}

export const LocationInput: React.FC<LocationInputProps> = ({
  iconName = 'location',
  mapIconName = 'map',
  mapIconColor,
  onMapPress,
  onClearPress,
  containerStyle,
  showMapButton = true,
  options = [],
  onOptionSelected,
  onChangeText,
  onFocus,
  onBlur,
  state,
  errorMessage,
  helperText,
  focusedBorderColor,
  focusedLeftIconColor = colors.primary.main,
  hasValidLocation = false,
  value,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  // Convertir LocationOption a AutocompleteOption
  const autocompleteOptions: AutocompleteOption[] = options.map((option) => ({
    label: option.address,
    value: option.placeId || `${option.latitude}-${option.longitude}`,
    description: option.description,
    icon: 'location' as keyof typeof Ionicons.glyphMap,
    // Mantener datos originales para el callback
    _original: option,
  }));

  const handleOptionSelected = (option: AutocompleteOption) => {
    // Recuperar el LocationOption original
    const locationOption = option._original as LocationOption;
    onOptionSelected?.(locationOption);
  };

  // Determinar qué icono mostrar basado en el contenido del input
  const getRightIcon = (): keyof typeof Ionicons.glyphMap | undefined => {
    const hasText = value && String(value).length > 0;
    
    // Si está focused y hay texto: mostrar close-circle-outline
    if (isFocused && hasText) {
      return 'close-circle-outline';
    }
    
    // Si no está focused y hay ubicación válida: mostrar checkmark
    if (!isFocused && hasValidLocation) {
      return 'checkmark-circle-outline';
    }
    
    // Si no está focused y no hay ubicación: mostrar mapa
    if (!isFocused && !hasValidLocation) {
      return showMapButton && onMapPress ? mapIconName : undefined;
    }
    
    return undefined;
  };

  // Manejar los clicks del icono derecho
  const handleRightIconPress = () => {
    const hasText = value && String(value).length > 0;
    
    if (isFocused && hasText) {
      // Si está focused y hay texto, limpiar
      onClearPress?.();
      onChangeText?.('');
    } else if (!isFocused && !hasValidLocation) {
      // Si no está focused y no hay ubicación, presionar el mapa
      onMapPress?.();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };
  const renderLocationOption = (option: AutocompleteOption) => {
    return (
      <View style={styles.locationOption}>
        <View style={styles.locationIconContainer}>
          <Ionicons name="location" size={20} color={colors.primary.main} />
        </View>
        <View style={styles.locationTextContainer}>
          <View style={styles.locationLabelRow}>
            <Ionicons
              name="navigate"
              size={14}
              color="#64748b"
              style={styles.navigateIcon}
            />
            <Text weight="medium" style={styles.locationLabelText}>
              {option.label}
            </Text>
          </View>
          {option.description && (
            <Text variant="caption" color="#64748b" style={styles.locationDescription}>
              {option.description}
            </Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={16} color="#64748b" />
      </View>
    );
  };

  return (
    <InputAutocomplete
      leftIcon={iconName}
      leftIconFocusedColor={focusedLeftIconColor}
      rightIcon={getRightIcon()}
      rightIconColor={mapIconColor}
      onRightIconPress={handleRightIconPress}
      containerStyle={containerStyle}
      options={autocompleteOptions}
      onOptionSelected={handleOptionSelected}
      onChangeText={onChangeText}
      onFocus={handleFocus}
      onBlur={handleBlur}
      state={state}
      errorMessage={errorMessage}
      helperText={helperText}
      focusedBorderColor={focusedBorderColor}
      value={value}
      renderOption={renderLocationOption}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    minHeight: 56,
  },
  locationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navigateIcon: {
    marginRight: spacing.xs,
  },
  locationLabelText: {
    fontSize: 16,
    flex: 1,
  },
  locationDescription: {
    marginTop: 2,
  },
});