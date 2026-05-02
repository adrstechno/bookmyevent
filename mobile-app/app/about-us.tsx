import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { BackHandler, ScrollView, StyleSheet, View, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppTopBar } from '@/components/layout/AppTopBar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppSelector } from '@/store';
import { useSettingsTheme } from '@/theme/settingsTheme';

const { width } = Dimensions.get('window');

const STATS = [
	{ icon: 'people-outline', value: '500+', label: 'Happy Clients', color: '#3B82F6' },
	{ icon: 'trophy-outline', value: '1000+', label: 'Events Completed', color: '#A855F7' },
	{ icon: 'trending-up-outline', value: '15+', label: 'Years Experience', color: '#10B981' },
	{ icon: 'heart-outline', value: '98%', label: 'Satisfaction Rate', color: '#EF4444' },
];

const VALUES = [
	{
		icon: 'flag-outline',
		title: 'Excellence',
		description: 'We strive for perfection in every event we manage, ensuring exceptional quality.',
		color: '#3B82F6',
	},
	{
		icon: 'flash-outline',
		title: 'Innovation',
		description: 'Bringing creative and modern solutions to make your events unique and memorable.',
		color: '#A855F7',
	},
	{
		icon: 'heart-outline',
		title: 'Passion',
		description: 'Our team is passionate about creating unforgettable experiences that exceed expectations.',
		color: '#EF4444',
	},
	{
		icon: 'people-outline',
		title: 'Collaboration',
		description: 'Working closely with clients and vendors to ensure seamless event execution.',
		color: '#10B981',
	},
];

const FEATURES = [
	{
		icon: 'calendar-outline',
		title: 'Easy Booking',
		description: 'Book your favorite vendors with just a few taps',
	},
	{
		icon: 'shield-checkmark-outline',
		title: 'Verified Vendors',
		description: 'All vendors are verified and trusted professionals',
	},
	{
		icon: 'pricetag-outline',
		title: 'Transparent Pricing',
		description: 'No hidden charges, clear pricing for all services',
	},
	{
		icon: 'chatbubbles-outline',
		title: '24/7 Support',
		description: 'Round-the-clock customer support for your queries',
	},
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
				{/* Hero Section */}
				<ThemedView style={[styles.heroCard, { backgroundColor: '#3C6E71' }]}>
					<View style={styles.heroContent}>
						<Ionicons name="sparkles" size={40} color="#F9A826" />
						<ThemedText style={styles.heroTitle}>GoEventify</ThemedText>
						<ThemedText style={styles.heroSubtitle}>Creating Unforgettable Moments</ThemedText>
						<ThemedText style={styles.heroText}>
							Your one-stop destination for event management. From intimate gatherings to grand celebrations, we handle every detail with precision and care.
						</ThemedText>
					</View>
				</ThemedView>

				{/* Our Story Section */}
				<ThemedView style={[styles.sectionCard, { backgroundColor: surfaceBg, borderColor: border }]}>
					<View style={styles.sectionHeader}>
						<Ionicons name="book-outline" size={24} color="#3C6E71" />
						<ThemedText style={[styles.sectionTitle, { color: palette.text }]}>Our Story</ThemedText>
					</View>
					<ThemedText style={[styles.storyText, { color: palette.text }]}>
						We started with a simple vision: to transform ordinary events into extraordinary experiences. Over the years, we've grown into a leading event management platform, trusted by hundreds of clients across the country.
					</ThemedText>
					<ThemedText style={[styles.storyText, { color: palette.text }]}>
						Our team of passionate professionals brings creativity, expertise, and dedication to every project. From weddings to corporate events, we make your dreams come true.
					</ThemedText>
				</ThemedView>

				{/* Stats Section */}
				<ThemedView style={[styles.statsContainer, { backgroundColor: surfaceBg, borderColor: border }]}>
					<ThemedText style={[styles.statsHeader, { color: palette.text }]}>Our Achievements</ThemedText>
					<View style={styles.statsGrid}>
						{STATS.map((stat, index) => (
							<View
								key={index}
								style={[styles.statCard, { backgroundColor: stat.color }]}
							>
								<Ionicons name={stat.icon as any} size={32} color="#FFFFFF" />
								<ThemedText style={styles.statValue}>{stat.value}</ThemedText>
								<ThemedText style={styles.statLabel}>{stat.label}</ThemedText>
							</View>
						))}
					</View>
				</ThemedView>

				{/* Features Section */}
				<ThemedView style={[styles.sectionCard, { backgroundColor: surfaceBg, borderColor: border }]}>
					<View style={styles.sectionHeader}>
						<Ionicons name="star-outline" size={24} color="#F9A826" />
						<ThemedText style={[styles.sectionTitle, { color: palette.text }]}>Why Choose Us</ThemedText>
					</View>
					<View style={styles.featuresGrid}>
						{FEATURES.map((feature, index) => (
							<View key={index} style={[styles.featureCard, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}>
								<View style={[styles.featureIconContainer, { backgroundColor: isDark ? '#334155' : '#FFFFFF' }]}>
									<Ionicons name={feature.icon as any} size={24} color="#3C6E71" />
								</View>
								<ThemedText style={[styles.featureTitle, { color: palette.text }]}>{feature.title}</ThemedText>
								<ThemedText style={[styles.featureDescription, { color: palette.subtext }]}>
									{feature.description}
								</ThemedText>
							</View>
						))}
					</View>
				</ThemedView>

				{/* Our Values Section */}
				<ThemedView style={[styles.sectionCard, { backgroundColor: surfaceBg, borderColor: border }]}>
					<View style={styles.sectionHeader}>
						<Ionicons name="diamond-outline" size={24} color="#3C6E71" />
						<ThemedText style={[styles.sectionTitle, { color: palette.text }]}>Our Core Values</ThemedText>
					</View>
					<ThemedText style={[styles.sectionSubtitle, { color: palette.subtext }]}>
						Our core values guide everything we do, ensuring exceptional service and memorable experiences
					</ThemedText>
					<View style={styles.valuesContainer}>
						{VALUES.map((value, index) => (
							<View key={index} style={[styles.valueCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: border }]}>
								<View
									style={[styles.valueIconContainer, { backgroundColor: value.color }]}
								>
									<Ionicons name={value.icon as any} size={24} color="#FFFFFF" />
								</View>
								<ThemedText style={[styles.valueTitle, { color: palette.text }]}>{value.title}</ThemedText>
								<ThemedText style={[styles.valueDescription, { color: palette.subtext }]}>
									{value.description}
								</ThemedText>
							</View>
						))}
					</View>
				</ThemedView>

				{/* Contact Section */}
				<ThemedView style={[styles.contactCard, { backgroundColor: '#F9A826' }]}>
					<Ionicons name="mail-outline" size={40} color="#FFFFFF" />
					<ThemedText style={styles.contactTitle}>Get In Touch</ThemedText>
					<ThemedText style={styles.contactText}>
						Have questions? We're here to help you plan your perfect event!
					</ThemedText>
					<View style={styles.contactInfo}>
						<View style={styles.contactRow}>
							<Ionicons name="call-outline" size={20} color="#FFFFFF" />
							<ThemedText style={styles.contactDetail}>+91 9876500000</ThemedText>
						</View>
						<View style={styles.contactRow}>
							<Ionicons name="mail-outline" size={20} color="#FFFFFF" />
							<ThemedText style={styles.contactDetail}>support@goeventify.com</ThemedText>
						</View>
						<View style={styles.contactRow}>
							<Ionicons name="location-outline" size={20} color="#FFFFFF" />
							<ThemedText style={styles.contactDetail}>Jabalpur, Madhya Pradesh</ThemedText>
						</View>
					</View>
				</ThemedView>

				{/* Footer Note */}
				<ThemedView style={[styles.footerCard, { backgroundColor: surfaceBg, borderColor: border }]}>
					<Ionicons name="heart" size={20} color="#EF4444" />
					<ThemedText style={[styles.footerText, { color: palette.subtext }]}>
						Made with love for creating memorable events
					</ThemedText>
					<ThemedText style={[styles.footerVersion, { color: palette.subtext }]}>
						Version 1.0.0 • © 2025 GoEventify
					</ThemedText>
				</ThemedView>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	page: {
		flex: 1,
	},
	container: {
		padding: 14,
		gap: 14,
	},
	// Hero Section
	heroCard: {
		borderRadius: 14,
		padding: 16,
		overflow: 'hidden',
	},
	heroContent: {
		alignItems: 'center',
		gap: 8,
	},
	heroTitle: {
		fontSize: 24,
		fontWeight: '900',
		color: '#FFFFFF',
		textAlign: 'center',
	},
	heroSubtitle: {
		fontSize: 13,
		fontWeight: '600',
		color: '#F9A826',
		textAlign: 'center',
	},
	heroText: {
		fontSize: 12,
		lineHeight: 18,
		color: '#E2E8F0',
		textAlign: 'center',
		marginTop: 2,
	},
	// Section Card
	sectionCard: {
		borderRadius: 12,
		padding: 14,
		borderWidth: 1,
		gap: 10,
	},
	sectionHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: '800',
	},
	sectionSubtitle: {
		fontSize: 12,
		lineHeight: 16,
		marginTop: -2,
	},
	// Story Section
	storyText: {
		fontSize: 12,
		lineHeight: 18,
	},
	// Stats Section
	statsContainer: {
		borderRadius: 12,
		padding: 14,
		borderWidth: 1,
		gap: 10,
	},
	statsHeader: {
		fontSize: 16,
		fontWeight: '800',
		textAlign: 'center',
		marginBottom: 2,
	},
	statsGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
		justifyContent: 'space-between',
	},
	statCard: {
		width: (width - 44) / 2,
		borderRadius: 12,
		padding: 14,
		alignItems: 'center',
		gap: 4,
	},
	statValue: {
		fontSize: 20,
		fontWeight: '900',
		color: '#FFFFFF',
	},
	statLabel: {
		fontSize: 10,
		fontWeight: '600',
		color: '#FFFFFF',
		textAlign: 'center',
	},
	// Features Section
	featuresGrid: {
		gap: 8,
	},
	featureCard: {
		borderRadius: 10,
		padding: 12,
		gap: 6,
	},
	featureIconContainer: {
		width: 40,
		height: 40,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	featureTitle: {
		fontSize: 14,
		fontWeight: '700',
	},
	featureDescription: {
		fontSize: 11,
		lineHeight: 16,
	},
	// Values Section
	valuesContainer: {
		gap: 8,
	},
	valueCard: {
		borderRadius: 12,
		padding: 12,
		borderWidth: 1,
		gap: 8,
	},
	valueIconContainer: {
		width: 40,
		height: 40,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	valueTitle: {
		fontSize: 14,
		fontWeight: '700',
	},
	valueDescription: {
		fontSize: 11,
		lineHeight: 16,
	},
	// Contact Section
	contactCard: {
		borderRadius: 14,
		padding: 16,
		alignItems: 'center',
		gap: 8,
	},
	contactTitle: {
		fontSize: 20,
		fontWeight: '800',
		color: '#FFFFFF',
		textAlign: 'center',
	},
	contactText: {
		fontSize: 12,
		lineHeight: 16,
		color: '#FFFFFF',
		textAlign: 'center',
		opacity: 0.95,
	},
	contactInfo: {
		marginTop: 6,
		gap: 8,
		width: '100%',
	},
	contactRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
		padding: 10,
		borderRadius: 8,
	},
	contactDetail: {
		fontSize: 12,
		fontWeight: '600',
		color: '#FFFFFF',
		flex: 1,
	},
	// Footer
	footerCard: {
		borderRadius: 12,
		padding: 14,
		borderWidth: 1,
		alignItems: 'center',
		gap: 4,
	},
	footerText: {
		fontSize: 11,
		textAlign: 'center',
	},
	footerVersion: {
		fontSize: 9,
		textAlign: 'center',
		marginTop: 2,
	},
});
