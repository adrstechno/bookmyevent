import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	ActivityIndicator,
	Image,
	Modal,
	Pressable,
	RefreshControl,
	ScrollView,
	StyleSheet,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import FadeInView from '@/components/common/FadeInView';
import { useAppToast } from '@/components/common/AppToastProvider';
import { ThemedText } from '@/components/themed-text';
import { useSettingsTheme } from '@/theme/settingsTheme';
import VendorAppBar from '@/components/vendor/VendorAppBar';
import {
	fetchVendorEventImages,
	uploadVendorEventImages,
	type VendorEventImage,
} from '@/services/vendor/vendorService';

interface SelectedImageItem {
	id: string;
	uri: string;
}

export default function VendorGalleryScreen() {
	const { palette } = useSettingsTheme();
	const { showSuccess, showError } = useAppToast();

	// ── Server gallery state ─────────────────────────────────────
	const [galleryImages, setGalleryImages] = useState<VendorEventImage[]>([]);
	const [loadingGallery, setLoadingGallery] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	// ── Local selected images (before upload) ────────────────────
	const [selectedImages, setSelectedImages] = useState<SelectedImageItem[]>([]);
	const [uploading, setUploading] = useState(false);
	const [pickerOpen, setPickerOpen] = useState(false);
	const [previewImage, setPreviewImage] = useState<string | null>(null);

	const styles = useMemo(() => createStyles(palette), [palette]);

	const MAX_UPLOAD = 5;
	const galleryCount = galleryImages.length;
	const selectedCount = selectedImages.length;

	// ── Fetch gallery from API ───────────────────────────────────
	const loadGallery = useCallback(async (isRefresh = false) => {
		if (isRefresh) setRefreshing(true);
		else setLoadingGallery(true);

		try {
			const images = await fetchVendorEventImages();
			setGalleryImages(images);
		} catch (err: unknown) {
			const msg = (err as { message?: string })?.message ?? 'Failed to load gallery';
			showError(msg);
		} finally {
			setLoadingGallery(false);
			setRefreshing(false);
		}
	}, [showError]);

	useEffect(() => {
		loadGallery();
	}, [loadGallery]);

	// ── Pick images from device ──────────────────────────────────
	const openImagePicker = useCallback(async () => {
		const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (permission.status !== 'granted') {
			showError('Permission is required to pick images');
			return;
		}

		const remainingSlots = MAX_UPLOAD - selectedImages.length;
		if (remainingSlots <= 0) {
			showError(`You can select up to ${MAX_UPLOAD} images at a time`);
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsMultipleSelection: true,
			selectionLimit: remainingSlots,
			quality: 0.9,
			allowsEditing: false,
		});

		if (result.canceled) return;

		const picked = result.assets.slice(0, remainingSlots).map((asset, index) => ({
			id: `${Date.now()}-${index}`,
			uri: asset.uri,
		}));

		setSelectedImages((prev) => [...prev, ...picked].slice(0, MAX_UPLOAD));
		setPickerOpen(false);
	}, [MAX_UPLOAD, selectedImages.length, showError]);

	// ── Remove from selected (before upload) ────────────────────
	const removeSelectedImage = useCallback((id: string) => {
		setSelectedImages((prev) => prev.filter((item) => item.id !== id));
	}, []);

	// ── Upload selected images to server ────────────────────────
	const handleUpload = useCallback(async () => {
		if (selectedImages.length === 0) {
			showError('Select at least one image first');
			return;
		}

		setUploading(true);
		try {
			await uploadVendorEventImages(selectedImages.map((img) => img.uri));
			showSuccess(`${selectedImages.length} image(s) uploaded successfully`);
			setSelectedImages([]);
			// Refresh gallery from server
			await loadGallery();
		} catch (err: unknown) {
			const msg = (err as { message?: string })?.message ?? 'Failed to upload images';
			showError(msg);
		} finally {
			setUploading(false);
		}
	}, [selectedImages, showError, showSuccess, loadGallery]);

	// ── Render ───────────────────────────────────────────────────
	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: palette.screenBg }}>
			<VendorAppBar title="Event Gallery" />

			<ScrollView
				style={styles.screen}
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={() => loadGallery(true)}
						colors={[palette.primary]}
						tintColor={palette.primary}
					/>
				}
			>
				<FadeInView>
					{/* ── Hero Card ── */}
					<View style={styles.heroCard}>
						<View style={styles.heroRow}>
							<View style={styles.heroIconBubble}>
								<Ionicons name="images-outline" size={20} color="#fff" />
							</View>
							<View style={styles.heroCopyBlock}>
								<ThemedText style={styles.heroTitle}>Event Gallery</ThemedText>
								<ThemedText style={styles.heroSubtitleText}>Showcase your best event highlights</ThemedText>
							</View>
						</View>
						<View style={styles.heroMetaRow}>
							<View style={styles.heroMetaChip}>
								<ThemedText style={styles.heroMetaValue}>{galleryCount}</ThemedText>
								<ThemedText style={styles.heroMetaLabel}>Uploaded</ThemedText>
							</View>
							<View style={styles.heroMetaChip}>
								<ThemedText style={styles.heroMetaValue}>{selectedCount}</ThemedText>
								<ThemedText style={styles.heroMetaLabel}>Selected</ThemedText>
							</View>
							<View style={styles.heroMetaChip}>
								<ThemedText style={styles.heroMetaValue}>{MAX_UPLOAD}</ThemedText>
								<ThemedText style={styles.heroMetaLabel}>Max/Upload</ThemedText>
							</View>
						</View>
					</View>

					{/* ── Upload Card ── */}
					<View style={styles.uploadCard}>
						<View style={styles.sectionHeader}>
							<ThemedText style={styles.sectionTitle}>Upload Images</ThemedText>
							<ThemedText style={styles.sectionHint}>(Max {MAX_UPLOAD} per upload)</ThemedText>
						</View>

						<Pressable
							style={({ pressed }) => [
								styles.uploadArea,
								{ opacity: pressed ? 0.92 : 1, borderColor: palette.primary },
							]}
							onPress={() => setPickerOpen(true)}
						>
							<View style={styles.uploadIconBubble}>
								<Ionicons name="cloud-upload-outline" size={28} color={palette.primary} />
							</View>
							<ThemedText style={styles.uploadTitle}>Upload Images</ThemedText>
							<ThemedText style={styles.uploadDescription}>
								Tap to browse your photo library and select up to {MAX_UPLOAD} images
							</ThemedText>
							<View style={styles.uploadButton}>
								<Ionicons name="add" size={16} color="#fff" />
								<ThemedText style={styles.uploadButtonText}>Select Images</ThemedText>
							</View>
						</Pressable>

						{/* Selected previews */}
						{selectedImages.length > 0 && (
							<View style={styles.previewSection}>
								<ThemedText style={styles.previewTitle}>
									Selected ({selectedImages.length}/{MAX_UPLOAD})
								</ThemedText>
								<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.previewRow}>
									{selectedImages.map((item, index) => (
										<View key={item.id} style={styles.previewCard}>
											<Image source={{ uri: item.uri }} style={styles.previewImage} />
											<Pressable style={styles.previewRemoveButton} onPress={() => removeSelectedImage(item.id)}>
												<Ionicons name="close" size={14} color="#fff" />
											</Pressable>
											<View style={styles.previewLabelBar}>
												<ThemedText style={styles.previewLabelText}>#{index + 1}</ThemedText>
											</View>
										</View>
									))}
								</ScrollView>
							</View>
						)}

						<View style={styles.actionRow}>
							<Pressable
								style={({ pressed }) => [
									styles.secondaryButton,
									{ backgroundColor: pressed ? palette.pressedBg : palette.elevatedBg },
								]}
								onPress={() => setPickerOpen(true)}
								disabled={uploading}
							>
								<ThemedText style={[styles.secondaryButtonText, { color: palette.primary }]}>Add More</ThemedText>
							</Pressable>
							<Pressable
								style={({ pressed }) => [
									styles.primaryButton,
									{ opacity: pressed || uploading || selectedImages.length === 0 ? 0.6 : 1 },
								]}
								onPress={handleUpload}
								disabled={uploading || selectedImages.length === 0}
							>
								{uploading ? (
									<ActivityIndicator size="small" color="#fff" />
								) : (
									<ThemedText style={styles.primaryButtonText}>Upload Images</ThemedText>
								)}
							</Pressable>
						</View>
					</View>

					{/* ── Current Gallery ── */}
					<View style={styles.galleryCard}>
						<View style={styles.sectionHeader}>
							<ThemedText style={styles.sectionTitle}>Current Gallery</ThemedText>
							<ThemedText style={styles.sectionHint}>Tap to preview</ThemedText>
						</View>

						{loadingGallery ? (
							<View style={styles.galleryLoader}>
								<ActivityIndicator size="large" color={palette.primary} />
								<ThemedText style={{ color: palette.muted, marginTop: 10 }}>Loading gallery...</ThemedText>
							</View>
						) : galleryImages.length === 0 ? (
							<View style={styles.emptyGallery}>
								<Ionicons name="images-outline" size={48} color={palette.muted} />
								<ThemedText style={[styles.emptyText, { color: palette.muted }]}>
									No images yet. Upload your first event photo!
								</ThemedText>
							</View>
						) : (
							<View style={styles.galleryGrid}>
								{galleryImages.map((item, index) => (
									<Pressable
										key={String(item.imageId)}
										style={styles.galleryItem}
										onPress={() => setPreviewImage(item.imageUrl)}
									>
										<Image
											source={{ uri: item.imageUrl }}
											style={styles.galleryImage}
											resizeMode="cover"
										/>
										<View style={styles.galleryOverlay} />
										<View style={styles.galleryFooter}>
											<ThemedText style={styles.galleryIndexText}>#{index + 1}</ThemedText>
										</View>
									</Pressable>
								))}
							</View>
						)}
					</View>
				</FadeInView>
			</ScrollView>

			{/* ── Image Picker Modal ── */}
			<Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
				<View style={styles.modalOverlay}>
					<Pressable style={StyleSheet.absoluteFill} onPress={() => setPickerOpen(false)} />
					<View style={[styles.modalCard, { backgroundColor: palette.surfaceBg }]}>
						<View style={styles.modalHeader}>
							<ThemedText style={styles.modalTitle}>Select Images</ThemedText>
							<Pressable onPress={() => setPickerOpen(false)}>
								<Ionicons name="close" size={24} color={palette.text} />
							</Pressable>
						</View>
						<View style={styles.modalBody}>
							<ThemedText style={styles.modalDescription}>
								Choose photos from your device. You can select up to {MAX_UPLOAD} images before uploading.
							</ThemedText>
							<Pressable
								style={({ pressed }) => [
									styles.modalActionButton,
									{ backgroundColor: pressed ? palette.pressedBg : palette.elevatedBg },
								]}
								onPress={openImagePicker}
							>
								<Ionicons name="images-outline" size={18} color={palette.primary} />
								<ThemedText style={[styles.modalActionText, { color: palette.primary }]}>Open Photo Library</ThemedText>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>

			{/* ── Full Preview Modal ── */}
			<Modal visible={Boolean(previewImage)} transparent animationType="fade" onRequestClose={() => setPreviewImage(null)}>
				<View style={styles.previewModalOverlay}>
					<Pressable style={StyleSheet.absoluteFill} onPress={() => setPreviewImage(null)} />
					<View style={[styles.previewModalCard, { backgroundColor: palette.surfaceBg }]}>
						<Image source={{ uri: previewImage || undefined }} style={styles.previewModalImage} resizeMode="contain" />
						<Pressable style={styles.previewModalClose} onPress={() => setPreviewImage(null)}>
							<Ionicons name="close" size={20} color="#fff" />
						</Pressable>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
}

function createStyles(palette: ReturnType<typeof useSettingsTheme>['palette']) {
	return StyleSheet.create({
		headerContainer: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 12,
			paddingHorizontal: 16,
			paddingVertical: 12,
			borderBottomWidth: 1,
			borderBottomColor: palette.border,
			backgroundColor: palette.screenBg,
		},
		headerCopy: {
			flex: 1,
		},
		headerTitle: {
			fontSize: 18,
			fontWeight: '800',
			color: palette.text,
		},
		headerSubtitle: {
			fontSize: 12,
			color: palette.muted,
			marginTop: 2,
		},
		screen: {
			flex: 1,
		},
		content: {
			padding: 16,
			paddingBottom: 28,
			gap: 14,
		},
		heroCard: {
			backgroundColor: palette.primary,
			borderRadius: 20,
			padding: 16,
			shadowColor: palette.shadow,
			shadowOpacity: 0.14,
			shadowRadius: 16,
			shadowOffset: { width: 0, height: 6 },
			elevation: 4,
		},
		heroRow: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 12,
		},
		heroIconBubble: {
			width: 44,
			height: 44,
			borderRadius: 14,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: 'rgba(255,255,255,0.18)',
		},
		heroCopyBlock: {
			flex: 1,
		},
		heroTitle: {
			fontSize: 19,
			fontWeight: '800',
			color: '#fff',
		},
		heroSubtitleText: {
			fontSize: 12,
			color: 'rgba(255,255,255,0.84)',
			marginTop: 4,
		},
		heroMetaRow: {
			flexDirection: 'row',
			gap: 10,
			marginTop: 14,
		},
		heroMetaChip: {
			flex: 1,
			borderRadius: 14,
			paddingVertical: 10,
			alignItems: 'center',
			backgroundColor: 'rgba(255,255,255,0.14)',
		},
		heroMetaValue: {
			fontSize: 18,
			fontWeight: '800',
			color: '#fff',
		},
		heroMetaLabel: {
			fontSize: 11,
			fontWeight: '600',
			color: 'rgba(255,255,255,0.82)',
			marginTop: 2,
		},
		uploadCard: {
			backgroundColor: palette.surfaceBg,
			borderRadius: 18,
			padding: 14,
			borderTopWidth: 4,
			borderTopColor: palette.primary,
			shadowColor: palette.shadow,
			shadowOpacity: 0.08,
			shadowRadius: 10,
			shadowOffset: { width: 0, height: 2 },
			elevation: 3,
		},
		sectionHeader: {
			flexDirection: 'row',
			alignItems: 'baseline',
			justifyContent: 'space-between',
			marginBottom: 12,
		},
		sectionTitle: {
			fontSize: 16,
			fontWeight: '800',
			color: palette.text,
		},
		sectionHint: {
			fontSize: 12,
			color: palette.muted,
		},
		uploadArea: {
			alignItems: 'center',
			justifyContent: 'center',
			borderWidth: 1.5,
			borderStyle: 'dashed',
			borderRadius: 18,
			paddingVertical: 24,
			paddingHorizontal: 18,
			backgroundColor: palette.elevatedBg,
		},
		uploadIconBubble: {
			width: 56,
			height: 56,
			borderRadius: 18,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: 'rgba(60, 110, 113, 0.12)',
			marginBottom: 12,
		},
		uploadTitle: {
			fontSize: 17,
			fontWeight: '800',
			color: palette.text,
		},
		uploadDescription: {
			fontSize: 12,
			color: palette.muted,
			textAlign: 'center',
			lineHeight: 18,
			marginTop: 6,
			marginBottom: 14,
		},
		uploadButton: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 6,
			paddingHorizontal: 16,
			paddingVertical: 11,
			borderRadius: 12,
			backgroundColor: palette.primary,
		},
		uploadButtonText: {
			color: '#fff',
			fontSize: 13,
			fontWeight: '700',
		},
		previewSection: {
			marginTop: 16,
		},
		previewTitle: {
			fontSize: 14,
			fontWeight: '800',
			color: palette.text,
			marginBottom: 10,
		},
		previewRow: {
			gap: 10,
		},
		previewCard: {
			width: 120,
			borderRadius: 16,
			overflow: 'hidden',
			backgroundColor: palette.screenBg,
			borderWidth: 1,
			borderColor: palette.border,
		},
		previewImage: {
			width: '100%',
			height: 132,
		},
		previewRemoveButton: {
			position: 'absolute',
			top: 8,
			right: 8,
			width: 24,
			height: 24,
			borderRadius: 999,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: 'rgba(0,0,0,0.7)',
		},
		previewLabelBar: {
			position: 'absolute',
			left: 0,
			right: 0,
			bottom: 0,
			paddingVertical: 6,
			alignItems: 'center',
			backgroundColor: 'rgba(0,0,0,0.28)',
		},
		previewLabelText: {
			fontSize: 11,
			fontWeight: '700',
			color: '#fff',
		},
		actionRow: {
			flexDirection: 'row',
			gap: 12,
			marginTop: 16,
		},
		primaryButton: {
			flex: 1,
			alignItems: 'center',
			justifyContent: 'center',
			paddingVertical: 13,
			borderRadius: 12,
			backgroundColor: palette.primary,
		},
		primaryButtonText: {
			fontSize: 14,
			fontWeight: '800',
			color: '#fff',
		},
		secondaryButton: {
			width: 106,
			alignItems: 'center',
			justifyContent: 'center',
			paddingVertical: 13,
			borderRadius: 12,
		},
		secondaryButtonText: {
			fontSize: 13,
			fontWeight: '800',
		},
		galleryCard: {
			backgroundColor: palette.surfaceBg,
			borderRadius: 18,
			padding: 14,
			borderWidth: 1,
			borderColor: palette.border,
		},
		galleryGrid: {
			flexDirection: 'row',
			flexWrap: 'wrap',
			gap: 10,
		},
		galleryLoader: {
			alignItems: 'center',
			paddingVertical: 40,
		},
		emptyGallery: {
			alignItems: 'center',
			paddingVertical: 40,
			gap: 12,
		},
		emptyText: {
			fontSize: 13,
			textAlign: 'center',
			lineHeight: 20,
		},
		galleryItem: {
			width: '48%',
			aspectRatio: 1,
			borderRadius: 16,
			overflow: 'hidden',
		},
		galleryImage: {
			width: '100%',
			height: '100%',
		},
		galleryOverlay: {
			...StyleSheet.absoluteFillObject,
			backgroundColor: 'rgba(0,0,0,0.06)',
		},
		galleryFooter: {
			position: 'absolute',
			left: 0,
			right: 0,
			bottom: 0,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			paddingHorizontal: 10,
			paddingVertical: 8,
			backgroundColor: 'rgba(0,0,0,0.3)',
		},
		galleryIndexText: {
			fontSize: 11,
			fontWeight: '700',
			color: '#fff',
		},
		galleryRemoveButton: {
			width: 24,
			height: 24,
			borderRadius: 999,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: 'rgba(220,38,38,0.9)',
		},
		modalOverlay: {
			flex: 1,
			backgroundColor: 'rgba(0,0,0,0.5)',
			justifyContent: 'center',
			padding: 16,
		},
		modalCard: {
			borderRadius: 18,
			overflow: 'hidden',
		},
		modalHeader: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			paddingHorizontal: 16,
			paddingVertical: 14,
			borderBottomWidth: 1,
			borderBottomColor: palette.border,
		},
		modalTitle: {
			fontSize: 16,
			fontWeight: '800',
			color: palette.text,
		},
		modalBody: {
			padding: 16,
			gap: 14,
		},
		modalDescription: {
			fontSize: 13,
			lineHeight: 19,
			color: palette.muted,
		},
		modalActionButton: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 8,
			paddingVertical: 13,
			borderRadius: 12,
		},
		modalActionText: {
			fontSize: 14,
			fontWeight: '800',
		},
		previewModalOverlay: {
			flex: 1,
			backgroundColor: 'rgba(0,0,0,0.82)',
			justifyContent: 'center',
			padding: 16,
		},
		previewModalCard: {
			borderRadius: 18,
			overflow: 'hidden',
			position: 'relative',
		},
		previewModalImage: {
			width: '100%',
			height: 420,
		},
		previewModalClose: {
			position: 'absolute',
			top: 12,
			right: 12,
			width: 34,
			height: 34,
			borderRadius: 999,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: 'rgba(0,0,0,0.55)',
		},
	});
}