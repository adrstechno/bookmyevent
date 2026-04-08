import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { BackHandler, ScrollView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppTopBar } from '@/components/layout/AppTopBar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppSelector } from '@/store';
import { useSettingsTheme } from '@/theme/settingsTheme';

const HIGHLIGHTS = [
	'Complete event planning and booking support',
	'Trusted vendors and transparent pricing',
	'Fast customer support for booking issues',
];

export default function AboutUsScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { isAuthenticated, isHydrated } = useAppSelector((state) => state.auth);
	const { mode, palette } = useSettingsTheme();
	const isDark = mode === 'dark';
	const screenBg = palette.screenBg;
	const surfaceBg = palette.surfaceBg;
	const border = palette.border;

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
		<SafeAreaView style={[styles.safeArea, { backgroundColor: screenBg }]} edges={['top', 'bottom']}>
			<StatusBar style={isDark ? 'light' : 'dark'} />
			<AppTopBar title="About Us" onBackPress={goToProfile} />

			<ScrollView
				style={styles.page}
				contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 20 }]}
				showsVerticalScrollIndicator={false}
			>
				<ThemedView style={[styles.heroCard, { backgroundColor: surfaceBg, borderColor: border }]}>
					<ThemedText style={[styles.heroTitle, { color: palette.text }]}>GoEventify</ThemedText>
					<ThemedText style={[styles.heroText, { color: palette.subtext }]}>
						We help users discover, plan, and book memorable events with reliable services and smooth experience.
					</ThemedText>
				</ThemedView>

				<ThemedView style={[styles.sectionCard, { backgroundColor: surfaceBg, borderColor: border }]}>
					<ThemedText style={[styles.sectionTitle, { color: palette.text }]}>What We Do</ThemedText>
					{HIGHLIGHTS.map((item) => (
						<View key={item} style={styles.pointRow}>
							<Ionicons name="checkmark-circle-outline" size={18} color={palette.tint} />
							<ThemedText style={[styles.pointText, { color: palette.text }]}>{item}</ThemedText>
						</View>
					))}
				</ThemedView>

				<ThemedView style={[styles.sectionCard, { backgroundColor: surfaceBg, borderColor: border }]}>
					<ThemedText style={[styles.sectionTitle, { color: palette.text }]}>Contact</ThemedText>
					<ThemedText style={[styles.contactText, { color: palette.text }]}>Phone: +91 98765 00000</ThemedText>
					<ThemedText style={[styles.contactText, { color: palette.text }]}>Email: support@goeventify.demo</ThemedText>
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
	heroCard: {
		borderRadius: 14,
		padding: 14,
		backgroundColor: '#FFFFFF',
		borderWidth: 1,
		borderColor: '#E2E8F0',
		gap: 6,
	},
	heroTitle: {
		fontSize: 24,
		fontWeight: '800',
		color: '#0F172A',
	},
	heroText: {
		fontSize: 13,
		lineHeight: 20,
		color: '#475569',
	},
	sectionCard: {
		borderRadius: 14,
		padding: 12,
		backgroundColor: '#FFFFFF',
		borderWidth: 1,
		borderColor: '#E2E8F0',
		gap: 8,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: '800',
		color: '#0F172A',
	},
	pointRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	pointText: {
		fontSize: 13,
		color: '#334155',
		fontWeight: '600',
		flex: 1,
	},
	contactText: {
		fontSize: 13,
		fontWeight: '600',
		color: '#334155',
	},
});
