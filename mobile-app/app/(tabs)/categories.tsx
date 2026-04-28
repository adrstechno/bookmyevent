import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, TextInput, View, type ImageSourcePropType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import FadeInView from '@/components/common/FadeInView';
import { TabsTopBar } from '@/components/layout/TabsTopBar';
import { ThemedText } from '@/components/themed-text';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import api from '@/services/api/client';
import { useSettingsTheme } from '@/theme/settingsTheme';

type CategoryChip = {
	id: string;
	name: string;
	image?: string;
};

type ServiceCard = {
	id: string;
	title: string;
	description: string;
	image?: string;
	localImage?: ImageSourcePropType;
	categoryId: string;
	categoryName: string;
};

const LOCAL_CATEGORY_IMAGES: Record<string, ImageSourcePropType> = {
	wedding: require('../../assets/images/frontend/Wedding.jpg'),
	birthday: require('../../assets/images/frontend/Birthday.jpg'),
	kitty: require('../../assets/images/frontend/img3.jpg'),
	bhagwat: require('../../assets/images/frontend/event/event5.jpg'),
	office: require('../../assets/images/frontend/Corporate-event.jpg'),
};

const LOCAL_TITLE_IMAGES: Record<string, ImageSourcePropType> = {
	'band party services': require('../../assets/images/frontend/services/concert/stageandtrusssetup.png'),
	'disco light': require('../../assets/images/frontend/services/fashion/professionallighting.jpg'),
	'dj and sound system': require('../../assets/images/frontend/services/concert/soundline.jpg'),
	'entry and pyro ballon decorestion': require('../../assets/images/frontend/event/event1.jpg'),
	'fireworks': require('../../assets/images/frontend/services/concert/special-effects.jpg'),
	'flower decorestion': require('../../assets/images/frontend/event/event4.jpg'),
	'ketars': require('../../assets/images/frontend/event/event7.jpg'),
	'mehendi service': require('../../assets/images/frontend/event/event3.jpg'),
	'musical accompaniment arkestra': require('../../assets/images/frontend/services/concert/artistmanagement.jpg'),
	'pandit ji': require('../../assets/images/frontend/event/event8.jpg'),
	'parlor service': require('../../assets/images/frontend/img2.jpg'),
	'party hall and garden': require('../../assets/images/frontend/Corporate-event.jpg'),
	'security crowd management volunteer': require('../../assets/images/frontend/services/concert/securityandcrowd.jpg'),
	'tent egency and light': require('../../assets/images/frontend/services/corporate/stagedesignandsetup.jpg'),
	'traditional turban pagdi tying service': require('../../assets/images/frontend/event/event10.jpg'),
	'wedding carriage baggi service': require('../../assets/images/frontend/event/event6.jpg'),
	'wedding photography videography': require('../../assets/images/frontend/Wedding.jpg'),
	'birthday cake custom cakes': require('../../assets/images/frontend/Birthday.jpg'),
	'fun entertainment services': require('../../assets/images/frontend/services/concert/backstagecoordination.jpg'),
};

const CATEGORY_CHIPS: CategoryChip[] = [
	{ id: 'wedding', name: 'Wedding Event' },
	{ id: 'birthday', name: 'Birthday Party Event' },
	{ id: 'kitty', name: 'Kity Party Event' },
	{ id: 'bhagwat', name: 'Bhagwat Katha Event' },
	{ id: 'office', name: 'Office Seminar and Public Confrence' },
];

const CANONICAL_SERVICE_CARDS: ServiceCard[] = [
	{ id: 'wedding-band-party-services', title: 'Band party services', description: 'Band party services', categoryId: 'wedding', categoryName: 'Wedding Event' },
	{ id: 'wedding-disco-light', title: 'disco light', description: 'we are providing best disco light services', categoryId: 'wedding', categoryName: 'Wedding Event' },
	{ id: 'wedding-dj-and-sound-system', title: 'dj and sound system', description: 'we are provieding the best sound and dj system', categoryId: 'wedding', categoryName: 'Wedding Event' },
	{ id: 'wedding-entry-and-pyro-ballon-decorestion', title: 'Entry and pyro ballon decorestion', description: 'Entry and pyro ballon decorestion services', categoryId: 'wedding', categoryName: 'Wedding Event' },
	{ id: 'wedding-fireworks', title: 'fireworks', description: 'we are provieding the best fireworks services', categoryId: 'wedding', categoryName: 'Wedding Event' },
	{ id: 'wedding-flower-decorestion', title: 'flower decorestion', description: 'we provied flower decorestion', categoryId: 'wedding', categoryName: 'Wedding Event' },
	{ id: 'wedding-ketars', title: 'Ketars', description: 'we provied Ketars services', categoryId: 'wedding', categoryName: 'Wedding Event' },
	{ id: 'wedding-mehendi-service', title: 'Mehendi Service', description: 'Our Bridal Mehendi services are designed to make your wedding even more special. We create stunning, personalized designs that reflect tradition, elegance, and your unique style.', categoryId: 'wedding', categoryName: 'Wedding Event' },
	{ id: 'wedding-musical-accompaniment-arkestra', title: 'Musical Accompaniment / Arkestra', description: 'we are provieding best musical Accompaniment services', categoryId: 'wedding', categoryName: 'Wedding Event' },
	{ id: 'wedding-pandit-ji', title: 'Pandit ji', description: 'Pandit ji', categoryId: 'wedding', categoryName: 'Wedding Event' },
	{ id: 'wedding-parlor-service', title: 'parlor service', description: 'we are providing mackup and parlor services', categoryId: 'wedding', categoryName: 'Wedding Event' },
	{ id: 'wedding-party-hall-and-garden', title: 'Party Hall and Garden', description: 'we are provieding a good location and space for your event', categoryId: 'wedding', categoryName: 'Wedding Event' },
	{ id: 'wedding-security-crowd-management-volunteer', title: 'Security & Crowd Management [Volunteer]', description: 'Volunteers ensuring safe and organized crowd flow.', categoryId: 'wedding', categoryName: 'Wedding Event' },
	{ id: 'wedding-tent-egency-and-light', title: 'Tent Egency and light', description: 'we are provieding the best light and tent service for your event', categoryId: 'wedding', categoryName: 'Wedding Event' },
	{ id: 'wedding-traditional-turban-pagdi-tying-service', title: 'Traditional Turban (Pagdi) Tying Service', description: 'Royal pagdi styling for a traditional look.', categoryId: 'wedding', categoryName: 'Wedding Event' },
	{ id: 'wedding-wedding-carriage-baggi-service', title: 'Wedding Carriage (Baggi) Service', description: 'Grand royal entry with decorated wedding carriage.', categoryId: 'wedding', categoryName: 'Wedding Event' },
	{ id: 'wedding-wedding-photography-videography', title: 'Wedding Photography & Videography', description: 'Creative photography for unforgettable events', categoryId: 'wedding', categoryName: 'Wedding Event' },

	{ id: 'birthday-band-party-services', title: 'Band party services', description: 'Band party services', categoryId: 'birthday', categoryName: 'Birthday Party Event' },
	{ id: 'birthday-birthday-cake-custom-cakes', title: 'Birthday Cake & Custom Cakes', description: 'Delicious cakes crafted for your special celebration.', categoryId: 'birthday', categoryName: 'Birthday Party Event' },
	{ id: 'birthday-dj-and-sound-system', title: 'dj and sound system', description: 'we are provieding the best sound and dj system', categoryId: 'birthday', categoryName: 'Birthday Party Event' },
	{ id: 'birthday-entry-and-pyro-ballon-decorestion', title: 'Entry and pyro ballon decorestion', description: 'Entry and pyro ballon decorestion services', categoryId: 'birthday', categoryName: 'Birthday Party Event' },
	{ id: 'birthday-flower-decorestion', title: 'flower decorestion', description: 'we provied flower decorestion', categoryId: 'birthday', categoryName: 'Birthday Party Event' },
	{ id: 'birthday-fun-entertainment-services', title: 'Fun & Entertainment Services', description: 'Fun-filled activities for an unforgettable party.', categoryId: 'birthday', categoryName: 'Birthday Party Event' },
	{ id: 'birthday-ketars', title: 'Ketars', description: 'we provied Ketars services', categoryId: 'birthday', categoryName: 'Birthday Party Event' },
	{ id: 'birthday-musical-accompaniment-arkestra', title: 'Musical Accompaniment / Arkestra', description: 'we are provieding best musical Accompaniment services', categoryId: 'birthday', categoryName: 'Birthday Party Event' },
	{ id: 'birthday-parlor-service', title: 'parlor service', description: 'we are providing mackup and parlor services', categoryId: 'birthday', categoryName: 'Birthday Party Event' },
	{ id: 'birthday-party-hall-and-garden', title: 'Party Hall and Garden', description: 'we are provieding a good location and space for your event', categoryId: 'birthday', categoryName: 'Birthday Party Event' },
	{ id: 'birthday-tent-egency-and-light', title: 'Tent Egency and light', description: 'we are provieding the best light and tent service for your event', categoryId: 'birthday', categoryName: 'Birthday Party Event' },
	{ id: 'birthday-wedding-photography-videography', title: 'Wedding Photography & Videography', description: 'Creative photography for unforgettable events', categoryId: 'birthday', categoryName: 'Birthday Party Event' },

	{ id: 'kitty-dj-and-sound-system', title: 'dj and sound system', description: 'we are provieding the best sound and dj system', categoryId: 'kitty', categoryName: 'Kity Party Event' },
	{ id: 'kitty-ketars', title: 'Ketars', description: 'we provied Ketars services', categoryId: 'kitty', categoryName: 'Kity Party Event' },
	{ id: 'kitty-parlor-service', title: 'parlor service', description: 'we are providing mackup and parlor services', categoryId: 'kitty', categoryName: 'Kity Party Event' },
	{ id: 'kitty-party-hall-and-garden', title: 'Party Hall and Garden', description: 'we are provieding a good location and space for your event', categoryId: 'kitty', categoryName: 'Kity Party Event' },
	{ id: 'kitty-tent-egency-and-light', title: 'Tent Egency and light', description: 'we are provieding the best light and tent service for your event', categoryId: 'kitty', categoryName: 'Kity Party Event' },
	{ id: 'kitty-wedding-photography-videography', title: 'Wedding Photography & Videography', description: 'Creative photography for unforgettable events', categoryId: 'kitty', categoryName: 'Kity Party Event' },

	{ id: 'bhagwat-band-party-services', title: 'Band party services', description: 'Band party services', categoryId: 'bhagwat', categoryName: 'Bhagwat Katha Event' },
	{ id: 'bhagwat-dj-and-sound-system', title: 'dj and sound system', description: 'we are provieding the best sound and dj system', categoryId: 'bhagwat', categoryName: 'Bhagwat Katha Event' },
	{ id: 'bhagwat-entry-and-pyro-ballon-decorestion', title: 'Entry and pyro ballon decorestion', description: 'Entry and pyro ballon decorestion services', categoryId: 'bhagwat', categoryName: 'Bhagwat Katha Event' },
	{ id: 'bhagwat-fireworks', title: 'fireworks', description: 'we are provieding the best fireworks services', categoryId: 'bhagwat', categoryName: 'Bhagwat Katha Event' },
	{ id: 'bhagwat-flower-decorestion', title: 'flower decorestion', description: 'we provied flower decorestion', categoryId: 'bhagwat', categoryName: 'Bhagwat Katha Event' },
	{ id: 'bhagwat-ketars', title: 'Ketars', description: 'we provied Ketars services', categoryId: 'bhagwat', categoryName: 'Bhagwat Katha Event' },
	{ id: 'bhagwat-musical-accompaniment-arkestra', title: 'Musical Accompaniment / Arkestra', description: 'we are provieding best musical Accompaniment services', categoryId: 'bhagwat', categoryName: 'Bhagwat Katha Event' },
	{ id: 'bhagwat-pandit-ji', title: 'Pandit ji', description: 'Pandit ji', categoryId: 'bhagwat', categoryName: 'Bhagwat Katha Event' },
	{ id: 'bhagwat-party-hall-and-garden', title: 'Party Hall and Garden', description: 'we are provieding a good location and space for your event', categoryId: 'bhagwat', categoryName: 'Bhagwat Katha Event' },
	{ id: 'bhagwat-security-crowd-management-volunteer', title: 'Security & Crowd Management [Volunteer]', description: 'Volunteers ensuring safe and organized crowd flow.', categoryId: 'bhagwat', categoryName: 'Bhagwat Katha Event' },
	{ id: 'bhagwat-tent-egency-and-light', title: 'Tent Egency and light', description: 'we are provieding the best light and tent service for your event', categoryId: 'bhagwat', categoryName: 'Bhagwat Katha Event' },
	{ id: 'bhagwat-wedding-photography-videography', title: 'Wedding Photography & Videography', description: 'Creative photography for unforgettable events', categoryId: 'bhagwat', categoryName: 'Bhagwat Katha Event' },

	{ id: 'office-parlor-service', title: 'parlor service', description: 'we are providing mackup and parlor services', categoryId: 'office', categoryName: 'Office Seminar and Public Confrence' },
	{ id: 'office-party-hall-and-garden', title: 'Party Hall and Garden', description: 'we are provieding a good location and space for your event', categoryId: 'office', categoryName: 'Office Seminar and Public Confrence' },
	{ id: 'office-security-crowd-management-volunteer', title: 'Security & Crowd Management [Volunteer]', description: 'Volunteers ensuring safe and organized crowd flow.', categoryId: 'office', categoryName: 'Office Seminar and Public Confrence' },
	{ id: 'office-tent-egency-and-light', title: 'Tent Egency and light', description: 'we are provieding the best light and tent service for your event', categoryId: 'office', categoryName: 'Office Seminar and Public Confrence' },
	{ id: 'office-wedding-photography-videography', title: 'Wedding Photography & Videography', description: 'Creative photography for unforgettable events', categoryId: 'office', categoryName: 'Office Seminar and Public Confrence' },
];

const normalizeText = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const toRows = (payload: unknown): Record<string, unknown>[] => {
	if (Array.isArray(payload)) {
		return payload as Record<string, unknown>[];
	}

	if (payload && typeof payload === 'object') {
		const maybeData = (payload as { data?: unknown }).data;
		if (Array.isArray(maybeData)) {
			return maybeData as Record<string, unknown>[];
		}
	}

	return [];
};

type ServiceCardItemProps = {
	card: ServiceCard;
	hasImageFailed: boolean;
	onImageError: (cardId: string) => void;
	onViewVendors: (card: ServiceCard) => void;
	isDark: boolean;
	palette: {
		surfaceBg: string;
		border: string;
		text: string;
		subtext: string;
		accent: string;
		tint: string;
		primary: string;
		primaryStrong: string;
		onPrimary: string;
		shadow: string;
	};
};

const ServiceCardItem = memo(function ServiceCardItem({
	card,
	hasImageFailed,
	onImageError,
	onViewVendors,
	isDark,
	palette,
}: ServiceCardItemProps) {
	const isRomanticCategory = /wedding|engagement|romantic/i.test(card.categoryName);
	const badgeBg = isRomanticCategory ? palette.primary : palette.primaryStrong;

	return (
		<View style={[styles.serviceCard, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
			{card.image && !hasImageFailed ? (
				<Image
					source={{ uri: card.image }}
					style={styles.serviceCardImage}
					onError={() => onImageError(card.id)}
				/>
			) : card.localImage ? (
				<Image source={card.localImage} style={styles.serviceCardImage} />
			) : (
				<View style={[styles.fallbackImage, { backgroundColor: palette.tint }]}>
					<ThemedText style={styles.fallbackLetter}>{card.title.charAt(0)}</ThemedText>
				</View>
			)}
			<View style={styles.imageOverlay} />
			<View style={[styles.categoryBadge, { backgroundColor: badgeBg }]}>
				<ThemedText style={[styles.categoryBadgeText, { color: palette.onPrimary }]} numberOfLines={1}>
					{card.categoryName}
				</ThemedText>
			</View>
			<View style={[styles.serviceCardFooter, { backgroundColor: palette.surfaceBg }]}>
				<ThemedText style={[styles.serviceCardTitle, { color: palette.text }]} numberOfLines={1}>
					{card.title}
				</ThemedText>
				<View style={[styles.titleUnderline, { backgroundColor: palette.accent }]} />
				<ThemedText style={[styles.serviceCardDescription, { color: palette.subtext }]} numberOfLines={2}>
					{card.description}
				</ThemedText>
				<Pressable
					style={({ pressed }) => [
						styles.viewButton,
						{ backgroundColor: palette.primary, borderColor: palette.primaryStrong, shadowColor: palette.shadow },
						pressed ? styles.viewButtonPressed : null,
					]}
					onPress={() => onViewVendors(card)}
					accessibilityRole="button"
					accessibilityLabel={`View vendors for ${card.title}`}
				>
					<View style={styles.viewButtonContent}>
						<ThemedText style={[styles.viewButtonText, { color: palette.onPrimary }]}>View Vendors</ThemedText>
						<View style={[styles.viewButtonIconWrap, { borderColor: 'rgba(255,255,255,0.35)' }]}>
							<Ionicons name="arrow-forward" size={14} color={palette.onPrimary} />
						</View>
					</View>
				</Pressable>
			</View>
		</View>
	);
});

export default function CategoriesTabScreen() {
	const router = useRouter();
	const { mode, palette } = useSettingsTheme();
	const isDark = mode === 'dark';
	const [activeService, setActiveService] = useState<string>('all');
	const [searchValue, setSearchValue] = useState('');
	const [failedImageIds, setFailedImageIds] = useState<Record<string, boolean>>({});
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState('');
	const [allCards, setAllCards] = useState<ServiceCard[]>(CANONICAL_SERVICE_CARDS);
	const [apiCategories, setApiCategories] = useState<CategoryChip[]>(CATEGORY_CHIPS); // Dynamic categories from API, fallback to hardcoded

	// Use API-fetched categories, or fall back to hardcoded ones
	const categories = apiCategories;

	const handleSearchChange = useCallback((value: string) => {
		setSearchValue(value);
	}, []);

	const handleSelectAll = useCallback(() => {
		setActiveService('all');
	}, []);

	const handleSelectCategory = useCallback((categoryId: string) => {
		setActiveService(categoryId);
	}, []);

	const handleImageError = useCallback((cardId: string) => {
		setFailedImageIds((prev) => {
			if (prev[cardId]) {
				return prev;
			}

			return { ...prev, [cardId]: true };
		});
	}, []);

	const handleViewVendors = useCallback(
		(card: ServiceCard) => {
			const isNumericSubservice = /^\d+$/.test(card.id);
			router.push({
				pathname: '/vendors',
				params: {
					serviceId: card.categoryId,
					subserviceId: isNumericSubservice ? card.id : '',
					serviceName: card.title,
				},
			});
		},
		[router]
	);

	useEffect(() => {
		let isMounted = true;

		const loadData = async () => {
			if (isMounted) {
				setIsLoading(true);
				setLoadError('');
			}

			try {
				// ==================== PHASE 1: Fetch & Validate Categories ====================
				console.log('[Categories] Fetching service categories from API...');
				const categoryResponse = await api.get(API_ENDPOINTS.service.all);
				console.log('[Categories] Service categories response:', categoryResponse.data);

				const categoryRows = toRows(categoryResponse.data);
				console.log('[Categories] Parsed category rows:', categoryRows.length, 'items');

				// Extract active categories with validation
				const activeCategories = categoryRows
					.filter((row) => {
						const isActive = Number(row.is_active ?? 1) === 1;
						if (!isActive) {
							console.log('[Categories] Skipping inactive category:', row.category_name ?? row.name);
						}
						return isActive;
					})
					.map((row, idx) => {
						// Validate required category ID field
						const categoryId = String(row.category_id ?? row.service_id ?? row.id ?? '').trim();
						if (!categoryId) {
							console.warn(`[Categories] Row ${idx} missing category ID (category_id, service_id, id all missing/empty)`);
							return null;
						}

						const categoryName = String(row.category_name ?? row.name ?? 'Service');
						const image = typeof row.icon_url === 'string' && row.icon_url.trim() ? row.icon_url : undefined;

						console.log(`[Categories] Active category: id=${categoryId}, name=${categoryName}, hasImage=${Boolean(image)}`);

						return {
							id: categoryId,
							name: categoryName,
							image,
						};
					})
					.filter((item) => item !== null) as ({ id: string; name: string; image?: string })[];

				console.log('[Categories] Total active categories:', activeCategories.length);

				// Phase 3: Fallback to hardcoded if no API results
				if (activeCategories.length === 0) {
					console.warn('[Categories] No active categories from API. Using fallback hardcoded services.');
					if (isMounted) {
						setLoadError('No active categories available right now. Showing saved services.');
						setAllCards(CANONICAL_SERVICE_CARDS);
						// Keep hardcoded category chips if API returns no categories
						setApiCategories(CATEGORY_CHIPS);
					}
					return;
				}

				// Update category chips with API data (dynamic)
				const dynamicCategories: CategoryChip[] = activeCategories.map((cat) => ({
					id: cat.id,
					name: cat.name,
					image: cat.image,
				}));

				if (isMounted) {
					// Update chips with API categories instead of using hardcoded ones
					console.log('[Categories] Updating category chips from API:', dynamicCategories.length, 'categories');
					setApiCategories(dynamicCategories);
				}

				// ==================== PHASE 2: Fetch & Validate Subservices ====================
				console.log('[Categories] Fetching subservices for', activeCategories.length, 'categories...');
				const serviceResponses = await Promise.all(
					activeCategories.map((category) => {
						console.log(`[Categories] Fetching subservices for category: ${category.name} (${category.id})`);
						return api.get(API_ENDPOINTS.service.subservicesByCategory(category.id));
					})
				);

				// Transform API subservices to ServiceCard format
				const apiCards = serviceResponses.flatMap((response, index) => {
					const currentCategory = activeCategories[index];
					const subserviceRows = toRows(response.data);

					console.log(
						`[Categories] Category "${currentCategory.name}" (${currentCategory.id}): ${subserviceRows.length} subservices returned`
					);

					return subserviceRows
						.filter((row) => {
							const isActive = Number(row.is_active ?? 1) === 1;
							if (!isActive) {
								console.log(`[Categories] → Skipping inactive subservice: ${row.subservice_name ?? row.name}`);
							}
							return isActive;
						})
						.map((row, rowIndex) => {
							// Validate required subservice ID field
							const subserviceId = String(row.subservice_id ?? row.id ?? `${currentCategory.id}-${rowIndex}`).trim();

							const card: ServiceCard = {
								id: subserviceId,
								title: String(row.subservice_name ?? row.name ?? 'Service'),
								description: String(row.description ?? 'Explore vendors offering this service'),
								image: typeof row.icon_url === 'string' && row.icon_url.trim() ? row.icon_url : currentCategory.image,
								categoryId: currentCategory.id,
								categoryName: currentCategory.name,
							};

							console.log(
								`[Categories] → Subservice: id=${card.id}, title=${card.title}, categoryId=${card.categoryId}, hasImage=${Boolean(card.image)}`
							);

							return card;
						});
				});

				console.log('[Categories] Total subservices loaded from API:', apiCards.length);

				if (isMounted) {
					// Use API cards directly as the primary source (Phase 3: API-first approach)
					console.log('[Categories] Setting all cards from API response');
					setAllCards(apiCards);
				}
			} catch (error) {
				// Error occurred during API fetch; fall back to hardcoded services
				const errorMessage = error instanceof Error ? error.message : 'Unknown error';
				console.error('[Categories] Error loading services from API:', errorMessage, error);

				if (isMounted) {
					setLoadError('Unable to sync services from server, showing saved services.');
					console.warn('[Categories] Using fallback hardcoded services due to API error');
					setAllCards(CANONICAL_SERVICE_CARDS);
					// Fallback to hardcoded category chips when API fails
					setApiCategories(CATEGORY_CHIPS);
				}
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		void loadData();

		return () => {
			isMounted = false;
		};
	}, []);

	const serviceCounts = useMemo(() => {
		const counts = new Map<string, number>();
		for (const card of allCards) {
			counts.set(card.categoryId, (counts.get(card.categoryId) ?? 0) + 1);
		}
		return counts;
	}, [allCards]);

	const cardsWithLocalFallback = useMemo(
		() =>
			allCards.map((card) => {
				const titleKey = normalizeText(card.title);
				return {
					...card,
					localImage: LOCAL_TITLE_IMAGES[titleKey] ?? LOCAL_CATEGORY_IMAGES[card.categoryId],
				};
			}),
		[allCards]
	);

	const visibleCards = useMemo(() => {
		const baseCards =
			activeService === 'all'
				? cardsWithLocalFallback
				: cardsWithLocalFallback.filter((card) => card.categoryId === activeService);
		const query = searchValue.trim().toLowerCase();

		if (!query) {
			return baseCards;
		}

		return baseCards.filter(
			(card) =>
				card.title.toLowerCase().includes(query) || card.description.toLowerCase().includes(query)
		);
	}, [activeService, cardsWithLocalFallback, searchValue]);

	return (
		<SafeAreaView style={[styles.safeArea, { backgroundColor: palette.screenBg }]} edges={['top']}>
			<StatusBar style={isDark ? 'light' : 'dark'} />
			<View style={[styles.page, { backgroundColor: palette.screenBg }]}>
				<TabsTopBar title="Services" />
				<View style={[styles.appBar, { backgroundColor: palette.primary }]}>
					<View style={[styles.searchWrap, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
						<Ionicons name="search-outline" size={18} color={palette.subtext} />
						<TextInput
							style={[styles.searchInput, { color: palette.text }]}
							placeholder="Search services..."
							placeholderTextColor={palette.subtext}
							value={searchValue}
							onChangeText={handleSearchChange}
						/>
					</View>

					<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.servicesRow}>
						<Pressable
							style={({ pressed }) => [
								styles.serviceChip,
								{ borderColor: palette.border, backgroundColor: palette.surfaceBg },
								activeService === 'all' ? [styles.serviceChipActive, { backgroundColor: palette.tint, borderColor: palette.tint }] : null,
								pressed ? styles.serviceChipPressed : null,
							]}
							onPress={handleSelectAll}
						>
							<ThemedText style={[styles.serviceText, { color: palette.subtext }, activeService === 'all' ? styles.serviceTextActive : null]} numberOfLines={1}>
								All Services ({allCards.length})
							</ThemedText>
						</Pressable>

						{categories.map((service) => {
							const isActive = activeService === service.id;
							const count = serviceCounts.get(service.id) ?? 0;
							return (
								<Pressable
									key={service.id}
									style={({ pressed }) => [
										styles.serviceChip,
										{ borderColor: palette.border, backgroundColor: palette.surfaceBg },
										isActive ? [styles.serviceChipActive, { backgroundColor: palette.tint, borderColor: palette.tint }] : null,
										pressed ? styles.serviceChipPressed : null,
									]}
									onPress={() => handleSelectCategory(service.id)}
								>
									<ThemedText style={[styles.serviceText, { color: palette.subtext }, isActive ? styles.serviceTextActive : null]} numberOfLines={1}>
										{service.name} ({count})
									</ThemedText>
								</Pressable>
							);
						})}
					</ScrollView>
				</View>

				<FadeInView delay={80} distance={8} style={styles.cardsScroll}>
					<ScrollView
						contentContainerStyle={styles.cardsContainer}
						showsVerticalScrollIndicator={false}
						decelerationRate="fast"
					>
					{isLoading ? (
						<View style={styles.loadingWrap}>
							<ActivityIndicator size="large" color={palette.tint} />
							<ThemedText style={[styles.loadingText, { color: palette.subtext }]}>Loading services...</ThemedText>
						</View>
					) : visibleCards.length === 0 ? (
						<View style={[styles.emptyStateCard, { borderColor: palette.border, backgroundColor: palette.surfaceBg }]}>
							<ThemedText style={[styles.emptyStateTitle, { color: palette.text }]}>No services found</ThemedText>
							<ThemedText style={[styles.emptyStateText, { color: palette.subtext }]}>{loadError || 'Try another service type or different search text.'}</ThemedText>
						</View>
					) : (
						visibleCards.map((card, index) => (
							<ServiceCardItem
								key={`${card.categoryId}-${card.id}-${index}`}
								card={card}
								hasImageFailed={Boolean(failedImageIds[card.id])}
								onImageError={handleImageError}
								onViewVendors={handleViewVendors}
								isDark={isDark}
								palette={palette}
							/>
						))
					)}
					</ScrollView>
				</FadeInView>
			</View>
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
		backgroundColor: '#F4F7F9',
	},
	appBar: {
		paddingHorizontal: 16,
		paddingTop: 12,
		paddingBottom: 4,
		gap: 10,
		backgroundColor: '#F4F7F9',
	},
	searchWrap: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		height: 46,
		borderRadius: 12,
		paddingHorizontal: 14,
		backgroundColor: '#F8FAFC',
		borderWidth: 1,
		borderColor: '#E2E8F0',
	},
	searchInput: {
		flex: 1,
		fontSize: 15,
		color: '#1F2937',
	},
	servicesRow: {
		paddingHorizontal: 2,
		paddingTop: 2,
		paddingBottom: 4,
		gap: 8,
		alignItems: 'center',
	},
	serviceChip: {
		height: 38,
		paddingHorizontal: 16,
		paddingVertical: 0,
		borderRadius: 11,
		borderWidth: 1,
		borderColor: '#D0DCE3',
		backgroundColor: '#FFFFFF',
		justifyContent: 'center',
	},
	serviceChipActive: {
		backgroundColor: '#2F6570',
		borderColor: '#2F6570',
		boxShadow: '0px 4px 10px rgba(15, 23, 42, 0.12)',
	},
	serviceChipPressed: {
		opacity: 0.88,
	},
	serviceText: {
		fontSize: 13,
		lineHeight: 18,
		fontWeight: '700',
		color: '#475569',
		includeFontPadding: false,
	},
	serviceTextActive: {
		color: '#FFFFFF',
	},
	cardsScroll: {
		flex: 1,
	},
	cardsContainer: {
		paddingHorizontal: 16,
		paddingTop: 10,
		paddingBottom: 24,
		gap: 12,
	},
	serviceCard: {
		borderRadius: 18,
		overflow: 'hidden',
		backgroundColor: '#FFFFFF',
		borderWidth: 1,
		borderColor: '#E2E8F0',
		boxShadow: '0px 6px 14px rgba(15, 23, 42, 0.08)',
	},
	serviceCardImage: {
		width: '100%',
		height: 240,
	},
	fallbackImage: {
		width: '100%',
		height: 240,
		backgroundColor: '#2F6570',
		justifyContent: 'center',
		alignItems: 'center',
	},
	fallbackLetter: {
		fontSize: 42,
		fontWeight: '800',
		color: '#FFFFFF',
	},
	imageOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		height: 240,
		backgroundColor: 'rgba(15, 23, 42, 0.28)',
	},
	categoryBadge: {
		position: 'absolute',
		top: 10,
		left: 10,
		maxWidth: '86%',
		paddingHorizontal: 10,
		paddingVertical: 5,
		borderRadius: 999,
		backgroundColor: '#F9A826',
	},
	categoryBadgeText: {
		fontSize: 11,
		fontWeight: '800',
		color: '#FFFFFF',
	},
	serviceCardFooter: {
		paddingHorizontal: 16,
		paddingVertical: 14,
	},
	serviceCardTitle: {
		fontSize: 20,
		fontWeight: '800',
		color: '#102A4C',
	},
	titleUnderline: {
		width: 74,
		height: 4,
		borderRadius: 999,
		backgroundColor: '#F5B234',
		marginTop: 8,
	},
	serviceCardDescription: {
		marginTop: 10,
		fontSize: 13,
		lineHeight: 20,
		fontWeight: '500',
		color: '#334155',
	},
	viewButton: {
		marginTop: 14,
		height: 48,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#2F6570',
		borderWidth: 1,
		boxShadow: '0px 6px 10px rgba(15, 23, 42, 0.2)',
	},
	viewButtonPressed: {
		opacity: 0.9,
		transform: [{ scale: 0.98 }],
	},
	viewButtonContent: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	viewButtonText: {
		fontSize: 15,
		fontWeight: '700',
		color: '#FFFFFF',
	},
	viewButtonIconWrap: {
		width: 22,
		height: 22,
		borderRadius: 11,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(255,255,255,0.2)',
		borderWidth: 1,
	},
	loadingWrap: {
		alignItems: 'center',
		paddingTop: 48,
		paddingBottom: 24,
		gap: 10,
	},
	loadingText: {
		fontSize: 14,
		fontWeight: '600',
		color: '#475569',
	},
	emptyStateCard: {
		padding: 14,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#E2E8F0',
		backgroundColor: '#FFFFFF',
	},
	emptyStateTitle: {
		fontSize: 15,
		fontWeight: '800',
		color: '#0F172A',
	},
	emptyStateText: {
		marginTop: 4,
		fontSize: 13,
		fontWeight: '500',
		color: '#64748B',
	},
});
