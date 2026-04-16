import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { BackHandler, Modal, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppTopBar } from '@/components/layout/AppTopBar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppSelector } from '@/store';
import { useSettingsTheme, type SettingsThemeMode } from '@/theme/settingsTheme';

const PREFERENCE_ITEMS = [
	{ key: 'language', label: 'Language', value: 'English' },
	{ key: 'currency', label: 'Currency', value: 'INR (₹)' },
	{ key: 'privacy', label: 'Privacy Policy', value: 'View' },
	{ key: 'terms', label: 'Terms and Conditions', value: 'View' },
];

const THEME_OPTIONS: { key: SettingsThemeMode; label: string }[] = [
	{ key: 'light', label: 'Light' },
	{ key: 'dark', label: 'Dark' },
];

export default function SettingsScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { isAuthenticated, isHydrated } = useAppSelector((state) => state.auth);
	const { mode, palette, setMode } = useSettingsTheme();
	const isDark = mode === 'dark';

	const [pushNotifications, setPushNotifications] = useState(true);
	const [emailNotifications, setEmailNotifications] = useState(true);
	const [biometricLogin, setBiometricLogin] = useState(false);
	const [marketingUpdates, setMarketingUpdates] = useState(false);
	const [showComingSoon, setShowComingSoon] = useState(false);

	const goToProfile = useCallback(() => {
		router.replace('/(tabs)/profile');
	}, [router]);

	useEffect(() => {
		const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
			goToProfile();
			return true;
		});

		return () => subscription.remove();
	}, [goToProfile]);

	if (isHydrated && !isAuthenticated) {
		return <Redirect href="/(auth)/login" />;
	}

	return (
		<SafeAreaView style={[styles.safeArea, { backgroundColor: palette.screenBg }]} edges={['top', 'bottom']}>
			<StatusBar style={isDark ? 'light' : 'dark'} />
			<AppTopBar title="Settings" onBackPress={goToProfile} />

			{/* Coming Soon Modal */}
			<Modal transparent animationType="fade" visible={showComingSoon} onRequestClose={() => setShowComingSoon(false)}>
				<Pressable style={styles.modalOverlay} onPress={() => setShowComingSoon(false)}>
					<View style={[styles.modalBox, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
						<ThemedText style={[styles.modalEmoji]}>🚀</ThemedText>
						<ThemedText style={[styles.modalTitle, { color: palette.text }]}>Coming Soon</ThemedText>
						<ThemedText style={[styles.modalSubtitle, { color: palette.subtext }]}>
							This feature is under development and will be available soon.
						</ThemedText>
						<Pressable style={[styles.modalBtn, { backgroundColor: palette.primary }]} onPress={() => setShowComingSoon(false)}>
							<ThemedText style={[styles.modalBtnText, { color: palette.onPrimary }]}>Got it</ThemedText>
						</Pressable>
					</View>
				</Pressable>
			</Modal>

			<ScrollView
				style={[styles.page, { backgroundColor: palette.screenBg }]}
				contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 20 }]}
				showsVerticalScrollIndicator={false}
			>
				<ThemedView style={[styles.card, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
					<ThemedText style={[styles.cardTitle, { color: palette.text }]}>Theme</ThemedText>
					<View style={styles.themeRow}>
						{THEME_OPTIONS.map((option) => {
							const active = mode === option.key;
							return (
								<Pressable
									key={option.key}
									style={[
										styles.themeChip,
										{ borderColor: active ? palette.tint : palette.border, backgroundColor: active ? palette.pressedBg : palette.surfaceBg },
									]}
									onPress={() => setMode(option.key)}
								>
									<ThemedText style={[styles.themeChipText, { color: active ? palette.tint : palette.text }]}>{option.label}</ThemedText>
								</Pressable>
							);
						})}
					</View>
				</ThemedView>

				<ThemedView style={[styles.card, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
					<ThemedText style={[styles.cardTitle, { color: palette.text }]}>Notifications</ThemedText>
					<Pressable style={({ pressed }) => [styles.switchRow, pressed ? [styles.rowPressed, { backgroundColor: palette.pressedBg }] : null]} onPress={() => setShowComingSoon(true)}>
						<ThemedText style={[styles.switchLabel, { color: palette.text }]}>Push Notifications</ThemedText>
						<Switch value={pushNotifications} onValueChange={() => setShowComingSoon(true)} trackColor={{ false: palette.switchOff, true: palette.switchOn }} thumbColor="#FFFFFF" />
					</Pressable>
					<Pressable style={({ pressed }) => [styles.switchRow, [styles.switchDivider, { borderTopColor: palette.border }], pressed ? [styles.rowPressed, { backgroundColor: palette.pressedBg }] : null]} onPress={() => setShowComingSoon(true)}>
						<ThemedText style={[styles.switchLabel, { color: palette.text }]}>Email Notifications</ThemedText>
						<Switch value={emailNotifications} onValueChange={() => setShowComingSoon(true)} trackColor={{ false: palette.switchOff, true: palette.switchOn }} thumbColor="#FFFFFF" />
					</Pressable>
					<Pressable style={({ pressed }) => [styles.switchRow, [styles.switchDivider, { borderTopColor: palette.border }], pressed ? [styles.rowPressed, { backgroundColor: palette.pressedBg }] : null]} onPress={() => setShowComingSoon(true)}>
						<ThemedText style={[styles.switchLabel, { color: palette.text }]}>Marketing Updates</ThemedText>
						<Switch value={marketingUpdates} onValueChange={() => setShowComingSoon(true)} trackColor={{ false: palette.switchOff, true: palette.switchOn }} thumbColor="#FFFFFF" />
					</Pressable>
				</ThemedView>

				<ThemedView style={[styles.card, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
					<ThemedText style={[styles.cardTitle, { color: palette.text }]}>Security</ThemedText>
					<Pressable style={({ pressed }) => [styles.switchRow, pressed ? [styles.rowPressed, { backgroundColor: palette.pressedBg }] : null]} onPress={() => setShowComingSoon(true)}>
						<ThemedText style={[styles.switchLabel, { color: palette.text }]}>Biometric Login</ThemedText>
						<Switch value={biometricLogin} onValueChange={() => setShowComingSoon(true)} trackColor={{ false: palette.switchOff, true: palette.switchOn }} thumbColor="#FFFFFF" />
					</Pressable>
				</ThemedView>

				<ThemedView style={[styles.card, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
					<ThemedText style={[styles.cardTitle, { color: palette.text }]}>Preferences</ThemedText>
					{PREFERENCE_ITEMS.map((item, index) => (
						<Pressable key={item.key} onPress={() => setShowComingSoon(true)} style={({ pressed }) => [styles.optionRow, index !== PREFERENCE_ITEMS.length - 1 ? [styles.optionDivider, { borderBottomColor: palette.border }] : null, pressed ? [styles.rowPressed, { backgroundColor: palette.pressedBg }] : null]}>
							<ThemedText style={[styles.optionLabel, { color: palette.text }]}>{item.label}</ThemedText>
							<View style={styles.optionRight}>
								<ThemedText style={[styles.optionValue, { color: palette.subtext }]}>{item.value}</ThemedText>
								<Ionicons name="chevron-forward" size={16} color={palette.subtext} />
							</View>
						</Pressable>
					))}
				</ThemedView>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#F4F7F9',
	},
	page: {
		flex: 1,
	},
	container: {
		padding: 16,
		gap: 10,
	},
	card: {
		borderRadius: 14,
		padding: 12,
		backgroundColor: '#FFFFFF',
		borderWidth: 1,
		borderColor: '#E2E8F0',
		gap: 8,
	},
	themeRow: {
		flexDirection: 'row',
		gap: 8,
	},
	themeChip: {
		flex: 1,
		height: 40,
		borderRadius: 10,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	themeChipText: {
		fontSize: 13,
		fontWeight: '700',
	},
	themeHint: {
		fontSize: 12,
		fontWeight: '600',
		marginTop: 2,
	},
	cardTitle: {
		fontSize: 16,
		fontWeight: '800',
		color: '#0F172A',
	},
	switchRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 10,
		paddingHorizontal: 8,
		borderRadius: 10,
	},
	switchDivider: {
		borderTopWidth: 1,
		borderTopColor: '#EEF2F7',
	},
	rowPressed: {
		backgroundColor: '#F1F5F9',
	},
	switchLabel: {
		fontSize: 14,
		fontWeight: '600',
		color: '#1F2937',
	},
	optionRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 10,
		paddingHorizontal: 8,
		borderRadius: 10,
	},
	optionDivider: {
		borderBottomWidth: 1,
		borderBottomColor: '#EEF2F7',
	},
	optionLabel: {
		fontSize: 14,
		fontWeight: '600',
		color: '#1F2937',
	},
	optionRight: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	optionValue: {
		fontSize: 13,
		color: '#64748B',
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.45)',
		alignItems: 'center',
		justifyContent: 'center',
		padding: 32,
	},
	modalBox: {
		width: '100%',
		borderRadius: 20,
		borderWidth: 1,
		padding: 28,
		alignItems: 'center',
		gap: 10,
	},
	modalEmoji: {
		fontSize: 42,
		marginBottom: 4,
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: '800',
		textAlign: 'center',
	},
	modalSubtitle: {
		fontSize: 14,
		textAlign: 'center',
		lineHeight: 22,
	},
	modalBtn: {
		marginTop: 8,
		paddingVertical: 12,
		paddingHorizontal: 36,
		borderRadius: 12,
	},
	modalBtnText: {
		fontSize: 15,
		fontWeight: '700',
	},
});