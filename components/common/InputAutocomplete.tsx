import { colors, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
	Animated,
	Dimensions,
	LayoutChangeEvent,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	TextInput,
	TextInputProps,
	View,
	ViewStyle,
} from 'react-native';
import { Text } from './Text';

export interface AutocompleteOption {
	label: string;
	value: string;
	icon?: keyof typeof Ionicons.glyphMap;
	description?: string;
	[key: string]: any; // Para datos adicionales
}

export type InputState = 'default' | 'valid' | 'invalid' | 'loading';

interface InputAutocompleteProps extends Omit<TextInputProps, 'onChangeText' | 'onFocus'> {
	leftIcon?: keyof typeof Ionicons.glyphMap;
	leftIconFocusedColor?: string;
	rightIcon?: keyof typeof Ionicons.glyphMap;
	rightIconColor?: string;
	onRightIconPress?: () => void;
	containerStyle?: ViewStyle;
	options?: AutocompleteOption[];
	onOptionSelected?: (option: AutocompleteOption) => void;
	onChangeText?: (text: string) => void;
	onFocus?: () => void;
	onBlur?: () => void;
	state?: InputState;
	errorMessage?: string;
	helperText?: string;
	maxDropdownHeight?: number;
	renderOption?: (option: AutocompleteOption) => React.ReactNode;
	focusedBorderColor?: string;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;
const DROPDOWN_GAP = 4;
const MAX_DROPDOWN_HEIGHT = 300;

export const InputAutocomplete: React.FC<InputAutocompleteProps> = ({
	leftIcon,
	leftIconFocusedColor = colors.primary.main,
	rightIcon,
	rightIconColor,
	onRightIconPress,
	containerStyle,
	options = [],
	onOptionSelected,
	onChangeText,
	onFocus,
	onBlur,
	state = 'default',
	errorMessage,
	helperText,
	maxDropdownHeight = MAX_DROPDOWN_HEIGHT,
	renderOption,
	focusedBorderColor,
	value,
	...props
}) => {
	const [isFocused, setIsFocused] = useState(false);
	const [showOptions, setShowOptions] = useState(false);
	const [dropdownPosition, setDropdownPosition] = useState<'below' | 'above'>('below');

	const inputRef = useRef<TextInput>(null);
	const containerRef = useRef<View>(null);
	const dropdownOpacity = useRef(new Animated.Value(0)).current;
	const dropdownTranslateY = useRef(new Animated.Value(-10)).current;

	useEffect(() => {
		if (showOptions && options.length > 0) {
			// Animación de entrada
			Animated.parallel([
				Animated.timing(dropdownOpacity, {
					toValue: 1,
					duration: 200,
					useNativeDriver: true,
				}),
				Animated.spring(dropdownTranslateY, {
					toValue: 0,
					tension: 100,
					friction: 10,
					useNativeDriver: true,
				}),
			]).start();
		} else {
			// Animación de salida
			Animated.parallel([
				Animated.timing(dropdownOpacity, {
					toValue: 0,
					duration: 150,
					useNativeDriver: true,
				}),
				Animated.timing(dropdownTranslateY, {
					toValue: dropdownPosition === 'below' ? -10 : 10,
					duration: 150,
					useNativeDriver: true,
				}),
			]).start();
		}
	}, [showOptions, options.length, dropdownPosition, dropdownOpacity, dropdownTranslateY]);

	const handleLayout = (event: LayoutChangeEvent) => {
		// Determinar si debe abrir hacia arriba o abajo basado en espacio disponible
		containerRef.current?.measure((x, y, width, height, pageX, pageY) => {
			const spaceBelow = SCREEN_HEIGHT - (pageY + height);
			const spaceAbove = pageY;

			if (spaceBelow < maxDropdownHeight && spaceAbove > spaceBelow) {
				setDropdownPosition('above');
			} else {
				setDropdownPosition('below');
			}
		});
	};

	const handleFocus = () => {
		setIsFocused(true);
		if (options.length > 0 && value) {
			setShowOptions(true);
		}
		onFocus?.();
	};

	const handleBlur = () => {
		setIsFocused(false);
		setTimeout(() => {
			setShowOptions(false);
		}, 200);
		onBlur?.();
	};

	const handleChangeText = (text: string) => {
		onChangeText?.(text);
		if (text.length > 0 && options.length > 0) {
			setShowOptions(true);
		} else if (text.length === 0) {
			setShowOptions(false);
		}
	};

	const handleSelectOption = (option: AutocompleteOption) => {
		onOptionSelected?.(option);
		setShowOptions(false);
		inputRef.current?.blur();
	};

	const getBorderColor = () => {
		if (state === 'invalid') return colors.error;
		if (state === 'valid') return colors.success;
		if (isFocused) return focusedBorderColor || colors.primary.main;
		return colors.border;
	};

	const getRightIconColor = () => {
		if (state === 'invalid') return colors.error;
		if (state === 'valid') return colors.success;
		return colors.text.secondary;
	};

	const getStateIcon = () => {
		if (state === 'loading') return 'hourglass-outline';
		if (state === 'valid') return 'checkmark-circle';
		if (state === 'invalid') return 'close-circle';
		return rightIcon;
	};

	return (
		<View 
			ref={containerRef} 
			style={[
				styles.container, 
				containerStyle,
				showOptions && styles.containerWithDropdown
			]} 
			onLayout={handleLayout}
		>
			<View
				style={[styles.inputContainer, { borderColor: getBorderColor() }, isFocused && styles.inputContainerFocused]}
			>
				{leftIcon && (
					<Ionicons
						name={leftIcon}
						size={20}
						color={isFocused ? leftIconFocusedColor : colors.text.secondary}
						style={styles.leftIcon}
					/>
				)}

				<TextInput
					ref={inputRef}
					style={styles.input}
					placeholderTextColor={colors.text.secondary}
					onFocus={handleFocus}
					onBlur={handleBlur}
					onChangeText={handleChangeText}
					value={value}
					{...props}
				/>

				{(rightIcon || state !== 'default') && (
					<Pressable
						onPress={onRightIconPress}
						style={styles.rightIconContainer}
						disabled={!onRightIconPress && state === 'loading'}
					>
						{state === 'loading' ? (
							<Animated.View
								style={{
									transform: [
										{
											rotate: dropdownOpacity.interpolate({
												inputRange: [0, 1],
												outputRange: ['0deg', '360deg'],
											}),
										},
									],
								}}
							>
								<Ionicons name={getStateIcon()!} size={20} color={rightIconColor || getRightIconColor()} />
							</Animated.View>
						) : (
							<Ionicons name={getStateIcon()!} size={20} color={rightIconColor || getRightIconColor()} />
						)}
					</Pressable>
				)}
			</View>

			{/* Error Message */}
			{state === 'invalid' && errorMessage && (
				<View style={styles.messageContainer}>
					<Ionicons name="alert-circle" size={14} color={colors.error} />
					<Text variant="caption" color={colors.error} style={styles.messageText}>
						{errorMessage}
					</Text>
				</View>
			)}

			{/* Helper Text */}
			{state === 'default' && helperText && (
				<Text variant="caption" color={colors.text.secondary} style={styles.helperText}>
					{helperText}
				</Text>
			)}

			{/* Dropdown Options */}
			{showOptions && options.length > 0 && (
				<View
					style={[
						styles.dropdownWrapper,
						{
							top: dropdownPosition === 'below' ? 50 : undefined,
							marginTop: dropdownPosition === 'below' ? DROPDOWN_GAP : undefined,
							marginBottom: dropdownPosition === 'above' ? DROPDOWN_GAP : undefined,
							bottom: dropdownPosition === 'above' ? '100%' : undefined,
						},
					]}
				>
					<Animated.View
						style={[
							styles.dropdown,
							{
								maxHeight: maxDropdownHeight,
								opacity: dropdownOpacity,
								transform: [{ translateY: dropdownTranslateY }],
							},
						]}
					>
						<ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
							{options.map((item, index) => (
								<React.Fragment key={item.value || `option-${index}`}>
									{renderOption ? (
										<Pressable onPress={() => handleSelectOption(item)}>{renderOption(item)}</Pressable>
									) : (
										<Pressable
											style={({ pressed }) => [styles.optionItem, pressed && styles.optionItemPressed]}
											onPress={() => handleSelectOption(item)}
										>
											{item.icon && (
												<View style={styles.optionIconContainer}>
													<Ionicons name={item.icon} size={20} color={colors.primary.main} />
												</View>
											)}
											<View style={styles.optionTextContainer}>
												<Text weight="medium" style={styles.optionLabel}>
													{item.label}
												</Text>
												{item.description && (
													<Text variant="caption" color={colors.text.secondary} style={styles.optionDescription}>
														{item.description}
													</Text>
												)}
											</View>
											<Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
										</Pressable>
									)}
									{index < options.length - 1 && <View style={styles.separator} />}
								</React.Fragment>
							))}
						</ScrollView>
					</Animated.View>
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		marginBottom: spacing.md,
		zIndex: 1,
	},
	containerWithDropdown: {
		zIndex: 10000,
	},
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: colors.input,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 8,
		height: 48,
		paddingHorizontal: spacing.md,
	},
	inputContainerFocused: {
		borderWidth: 2,
	},
	leftIcon: {
		marginRight: spacing.sm,
	},
	input: {
		flex: 1,
		fontSize: typography.fontSize.base,
		fontFamily: typography.fontFamily.regular,
		color: colors.text.primary,
	},
	rightIconContainer: {
		padding: spacing.xs,
		marginLeft: spacing.xs,
	},
	messageContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: spacing.xs,
	},
	messageText: {
		marginLeft: spacing.xs,
	},
	helperText: {
		marginTop: spacing.xs,
	},
	dropdownWrapper: {
		position: 'absolute',
		left: 0,
		right: 0,
		zIndex: 9999,
	},
	dropdown: {
		backgroundColor: colors.card,
		borderRadius: 8,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.15,
		shadowRadius: 12,
		elevation: 8,
		...Platform.select({
			android: {
				borderWidth: 1,
				borderColor: colors.border,
			},
		}),
	},
	optionItem: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: spacing.md,
		minHeight: 56,
	},
	optionItemPressed: {
		backgroundColor: colors.background.paperPressed,
	},
	optionIconContainer: {
		width: 36,
		height: 36,
		borderRadius: 8,
		backgroundColor: colors.blue.light,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: spacing.md,
	},
	optionTextContainer: {
		flex: 1,
	},
	optionLabel: {
		fontSize: typography.fontSize.base,
		marginBottom: 2,
	},
	optionDescription: {
		fontSize: typography.fontSize.sm,
	},
	separator: {
		height: 1,
		backgroundColor: colors.border,
		marginHorizontal: spacing.md,
	},
});
