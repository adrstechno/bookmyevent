import Ionicons from '@expo/vector-icons/Ionicons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Linking, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppMenuDrawer from '@/components/layout/AppMenuDrawer';
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
	const authName = useAppSelector((state) => state.auth.name);
	const authEmail = useAppSelector((state) => state.auth.email);
	const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
	const [isImageModalVisible, setIsImageModalVisible] = useState(false);
	const [isImageUploading, setIsImageUploading] = useState(false);
	const [isCameraModalVisible, setIsCameraModalVisible] = useState(false);
	const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
	const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
	const cameraRef = useRef<CameraView | null>(null);
	const [cameraPermission, requestCameraPermission] = useCameraPermissions();
	const [profile, setProfile] = useState<ProfileState>({
		firstName: (authName || 'Guest').split(' ')[0] || 'Guest',
		lastName: (authName || '').split(' ').slice(1).join(' '),
		email: authEmail || 'guest@example.com',
		phone: '',
	});
	const [message, setMessage] = useState('');

	useEffect(() => {
		setProfile((prev) => ({
			...prev,
			firstName: (authName || prev.firstName).split(' ')[0] || prev.firstName,
			lastName: (authName || '').split(' ').slice(1).join(' ') || prev.lastName,
			email: authEmail || prev.email,
		}));
	}, [authEmail, authName]);

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
		setIsLogoutModalVisible(true);
	};

	const closeLogoutModal = () => {
		setIsLogoutModalVisible(false);
	};

	const confirmLogout = () => {
		void (async () => {
			closeLogoutModal();
			await dispatch(signOut());
			router.replace('/(auth)/login');
		})();
	};

	return (
		<SafeAreaView style={[styles.safeArea, { backgroundColor: palette.screenBg }]} edges={['top']}>
			<StatusBar style="light" />
			<ScrollView
				style={[styles.page, { backgroundColor: palette.screenBg }]}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={[styles.container, { paddingBottom: tabBarHeight + 16 }]}
			>
				{/* Hero Section with Gradient */}
				<View style={[styles.heroSection, { backgroundColor: palette.tint }]}>
					<View style={styles.heroHeader}>
						<AppMenuDrawer variant="onPrimary" />
						<Pressable 
							style={[styles.settingsBtn, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}
							onPress={() => router.push('/settings')}
						>
							<Ionicons name="settings-outline" size={22} color="#FFFFFF" />
						</Pressable>
					</View>

					<View style={styles.heroContent}>
						<View style={styles.avatarContainer}>
							{profileImageUri ? (
								<Image source={{ uri: profileImageUri }} style={styles.avatarImage} contentFit="cover" />
							) : (
								<View style={[styles.avatarCircle, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
									<Ionicons name="person" size={60} color="#FFFFFF" />
								</View>
							)}
							<Pressable 
								style={[styles.cameraBtn, { backgroundColor: '#284B63' }]}
								onPress={onAddImage}
							>
								<Ionicons name="camera" size={18} color="#FFFFFF" />
							</Pressable>
						</View>

						<ThemedText style={styles.heroName}>
							{profile.firstName} {profile.lastName}
						</ThemedText>
						<ThemedText style={styles.heroEmail}>{profile.email}</ThemedText>
						
						{profile.phone && (
							<View style={[styles.phoneChip, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
								<Ionicons name="call" size={14} color="#FFFFFF" />
								<ThemedText style={styles.phoneText}>{profile.phone}</ThemedText>
							</View>
						)}
					</View>
				</View>

				{/* Quick Actions */}
				<View style={[styles.section, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
					<ThemedText style={[styles.sectionTitle, { color: palette.text }]}>Quick Actions</ThemedText>
					<View style={styles.actionsGrid}>
						{QUICK_ACTIONS.map((item) => (
							<Pressable 
								key={item.key} 
								style={({ pressed }) => [
									styles.actionCard,
									{ 
										backgroundColor: palette.screenBg, 
										borderColor: palette.border 
									},
									pressed && styles.actionCardPressed
								]} 
								onPress={() => onQuickAction(item.key, item.label)}
							>
								<View style={[styles.actionIcon, { backgroundColor: palette.tint }]}>
									<Ionicons name={item.icon as any} size={22} color="#FFFFFF" />
								</View>
								<ThemedText style={[styles.actionLabel, { color: palette.text }]}>{item.label}</ThemedText>
								<Ionicons name="chevron-forward" size={16} color={palette.subtext} />
							</Pressable>
						))}
					</View>
				</View>

				{/* Menu Items */}
				<View style={[styles.section, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
					<ThemedText style={[styles.sectionTitle, { color: palette.text }]}>Account Settings</ThemedText>
					{MENU_ITEMS.map((item, index) => (
						<Pressable
							key={item.key}
							style={({ pressed }) => [
								styles.menuItem,
								index !== MENU_ITEMS.length - 1 && [styles.menuDivider, { borderBottomColor: palette.border }],
								pressed && styles.menuItemPressed
							]}
							onPress={() => onPressMenuItem(item.key, item.label)}
						>
							<View style={[styles.menuIcon, { backgroundColor: palette.screenBg }]}>
								<Ionicons name={item.icon as any} size={20} color={palette.tint} />
							</View>
							<ThemedText style={[styles.menuLabel, { color: palette.text }]}>{item.label}</ThemedText>
							<Ionicons name="chevron-forward" size={20} color={palette.subtext} />
						</Pressable>
					))}
				</View>

				{/* Messages */}
				{isImageUploading && (
					<View style={[styles.messageCard, { backgroundColor: '#DBEAFE', borderColor: '#93C5FD' }]}>
						<Ionicons name="cloud-upload-outline" size={16} color="#1D4ED8" />
						<ThemedText style={[styles.messageText, { color: '#1E40AF' }]}>Uploading profile image...</ThemedText>
					</View>
				)}
				{message && (
					<View style={[styles.messageCard, { backgroundColor: '#D1FAE5', borderColor: '#86EFAC' }]}>
						<Ionicons name="checkmark-circle" size={16} color="#059669" />
						<ThemedText style={[styles.messageText, { color: '#047857' }]}>{message}</ThemedText>
					</View>
				)}

				{/* Logout Button */}
				<Pressable 
					style={({ pressed }) => [
						styles.logoutBtn,
						{ 
							backgroundColor: palette.surfaceBg, 
							borderColor: isDark ? '#7F1D1D' : '#FCA5A5' 
						},
						pressed && styles.logoutBtnPressed,
						isLoading && styles.logoutBtnDisabled
					]} 
					onPress={onPressLogout} 
					disabled={isLoading}
				>
					<Ionicons name="log-out-outline" size={20} color={isDark ? '#FCA5A5' : '#DC2626'} />
					<ThemedText style={[styles.logoutText, { color: isDark ? '#FCA5A5' : '#DC2626' }]}>
						{isLoading ? 'Logging out...' : 'Logout'}
					</ThemedText>
				</Pressable>

				<ThemedText style={[styles.footerText, { color: palette.subtext }]}>
					GoEventify Customer App v1.0
				</ThemedText>
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

			<Modal transparent visible={isLogoutModalVisible} animationType="fade" onRequestClose={closeLogoutModal}>
				<View style={styles.logoutModalOverlay}>
					<Pressable style={styles.logoutModalBackdrop} onPress={closeLogoutModal} />
					<View style={[styles.logoutModalCard, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
						<View style={[styles.logoutModalIconWrap, { backgroundColor: isDark ? 'rgba(248, 113, 113, 0.12)' : '#FEF2F2' }]}>
							<Ionicons name="log-out-outline" size={22} color={isDark ? '#FCA5A5' : '#B91C1C'} />
						</View>
						<ThemedText style={[styles.logoutModalTitle, { color: palette.text }]}>Logout from your account?</ThemedText>
						<ThemedText style={[styles.logoutModalSubtitle, { color: palette.subtext }]}>You can sign back in anytime. Your session will end on this device.</ThemedText>

						<View style={styles.logoutModalActions}>
							<Pressable style={[styles.logoutModalButton, styles.logoutModalSecondaryButton, { backgroundColor: palette.headerBtnBg, borderColor: palette.border }]} onPress={closeLogoutModal}>
								<ThemedText style={[styles.logoutModalSecondaryText, { color: palette.text }]}>Cancel</ThemedText>
							</Pressable>
							<Pressable style={[styles.logoutModalButton, styles.logoutModalPrimaryButton, { backgroundColor: isDark ? '#991B1B' : '#B91C1C' }]} onPress={confirmLogout}>
								<ThemedText style={styles.logoutModalPrimaryText}>Logout</ThemedText>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#F3F7F6',
	},
	page: {
		flex: 1,
		backgroundColor: '#F3F7F6',
	},
	container: {
		gap: 16,
	},
	// Hero Section
	heroSection: {
		backgroundColor: '#3C6E71',
		paddingBottom: 32,
		borderBottomLeftRadius: 32,
		borderBottomRightRadius: 32,
	},
	heroHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingTop: 16,
		paddingBottom: 8,
	},
	settingsBtn: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	heroContent: {
		alignItems: 'center',
		paddingTop: 16,
		gap: 8,
	},
	avatarContainer: {
		position: 'relative',
		marginBottom: 8,
	},
	avatarImage: {
		width: 120,
		height: 120,
		borderRadius: 60,
		borderWidth: 4,
		borderColor: '#FFFFFF',
	},
	avatarCircle: {
		width: 120,
		height: 120,
		borderRadius: 60,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 4,
		borderColor: '#FFFFFF',
	},
	cameraBtn: {
		position: 'absolute',
		right: 0,
		bottom: 0,
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: '#284B63',
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 3,
		borderColor: '#FFFFFF',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	heroName: {
		fontSize: 24,
		fontWeight: '800',
		color: '#FFFFFF',
	},
	heroEmail: {
		fontSize: 14,
		color: 'rgba(255, 255, 255, 0.85)',
		fontWeight: '500',
	},
	phoneChip: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 20,
		marginTop: 4,
	},
	phoneText: {
		fontSize: 13,
		fontWeight: '700',
		color: '#FFFFFF',
	},
	// Sections
	section: {
		backgroundColor: '#FFFFFF',
		borderRadius: 20,
		padding: 16,
		marginHorizontal: 16,
		borderWidth: 1,
		borderColor: '#E2E8F0',
		shadowColor: '#0F172A',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.06,
		shadowRadius: 8,
		elevation: 2,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: '800',
		marginBottom: 12,
	},
	// Quick Actions
	actionsGrid: {
		gap: 10,
	},
	actionCard: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		padding: 14,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: '#E2E8F0',
	},
	actionCardPressed: {
		opacity: 0.7,
		transform: [{ scale: 0.98 }],
	},
	actionIcon: {
		width: 44,
		height: 44,
		borderRadius: 22,
		alignItems: 'center',
		justifyContent: 'center',
	},
	actionLabel: {
		flex: 1,
		fontSize: 15,
		fontWeight: '700',
	},
	// Menu Items
	menuItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		paddingVertical: 14,
	},
	menuItemPressed: {
		opacity: 0.7,
	},
	menuDivider: {
		borderBottomWidth: 1,
		borderBottomColor: '#F1F5F9',
	},
	menuIcon: {
		width: 44,
		height: 44,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
	},
	menuLabel: {
		flex: 1,
		fontSize: 15,
		fontWeight: '700',
	},
	// Messages
	messageCard: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderRadius: 12,
		marginHorizontal: 16,
		borderWidth: 1,
	},
	messageText: {
		fontSize: 13,
		fontWeight: '600',
		flex: 1,
	},
	// Logout Button
	logoutBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		marginHorizontal: 16,
		paddingVertical: 14,
		borderRadius: 14,
		borderWidth: 2,
		backgroundColor: '#FFFFFF',
	},
	logoutBtnPressed: {
		opacity: 0.7,
		transform: [{ scale: 0.98 }],
	},
	logoutBtnDisabled: {
		opacity: 0.5,
	},
	logoutText: {
		fontSize: 15,
		fontWeight: '800',
	},
	footerText: {
		fontSize: 12,
		textAlign: 'center',
		paddingVertical: 8,
		marginHorizontal: 16,
	},
	// Modals
	modalOverlay: {
		flex: 1,
		justifyContent: 'flex-end',
		backgroundColor: 'rgba(15, 23, 42, 0.5)',
	},
	modalBackdrop: {
		...StyleSheet.absoluteFillObject,
	},
	imageModalCard: {
		backgroundColor: '#FFFFFF',
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		paddingHorizontal: 20,
		paddingTop: 20,
		paddingBottom: 32,
		gap: 12,
		borderTopWidth: 1,
		borderTopColor: '#E2E8F0',
	},
	imageModalTitle: {
		fontSize: 20,
		fontWeight: '800',
		color: '#0F172A',
	},
	imageModalSubtitle: {
		fontSize: 13,
		fontWeight: '500',
		color: '#64748B',
		marginBottom: 8,
	},
	imageModalAction: {
		height: 52,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: '#E2E8F0',
		backgroundColor: '#F8FAFC',
		paddingHorizontal: 16,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	imageModalActionText: {
		fontSize: 15,
		fontWeight: '700',
		color: '#1E293B',
	},
	imageModalActionDangerText: {
		fontSize: 15,
		fontWeight: '700',
		color: '#DC2626',
	},
	imageModalCancelBtn: {
		height: 52,
		borderRadius: 14,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#3C6E71',
		marginTop: 8,
	},
	imageModalCancelText: {
		fontSize: 15,
		fontWeight: '800',
		color: '#FFFFFF',
	},
	// Camera Modal
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
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: 'rgba(148,163,184,0.3)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	cameraHeaderTitle: {
		fontSize: 17,
		fontWeight: '800',
		color: '#FFFFFF',
	},
	cameraHeaderPlaceholder: {
		width: 40,
		height: 40,
	},
	cameraPreviewWrap: {
		flex: 1,
		marginHorizontal: 16,
		borderRadius: 24,
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
		height: 120,
		paddingHorizontal: 20,
		paddingTop: 20,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 12,
	},
	captureBtnOuter: {
		width: 80,
		height: 80,
		borderRadius: 40,
		borderWidth: 5,
		borderColor: 'rgba(255,255,255,0.9)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	captureBtnInner: {
		width: 64,
		height: 64,
		borderRadius: 32,
		backgroundColor: '#FFFFFF',
	},
	cameraPrimaryBtn: {
		flex: 1,
		height: 50,
		borderRadius: 14,
		backgroundColor: '#3C6E71',
		alignItems: 'center',
		justifyContent: 'center',
	},
	cameraPrimaryBtnText: {
		fontSize: 15,
		fontWeight: '800',
		color: '#FFFFFF',
	},
	cameraSecondaryBtn: {
		flex: 1,
		height: 50,
		borderRadius: 14,
		borderWidth: 2,
		borderColor: '#94A3B8',
		backgroundColor: 'rgba(255,255,255,0.15)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	cameraSecondaryBtnText: {
		fontSize: 15,
		fontWeight: '800',
		color: '#FFFFFF',
	},
	// Logout Modal
	logoutModalOverlay: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 20,
		backgroundColor: 'rgba(15, 23, 42, 0.5)',
	},
	logoutModalBackdrop: {
		...StyleSheet.absoluteFillObject,
	},
	logoutModalCard: {
		width: '100%',
		maxWidth: 380,
		borderRadius: 24,
		paddingHorizontal: 20,
		paddingTop: 24,
		paddingBottom: 20,
		borderWidth: 1,
		gap: 16,
		shadowColor: '#0F172A',
		shadowOpacity: 0.2,
		shadowOffset: { width: 0, height: 16 },
		shadowRadius: 32,
		elevation: 12,
	},
	logoutModalIconWrap: {
		width: 56,
		height: 56,
		borderRadius: 28,
		alignItems: 'center',
		justifyContent: 'center',
		alignSelf: 'center',
	},
	logoutModalTitle: {
		fontSize: 20,
		fontWeight: '800',
		textAlign: 'center',
	},
	logoutModalSubtitle: {
		fontSize: 14,
		lineHeight: 20,
		textAlign: 'center',
	},
	logoutModalActions: {
		flexDirection: 'row',
		gap: 12,
		marginTop: 4,
	},
	logoutModalButton: {
		flex: 1,
		height: 50,
		borderRadius: 14,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
	},
	logoutModalSecondaryButton: {},
	logoutModalPrimaryButton: {
		borderWidth: 0,
	},
	logoutModalSecondaryText: {
		fontSize: 15,
		fontWeight: '700',
	},
	logoutModalPrimaryText: {
		fontSize: 15,
		fontWeight: '800',
		color: '#FFFFFF',
	},
});
