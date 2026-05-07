import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { BackHandler, ScrollView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppTopBar } from '@/components/layout/AppTopBar';
import { ThemedText } from '@/components/themed-text';
import { useAppSelector } from '@/store';
import { useSettingsTheme } from '@/theme/settingsTheme';

// ─── Data ────────────────────────────────────────────────────

const STATS = [
	{ value: '500+', label: 'Happy Clients' },
	{ value: '1K+', label: 'Events Done' },
	{ value: '50+', label: 'Vendors' },
	{ value: '98%', label: 'Satisfaction' },
];

const FEATURES = [
	{
		icon: 'calendar-outline' as const,
		title: 'Easy Booking',
		desc: 'Book verified vendors in just a few taps — anytime, anywhere.',
	},
	{
		icon: 'shield-checkmark-outline' as const,
		title: 'Verified Vendors',
		desc: 'Every vendor is background-checked and trusted by our team.',
	},
	{
		icon: 'pricetag-outline' as const,
		title: 'Transparent Pricing',
		desc: 'No hidden charges. What you see is exactly what you pay.',
	},
	{
		icon: 'headset-outline' as const,
		title: '24/7 Support',
		desc: 'Our support team is always available to help you out.',
	},
];

const CONTACT_ITEMS = [
	{ icon: 'call-outline' as const, label: 'Phone', value: '+91 98765 00000' },
	{ icon: 'mail-outline' as const, label: 'Email', value: 'goeventify@adrstechno.com' },
	{ icon: 'location-outline' as const, label: 'Location', value: 'Jabalpur, Madhya Pradesh, India' },
];

// ─── Component ───────────────────────────────────────────────

export default function AboutUsScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { isAuthenticated, isHydrated } = useAppSelector((state) => state.auth);
	const { mode, palette } = useSettingsTheme();
	const isDark = mode === 'dark';

	const goBack = useCallback(() => {
		router.replace('/(tabs)/profile');
	}, [router]);

	useEffect(() => {
		const sub = BackHandler.addEventListener('hardwareBackPress', () => {
			goBack();
			return true;
		});
		return () => sub.remove();
	}, [goBack]);

	if (isHydrated && !isAuthenticated) {
		return <Redirect href="/(auth)/login" />;
	}

	return (
		<SafeAreaView style={[styles.safe, { backgroundColor: palette.screenBg }]} edges={['top', 'bottom']}>
			<StatusBar style={isDark ? 'light' : 'dark'} />
			<AppTopBar title="About Us" onBackPress={goBack} />

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
			>
				{/* ── Hero Banner ─────────────────────────────── */}
				<View style={[styles.hero, { backgroundColor: palette.primary }]}>
					<View style={styles.heroLogoWrap}>
						<Ionicons name="sparkles" size={28} color="#FFFFFF" />
					</View>
					<ThemedText style={styles.heroName}>GoEventify</ThemedText>
					<ThemedText style={styles.heroTagline}>Creating Unforgettable Moments</ThemedText>
					<ThemedText style={styles.heroDesc}>
						Your one-stop platform for event management — from intimate gatherings to grand celebrations, handled with precision and care.
					</ThemedText>
				</View>

				{/* ── Stats Strip ─────────────────────────────── */}
				<View style={[styles.statsStrip, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
					{STATS.map((s, i) => (
						<View
							key={s.label}
							style={[
								styles.statCell,
								i < STATS.length - 1 && { borderRightWidth: 1, borderRightColor: palette.border },
							]}
						>
							<ThemedText style={[styles.statVal, { color: palette.primary }]}>{s.value}</ThemedText>
							<ThemedText style={[styles.statLbl, { color: palette.subtext }]}>{s.label}</ThemedText>
						</View>
					))}
				</View>

				{/* ── Our Story ───────────────────────────────── */}
				<View style={styles.section}>
					<SectionHeading icon="book-outline" title="Our Story" palette={palette} isDark={isDark} />
					<View style={[styles.card, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
						<ThemedText style={[styles.bodyText, { color: palette.text }]}>
							GoEventify was born from a simple belief — every event deserves to be extraordinary. We started as a small team of event enthusiasts and have grown into a trusted platform connecting clients with the best vendors across the country.
						</ThemedText>
						<View style={[styles.divider, { backgroundColor: palette.border }]} />
						<ThemedText style={[styles.bodyText, { color: palette.text }]}>
							Today, we power hundreds of events every year — weddings, corporate gatherings, concerts, and more — with the same passion and attention to detail we started with.
						</ThemedText>
					</View>
				</View>

				{/* ── Why Choose Us ───────────────────────────── */}
				<View style={styles.section}>
					<SectionHeading icon="star-outline" title="Why Choose Us" palette={palette} isDark={isDark} />
					<View style={[styles.card, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
						{FEATURES.map((f, i) => (
							<View key={f.title}>
								{i > 0 && <View style={[styles.divider, { backgroundColor: palette.border }]} />}
								<View style={styles.featureRow}>
									<View style={[styles.featureIcon, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
										<Ionicons name={f.icon} size={18} color={palette.primary} />
									</View>
									<View style={styles.featureText}>
										<ThemedText style={[styles.featureTitle, { color: palette.text }]}>{f.title}</ThemedText>
										<ThemedText style={[styles.featureDesc, { color: palette.subtext }]}>{f.desc}</ThemedText>
									</View>
								</View>
							</View>
						))}
					</View>
				</View>

				{/* ── Mission ─────────────────────────────────── */}
				<View style={styles.section}>
					<SectionHeading icon="rocket-outline" title="Our Mission" palette={palette} isDark={isDark} />
					<View style={[styles.missionCard, { backgroundColor: palette.primary }]}>
						<Ionicons name="chatbubble-ellipses-outline" size={28} color="rgba(255,255,255,0.3)" style={styles.quoteIcon} />
						<ThemedText style={styles.missionText}>
							To make event planning effortless, transparent, and memorable for every client — by connecting them with the right vendors at the right time.
						</ThemedText>
						<ThemedText style={styles.missionAttrib}>— GoEventify Team</ThemedText>
					</View>
				</View>

				{/* ── Contact ─────────────────────────────────── */}
				<View style={styles.section}>
					<SectionHeading icon="call-outline" title="Get In Touch" palette={palette} isDark={isDark} />
					<View style={[styles.card, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
						{CONTACT_ITEMS.map((c, i) => (
							<View key={c.label}>
								{i > 0 && <View style={[styles.divider, { backgroundColor: palette.border }]} />}
								<View style={styles.contactRow}>
									<View style={[styles.contactIconWrap, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
										<Ionicons name={c.icon} size={16} color={palette.primary} />
									</View>
									<View style={styles.contactText}>
										<ThemedText style={[styles.contactLabel, { color: palette.subtext }]}>{c.label}</ThemedText>
										<ThemedText style={[styles.contactValue, { color: palette.text }]}>{c.value}</ThemedText>
									</View>
								</View>
							</View>
						))}
					</View>
				</View>

				{/* ── Footer ──────────────────────────────────── */}
				<ThemedText style={[styles.footer, { color: palette.subtext }]}>
					Version 1.0.0 · © 2025 GoEventify. All rights reserved.
				</ThemedText>
			</ScrollView>
		</SafeAreaView>
	);
}

// ─── Section Heading ─────────────────────────────────────────

function SectionHeading({
	icon,
	title,
	palette,
	isDark,
}: {
	icon: React.ComponentProps<typeof Ionicons>['name'];
	title: string;
	palette: any;
	isDark: boolean;
}) {
	return (
		<View style={styles.sectionHead}>
			<View style={[styles.sectionIconWrap, { backgroundColor: isDark ? '#1E293B' : '#EEF2FF' }]}>
				<Ionicons name={icon} size={16} color={palette.primary} />
			</View>
			<ThemedText style={[styles.sectionTitle, { color: palette.text }]}>{title}</ThemedText>
		</View>
	);
}

// ─── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
	safe: { flex: 1 },
	scroll: {
		paddingHorizontal: 16,
		paddingTop: 16,
		gap: 20,
	},

	// Hero
	hero: {
		borderRadius: 18,
		padding: 24,
		alignItems: 'center',
		gap: 8,
	},
	heroLogoWrap: {
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: 'rgba(255,255,255,0.18)',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 4,
	},
	heroName: {
		fontSize: 28,
		fontWeight: '900',
		color: '#FFFFFF',
		letterSpacing: 0.4,
	},
	heroTagline: {
		fontSize: 14,
		fontWeight: '600',
		color: 'rgba(255,255,255,0.82)',
	},
	heroDesc: {
		fontSize: 13,
		color: 'rgba(255,255,255,0.7)',
		textAlign: 'center',
		lineHeight: 20,
		marginTop: 4,
		paddingHorizontal: 8,
	},

	// Stats
	statsStrip: {
		flexDirection: 'row',
		borderRadius: 14,
		borderWidth: 1,
		overflow: 'hidden',
	},
	statCell: {
		flex: 1,
		alignItems: 'center',
		paddingVertical: 14,
		gap: 2,
	},
	statVal: {
		fontSize: 18,
		fontWeight: '800',
	},
	statLbl: {
		fontSize: 11,
		fontWeight: '500',
	},

	// Section heading
	section: {
		gap: 10,
	},
	sectionHead: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	sectionIconWrap: {
		width: 30,
		height: 30,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: '800',
	},

	// Card
	card: {
		borderRadius: 14,
		borderWidth: 1,
		overflow: 'hidden',
		paddingVertical: 4,
	},
	divider: {
		height: 1,
		marginHorizontal: 14,
	},
	bodyText: {
		fontSize: 14,
		lineHeight: 22,
		paddingHorizontal: 14,
		paddingVertical: 12,
	},

	// Feature rows
	featureRow: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 12,
		paddingHorizontal: 14,
		paddingVertical: 12,
	},
	featureIcon: {
		width: 36,
		height: 36,
		borderRadius: 9,
		alignItems: 'center',
		justifyContent: 'center',
		flexShrink: 0,
		marginTop: 1,
	},
	featureText: {
		flex: 1,
		gap: 3,
	},
	featureTitle: {
		fontSize: 14,
		fontWeight: '700',
	},
	featureDesc: {
		fontSize: 13,
		lineHeight: 19,
	},

	// Mission card
	missionCard: {
		borderRadius: 14,
		padding: 20,
		gap: 10,
	},
	quoteIcon: {
		alignSelf: 'flex-start',
	},
	missionText: {
		fontSize: 15,
		fontWeight: '600',
		color: '#FFFFFF',
		lineHeight: 24,
		fontStyle: 'italic',
	},
	missionAttrib: {
		fontSize: 13,
		color: 'rgba(255,255,255,0.7)',
		fontWeight: '600',
		alignSelf: 'flex-end',
	},

	// Contact rows
	contactRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		paddingHorizontal: 14,
		paddingVertical: 12,
	},
	contactIconWrap: {
		width: 34,
		height: 34,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
		flexShrink: 0,
	},
	contactText: {
		flex: 1,
		gap: 2,
	},
	contactLabel: {
		fontSize: 11,
		fontWeight: '600',
		textTransform: 'uppercase',
		letterSpacing: 0.5,
	},
	contactValue: {
		fontSize: 14,
		fontWeight: '500',
	},

	// Footer
	footer: {
		fontSize: 11,
		textAlign: 'center',
		paddingBottom: 4,
	},
});
