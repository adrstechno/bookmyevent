import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useMemo, useState } from 'react';
import {
	ActivityIndicator,
	Image,
	Pressable,
	ScrollView,
	StyleSheet,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppToast } from '@/components/common/AppToastProvider';
import { ThemedText } from '@/components/themed-text';
import { useSettingsTheme } from '@/theme/settingsTheme';
import VendorAppBar from '@/components/vendor/VendorAppBar';
import { uploadVendorEventImages } from '@/services/vendor/vendorService';

interface SelectedImageItem {
	id: string;
	uri: string;
}

const MAX_IMAGES = 5;

export default function VendorGalleryScreen() {
	const { palette } = useSettingsTheme();
	const { showSuccess, showError } = useAppToast();

	const [selectedImages, setSelectedImages] = useState<SelectedImageItem[]>([]);
	const [uploading, setUploading] = useState(false);

	const styles = useMemo(() => createStyles(palette), [palette]);

	// ── Pick images from device ──────────────────────────────────
	const openImagePicker = useCallback(async () => {
		const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (permission.status !== 'granted') {
			showError('Permission is required to pick images');
			return;
		}

		const remainingSlots = MAX_IMAGES - selectedImages.length;
		if (remainingSlots <= 0) {
			showError(`You can upload up to ${MAX_IMAGES} images only.`);
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

		setSelectedImages((prev) => [...prev, ...picked].slice(0, MAX_IMAGES));
	}, [selectedImages.length, showError]);

	// ── Remove selected image before upload ─────────────────────
	const removeImage = useCallback((id: string) => {
		setSelectedImages((prev) => prev.filter((item) => item.id !== id));
	}, []);

	// ── Upload to server ─────────────────────────────────────────
	const handleUpload = useCallback(async () => {
		if (selectedImages.length === 0) {
			showError('Select images first.');
			return;
		}

		setUploading(true);
		try {
			await uploadVendorEventImages(selectedImages.map((img) => img.uri));
			showSuccess('Images uploaded successfully!');
			setSelectedImages([]);
		} catch (err: unknown) {
			const msg = (err as { message?: string })?.message ?? 'Failed to upload images.';
			showError(msg);
		} finally {
			setUploading(false);
		}
	}, [selectedImages, showError, showSuccess]);

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: palette.screenBg }}>
			<VendorAppBar title="Event Gallery" />

			<ScrollView
				style={styles.screen}
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				{/* ── Single upload card — same as frontend ── */}
				<View style={styles.uploadCard}>
					<ThemedText style={styles.cardTitle}>
						Upload Images{'\n'}(Max {MAX_IMAGES})
					</ThemedText>

					{/* Dashed upload area */}
					<Pressable
						style={({ pressed }) => [
							styles.uploadArea,
							{ borderColor: palette.primary, opacity: pressed ? 0.88 : 1 },
						]}
						onPress={openImagePicker}
					>
						<View style={styles.iconBubble}>
							<Ionicons name="image-outline" size={36} color={palette.primary} />
						</View>
						<ThemedText style={styles.uploadTitle}>Upload Images</ThemedText>
						<ThemedText style={styles.uploadDesc}>
							Tap to browse your photo library
						</ThemedText>
						<ThemedText style={styles.uploadHint}>
							Maximum {MAX_IMAGES} images allowed
						</ThemedText>
						<View style={styles.selectBtn}>
							<ThemedText style={styles.selectBtnText}>Select Images</ThemedText>
						</View>
					</Pressable>

					{/* Preview Grid — 2 columns same as frontend */}
					{selectedImages.length > 0 && (
						<View style={styles.previewGrid}>
							{selectedImages.map((item, index) => (
								<View key={item.id} style={styles.previewItem}>
									<Image
										source={{ uri: item.uri }}
										style={styles.previewImage}
										resizeMode="cover"
									/>
									<Pressable
										style={styles.removeBtn}
										onPress={() => removeImage(item.id)}
									>
										<ThemedText style={styles.removeBtnText}>✕</ThemedText>
									</Pressable>
									<View style={styles.previewLabel}>
										<ThemedText style={styles.previewLabelText}>
											Preview {index + 1}
										</ThemedText>
									</View>
								</View>
							))}
						</View>
					)}

					{/* Upload button — right aligned same as frontend */}
					<View style={styles.uploadBtnRow}>
						<Pressable
							style={({ pressed }) => [
								styles.uploadBtn,
								{
									backgroundColor: palette.primary,
									opacity:
										uploading || selectedImages.length === 0
											? 0.6
											: pressed
											? 0.85
											: 1,
								},
							]}
							onPress={handleUpload}
							disabled={uploading || selectedImages.length === 0}
						>
							{uploading ? (
								<ActivityIndicator size="small" color="#fff" />
							) : (
								<ThemedText style={styles.uploadBtnText}>Upload Images</ThemedText>
							)}
						</Pressable>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

function createStyles(palette: ReturnType<typeof useSettingsTheme>['palette']) {
	return StyleSheet.create({
		screen: { flex: 1 },
		content: {
			padding: 16,
			paddingBottom: 40,
		},
		uploadCard: {
			backgroundColor: palette.surfaceBg,
			borderRadius: 20,
			padding: 20,
			borderTopWidth: 4,
			borderTopColor: palette.primary,
			shadowColor: palette.shadow,
			shadowOpacity: 0.1,
			shadowRadius: 12,
			shadowOffset: { width: 0, height: 4 },
			elevation: 4,
		},
		cardTitle: {
			fontSize: 17,
			fontWeight: '700',
			color: palette.text,
			marginBottom: 16,
			paddingBottom: 12,
			borderBottomWidth: 1,
			borderBottomColor: palette.border,
		},
		uploadArea: {
			borderWidth: 2,
			borderStyle: 'dashed',
			borderRadius: 16,
			paddingVertical: 32,
			paddingHorizontal: 20,
			alignItems: 'center',
			backgroundColor: palette.elevatedBg,
		},
		iconBubble: {
			width: 72,
			height: 72,
			borderRadius: 36,
			backgroundColor: 'rgba(60,110,113,0.1)',
			alignItems: 'center',
			justifyContent: 'center',
			marginBottom: 12,
		},
		uploadTitle: {
			fontSize: 17,
			fontWeight: '700',
			color: palette.text,
			marginBottom: 6,
		},
		uploadDesc: {
			fontSize: 13,
			color: palette.muted,
			textAlign: 'center',
		},
		uploadHint: {
			fontSize: 11,
			color: palette.muted,
			marginTop: 4,
			marginBottom: 16,
		},
		selectBtn: {
			backgroundColor: palette.primary,
			paddingHorizontal: 24,
			paddingVertical: 10,
			borderRadius: 8,
		},
		selectBtnText: {
			color: '#fff',
			fontSize: 14,
			fontWeight: '600',
		},
		previewGrid: {
			flexDirection: 'row',
			flexWrap: 'wrap',
			gap: 12,
			marginTop: 20,
		},
		previewItem: {
			width: '47%',
			borderRadius: 12,
			overflow: 'hidden',
			borderWidth: 2,
			borderColor: palette.primary,
		},
		previewImage: {
			width: '100%',
			height: 160,
		},
		removeBtn: {
			position: 'absolute',
			top: 8,
			right: 8,
			backgroundColor: 'rgba(60,110,113,0.9)',
			borderRadius: 999,
			paddingHorizontal: 8,
			paddingVertical: 3,
		},
		removeBtnText: {
			color: '#fff',
			fontSize: 11,
			fontWeight: '700',
		},
		previewLabel: {
			position: 'absolute',
			bottom: 0,
			left: 0,
			right: 0,
			backgroundColor: 'rgba(0,0,0,0.3)',
			paddingVertical: 4,
			alignItems: 'center',
		},
		previewLabelText: {
			color: '#fff',
			fontSize: 11,
			fontWeight: '600',
		},
		uploadBtnRow: {
			alignItems: 'flex-end',
			marginTop: 20,
		},
		uploadBtn: {
			paddingHorizontal: 32,
			paddingVertical: 12,
			borderRadius: 10,
			minWidth: 140,
			alignItems: 'center',
		},
		uploadBtnText: {
			color: '#fff',
			fontSize: 14,
			fontWeight: '700',
		},
	});
}
