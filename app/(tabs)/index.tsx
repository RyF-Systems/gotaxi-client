import { Text } from '@/components/common/Text';
import { useAuthStore } from '@/store/authStore';
import { colors, spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
	const user = useAuthStore(state => state.user);
	const router = useRouter();

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.container}>
				<ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
					{/* Header */}
					<View style={styles.header}>
						<View>
							<Text variant="caption" color={colors.text.secondary}>
								Bienvenido de nuevo
							</Text>
							<Text variant="h2" weight="bold">
								{user?.name || 'Usuario'}
							</Text>
						</View>
						<View style={styles.iconContainer}>
							<Ionicons name="person-circle" size={48} color={colors.primary.main} />
						</View>
					</View>

					{/* Quick Actions */}
					<View style={styles.section}>
						<Text variant="h3" weight="semiBold" style={styles.sectionTitle}>
							Acciones rápidas
						</Text>
						<View style={styles.quickActions}>
							<Pressable onPress={() => router.push('/booking/new')} style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}>
								<View style={styles.actionIcon}>
									<Ionicons name="car" size={32} color={colors.blue.main} />
								</View>
								<Text weight="semiBold" style={styles.actionTitle}>
									Solicitar viaje
								</Text>
								<Text variant="caption" color={colors.text.secondary} style={styles.actionDescription}>
									Encuentra un conductor cerca
								</Text>
							</Pressable>

							<View style={styles.actionCard}>
								<View style={styles.actionIcon}>
									<Ionicons name="time" size={32} color={colors.success} />
								</View>
								<Text weight="semiBold" style={styles.actionTitle}>
									Mis viajes
								</Text>
								<Text variant="caption" color={colors.text.secondary} style={styles.actionDescription}>
									Historial de viajes
								</Text>
							</View>
						</View>
					</View>

					{/* Recent Activity */}
					<View style={styles.section}>
						<Text variant="h3" weight="semiBold" style={styles.sectionTitle}>
							Actividad reciente
						</Text>
						<View style={styles.emptyState}>
							<Ionicons name="document-text-outline" size={64} color={colors.text.disabled} />
							<Text color={colors.text.secondary} style={styles.emptyText}>
								No hay viajes recientes
							</Text>
						</View>
					</View>
				</ScrollView>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: colors.background.default,
	},
	container: {
		flex: 1,
	},
	content: {
		padding: spacing.lg,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: spacing['2xl'],
	},
	iconContainer: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: colors.blue.light,
		alignItems: 'center',
		justifyContent: 'center',
	},
	section: {
		marginBottom: spacing['2xl'],
	},
	sectionTitle: {
		marginBottom: spacing.md,
	},
	quickActions: {
		flexDirection: 'row',
		gap: spacing.md,
	},
	actionCard: {
		flex: 1,
		backgroundColor: colors.background.paper,
		padding: spacing.lg,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors.border,
	},
	actionCardPressed: {
		backgroundColor: colors.background.paperPressed,
	},
	actionIcon: {
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: colors.blue.light,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: spacing.md,
	},
	actionTitle: {
		marginBottom: spacing.xs,
	},
	actionDescription: {
		lineHeight: 18,
	},
	emptyState: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: spacing['2xl'],
	},
	emptyText: {
		marginTop: spacing.md,
	},
});
