import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useCallback, useState } from 'react';
import {
	ActivityIndicator,
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

const MAX_UPLOAD = 5;

export default function VendorGalleryScreen() {
	const { palette } = useSettingsTheme();
	const { showSuccess, showError } = useAppToast();

	const [selectedUris, setSelectedUris] = useState<{ id: string; uri: string }[]>([]);
	const [uploading, setUploading] = useState(false);

	// ── Pick images ───────────────────────────────────────────────
	const openImagePicker = useCallback(async () => {
		const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (permission.status !== 'granted') {
			showError('Permission is required to pick images.');
			return;
		}
		const remaining = MAX_UPLOAD - selectedUris.length;
		if (remaining <= 0) {
			showError(`You can select up to ${MAX_UPLOAD} images at a time.`);
			return;
		}
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsMultipleSelection: true,
			selectionLimit: remaining,
			quality: 0.9,
		});
		if (result.canceled) return;
		const picked = result.assets.slice(0, remaining).map((a, i) => ({
			id: `${Date.now()}-${i}`,
			uri: a.uri,
		}));
		setSelectedUris((prev) => [...prev, ...picked].slice(0, MAX_UPLOAD));
	}, [selectedUris.length, showError]);

	// ── Upload ────────────────────────────────────────────────────
	const handleUpload = useCallback(async () => {
		if (selectedUris.length === 0) { showError('Select images first.'); return; }
		setUploading(true);
		try {
			await uploadVendorEventImages(selectedUris.map((i) => i.uri));
			showSuccess('Images uploaded! Go to My Events to view them.');
			setSelectedUris([]);
		} catch (err: unknown) {
			showError((err as { message?: string })?.message ?? 'Failed to upload images.');
		} finally {
			setUploading(false);
		}
	}, [selectedUris, showError, showSuccess]);

	return (
		<SafeAreaView style={[s.safe, { backgroundColor: palette.screenBg }]}>
			<VendorAppBar title="Upload Photos" />

			<ScrollView
				contentContainerStyle={s.scroll}
				showsVerticalScrollIndicator={false}
			>
				{/* Upload Card */}
				<View style={[s.card, { backgroundColor: palette.surfaceBg, borderTopColor: palette.primary }]}>
					<ThemedText style={[s.cardTitle, { color: palette.text, borderBottomColor: palette.border }]}>
						Upload Images (Max {MAX_UPLOAD})
					</ThemedText>

					{/* Dashed pick area */}
					<Pressable
						style={({ pressed }) => [
							s.pickArea,
							{ borderColor: palette.primary, backgroundColor: palette.elevatedBg, opacity: pressed ? 0.85 : 1 },
						]}
						onPress={openImagePicker}
					>
						<View style={[s.iconBubble, { backgroundColor: 'rgba(60,110,113,0.1)' }]}>
							<Ionicons name="image-outline" size={36} color={palette.primary} />
						</View>
						<ThemedText style={[s.pickTitle, { color: palette.text }]}>Upload Images</ThemedText>
						<ThemedText style={[s.pickDesc, { color: palette.muted }]}>
							Tap to browse your photo library
						</ThemedText>
						<ThemedText style={[s.pickHint, { color: palette.muted }]}>
							Maximum {MAX_UPLOAD} images allowed
						</ThemedText>
						<View style={[s.selectBtn, { backgroundColor: palette.primary }]}>
							<ThemedText style={s.selectBtnText}>Select Images</ThemedText>
						</View>
					</Pressable>

					{/* Preview grid */}
					{selectedUris.length > 0 && (
						<View style={s.previewGrid}>
							{selectedUris.map((item, idx) => (
								<View key={item.id} style={[s.previewItem, { borderColor: palette.primary }]}>
									<Image source={{ uri: item.uri }} style={s.previewImg} contentFit="cover" />
									<Pressable
										style={[s.previewRemove, { backgroundColor: 'rgba(60,110,113,0.9)' }]}
										onPress={() => setSelectedUris((prev) => prev.filter((x) => x.id !== item.id))}
									>
										<ThemedText style={s.previewRemoveText}>✕</ThemedText>
									</Pressable>
									<View style={s.previewLabel}>
										<ThemedText style={s.previewLabelText}>Preview {idx + 1}</ThemedText>
									</View>
								</View>
							))}
						</View>
					)}

					{/* Upload button */}
					<View style={s.uploadBtnRow}>
						<Pressable
							style={[
								s.uploadBtn,
								{ backgroundColor: palette.primary, opacity: (uploading || selectedUris.length === 0) ? 0.55 : 1 },
							]}
							onPress={handleUpload}
							disabled={uploading || selectedUris.length === 0}
						>
							{uploading
								? <ActivityIndicator size="small" color="#fff" />
								: <ThemedText style={s.uploadBtnText}>Upload Images</ThemedText>
							}
						</Pressable>
					</View>
				</View>

				{/* Hint card */}
				<View style={[s.hintCard, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
					<Ionicons name="information-circle-outline" size={18} color={palette.primary} />
					<ThemedText style={[s.hintText, { color: palette.subtext }]}>
						After uploading, go to <ThemedText style={{ fontWeight: '800', color: palette.text }}>My Events</ThemedText> to view, preview, and delete your photos.
					</ThemedText>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const s = StyleSheet.create({
	safe: { flex: 1 },
	scroll: { padding: 16, paddingBottom: 40, gap: 16 },

	card: {
		borderRadius: 16,
		padding: 16,
		borderTopWidth: 4,
		shadowColor: '#0F172A',
		shadowOpacity: 0.07,
		shadowRadius: 10,
		shadowOffset: { width: 0, height: 3 },
		elevation: 3,
	},
	cardTitle: {
		fontSize: 16,
		fontWeight: '700',
		marginBottom: 14,
		paddingBottom: 12,
		borderBottomWidth: 1,
	},

	pickArea: {
		borderWidth: 2,
		borderStyle: 'dashed',
		borderRadius: 14,
		paddingVertical: 28,
		paddingHorizontal: 20,
		alignItems: 'center',
	},
	iconBubble: {
		width: 68,
		height: 68,
		borderRadius: 34,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 10,
	},
	pickTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
	pickDesc: { fontSize: 13, textAlign: 'center' },
	pickHint: { fontSize: 11, marginTop: 4, marginBottom: 14 },
	selectBtn: { paddingHorizontal: 22, paddingVertical: 9, borderRadius: 8 },
	selectBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },

	previewGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
	previewItem: { width: '47%', borderRadius: 10, overflow: 'hidden', borderWidth: 2 },
	previewImg: { width: '100%', height: 140 },
	previewRemove: {
		position: 'absolute', top: 6, right: 6,
		borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2,
	},
	previewRemoveText: { color: '#fff', fontSize: 11, fontWeight: '700' },
	previewLabel: {
		position: 'absolute', bottom: 0, left: 0, right: 0,
		backgroundColor: 'rgba(0,0,0,0.3)', paddingVertical: 4, alignItems: 'center',
	},
	previewLabelText: { color: '#fff', fontSize: 11, fontWeight: '600' },

	uploadBtnRow: { alignItems: 'flex-end', marginTop: 16 },
	uploadBtn: {
		paddingHorizontal: 28, paddingVertical: 11,
		borderRadius: 10, minWidth: 130, alignItems: 'center',
	},
	uploadBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

	hintCard: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 10,
		padding: 14,
		borderRadius: 12,
		borderWidth: 1,
	},
	hintText: { flex: 1, fontSize: 13, lineHeight: 20 },
});
