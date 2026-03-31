import { ImageBackground, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const EVENT_CARDS = [
	{
		title: 'Wedding Event',
		description: 'Premium decor, catering, lights, and complete ceremony planning support.',
		image: require('@/assets/images/home/wedding.jpg'),
	},
	{
		title: 'Birthday Party Event',
		description: 'Theme setups, cake table design, entertainers, and custom party plans.',
		image: require('@/assets/images/home/birthday.jpg'),
	},
	{
		title: 'Kitty Party Event',
		description: 'Stylish venue layouts, games, snacks, and end-to-end event handling.',
		image: require('@/assets/images/home/kitty.jpg'),
	},
	{
		title: 'Bhagwat Katha Event',
		description: 'Spiritual stage setup, sound systems, seating plans, and hospitality teams.',
		image: require('@/assets/images/home/bhagwat.jpg'),
	},
	{
		title: 'Office Seminar & Conference',
		description: 'Conference halls, AV setup, registration desks, and support staff management.',
		image: require('@/assets/images/home/seminar.jpg'),
	},
];

export default function HomeTabScreen() {
	const tabBarHeight = useBottomTabBarHeight();

	return (
		<SafeAreaView style={styles.safeArea} edges={['top']}>
			<StatusBar style="dark" />
			<ScrollView
				style={styles.page}
				contentContainerStyle={[styles.container, { paddingBottom: tabBarHeight + 16 }]}
			>
				<View style={styles.topBar}>
					<View style={styles.brandWrap}>
						<Image source={require('@/assets/images/home/logo2.png')} style={styles.logo} contentFit="contain" />
						<View>
							<ThemedText style={styles.brandTitle}>GoEventify</ThemedText>
							<ThemedText style={styles.brandSubtitle}>Event Booking Platform</ThemedText>
						</View>
					</View>

					<View style={styles.topBarActions}>
						<Pressable style={styles.iconBtn}>
							<Ionicons name="search-outline" size={20} color="#0F172A" />
						</Pressable>
						<Pressable style={styles.iconBtn}>
							<Ionicons name="notifications-outline" size={20} color="#0F172A" />
						</Pressable>
					</View>
				</View>

			<ImageBackground
				source={require('@/assets/images/home/hero.jpg')}
				imageStyle={styles.heroImageStyle}
				style={styles.heroWrapper}
			>
				<View style={styles.heroOverlay}>
					<ThemedText style={styles.heroTag}>EVENT MANAGEMENT PLATFORM</ThemedText>
					<ThemedText type="title" style={styles.heroTitle}>
						Create Events People Remember
					</ThemedText>
					<ThemedText style={styles.heroSubtitle}>
						From weddings to corporate shows, plan, organize, and manage everything from one app.
					</ThemedText>
					<View style={styles.heroActionRow}>
						<Pressable style={[styles.actionButton, styles.actionPrimary]}>
							<ThemedText style={styles.actionPrimaryText}>Explore Services</ThemedText>
						</Pressable>
						<Pressable style={[styles.actionButton, styles.actionSecondary]}>
							<ThemedText style={styles.actionSecondaryText}>Contact Team</ThemedText>
						</Pressable>
					</View>
				</View>
			</ImageBackground>

			<View style={styles.statRow}>
				<ThemedView style={styles.statCard}>
					<ThemedText style={styles.statValue}>50+</ThemedText>
					<ThemedText style={styles.statLabel}>Event Types</ThemedText>
				</ThemedView>
				<ThemedView style={styles.statCard}>
					<ThemedText style={styles.statValue}>1000+</ThemedText>
					<ThemedText style={styles.statLabel}>Vendors</ThemedText>
				</ThemedView>
				<ThemedView style={styles.statCard}>
					<ThemedText style={styles.statValue}>24x7</ThemedText>
					<ThemedText style={styles.statLabel}>Support</ThemedText>
				</ThemedView>
			</View>

			<ThemedText type="subtitle" style={styles.sectionTitle}>
				Popular Categories
			</ThemedText>

			<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsRow}>
				{EVENT_CARDS.map((item) => (
					<ThemedView key={item.title} style={styles.cardContainer}>
						<ImageBackground
							source={item.image}
							imageStyle={styles.cardImageStyle}
							style={styles.cardImage}
						/>
						<View style={styles.cardContent}>
							<ThemedText type="defaultSemiBold" style={styles.cardTitle}>
								{item.title}
							</ThemedText>
							<View style={styles.orangeLine} />
							<ThemedText style={styles.cardDesc}>{item.description}</ThemedText>
							<Pressable style={styles.cardCtaBtn}>
								<ThemedText style={styles.cardCtaText}>Explore Services</ThemedText>
							</Pressable>
						</View>
					</ThemedView>
				))}
			</ScrollView>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#FFFFFF',
	},
	page: {
		flex: 1,
	},
	container: {
		paddingHorizontal: 16,
		paddingTop: 16,
		gap: 14,
	},
	topBar: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderRadius: 16,
		backgroundColor: '#FFFFFF',
		borderWidth: 1,
		borderColor: '#E2E8F0',
		shadowColor: '#0F172A',
		shadowOpacity: 0.06,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 2 },
		elevation: 2,
	},
	brandWrap: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
	},
	logo: {
		width: 42,
		height: 42,
	},
	brandTitle: {
		fontSize: 16,
		fontWeight: '700',
		color: '#0F172A',
	},
	brandSubtitle: {
		fontSize: 12,
		color: '#475569',
	},
	topBarActions: {
		flexDirection: 'row',
		gap: 8,
	},
	iconBtn: {
		width: 38,
		height: 38,
		borderRadius: 19,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#F8FAFC',
		borderWidth: 1,
		borderColor: '#E2E8F0',
	},
	sectionTitle: {
		marginTop: 2,
		fontSize: 22,
		fontWeight: '800',
		color: '#0F172A',
	},
	statLabel: {
		fontSize: 11,
		color: '#334155',
	},
	heroTag: {
		fontSize: 11,
		fontWeight: '600',
		letterSpacing: 0.4,
		color: '#E2E8F0',
	},
	heroWrapper: {
		height: 260,
		borderRadius: 20,
		overflow: 'hidden',
	},
	heroImageStyle: {
		borderRadius: 20,
	},
	heroOverlay: {
		flex: 1,
		padding: 16,
		justifyContent: 'flex-end',
		backgroundColor: 'rgba(15, 23, 42, 0.44)',
	},

	heroSubtitle: {
		marginTop: 6,
		color: '#E2E8F0',
		fontSize: 14,
		lineHeight: 20,
	},
	heroTitle: {
		fontSize: 30,
		lineHeight: 34,
		color: '#FFFFFF',
		marginTop: 4,
	},
	heroActionRow: {
		flexDirection: 'row',
		gap: 8,
		marginTop: 12,
	},
	actionButton: {
		flex: 1,
		borderRadius: 12,
		paddingVertical: 10,
		alignItems: 'center',
	},
	actionPrimary: {
		backgroundColor: '#0F766E',
	},
	actionSecondary: {
		backgroundColor: 'rgba(255, 255, 255, 0.18)',
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.4)',
	},
	actionPrimaryText: {
		color: '#FFFFFF',
		fontWeight: '700',
		fontSize: 13,
	},
	actionSecondaryText: {
		color: '#FFFFFF',
		fontWeight: '700',
		fontSize: 13,
	},
	statRow: {
		flexDirection: 'row',
		gap: 8,
	},
	statCard: {
		flex: 1,
		borderRadius: 14,
		paddingVertical: 12,
		paddingHorizontal: 10,
		backgroundColor: '#F8FAFC',
		borderWidth: 1,
		borderColor: '#E2E8F0',
		alignItems: 'center',
	},
	statValue: {
		fontSize: 17,
		fontWeight: '700',
		color: '#0F766E',
	},
	cardsRow: {
		paddingRight: 6,
		gap: 12,
	},
	cardContainer: {
		width: 300,
		borderRadius: 16,
		overflow: 'hidden',
		backgroundColor: '#FFFFFF',
		borderWidth: 1,
		borderColor: '#E2E8F0',
	},
	cardImage: {
		height: 150,
	},
	cardImageStyle: {
		resizeMode: 'cover',
	},
	cardContent: {
		padding: 12,
		gap: 8,
	},
	cardTitle: {
		fontSize: 20,
		fontWeight: '700',
		color: '#0F172A',
	},
	orangeLine: {
		width: 72,
		height: 4,
		borderRadius: 999,
		backgroundColor: '#F59E0B',
	},
	cardDesc: {
		fontSize: 14,
		lineHeight: 20,
		color: '#475569',
	},
	cardCtaBtn: {
		marginTop: 2,
		paddingVertical: 11,
		borderRadius: 10,
		alignItems: 'center',
		backgroundColor: '#0F766E',
	},
	cardCtaText: {
		color: '#FFFFFF',
		fontWeight: '600',
		fontSize: 15,
	},
});

