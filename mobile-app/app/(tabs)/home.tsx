import { useCallback } from 'react';
import { FlatList, ImageBackground, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import FadeInView from '@/components/common/FadeInView';
import AppMenuDrawer from '@/components/layout/AppMenuDrawer';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useSettingsTheme } from '@/theme/settingsTheme';

const EVENT_CARDS = [
	{
		id: 'wedding',
		title: 'Wedding Event',
		description: 'Premium decor, catering, lights, and complete ceremony planning support.',
		image: require('@/assets/images/home/wedding.jpg'),
	},
	{
		id: 'birthday',
		title: 'Birthday Party Event',
		description: 'Theme setups, cake table design, entertainers, and custom party plans.',
		image: require('@/assets/images/home/birthday.jpg'),
	},
	{
		id: 'kitty',
		title: 'Kitty Party Event',
		description: 'Stylish venue layouts, games, snacks, and end-to-end event handling.',
		image: require('@/assets/images/home/kitty.jpg'),
	},
	{
		id: 'bhagwat',
		title: 'Bhagwat Katha Event',
		description: 'Spiritual stage setup, sound systems, seating plans, and hospitality teams.',
		image: require('@/assets/images/home/bhagwat.jpg'),
	},
	{
		id: 'seminar',
		title: 'Office Seminar & Conference',
		description: 'Conference halls, AV setup, registration desks, and support staff management.',
		image: require('@/assets/images/home/seminar.jpg'),
	},
];

export default function HomeTabScreen() {
	const router = useRouter();
	const tabBarHeight = useBottomTabBarHeight();
	const { mode, palette } = useSettingsTheme();
	const isDark = mode === 'dark';
	const screenBg = palette.screenBg;
	const surfaceBg = palette.surfaceBg;
	const border = palette.border;
	const elevated = palette.primaryStrong;

	const onSoftPress = useCallback(async () => {
		await Haptics.selectionAsync();
	}, []);

	const onOpenCategories = useCallback(async () => {
		await Haptics.selectionAsync();
		router.push('/(tabs)/categories');
	}, [router]);

	const onOpenSupport = useCallback(async () => {
		await Haptics.selectionAsync();
		router.push('/support');
	}, [router]);

	const renderEventCard = useCallback(
		({ item }: { item: (typeof EVENT_CARDS)[number] }) => (
			<ThemedView style={[styles.cardContainer, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
				<ImageBackground source={item.image} imageStyle={styles.cardImageStyle} style={styles.cardImage} />
				<View style={styles.cardContent}>
					<ThemedText type="defaultSemiBold" style={[styles.cardTitle, { color: palette.text }]}>
						{item.title}
					</ThemedText>
					<View style={[styles.orangeLine, { backgroundColor: palette.accent }]} />
					<ThemedText style={[styles.cardDesc, { color: palette.subtext }]}>{item.description}</ThemedText>
					<Pressable style={({ pressed }) => [styles.cardCtaBtn, { backgroundColor: palette.accent }, pressed ? styles.cardCtaBtnPressed : null]} onPress={onOpenCategories}>
						<ThemedText style={[styles.cardCtaText, { color: palette.text }]}>Explore Services</ThemedText>
					</Pressable>
				</View>
			</ThemedView>
		),
		[onOpenCategories, palette.accent, palette.border, palette.subtext, palette.surfaceBg, palette.text]
	);

	return (
		<SafeAreaView style={[styles.safeArea, { backgroundColor: screenBg }]} edges={['top']}>
			<StatusBar style={isDark ? 'light' : 'dark'} />
			<View style={styles.appBarWrap}>
				<View style={[styles.appBar, { backgroundColor: palette.primary, borderColor: palette.primaryStrong }]}>
					<AppMenuDrawer />

					<View style={styles.appBarBrand}>
						<Image source={require('@/assets/images/home/logo2.png')} style={styles.logo} contentFit="contain" />
					</View>

					<Pressable style={({ pressed }) => [styles.iconBtn, { backgroundColor: elevated, borderColor: palette.primaryStrong }, pressed ? styles.iconBtnPressed : null]} onPress={onSoftPress}>
						<Ionicons name="notifications-outline" size={20} color={palette.onPrimary} />
					</Pressable>
				</View>
			</View>
			<ScrollView
				style={[styles.page, { backgroundColor: screenBg }]}
				contentContainerStyle={[styles.container, { paddingBottom: tabBarHeight + 16 }]}
				showsVerticalScrollIndicator={false}
			>
			<FadeInView delay={40} distance={8}>
				<ImageBackground
					source={require('@/assets/images/home/hero.jpg')}
					imageStyle={styles.heroImageStyle}
					style={styles.heroWrapper}
				>
					<View style={[styles.heroOverlay, { backgroundColor: palette.overlay }]}>
						<ThemedText style={[styles.heroTag, { color: palette.accent }]}>EVENT MANAGEMENT PLATFORM</ThemedText>
						<ThemedText type="title" style={[styles.heroTitle, { color: palette.onPrimary }]}>
							Create Events People Remember
						</ThemedText>
						<ThemedText style={[styles.heroSubtitle, { color: '#F6F2FF' }]}>
							From weddings to corporate shows, plan, organize, and manage everything from one app.
						</ThemedText>
						<View style={styles.heroActionRow}>
							<Pressable style={({ pressed }) => [styles.actionButton, styles.actionPrimary, { backgroundColor: palette.accent }, pressed ? styles.actionButtonPressed : null]} onPress={onOpenCategories}>
								<ThemedText style={[styles.actionPrimaryText, { color: palette.text }]}>Explore Services</ThemedText>
							</Pressable>
							<Pressable style={({ pressed }) => [styles.actionButton, styles.actionSecondary, { borderColor: 'rgba(255, 255, 255, 0.55)' }, pressed ? styles.actionButtonPressed : null]} onPress={onOpenSupport}>
								<ThemedText style={[styles.actionSecondaryText, { color: palette.onPrimary }]}>Contact Team</ThemedText>
							</Pressable>
						</View>
					</View>
				</ImageBackground>
			</FadeInView>

			<FadeInView delay={90} distance={8} style={styles.statRow}>
				<ThemedView style={[styles.statCard, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
					<ThemedText style={[styles.statValue, { color: palette.primary }]}>50+</ThemedText>
					<ThemedText style={[styles.statLabel, { color: palette.subtext }]}>Event Types</ThemedText>
				</ThemedView>
				<ThemedView style={[styles.statCard, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
					<ThemedText style={[styles.statValue, { color: palette.primary }]}>1000+</ThemedText>
					<ThemedText style={[styles.statLabel, { color: palette.subtext }]}>Vendors</ThemedText>
				</ThemedView>
				<ThemedView style={[styles.statCard, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
					<ThemedText style={[styles.statValue, { color: palette.primary }]}>24x7</ThemedText>
					<ThemedText style={[styles.statLabel, { color: palette.subtext }]}>Support</ThemedText>
				</ThemedView>
			</FadeInView>

			<FadeInView delay={130} distance={8}>
				<ThemedText type="subtitle" style={[styles.sectionTitle, { color: palette.text }]}>
					Popular Categories
				</ThemedText>
			</FadeInView>

			<FadeInView delay={170} distance={8}>
				<FlatList
					horizontal
					data={EVENT_CARDS}
					renderItem={renderEventCard}
					keyExtractor={(item) => item.id}
					contentContainerStyle={styles.cardsRow}
					showsHorizontalScrollIndicator={false}
					initialNumToRender={3}
					maxToRenderPerBatch={3}
					windowSize={5}
					removeClippedSubviews
				/>
			</FadeInView>
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
		paddingTop: 12,
		gap: 14,
	},
	appBarWrap: {
		paddingHorizontal: 16,
		paddingTop: 8,
	},
	appBar: {
		height: 56,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 12,
		backgroundColor: '#FFFFFF',
		borderWidth: 1,
		borderColor: '#E2E8F0',
		borderRadius: 12,
	},
	appBarBrand: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	logo: {
		width: 50,
		height: 50,
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
	iconBtnPressed: {
		opacity: 0.7,
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
	actionButtonPressed: {
		opacity: 0.82,
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
	cardCtaBtnPressed: {
		opacity: 0.82,
	},
	cardCtaText: {
		color: '#FFFFFF',
		fontWeight: '600',
		fontSize: 15,
	},
});

