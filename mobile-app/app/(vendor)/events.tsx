import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useCallback, useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Dimensions,
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
	deleteVendorEventImage,
	type VendorEventImage,
} from '@/services/vendor/vendorService';

const SCREEN_WIDTH = Dimensions.get('window').width;
// 2-column grid: 16 padding each side + 10 gap between
const ITEM_WIDTH = (SCREEN_WIDTH - 16 * 2 - 10) / 2;

export default function VendorEventsScreen() {
	const { palette } = useSettingsTheme();
	const { showError, showSuccess } = useAppToast();

	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [images, setImages] = useState<VendorEventImage[]>([]);

	// Lightbox
	const [viewUrl, setViewUrl] = useState<string | null>(null);

	// Confirm delete
	const [confirmDelete, setConfirmDelete] = useState<VendorEventImage | null>(null);
	const [deletingId, setDeletingId] = useState<number | string | null>(null);

	// ── Load images ───────────────────────────────────────────────
	const loadImages = useCallback(async (isRefresh = false) => {
		isRefresh ? setRefreshing(true) : setLoading(true);
		try {
			const data = await fetchVendorEventImages();
			setImages(data);
		} catch (err: unknown) {
			const status = (err as { status?: number })?.status;
			if (status === 404) {
				showError('Please complete your vendor profile setup first!');
			} else if (status === 401) {
				showError('Please log in again.');
			} else {
				showError((err as { message?: string })?.message ?? 'Failed to load events.');
			}
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	}, [showError]);

	useEffect(() => { void loadImages(); }, [loadImages]);

	// ── Delete image ──────────────────────────────────────────────
	const handleDelete = async (image: VendorEventImage) => {
		setConfirmDelete(null);
		setDeletingId(image.imageId);
		try {
			await deleteVendorEventImage(image.imageId);
			setImages((prev) => prev.filter((img) => img.imageId !== image.imageId));
			showSuccess('Photo deleted successfully!');
		} catch (err: unknown) {
			showError((err as { message?: string })?.message ?? 'Failed to delete photo.');
		} finally {
			setDeletingId(null);
		}
	};

	return (
		<SafeAreaView style={[s.safe, { backgroundColor: palette.screenBg }]}>
			<VendorAppBar title="My Events" />

			<ScrollView
				contentContainerStyle={s.scroll}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={() => void loadImages(true)}
						tintColor={palette.primary}
					/>
				}
			>
				{/* Header */}
				<View style={s.header}>
					<View>
						<ThemedText style={[s.headerTitle, { color: palette.text }]}>My Events</ThemedText>
						<ThemedText style={[s.headerSub, { color: palette.muted }]}>
							Manage all your organized events
						</ThemedText>
					</View>
					<ThemedText style={[s.imageCount, { color: palette.muted }]}>
						{images.length} photo{images.length !== 1 ? 's' : ''}
					</ThemedText>
				</View>

				{/* Loading */}
				{loading ? (
					<View style={[s.centerState, { backgroundColor: palette.surfaceBg, borderTopColor: palette.primary }]}>
						<ActivityIndicator size="large" color={palette.primary} />
						<ThemedText style={[s.stateText, { color: palette.muted }]}>Loading events...</ThemedText>
					</View>
				) : images.length === 0 ? (
					/* Empty */
					<View style={[s.centerState, { backgroundColor: palette.surfaceBg, borderTopColor: palette.primary }]}>
						<Ionicons name="calendar-outline" size={56} color={palette.muted} />
						<ThemedText style={[s.emptyTitle, { color: palette.text }]}>No events found</ThemedText>
						<ThemedText style={[s.stateText, { color: palette.muted }]}>
							Upload photos from the Gallery tab to showcase your work.
						</ThemedText>
					</View>
				) : (
					/* Image grid — 2 columns with View + Delete buttons */
					<View style={s.grid}>
						{images.map((item) => (
							<View
								key={String(item.imageId)}
								style={[s.card, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}
							>
								{/* Image */}
								<Image
									source={{ uri: item.imageUrl }}
									style={s.cardImage}
									contentFit="cover"
								/>

								{/* Buttons row — always visible */}
								<View style={[s.btnRow, { backgroundColor: palette.surfaceBg }]}>
									{/* View */}
									<Pressable
										style={[s.btn, s.btnView]}
										onPress={() => setViewUrl(item.imageUrl)}
									>
										<Ionicons name="eye-outline" size={14} color="#FFFFFF" />
										<ThemedText style={s.btnText}>View</ThemedText>
									</Pressable>

									{/* Delete */}
									<Pressable
										style={[s.btn, s.btnDelete, { opacity: deletingId === item.imageId ? 0.5 : 1 }]}
										onPress={() => setConfirmDelete(item)}
										disabled={deletingId === item.imageId}
									>
										{deletingId === item.imageId
											? <ActivityIndicator size="small" color="#FFFFFF" />
											: <>
												<Ionicons name="trash-outline" size={14} color="#FFFFFF" />
												<ThemedText style={s.btnText}>Delete</ThemedText>
											</>
										}
									</Pressable>
								</View>
							</View>
						))}
					</View>
				)}
			</ScrollView>

			{/* Lightbox */}
			<Modal visible={!!viewUrl} transparent animationType="fade" onRequestClose={() => setViewUrl(null)}>
				<Pressable style={s.lightboxBg} onPress={() => setViewUrl(null)}>
					<Pressable style={s.lightboxClose} onPress={() => setViewUrl(null)}>
						<Ionicons name="close" size={22} color="#FFFFFF" />
					</Pressable>
					{viewUrl && (
						<Image
							source={{ uri: viewUrl }}
							style={s.lightboxImg}
							contentFit="contain"
						/>
					)}
				</Pressable>
			</Modal>

			{/* Confirm Delete Modal */}
			<Modal visible={!!confirmDelete} transparent animationType="fade" onRequestClose={() => setConfirmDelete(null)}>
				<View style={s.confirmBg}>
					<View style={[s.confirmBox, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
						<View style={s.confirmIconWrap}>
							<Ionicons name="trash-outline" size={28} color="#EF4444" />
						</View>
						<ThemedText style={[s.confirmTitle, { color: palette.text }]}>Delete Photo?</ThemedText>
						<ThemedText style={[s.confirmBody, { color: palette.subtext }]}>
							This photo will be permanently removed from your gallery.
						</ThemedText>
						<View style={s.confirmBtns}>
							<Pressable
								style={[s.confirmBtn, { backgroundColor: palette.headerBtnBg, borderColor: palette.border }]}
								onPress={() => setConfirmDelete(null)}
							>
								<ThemedText style={[s.confirmBtnText, { color: palette.text }]}>Keep</ThemedText>
							</Pressable>
							<Pressable
								style={[s.confirmBtn, s.confirmBtnRed]}
								onPress={() => confirmDelete && void handleDelete(confirmDelete)}
							>
								<Ionicons name="trash-outline" size={14} color="#FFFFFF" />
								<ThemedText style={[s.confirmBtnText, { color: '#FFFFFF' }]}>Delete</ThemedText>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
}

const s = StyleSheet.create({
	safe: { flex: 1 },
	scroll: { padding: 16, paddingBottom: 40, gap: 16 },

	// Header
	header: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		justifyContent: 'space-between',
	},
	headerTitle: { fontSize: 22, fontWeight: '800' },
	headerSub: { fontSize: 13, marginTop: 2 },
	imageCount: { fontSize: 13, fontWeight: '600', marginTop: 4 },

	// States
	centerState: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 60,
		paddingHorizontal: 20,
		gap: 12,
		borderRadius: 18,
		borderTopWidth: 4,
	},
	emptyTitle: { fontSize: 18, fontWeight: '800' },
	stateText: { fontSize: 13, textAlign: 'center', lineHeight: 20 },

	// Grid — 2 columns
	grid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 10,
	},
	card: {
		width: ITEM_WIDTH,
		borderRadius: 12,
		overflow: 'hidden',
		borderWidth: 1,
		shadowColor: '#0F172A',
		shadowOpacity: 0.06,
		shadowRadius: 6,
		shadowOffset: { width: 0, height: 2 },
		elevation: 2,
	},
	cardImage: {
		width: '100%',
		height: ITEM_WIDTH, // square
	},

	// Action buttons — always visible below image
	btnRow: {
		flexDirection: 'row',
		gap: 6,
		padding: 8,
	},
	btn: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 4,
		paddingVertical: 8,
		borderRadius: 8,
	},
	btnView: { backgroundColor: '#3B82F6' },
	btnDelete: { backgroundColor: '#EF4444' },
	btnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

	// Lightbox
	lightboxBg: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.93)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	lightboxClose: {
		position: 'absolute',
		top: 52,
		right: 20,
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: 'rgba(255,255,255,0.15)',
		alignItems: 'center',
		justifyContent: 'center',
		zIndex: 10,
	},
	lightboxImg: {
		width: SCREEN_WIDTH - 32,
		height: SCREEN_WIDTH - 32,
	},

	// Confirm delete
	confirmBg: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.45)',
		alignItems: 'center',
		justifyContent: 'center',
		padding: 24,
	},
	confirmBox: {
		width: '100%',
		maxWidth: 340,
		borderRadius: 18,
		borderWidth: 1,
		padding: 24,
		alignItems: 'center',
		gap: 10,
	},
	confirmIconWrap: {
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: '#FEE2E2',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 4,
	},
	confirmTitle: { fontSize: 18, fontWeight: '800' },
	confirmBody: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
	confirmBtns: { flexDirection: 'row', gap: 10, marginTop: 6, width: '100%' },
	confirmBtn: {
		flex: 1,
		height: 46,
		borderRadius: 12,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row',
		gap: 6,
	},
	confirmBtnRed: { backgroundColor: '#EF4444', borderColor: '#EF4444' },
	confirmBtnText: { fontSize: 14, fontWeight: '700' },
});
