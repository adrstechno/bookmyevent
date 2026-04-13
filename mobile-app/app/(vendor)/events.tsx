import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	ActivityIndicator,
	Dimensions,
	Image,
	Modal,
	Pressable,
	RefreshControl,
	ScrollView,
	StyleSheet,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useSettingsTheme } from '@/theme/settingsTheme';
import VendorAppBar from '@/components/vendor/VendorAppBar';
import { useAppToast } from '@/components/common/AppToastProvider';
import {
	fetchVendorEventImages,
	type VendorEventImage,
} from '@/services/vendor/vendorService';

const SCREEN_WIDTH = Dimensions.get('window').width;
const ITEM_SIZE = (SCREEN_WIDTH - 16 * 2 - 8 * 2) / 3; // 3 columns, 16 padding each side, 8 gap

export default function VendorEventsScreen() {
	const { palette } = useSettingsTheme();
	const { showError } = useAppToast();

	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [images, setImages] = useState<VendorEventImage[]>([]);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);

	const styles = useMemo(() => createStyles(palette), [palette]);

	// ── Fetch event images from API ──────────────────────────────
	const loadImages = useCallback(async (isRefresh = false) => {
		if (isRefresh) setRefreshing(true);
		else setLoading(true);

		try {
			const data = await fetchVendorEventImages();
			setImages(data);
		} catch (err: unknown) {
			const msg = (err as { message?: string })?.message;
			// 404 vendor not found — show friendly message, don't crash
			if ((err as { status?: number })?.status === 404) {
				showError('Please complete your vendor profile setup first!');
			} else if ((err as { status?: number })?.status === 401) {
				showError('Please log in again.');
			} else {
				showError(msg ?? 'Failed to load events.');
			}
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	}, [showError]);

	useEffect(() => {
		loadImages();
	}, [loadImages]);

	// ── Render ───────────────────────────────────────────────────
	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: palette.screenBg }}>
			<VendorAppBar title="My Events" />

			<ScrollView
				style={styles.screen}
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={() => loadImages(true)}
						colors={[palette.primary]}
						tintColor={palette.primary}
					/>
				}
			>
				{/* Page Header */}
				<View style={styles.pageHeader}>
					<ThemedText style={styles.pageTitle}>My Events</ThemedText>
					<ThemedText style={styles.pageSubtitle}>Manage all your organized events</ThemedText>
				</View>

				{/* Loading */}
				{loading ? (
					<View style={styles.centerState}>
						<ActivityIndicator size="large" color={palette.primary} />
						<ThemedText style={styles.loadingText}>Loading events...</ThemedText>
					</View>
				) : images.length === 0 ? (
					/* Empty State */
					<View style={styles.centerState}>
						<Ionicons name="calendar-outline" size={56} color={palette.muted} />
						<ThemedText style={styles.emptyTitle}>No events found</ThemedText>
						<ThemedText style={styles.emptySubtitle}>
							Try creating your first event!
						</ThemedText>
					</View>
				) : (
					/* Image Grid — same as frontend */
					<View style={styles.grid}>
						{images.map((item, index) => (
							<Pressable
								key={`${String(item.imageId)}-${index}`}
								style={({ pressed }) => [
									styles.gridItem,
									{ opacity: pressed ? 0.85 : 1 },
								]}
								onPress={() => setSelectedImage(item.imageUrl)}
							>
								<Image
									source={{ uri: item.imageUrl }}
									style={styles.gridImage}
									resizeMode="cover"
								/>
								{/* Hover overlay — always slightly visible on mobile */}
								<View style={styles.gridOverlay}>
									<Ionicons name="eye-outline" size={20} color="#fff" />
								</View>
							</Pressable>
						))}
					</View>
				)}
			</ScrollView>

			{/* Fullscreen Lightbox Modal — same as frontend */}
			<Modal
				visible={Boolean(selectedImage)}
				transparent
				animationType="fade"
				onRequestClose={() => setSelectedImage(null)}
			>
				<Pressable
					style={styles.lightboxOverlay}
					onPress={() => setSelectedImage(null)}
				>
					{/* Close button */}
					<Pressable
						style={styles.lightboxClose}
						onPress={() => setSelectedImage(null)}
					>
						<Ionicons name="close" size={22} color="#fff" />
					</Pressable>

					{/* Full image */}
					<Pressable onPress={(e) => e.stopPropagation()}>
						<Image
							source={{ uri: selectedImage ?? undefined }}
							style={styles.lightboxImage}
							resizeMode="contain"
						/>
					</Pressable>
				</Pressable>
			</Modal>
		</SafeAreaView>
	);
}

function createStyles(palette: ReturnType<typeof useSettingsTheme>['palette']) {
	return StyleSheet.create({
		screen: {
			flex: 1,
		},
		content: {
			padding: 16,
			paddingBottom: 32,
			gap: 16,
		},
		pageHeader: {
			marginBottom: 4,
		},
		pageTitle: {
			fontSize: 22,
			fontWeight: '800',
			color: palette.text,
		},
		pageSubtitle: {
			fontSize: 13,
			color: palette.muted,
			marginTop: 4,
		},
		centerState: {
			alignItems: 'center',
			justifyContent: 'center',
			paddingVertical: 60,
			paddingHorizontal: 20,
			gap: 12,
			backgroundColor: palette.surfaceBg,
			borderRadius: 18,
			borderTopWidth: 4,
			borderTopColor: palette.primary,
		},
		loadingText: {
			fontSize: 13,
			fontWeight: '600',
			color: palette.muted,
		},
		emptyTitle: {
			fontSize: 18,
			fontWeight: '800',
			color: palette.text,
		},
		emptySubtitle: {
			fontSize: 13,
			color: palette.muted,
			textAlign: 'center',
			lineHeight: 20,
		},
		// ── Grid (same layout as frontend 3-col on mobile) ──────
		grid: {
			flexDirection: 'row',
			flexWrap: 'wrap',
			gap: 8,
		},
		gridItem: {
			width: ITEM_SIZE,
			height: ITEM_SIZE,
			borderRadius: 10,
			overflow: 'hidden',
			backgroundColor: palette.elevatedBg,
		},
		gridImage: {
			width: '100%',
			height: '100%',
		},
		gridOverlay: {
			...StyleSheet.absoluteFillObject,
			backgroundColor: 'rgba(0,0,0,0.25)',
			alignItems: 'center',
			justifyContent: 'center',
		},
		// ── Lightbox ─────────────────────────────────────────────
		lightboxOverlay: {
			flex: 1,
			backgroundColor: 'rgba(0,0,0,0.92)',
			alignItems: 'center',
			justifyContent: 'center',
			padding: 16,
		},
		lightboxClose: {
			position: 'absolute',
			top: 52,
			right: 16,
			width: 36,
			height: 36,
			borderRadius: 18,
			backgroundColor: 'rgba(255,255,255,0.2)',
			alignItems: 'center',
			justifyContent: 'center',
			zIndex: 10,
		},
		lightboxImage: {
			width: SCREEN_WIDTH - 32,
			height: SCREEN_WIDTH - 32,
			borderRadius: 12,
		},
	});
}