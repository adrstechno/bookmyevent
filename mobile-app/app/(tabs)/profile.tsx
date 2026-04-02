import Ionicons from '@expo/vector-icons/Ionicons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Linking, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAppDispatch, useAppSelector } from '@/store';
import { signOut } from '@/store/slices/authSlice';
import { useSettingsTheme } from '@/theme/settingsTheme';

type ProfileState = {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
};

const QUICK_ACTIONS = [
	{ key: 'bookings', label: 'Bookings', icon: 'calendar-outline' },
	{ key: 'favorites', label: 'Favorites', icon: 'heart-outline' },
	{ key: 'support', label: 'Support', icon: 'chatbubble-ellipses-outline' },
];

const MENU_ITEMS = [
	{ key: 'edit', label: 'Profile', icon: 'create-outline' },
	{ key: 'settings', label: 'Settings', icon: 'settings-outline' },
	{ key: 'about', label: 'About Us', icon: 'information-circle-outline' },
];

export default function ProfileTabScreen() {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const tabBarHeight = useBottomTabBarHeight();
	const { mode, palette } = useSettingsTheme();
	const isDark = mode === 'dark';
	const isLoading = useAppSelector((state) => state.auth.isLoading);
	const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
	const [isImageModalVisible, setIsImageModalVisible] = useState(false);
	const [isImageUploading, setIsImageUploading] = useState(false);
	const [isCameraModalVisible, setIsCameraModalVisible] = useState(false);
	const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
	const cameraRef = useRef<CameraView | null>(null);
	const [cameraPermission, requestCameraPermission] = useCameraPermissions();
	const [profile] = useState<ProfileState>({
		firstName: 'Nayan',
		lastName: 'Malviya',
		email: 'nayan@example.com',
		phone: '+91 98765 43210',
	});
	const [message, setMessage] = useState('');

	const onPressMenuItem = (key: string, label: string) => {
		if (key === 'edit') {
			router.push({
				pathname: '/profile-edit',
				params: {
					firstName: profile.firstName,
					lastName: profile.lastName,
					email: profile.email,
					phone: profile.phone,
				},
			});
			return;
		}

		if (key === 'settings') {
			router.push('/settings');
			return;
		}

		if (key === 'about') {
			router.push('/about-us');
			return;
		}

		setMessage(`${label} opened in demo mode.`);
	};

	const onQuickAction = (key: string, label: string) => {
		if (key === 'bookings') {
			router.push('/(tabs)/bookings');
			return;
		}

		if (key === 'favorites') {
			router.push('/favorites');
			return;
		}

		if (key === 'support') {
			router.push('/support');
			return;
		}

		setMessage(`${label} opened in demo mode.`);
	};

	const onAddImage = () => {
		setIsImageModalVisible(true);
	};

	const closeImageModal = () => {
		setIsImageModalVisible(false);
	};

	const onOpenCamera = () => {
		void (async () => {
			closeImageModal();

			const granted = cameraPermission?.granted ?? false;
			if (!granted) {
				const permission = await requestCameraPermission();
				if (!permission.granted) {
					Alert.alert('Permission Required', 'Camera permission is required to take profile photo.');
					return;
				}
			}

			setCapturedImageUri(null);
			setIsCameraModalVisible(true);
		})();
	};

	const closeCameraModal = () => {
		setIsCameraModalVisible(false);
		setCapturedImageUri(null);
	};

	const onCapturePhoto = () => {
		void (async () => {
			if (!cameraRef.current) {
				return;
			}

			const result = await cameraRef.current.takePictureAsync({ quality: 0.8, skipProcessing: true });
			if (!result?.uri) {
				Alert.alert('Permission Required', 'Camera permission is required to take profile photo.');
				return;
			}

			setCapturedImageUri(result.uri);
		})();
 	};

	const uploadProfileImage = async (selectedUri: string) => {
			setIsImageUploading(true);
			try {
				// Simulate upload request until backend upload endpoint is connected.
				await new Promise((resolve) => setTimeout(resolve, 900));
				setProfileImageUri(selectedUri);
				setMessage('Profile image uploaded successfully.');
			} catch {
				setMessage('Failed to upload profile image. Please try again.');
			} finally {
				setIsImageUploading(false);
			}
	};

	const onUseCapturedPhoto = () => {
		void (async () => {
			if (!capturedImageUri) {
				return;
			}

			closeCameraModal();
			await uploadProfileImage(capturedImageUri);
		})();
	};

	const onPickFromGallery = () => {
		void (async () => {
			closeImageModal();

			const existingPermission = await ImagePicker.getMediaLibraryPermissionsAsync();
			const permission =
				existingPermission.granted || !existingPermission.canAskAgain
					? existingPermission
					: await ImagePicker.requestMediaLibraryPermissionsAsync();

			if (!permission.granted) {
				Alert.alert(
					'Permission Required',
					'Storage/Photos permission is required to choose profile image.',
					[
						{ text: 'Cancel', style: 'cancel' },
						{
							text: 'Open Settings',
							onPress: () => {
								void Linking.openSettings();
							},
						},
					]
				);
				return;
			}

			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ['images'],
				allowsEditing: true,
				aspect: [1, 1],
				quality: 0.8,
			});

			if (result.canceled || !result.assets?.length) {
				return;
			}

			const selectedUri = result.assets[0].uri;
			await uploadProfileImage(selectedUri);
		})();
	};

	const onRemovePhoto = () => {
		closeImageModal();
		setProfileImageUri(null);
		setMessage('Profile image removed.');
	};

	const onPressLogout = () => {
		Alert.alert('Logout', 'Are you sure you want to logout?', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Logout',
				style: 'destructive',
				onPress: async () => {
					await dispatch(signOut());
					router.replace('/(auth)/login');
				},
			},
		]);
	};

	return (
		<SafeAreaView style={[styles.safeArea, { backgroundColor: palette.screenBg }]} edges={['top']}>
			<StatusBar style={isDark ? 'light' : 'dark'} />
			<View style={[styles.appBar, { backgroundColor: palette.surfaceBg, borderBottomColor: palette.border }]}>
				<ThemedText style={[styles.appBarTitle, { color: palette.text }]}>My Profile</ThemedText>
				<Pressable style={[styles.appBarAction, { backgroundColor: palette.headerBtnBg, borderColor: palette.border }]} onPress={() => router.push('/settings')}>
					<Ionicons name="settings-outline" size={19} color={palette.text} />
				</Pressable>
			</View>
			<ScrollView
				style={[styles.page, { backgroundColor: palette.screenBg }]}
				showsVerticalScrollIndicator={false}
				bounces={false}
				overScrollMode="never"
				contentContainerStyle={[styles.container, { paddingBottom: tabBarHeight + 6 }]}
			>
				<View style={[styles.profileCard, { backgroundColor: palette.surfaceBg, borderColor: palette.border, borderTopColor: palette.tint }]}>
					<ThemedText style={[styles.profileCardTitle, { color: palette.text, borderBottomColor: palette.border }]}>Profile Details</ThemedText>
					<View style={styles.profileCenterBlock}>
						<View style={styles.avatarWrap}>
							{profileImageUri ? (
								<Image source={{ uri: profileImageUri }} style={styles.avatarImage} contentFit="cover" />
							) : (
								<View style={[styles.avatarCircle, { backgroundColor: palette.headerBtnBg, borderColor: palette.tint }]}>
									<Ionicons name="person" size={54} color={palette.subtext} />
								</View>
							)}
							<Pressable style={[styles.addImageBtn, { backgroundColor: palette.tint, borderColor: palette.surfaceBg }]} onPress={onAddImage}>
								<Ionicons name="camera" size={14} color="#FFFFFF" />
							</Pressable>
						</View>

						<View style={styles.profileMeta}>
							<ThemedText style={[styles.profileName, { color: palette.text }]}>
								{profile.firstName} {profile.lastName}
							</ThemedText>
							<ThemedText style={[styles.profileEmail, { color: palette.subtext }]}>{profile.email}</ThemedText>
						</View>
					</View>

					<View style={styles.infoPillRow}>
						<View style={[styles.infoPill, { backgroundColor: isDark ? palette.pressedBg : '#ECFEFF', borderColor: palette.border }]}>
							<Ionicons name="call-outline" size={14} color={palette.tint} />
							<ThemedText style={[styles.infoPillText, { color: palette.tint }]}>{profile.phone}</ThemedText>
						</View>
					</View>
				</View>

				<View style={[styles.sectionCard, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
					<ThemedText style={[styles.sectionTitle, { color: palette.text }]}>Quick Actions</ThemedText>
					<View style={styles.quickGrid}>
						{QUICK_ACTIONS.map((item) => (
							<Pressable key={item.key} style={[styles.quickItem, { backgroundColor: palette.headerBtnBg, borderColor: palette.border }]} onPress={() => onQuickAction(item.key, item.label)}>
								<View style={[styles.quickIconWrap, { backgroundColor: palette.pressedBg }]}>
									<Ionicons name={item.icon as any} size={18} color={palette.tint} />
								</View>
								<ThemedText style={[styles.quickLabel, { color: palette.text }]}>{item.label}</ThemedText>
							</Pressable>
						))}
					</View>
				</View>

				<View style={[styles.sectionCard, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
					{MENU_ITEMS.map((item, index) => (
						<Pressable
							key={item.key}
							style={[styles.menuRow, index !== MENU_ITEMS.length - 1 ? [styles.menuDivider, { borderBottomColor: palette.border }] : null]}
							onPress={() => onPressMenuItem(item.key, item.label)}
						>
							<View style={styles.menuLeft}>
								<View style={[styles.menuIconWrap, { backgroundColor: palette.pressedBg }]}>
									<Ionicons name={item.icon as any} size={17} color={palette.tint} />
								</View>
								<ThemedText style={[styles.menuText, { color: palette.text }]}>{item.label}</ThemedText>
							</View>
							<Ionicons name="chevron-forward" size={18} color={palette.subtext} />
						</Pressable>
					))}
				</View>

				{isImageUploading ? <ThemedText style={[styles.messageText, { color: palette.tint }]}>Uploading profile image...</ThemedText> : null}
				{message ? <ThemedText style={[styles.messageText, { color: palette.tint }]}>{message}</ThemedText> : null}

				<Pressable style={[styles.logoutBtn, { backgroundColor: palette.surfaceBg, borderColor: isDark ? '#7F1D1D' : '#FECACA' }, isLoading ? styles.logoutBtnDisabled : null]} onPress={onPressLogout} disabled={isLoading}>
					<Ionicons name="log-out-outline" size={17} color={isDark ? '#FCA5A5' : '#B91C1C'} />
					<ThemedText style={[styles.logoutText, { color: isDark ? '#FCA5A5' : '#B91C1C' }]}>{isLoading ? 'Logging out...' : 'Logout'}</ThemedText>
				</Pressable>

				<ThemedText style={[styles.footerText, { color: palette.subtext }]}>GoEventify Customer App v1.0</ThemedText>
			</ScrollView>

			<Modal transparent visible={isImageModalVisible} animationType="fade" onRequestClose={closeImageModal}>
				<View style={styles.modalOverlay}>
					<Pressable style={styles.modalBackdrop} onPress={closeImageModal} />
					<View style={[styles.imageModalCard, { backgroundColor: palette.surfaceBg, borderTopColor: palette.border }]}>
						<ThemedText style={[styles.imageModalTitle, { color: palette.text }]}>Add Profile Image</ThemedText>
						<ThemedText style={[styles.imageModalSubtitle, { color: palette.subtext }]}>Choose how you want to update your profile photo.</ThemedText>

						<Pressable style={[styles.imageModalAction, { borderColor: palette.border, backgroundColor: palette.headerBtnBg }]} onPress={onOpenCamera}>
							<Ionicons name="camera-outline" size={18} color={palette.tint} />
							<ThemedText style={[styles.imageModalActionText, { color: palette.text }]}>Take Photo</ThemedText>
						</Pressable>

						<Pressable style={[styles.imageModalAction, { borderColor: palette.border, backgroundColor: palette.headerBtnBg }]} onPress={onPickFromGallery}>
							<Ionicons name="images-outline" size={18} color={palette.tint} />
							<ThemedText style={[styles.imageModalActionText, { color: palette.text }]}>Choose From Gallery</ThemedText>
						</Pressable>

						<Pressable style={styles.imageModalAction} onPress={onRemovePhoto}>
							<Ionicons name="trash-outline" size={18} color="#B91C1C" />
							<ThemedText style={styles.imageModalActionDangerText}>Remove Current Photo</ThemedText>
						</Pressable>

						<Pressable style={styles.imageModalCancelBtn} onPress={closeImageModal}>
							<ThemedText style={styles.imageModalCancelText}>Cancel</ThemedText>
						</Pressable>
					</View>
				</View>
			</Modal>

			<Modal visible={isCameraModalVisible} animationType="slide" onRequestClose={closeCameraModal}>
				<SafeAreaView style={styles.cameraScreen} edges={['top', 'bottom']}>
					<View style={styles.cameraHeader}>
						<Pressable style={styles.cameraHeaderBtn} onPress={closeCameraModal}>
							<Ionicons name="close" size={20} color="#FFFFFF" />
						</Pressable>
						<ThemedText style={styles.cameraHeaderTitle}>Take Profile Photo</ThemedText>
						<View style={styles.cameraHeaderPlaceholder} />
					</View>

					<View style={styles.cameraPreviewWrap}>
						{capturedImageUri ? (
							<Image source={{ uri: capturedImageUri }} style={styles.cameraPreviewImage} contentFit="cover" />
						) : (
							<CameraView ref={cameraRef} style={styles.cameraPreview} facing="front" />
						)}
					</View>

					<View style={styles.cameraFooter}>
						{capturedImageUri ? (
							<>
								<Pressable style={styles.cameraSecondaryBtn} onPress={() => setCapturedImageUri(null)}>
									<ThemedText style={styles.cameraSecondaryBtnText}>Retake</ThemedText>
								</Pressable>
								<Pressable style={styles.cameraPrimaryBtn} onPress={onUseCapturedPhoto}>
									<ThemedText style={styles.cameraPrimaryBtnText}>Use Photo</ThemedText>
								</Pressable>
							</>
						) : (
							<Pressable style={styles.captureBtnOuter} onPress={onCapturePhoto}>
								<View style={styles.captureBtnInner} />
							</Pressable>
						)}
					</View>
				</SafeAreaView>
			</Modal>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#F3F7F6',
	},
	appBar: {
		height: 56,
		paddingHorizontal: 16,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: '#FFFFFF',
		borderBottomWidth: 1,
		borderBottomColor: '#E2E8F0',
	},
	appBarTitle: {
		fontSize: 20,
		fontWeight: '800',
		color: '#0F172A',
	},
	appBarAction: {
		width: 34,
		height: 34,
		borderRadius: 17,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#F8FAFC',
		borderWidth: 1,
		borderColor: '#E2E8F0',
	},
	page: {
		flex: 1,
		backgroundColor: '#F3F7F6',
	},
	container: {
		paddingHorizontal: 16,
		paddingTop: 10,
		gap: 10,
	},
	profileCard: {
		borderRadius: 22,
		padding: 14,
		gap: 10,
		backgroundColor: '#FFFFFF',
		borderTopWidth: 4,
		borderTopColor: '#3C6E71',
		borderWidth: 1,
		borderColor: '#DCE5E8',
		shadowColor: '#0F172A',
		shadowOpacity: 0.07,
		shadowOffset: { width: 0, height: 8 },
		shadowRadius: 14,
		elevation: 5,
	},
	profileCardTitle: {
		fontSize: 17,
		fontWeight: '800',
		color: '#1E293B',
		paddingBottom: 8,
		borderBottomWidth: 1,
		borderBottomColor: '#EEF2F7',
	},
	profileCenterBlock: {
		alignItems: 'center',
		justifyContent: 'center',
		gap: 10,
	},
	avatarWrap: {
		position: 'relative',
	},
	avatarImage: {
		width: 112,
		height: 112,
		borderRadius: 56,
		borderWidth: 4,
		borderColor: '#3C6E71',
	},
	avatarCircle: {
		width: 112,
		height: 112,
		borderRadius: 56,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#F8FAFC',
		borderWidth: 4,
		borderColor: '#3C6E71',
	},
	addImageBtn: {
		position: 'absolute',
		right: 2,
		bottom: 2,
		width: 30,
		height: 30,
		borderRadius: 15,
		backgroundColor: '#3C6E71',
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 2,
		borderColor: '#FFFFFF',
	},
	profileMeta: {
		alignItems: 'center',
		gap: 2,
	},
	profileName: {
		fontSize: 22,
		fontWeight: '800',
		color: '#1E293B',
	},
	profileEmail: {
		fontSize: 14,
		color: '#64748B',
	},
	infoPillRow: {
		flexDirection: 'row',
		gap: 8,
	},
	infoPill: {
		flex: 1,
		borderRadius: 12,
		paddingHorizontal: 10,
		paddingVertical: 8,
		backgroundColor: '#ECFEFF',
		borderWidth: 1,
		borderColor: '#CCFBF1',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 6,
	},
	infoPillText: {
		fontSize: 12,
		fontWeight: '700',
		color: '#0F766E',
	},
	sectionCard: {
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		padding: 10,
		borderWidth: 1,
		borderColor: '#E2E8F0',
	},
	sectionTitle: {
		fontSize: 15,
		fontWeight: '800',
		color: '#1E293B',
		marginBottom: 10,
	},
	quickGrid: {
		flexDirection: 'row',
		gap: 8,
	},
	quickItem: {
		flex: 1,
		backgroundColor: '#F8FAFC',
		borderWidth: 1,
		borderColor: '#E2E8F0',
		borderRadius: 12,
		paddingVertical: 10,
		alignItems: 'center',
		justifyContent: 'center',
		gap: 6,
	},
	quickIconWrap: {
		width: 30,
		height: 30,
		borderRadius: 15,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#D1FAE5',
	},
	quickLabel: {
		fontSize: 12,
		fontWeight: '700',
		color: '#334155',
	},
	menuRow: {
		paddingVertical: 10,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	menuDivider: {
		borderBottomWidth: 1,
		borderBottomColor: '#F1F5F9',
	},
	menuLeft: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
	},
	menuIconWrap: {
		width: 30,
		height: 30,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#ECFEFF',
	},
	menuText: {
		fontSize: 15,
		fontWeight: '700',
		color: '#334155',
	},
	messageText: {
		fontSize: 13,
		fontWeight: '700',
		color: '#0F766E',
		paddingHorizontal: 2,
	},
	logoutBtn: {
		marginTop: 4,
		borderRadius: 12,
		paddingVertical: 12,
		backgroundColor: '#FFFFFF',
		borderWidth: 1,
		borderColor: '#FECACA',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
	},
	logoutBtnDisabled: {
		opacity: 0.7,
	},
	logoutText: {
		color: '#B91C1C',
		fontSize: 14,
		fontWeight: '700',
	},
	footerText: {
		fontSize: 12,
		textAlign: 'center',
		color: '#94A3B8',
		paddingTop: 4,
	},
	modalOverlay: {
		flex: 1,
		justifyContent: 'flex-end',
		backgroundColor: 'rgba(15, 23, 42, 0.36)',
	},
	modalBackdrop: {
		...StyleSheet.absoluteFillObject,
	},
	imageModalCard: {
		backgroundColor: '#FFFFFF',
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		paddingHorizontal: 16,
		paddingTop: 14,
		paddingBottom: 20,
		gap: 10,
		borderTopWidth: 1,
		borderTopColor: '#E2E8F0',
	},
	imageModalTitle: {
		fontSize: 17,
		fontWeight: '800',
		color: '#0F172A',
	},
	imageModalSubtitle: {
		fontSize: 12,
		fontWeight: '600',
		color: '#64748B',
		marginBottom: 4,
	},
	imageModalAction: {
		height: 44,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#E2E8F0',
		backgroundColor: '#F8FAFC',
		paddingHorizontal: 12,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
	},
	imageModalActionText: {
		fontSize: 14,
		fontWeight: '700',
		color: '#1E293B',
	},
	imageModalActionDangerText: {
		fontSize: 14,
		fontWeight: '700',
		color: '#B91C1C',
	},
	imageModalCancelBtn: {
		height: 44,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#0F766E',
		marginTop: 2,
	},
	imageModalCancelText: {
		fontSize: 14,
		fontWeight: '800',
		color: '#FFFFFF',
	},
	cameraScreen: {
		flex: 1,
		backgroundColor: '#020617',
	},
	cameraHeader: {
		height: 56,
		paddingHorizontal: 16,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	cameraHeaderBtn: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: 'rgba(148,163,184,0.28)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	cameraHeaderTitle: {
		fontSize: 16,
		fontWeight: '800',
		color: '#FFFFFF',
	},
	cameraHeaderPlaceholder: {
		width: 36,
		height: 36,
	},
	cameraPreviewWrap: {
		flex: 1,
		marginHorizontal: 14,
		borderRadius: 20,
		overflow: 'hidden',
		backgroundColor: '#0F172A',
	},
	cameraPreview: {
		flex: 1,
	},
	cameraPreviewImage: {
		flex: 1,
	},
	cameraFooter: {
		height: 112,
		paddingHorizontal: 20,
		paddingTop: 16,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 12,
	},
	captureBtnOuter: {
		width: 76,
		height: 76,
		borderRadius: 38,
		borderWidth: 4,
		borderColor: 'rgba(255,255,255,0.9)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	captureBtnInner: {
		width: 58,
		height: 58,
		borderRadius: 29,
		backgroundColor: '#FFFFFF',
	},
	cameraPrimaryBtn: {
		flex: 1,
		height: 46,
		borderRadius: 12,
		backgroundColor: '#0F766E',
		alignItems: 'center',
		justifyContent: 'center',
	},
	cameraPrimaryBtnText: {
		fontSize: 14,
		fontWeight: '800',
		color: '#FFFFFF',
	},
	cameraSecondaryBtn: {
		flex: 1,
		height: 46,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#94A3B8',
		backgroundColor: 'rgba(255,255,255,0.1)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	cameraSecondaryBtnText: {
		fontSize: 14,
		fontWeight: '800',
		color: '#FFFFFF',
	},
});
