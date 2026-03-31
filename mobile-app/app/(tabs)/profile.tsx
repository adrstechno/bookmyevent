import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAppDispatch, useAppSelector } from '@/store';
import { signOut } from '@/store/slices/authSlice';

type ProfileState = {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	city: string;
};

const QUICK_ACTIONS = [
	{ key: 'bookings', label: 'Bookings', icon: 'calendar-outline' },
	{ key: 'favorites', label: 'Favorites', icon: 'heart-outline' },
	{ key: 'support', label: 'Support', icon: 'chatbubble-ellipses-outline' },
];

const MENU_ITEMS = [
	{ key: 'edit', label: 'Profile', icon: 'create-outline' },
	{ key: 'settings', label: 'Settings', icon: 'settings-outline' },
	{ key: 'address', label: 'Address', icon: 'location-outline' },
	{ key: 'about', label: 'About Us', icon: 'information-circle-outline' },
];

export default function ProfileTabScreen() {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const tabBarHeight = useBottomTabBarHeight();
	const isLoading = useAppSelector((state) => state.auth.isLoading);
	const [profileImageUri] = useState<string | null>(null);
	const [profile] = useState<ProfileState>({
		firstName: 'Nayan',
		lastName: 'Malviya',
		email: 'nayan@example.com',
		phone: '+91 98765 43210',
		city: 'Indore',
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
					city: profile.city,
				},
			});
			return;
		}

		setMessage(`${label} opened in demo mode.`);
	};

	const onQuickAction = (key: string, label: string) => {
		if (key === 'bookings') {
			router.push('/(tabs)/bookings');
			return;
		}

		if (key === 'support') {
			router.push('/support');
			return;
		}

		setMessage(`${label} opened in demo mode.`);
	};

	const onAddImage = () => {
		setMessage('Add image action opened in demo mode.');
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
		<SafeAreaView style={styles.safeArea} edges={['top']}>
			<StatusBar style="dark" />
			<ScrollView
				style={styles.page}
				showsVerticalScrollIndicator={false}
				bounces={false}
				overScrollMode="never"
				contentContainerStyle={[styles.container, { paddingBottom: tabBarHeight + 6 }]}
			>
				<View style={styles.profileCard}>
					<ThemedText style={styles.profileCardTitle}>Profile Details</ThemedText>
					<View style={styles.profileCenterBlock}>
						<View style={styles.avatarWrap}>
							{profileImageUri ? (
								<Image source={{ uri: profileImageUri }} style={styles.avatarImage} contentFit="cover" />
							) : (
								<View style={styles.avatarCircle}>
									<Ionicons name="person" size={54} color="#94A3B8" />
								</View>
							)}
							<Pressable style={styles.addImageBtn} onPress={onAddImage}>
								<Ionicons name="camera" size={14} color="#FFFFFF" />
							</Pressable>
						</View>

						<View style={styles.profileMeta}>
							<ThemedText style={styles.profileName}>
								{profile.firstName} {profile.lastName}
							</ThemedText>
							<ThemedText style={styles.profileEmail}>{profile.email}</ThemedText>
						</View>
					</View>

					<View style={styles.infoPillRow}>
						<View style={styles.infoPill}>
							<Ionicons name="call-outline" size={14} color="#0F766E" />
							<ThemedText style={styles.infoPillText}>{profile.phone}</ThemedText>
						</View>
						<View style={styles.infoPill}>
							<Ionicons name="navigate-outline" size={14} color="#0F766E" />
							<ThemedText style={styles.infoPillText}>{profile.city}</ThemedText>
						</View>
					</View>
				</View>

				<View style={styles.sectionCard}>
					<ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
					<View style={styles.quickGrid}>
						{QUICK_ACTIONS.map((item) => (
							<Pressable key={item.key} style={styles.quickItem} onPress={() => onQuickAction(item.key, item.label)}>
								<View style={styles.quickIconWrap}>
									<Ionicons name={item.icon as any} size={18} color="#0F766E" />
								</View>
								<ThemedText style={styles.quickLabel}>{item.label}</ThemedText>
							</Pressable>
						))}
					</View>
				</View>

				<View style={styles.sectionCard}>
					{MENU_ITEMS.map((item, index) => (
						<Pressable
							key={item.key}
							style={[styles.menuRow, index !== MENU_ITEMS.length - 1 ? styles.menuDivider : null]}
							onPress={() => onPressMenuItem(item.key, item.label)}
						>
							<View style={styles.menuLeft}>
								<View style={styles.menuIconWrap}>
									<Ionicons name={item.icon as any} size={17} color="#0F766E" />
								</View>
								<ThemedText style={styles.menuText}>{item.label}</ThemedText>
							</View>
							<Ionicons name="chevron-forward" size={18} color="#94A3B8" />
						</Pressable>
					))}
				</View>

				{message ? <ThemedText style={styles.messageText}>{message}</ThemedText> : null}

				<Pressable style={[styles.logoutBtn, isLoading ? styles.logoutBtnDisabled : null]} onPress={onPressLogout} disabled={isLoading}>
					<Ionicons name="log-out-outline" size={17} color="#FFFFFF" />
					<ThemedText style={styles.logoutText}>{isLoading ? 'Logging out...' : 'Logout'}</ThemedText>
				</Pressable>

				<ThemedText style={styles.footerText}>BookMyEvent Customer App v1.0</ThemedText>
			</ScrollView>
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
		backgroundColor: '#DC2626',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
	},
	logoutBtnDisabled: {
		opacity: 0.7,
	},
	logoutText: {
		color: '#FFFFFF',
		fontSize: 14,
		fontWeight: '800',
	},
	footerText: {
		fontSize: 12,
		textAlign: 'center',
		color: '#94A3B8',
		paddingTop: 4,
	},
});
