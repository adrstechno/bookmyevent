import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, ImageBackground, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import FadeInView from '@/components/common/FadeInView';
import { TabsTopBar } from '@/components/layout/TabsTopBar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { favoritesService } from '@/services/favorites/favoritesService';
import { notificationService } from '@/services/notification/notificationService';
import { useSettingsTheme } from '@/theme/settingsTheme';

const HERO_SLIDES = [
	{
		id: 'wedding-hero',
		tag: 'EVENT PLANNING',
		title: 'Moments that stay.',
		subtitle: 'Plan faster. Book smarter.',
		image: require('@/assets/images/home/wedding.jpg'),
	},
	{
		id: 'birthday-hero',
		tag: 'PARTY READY',
		title: 'Host better.',
		subtitle: 'Everything you need in one place.',
		image: require('@/assets/images/home/birthday.jpg'),
	},
	{
		id: 'seminar-hero',
		tag: 'CORPORATE EVENTS',
		title: 'Plan with confidence.',
		subtitle: 'Smooth events, zero chaos.',
		image: require('@/assets/images/home/seminar.jpg'),
	},
] as const;

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
	const heroCarouselRef = useRef<FlatList<(typeof HERO_SLIDES)[number]>>(null);
	const heroAutoplayLockRef = useRef(false);
	const { width: windowWidth } = useWindowDimensions();
	const { mode, palette } = useSettingsTheme();
	const isDark = mode === 'dark';
	const screenBg = palette.screenBg;
	const elevated = palette.primaryStrong;
	const [activeFilter, setActiveFilter] = useState<string>('all');
	const [savedEvents, setSavedEvents] = useState<Record<string, boolean>>({});
	const [activeHeroSlide, setActiveHeroSlide] = useState(0);
	const [unreadCount, setUnreadCount] = useState(0);
	const heroWidth = windowWidth - 32;

	const filterChips = useMemo(
		() => [{ id: 'all', label: 'All' }, ...EVENT_CARDS.map((card) => ({ id: card.id, label: card.title.replace(' Event', '') }))],
		[]
	);

	const filteredCards = useMemo(
		() => (activeFilter === 'all' ? EVENT_CARDS : EVENT_CARDS.filter((card) => card.id === activeFilter)),
		[activeFilter]
	);

	const savedCount = useMemo(() => Object.values(savedEvents).filter(Boolean).length, [savedEvents]);

	const fetchUnreadCount = useCallback(async () => {
		const result = await notificationService.getUnreadCount();
		if (result.success) {
			setUnreadCount(result.data);
			return;
		}

		setUnreadCount(0);
	}, []);

	const onOpenNotifications = useCallback(async () => {
		await Haptics.selectionAsync();
		router.push('/notifications');
	}, [router]);

	const onOpenCategories = useCallback(async () => {
		await Haptics.selectionAsync();
		router.push('/(tabs)/categories');
	}, [router]);

	const onSelectFilter = useCallback(async (filterId: string) => {
		await Haptics.selectionAsync();
		setActiveFilter(filterId);
	}, []);

	const onToggleSave = useCallback(async (eventId: string) => {
		await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

		const event = EVENT_CARDS.find((item) => item.id === eventId);
		if (!event) {
			return;
		}

		const nextIsFavorite = !savedEvents[eventId];
		setSavedEvents((prev) => ({ ...prev, [eventId]: nextIsFavorite }));
		await favoritesService.setFavorite(
			{ id: event.id, title: event.title, description: event.description },
			nextIsFavorite
		);
	}, [savedEvents]);

	const hydrateSavedEvents = useCallback(async () => {
		const favorites = await favoritesService.getAll();
		const next: Record<string, boolean> = {};
		for (const item of favorites) {
			next[item.id] = true;
		}
		setSavedEvents(next);
	}, []);

	useEffect(() => {
		void hydrateSavedEvents();
	}, [hydrateSavedEvents]);

	useEffect(() => {
		void fetchUnreadCount();
		const interval = setInterval(() => {
			void fetchUnreadCount();
		}, 30000);

		return () => clearInterval(interval);
	}, [fetchUnreadCount]);

	useEffect(() => {
		if (HERO_SLIDES.length <= 1) {
			return;
		}

		const interval = setInterval(() => {
			if (heroAutoplayLockRef.current) {
				return;
			}

			setActiveHeroSlide((currentIndex) => {
				const nextIndex = (currentIndex + 1) % HERO_SLIDES.length;
				heroCarouselRef.current?.scrollToIndex({ index: nextIndex, animated: true });
				return nextIndex;
			});
		}, 4200);

		return () => clearInterval(interval);
	}, [heroWidth]);

	const renderEventCard = useCallback(
		({ item }: { item: (typeof EVENT_CARDS)[number] }) => (
			<ThemedView style={[styles.cardContainer, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
				<ImageBackground source={item.image} imageStyle={styles.cardImageStyle} style={styles.cardImage}>
					<View style={styles.cardTopActions}>
						<Pressable
							style={({ pressed }) => [
								styles.saveIconBtn,
								{
									backgroundColor: savedEvents[item.id] ? palette.primary : 'rgba(0, 0, 0, 0.38)',
									borderColor: savedEvents[item.id] ? palette.primaryStrong : 'rgba(255,255,255,0.35)',
								},
								pressed ? styles.saveIconBtnPressed : null,
							]}
							onPress={() => void onToggleSave(item.id)}
						>
							<Ionicons name={savedEvents[item.id] ? 'heart' : 'heart-outline'} size={16} color={palette.onPrimary} />
						</Pressable>
					</View>
				</ImageBackground>
				<View style={styles.cardContent}>
					<ThemedText type="defaultSemiBold" style={[styles.cardTitle, { color: palette.text }]}>
						{item.title}
					</ThemedText>
					<View style={[styles.orangeLine, { backgroundColor: palette.accent }]} />
					<ThemedText style={[styles.cardDesc, { color: palette.subtext }]}>{item.description}</ThemedText>
					<Pressable
						style={({ pressed }) => [
							styles.cardCtaBtn,
							{ backgroundColor: palette.primary, borderColor: palette.primaryStrong, shadowColor: palette.shadow },
							pressed ? styles.cardCtaBtnPressed : null,
						]}
						onPress={onOpenCategories}
					>
						<ThemedText style={[styles.cardCtaText, { color: palette.onPrimary }]}>Explore Services</ThemedText>
					</Pressable>
				</View>
			</ThemedView>
		),
		[
			onOpenCategories,
			onToggleSave,
			palette.accent,
			palette.border,
			palette.onPrimary,
			palette.primary,
			palette.primaryStrong,
			palette.shadow,
			palette.subtext,
			palette.surfaceBg,
			palette.text,
			savedEvents,
		]
	);

	return (
		<SafeAreaView style={[styles.safeArea, { backgroundColor: screenBg }]} edges={['top']}>
			<StatusBar style={isDark ? 'light' : 'dark'} />
			<TabsTopBar
				title="Home"
				rightContent={(
					<View style={styles.notificationWrap}>
						<Pressable
							style={({ pressed }) => [
								styles.iconBtn,
								{ backgroundColor: elevated, borderColor: palette.primaryStrong },
								pressed ? styles.iconBtnPressed : null,
							]}
							onPress={onOpenNotifications}
						>
							<Ionicons name="notifications-outline" size={20} color={palette.onPrimary} />
						</Pressable>
						{unreadCount > 0 && (
							<View style={[styles.notificationBadge, { backgroundColor: palette.accent }]}>
								<ThemedText style={[styles.notificationBadgeText, { color: palette.onPrimary }]}>
									{unreadCount > 9 ? '9+' : unreadCount}
								</ThemedText>
							</View>
						)}
					</View>
				)}
			/>
			<ScrollView
				style={[styles.page, { backgroundColor: screenBg }]}
				contentContainerStyle={[styles.container, { paddingBottom: tabBarHeight + 16 }]}
				showsVerticalScrollIndicator={false}
			>
			<FadeInView delay={40} distance={8}>
				<View style={[styles.heroShell, { width: heroWidth }]}>
					<FlatList
						ref={heroCarouselRef}
						horizontal
						pagingEnabled
						showsHorizontalScrollIndicator={false}
						data={HERO_SLIDES}
						keyExtractor={(item) => item.id}
						getItemLayout={(_, index) => ({ length: heroWidth, offset: heroWidth * index, index })}
						decelerationRate="fast"
						snapToInterval={heroWidth}
						snapToAlignment="start"
						bounces={false}
						showsVerticalScrollIndicator={false}
						onScrollBeginDrag={() => {
							heroAutoplayLockRef.current = true;
						}}
						onMomentumScrollEnd={(event) => {
							const nextIndex = Math.round(event.nativeEvent.contentOffset.x / heroWidth);
							setActiveHeroSlide(nextIndex);
							heroAutoplayLockRef.current = false;
						}}
						renderItem={({ item }) => (
							<ImageBackground source={item.image} imageStyle={styles.heroImageStyle} style={[styles.heroWrapper, { width: heroWidth }]}>
								<View style={[styles.heroOverlay, { backgroundColor: palette.overlay }]}>
									<ThemedText style={[styles.heroTag, { color: palette.accent }]}>{item.tag}</ThemedText>
									<ThemedText type="title" style={[styles.heroTitle, { color: palette.onPrimary }]}>
										{item.title}
									</ThemedText>
									<ThemedText style={[styles.heroSubtitle, { color: '#F6F2FF' }]} numberOfLines={1}>
										{item.subtitle}
									</ThemedText>
									<Pressable
										style={({ pressed }) => [
											styles.actionButton,
											styles.actionPrimary,
											styles.heroActionSingle,
											{ backgroundColor: palette.primary, borderColor: palette.primaryStrong, shadowColor: palette.shadow },
											pressed ? styles.actionButtonPressed : null,
										]}
										onPress={onOpenCategories}
									>
										<ThemedText style={[styles.actionPrimaryText, { color: palette.onPrimary }]}>Explore Services</ThemedText>
									</Pressable>
								</View>
							</ImageBackground>
						)}
					/>
					<View style={styles.heroDotsRow}>
						{HERO_SLIDES.map((item, index) => {
							const active = index === activeHeroSlide;
							return <View key={item.id} style={[styles.heroDot, { backgroundColor: active ? palette.accent : palette.border, opacity: active ? 1 : 0.45 }]} />;
						})}
					</View>
				</View>
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
				<View style={styles.engagementMetaRow}>
					<View style={[styles.savedPill, { backgroundColor: palette.elevatedBg, borderColor: palette.border }]}>
						<Ionicons name="sparkles-outline" size={14} color={palette.primary} />
						<ThemedText style={[styles.savedPillText, { color: palette.primaryStrong }]}>{savedCount} saved ideas</ThemedText>
					</View>
				</View>
				<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
					{filterChips.map((chip) => {
						const active = chip.id === activeFilter;
						return (
							<Pressable
								key={chip.id}
								style={({ pressed }) => [
									styles.filterChip,
									{
										backgroundColor: active ? palette.primary : palette.surfaceBg,
										borderColor: active ? palette.primaryStrong : palette.border,
									},
									pressed ? styles.filterChipPressed : null,
								]}
								onPress={() => void onSelectFilter(chip.id)}
							>
								<ThemedText style={[styles.filterChipText, { color: active ? palette.onPrimary : palette.text }]}>{chip.label}</ThemedText>
							</Pressable>
						);
					})}
				</ScrollView>

				<ThemedText type="subtitle" style={[styles.sectionTitle, { color: palette.text }]}>
					{activeFilter === 'all' ? 'Popular Categories' : 'Filtered Category'}
				</ThemedText>
			</FadeInView>

			<FadeInView delay={170} distance={8}>
				<FlatList
					horizontal
					data={filteredCards}
					renderItem={renderEventCard}
					keyExtractor={(item) => item.id}
					contentContainerStyle={styles.cardsRow}
					showsHorizontalScrollIndicator={false}
					initialNumToRender={3}
					maxToRenderPerBatch={3}
					windowSize={5}
					decelerationRate="fast"
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
	notificationWrap: {
		position: 'relative',
		alignItems: 'center',
		justifyContent: 'center',
	},
	notificationBadge: {
		position: 'absolute',
		top: -4,
		right: -4,
		minWidth: 20,
		height: 20,
		borderRadius: 10,
		paddingHorizontal: 5,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: '#FFFFFF',
	},
	notificationBadgeText: {
		fontSize: 10,
		fontWeight: '800',
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
		fontWeight: '700',
		letterSpacing: 0.8,
		color: '#E2E8F0',
	},
	heroShell: {
		borderRadius: 20,
		overflow: 'hidden',
	},
	heroWrapper: {
		height: 270,
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
		fontSize: 12,
		lineHeight: 16,
	},
	heroTitle: {
		fontSize: 24,
		lineHeight: 28,
		color: '#FFFFFF',
		marginTop: 4,
	},
	heroActionSingle: {
		marginTop: 12,
		alignSelf: 'stretch',
	},
	actionButton: {
		borderRadius: 12,
		paddingVertical: 10,
		alignItems: 'center',
	},
	actionButtonPressed: {
		opacity: 0.88,
		transform: [{ scale: 0.98 }],
	},
	actionPrimary: {
		backgroundColor: '#0F766E',
		borderWidth: 1,
		boxShadow: '0px 6px 10px rgba(15, 23, 42, 0.2)',
	},
	actionPrimaryText: {
		color: '#FFFFFF',
		fontWeight: '700',
		fontSize: 13,
	},
	heroDotsRow: {
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 8,
		marginTop: 10,
	},
	heroDot: {
		width: 8,
		height: 8,
		borderRadius: 999,
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
		justifyContent: 'flex-start',
	},
	cardTopActions: {
		padding: 10,
		alignItems: 'flex-end',
	},
	saveIconBtn: {
		width: 32,
		height: 32,
		borderRadius: 16,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
	},
	saveIconBtnPressed: {
		opacity: 0.88,
		transform: [{ scale: 0.96 }],
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
		borderWidth: 1,
		boxShadow: '0px 5px 9px rgba(15, 23, 42, 0.18)',
	},
	cardCtaBtnPressed: {
		opacity: 0.88,
		transform: [{ scale: 0.98 }],
	},
	cardCtaText: {
		color: '#FFFFFF',
		fontWeight: '600',
		fontSize: 15,
	},
	engagementMetaRow: {
		marginBottom: 8,
	},
	savedPill: {
		alignSelf: 'flex-start',
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 999,
		borderWidth: 1,
	},
	savedPillText: {
		fontSize: 12,
		fontWeight: '700',
	},
	filterRow: {
		gap: 8,
		paddingRight: 8,
		paddingBottom: 10,
	},
	filterChip: {
		height: 34,
		paddingHorizontal: 12,
		borderRadius: 999,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	filterChipPressed: {
		opacity: 0.9,
	},
	filterChipText: {
		fontSize: 12,
		fontWeight: '700',
	},
});

