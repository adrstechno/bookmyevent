import Ionicons from '@expo/vector-icons/Ionicons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppMenuDrawer from '@/components/layout/AppMenuDrawer';
import { ThemedText } from '@/components/themed-text';
import { useAppDispatch, useAppSelector } from '@/store';
import { signOut, updateProfile } from '@/store/slices/authSlice';
import { useSettingsTheme } from '@/theme/settingsTheme';
import { getUserProfile } from '@/services/auth/profileApi';

type ProfileState = {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
};

const QUICK_ACTIONS = [
	{ key: 'bookings', label: 'Bookings', icon: 'calendar-outline' },
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
	const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
	const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
	const [profile, setProfile] = useState<ProfileState>({
		firstName: (authName || 'Guest').split(' ')[0] || 'Guest',
		lastName: (authName || '').split(' ').slice(1).join(' '),
		email: authEmail || 'guest@example.com',
		phone: '',
	});

	// Fetch real profile from backend on mount — gets accurate first/last name
	useEffect(() => {
		if (!isAuthenticated) return;
		void (async () => {
			try {
				const data = await getUserProfile();
				const firstName = data.first_name || (authName || 'Guest').split(' ')[0] || 'Guest';
				const lastName = data.last_name || '';
				setProfile({
					firstName,
					lastName,
					email: data.email || authEmail || '',
					phone: data.phone || '',
				});
				// Keep Redux in sync
				dispatch(updateProfile({
					name: lastName ? `${firstName} ${lastName}`.trim() : firstName,
					email: data.email,
				}));
			} catch {
				// Fallback to Redux store data silently
				setProfile({
					firstName: (authName || 'Guest').split(' ')[0] || 'Guest',
					lastName: (authName || '').split(' ').slice(1).join(' '),
					email: authEmail || '',
					phone: '',
				});
			}
		})();
	}, [isAuthenticated]);

	const onPressMenuItem = (key: string) => {
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
	};

	const onQuickAction = (key: string) => {
		if (key === 'bookings') {
			router.push('/(tabs)/bookings');
			return;
		}
		if (key === 'support') {
			router.push('/support');
			return;
		}
	};

	const confirmLogout = () => {
		void (async () => {
			setIsLogoutModalVisible(false);
			await dispatch(signOut());
			router.replace('/(auth)/login');
		})();
	};

	// Initials for avatar fallback
	const initials =
		`${profile.firstName.charAt(0)}${profile.lastName.charAt(0) || ''}`.toUpperCase() || '?';

	return (
		<SafeAreaView style={[styles.safeArea, { backgroundColor: palette.screenBg }]} edges={['top']}>
			<StatusBar style="light" />
			<ScrollView
				style={[styles.page, { backgroundColor: palette.screenBg }]}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={[styles.container, { paddingBottom: tabBarHeight + 16 }]}
			>
				{/* Hero Section */}
				<View style={[styles.heroSection, { backgroundColor: palette.tint }]}>
					<View style={styles.heroHeader}>
						<AppMenuDrawer variant="onPrimary" />
						<Pressable
							style={styles.settingsBtn}
							onPress={() => router.push('/settings')}
						>
							<Ionicons name="settings-outline" size={22} color="#FFFFFF" />
						</Pressable>
					</View>

					<View style={styles.heroContent}>
						{/* Static avatar — initials based */}
						<View style={[styles.avatarCircle, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
							<ThemedText style={styles.avatarInitials}>{initials}</ThemedText>
						</View>

						<ThemedText style={styles.heroName}>
							{profile.firstName} {profile.lastName}
						</ThemedText>
						<ThemedText style={styles.heroEmail}>{profile.email}</ThemedText>

						{profile.phone ? (
							<View style={styles.phoneChip}>
								<Ionicons name="call" size={14} color="#FFFFFF" />
								<ThemedText style={styles.phoneText}>{profile.phone}</ThemedText>
							</View>
						) : null}
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
									{ backgroundColor: palette.screenBg, borderColor: palette.border },
									pressed && styles.actionCardPressed,
								]}
								onPress={() => onQuickAction(item.key)}
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

				{/* Account Settings */}
				<View style={[styles.section, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
					<ThemedText style={[styles.sectionTitle, { color: palette.text }]}>Account Settings</ThemedText>
					{MENU_ITEMS.map((item, index) => (
						<Pressable
							key={item.key}
							style={({ pressed }) => [
								styles.menuItem,
								index !== MENU_ITEMS.length - 1 && [styles.menuDivider, { borderBottomColor: palette.border }],
								pressed && styles.menuItemPressed,
							]}
							onPress={() => onPressMenuItem(item.key)}
						>
							<View style={[styles.menuIcon, { backgroundColor: palette.screenBg }]}>
								<Ionicons name={item.icon as any} size={20} color={palette.tint} />
							</View>
							<ThemedText style={[styles.menuLabel, { color: palette.text }]}>{item.label}</ThemedText>
							<Ionicons name="chevron-forward" size={20} color={palette.subtext} />
						</Pressable>
					))}
				</View>

				{/* Logout */}
				<Pressable
					style={({ pressed }) => [
						styles.logoutBtn,
						{ backgroundColor: palette.surfaceBg, borderColor: isDark ? '#7F1D1D' : '#FCA5A5' },
						pressed && styles.logoutBtnPressed,
						isLoading && styles.logoutBtnDisabled,
					]}
					onPress={() => setIsLogoutModalVisible(true)}
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

			{/* Logout Confirmation Modal */}
			<Modal transparent visible={isLogoutModalVisible} animationType="fade" onRequestClose={() => setIsLogoutModalVisible(false)}>
				<View style={styles.logoutModalOverlay}>
					<Pressable style={StyleSheet.absoluteFillObject} onPress={() => setIsLogoutModalVisible(false)} />
					<View style={[styles.logoutModalCard, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
						<View style={[styles.logoutModalIconWrap, { backgroundColor: isDark ? 'rgba(248,113,113,0.12)' : '#FEF2F2' }]}>
							<Ionicons name="log-out-outline" size={22} color={isDark ? '#FCA5A5' : '#B91C1C'} />
						</View>
						<ThemedText style={[styles.logoutModalTitle, { color: palette.text }]}>
							Logout from your account?
						</ThemedText>
						<ThemedText style={[styles.logoutModalSubtitle, { color: palette.subtext }]}>
							You can sign back in anytime. Your session will end on this device.
						</ThemedText>
						<View style={styles.logoutModalActions}>
							<Pressable
								style={[styles.logoutModalButton, { backgroundColor: palette.headerBtnBg, borderColor: palette.border }]}
								onPress={() => setIsLogoutModalVisible(false)}
							>
								<ThemedText style={[styles.logoutModalSecondaryText, { color: palette.text }]}>Cancel</ThemedText>
							</Pressable>
							<Pressable
								style={[styles.logoutModalButton, styles.logoutModalPrimaryButton, { backgroundColor: isDark ? '#991B1B' : '#B91C1C' }]}
								onPress={confirmLogout}
							>
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
	safeArea: { flex: 1 },
	page: { flex: 1 },
	container: { gap: 16 },

	// Hero
	heroSection: {
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
		backgroundColor: 'rgba(255,255,255,0.2)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	heroContent: {
		alignItems: 'center',
		paddingTop: 16,
		gap: 8,
	},
	avatarCircle: {
		width: 100,
		height: 100,
		borderRadius: 50,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 3,
		borderColor: 'rgba(255,255,255,0.5)',
		marginBottom: 8,
	},
	avatarInitials: {
		fontSize: 36,
		fontWeight: '800',
		color: '#FFFFFF',
		letterSpacing: 1,
	},
	heroName: {
		fontSize: 24,
		fontWeight: '800',
		color: '#FFFFFF',
	},
	heroEmail: {
		fontSize: 14,
		color: 'rgba(255,255,255,0.85)',
		fontWeight: '500',
	},
	phoneChip: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		backgroundColor: 'rgba(255,255,255,0.2)',
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
		borderRadius: 20,
		padding: 16,
		marginHorizontal: 16,
		borderWidth: 1,
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
	actionsGrid: { gap: 10 },
	actionCard: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		padding: 14,
		borderRadius: 14,
		borderWidth: 1,
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
	menuItemPressed: { opacity: 0.7 },
	menuDivider: {
		borderBottomWidth: 1,
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

	// Logout
	logoutBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		marginHorizontal: 16,
		paddingVertical: 14,
		borderRadius: 14,
		borderWidth: 2,
	},
	logoutBtnPressed: {
		opacity: 0.7,
		transform: [{ scale: 0.98 }],
	},
	logoutBtnDisabled: { opacity: 0.5 },
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

	// Logout Modal
	logoutModalOverlay: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 20,
		backgroundColor: 'rgba(15,23,42,0.5)',
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
	logoutModalPrimaryButton: { borderWidth: 0 },
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
