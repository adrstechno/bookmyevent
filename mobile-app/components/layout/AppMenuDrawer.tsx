import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, usePathname } from 'expo-router';
import type { Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { signOut } from '@/store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '@/store';
import { useSettingsTheme } from '@/theme/settingsTheme';

type MenuItem = {
	label: string;
	href: Href;
	icon: keyof typeof Ionicons.glyphMap;
};

const userMenu: MenuItem[] = [
	{ label: 'Dashboard', href: '/(tabs)/home', icon: 'home-outline' },
	{ label: 'My Bookings', href: '/(tabs)/bookings', icon: 'ticket-outline' },
	{ label: 'Services', href: '/(tabs)/categories', icon: 'grid-outline' },
	{ label: 'Profile', href: '/(tabs)/profile', icon: 'person-outline' },
	{ label: 'Settings', href: '/settings', icon: 'settings-outline' },
	{ label: 'Support', href: '/support', icon: 'help-circle-outline' },
];

const vendorMenu: MenuItem[] = [
	{ label: 'Dashboard', href: '/(vendor)/dashboard', icon: 'speedometer-outline' },
	{ label: 'Shifts', href: '/(vendor)/shifts', icon: 'time-outline' },
	{ label: 'Bookings', href: '/(vendor)/bookings', icon: 'calendar-outline' },
	{ label: 'Manual Reservations', href: '/(vendor)/reservations', icon: 'lock-closed-outline' },
	{ label: 'Events', href: '/(vendor)/events', icon: 'list-outline' },
	{ label: 'Gallery', href: '/(vendor)/gallery', icon: 'images-outline' },
	{ label: 'Packages', href: '/(vendor)/packages', icon: 'cube-outline' },
	{ label: 'Settings', href: '/(vendor)/settings', icon: 'settings-outline' },
];

const adminMenu: MenuItem[] = [
	{ label: 'Dashboard', href: '/(admin)/dashboard', icon: 'speedometer-outline' },
	{ label: 'Users', href: '/(admin)/users', icon: 'people-outline' },
	{ label: 'Services', href: '/(admin)/services', icon: 'grid-outline' },
	{ label: 'Main Services', href: '/(admin)/main-services', icon: 'layers-outline' },
	{ label: 'Bookings', href: '/(admin)/bookings', icon: 'calendar-outline' },
	{ label: 'Manual Reservations', href: '/(admin)/reservations', icon: 'lock-closed-outline' },
	{ label: 'Subscriptions', href: '/(admin)/subscriptions', icon: 'card-outline' },
	{ label: 'Analytics', href: '/(admin)/analytics', icon: 'bar-chart-outline' },
];

export default function AppMenuDrawer({ variant = 'default' }: { variant?: 'default' | 'onPrimary' }) {
	const [visible, setVisible] = useState(false);
	const router = useRouter();
	const pathname = usePathname();
	const dispatch = useAppDispatch();
	const { role, email, isLoading } = useAppSelector((state) => state.auth);
	const { palette } = useSettingsTheme();

	const items = useMemo(() => {
		if (role === 'admin') return adminMenu;
		if (role === 'vendor') return vendorMenu;
		return userMenu;
	}, [role]);

	const onClose = () => setVisible(false);

	const onNavigate = (href: Href) => {
		onClose();
		router.push(href);
	};

	const onBack = () => {
		onClose();
		router.back();
	};

	const onLogout = () => {
		onClose();
		void dispatch(signOut()).then(() => {
			router.replace('/(auth)/login');
		});
	};

	return (
		<>
			<Pressable
				style={[
					styles.menuButton,
					variant === 'onPrimary'
						? { backgroundColor: 'transparent', borderColor: 'transparent' }
						: { backgroundColor: palette.elevatedBg, borderColor: palette.border },
				]}
				onPress={() => setVisible(true)}
			>
				<Ionicons
					name="menu"
					size={20}
					color={variant === 'onPrimary' ? 'rgba(255,255,255,0.9)' : palette.text}
				/>
			</Pressable>

			<Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
				<View style={styles.overlay}>
					<View style={[styles.drawer, { backgroundColor: palette.surfaceBg, borderRightColor: palette.border }]}>
						{/* Header */}
						<View style={[styles.header, { borderBottomColor: palette.border }]}>
							<ThemedText style={[styles.headerTitle, { color: palette.text }]}>GoEventify</ThemedText>
							<ThemedText style={[styles.headerSub, { color: palette.subtext }]} numberOfLines={1}>
								{email ?? 'Signed in user'}
							</ThemedText>
						</View>

						{/* Menu items */}
						<ScrollView
							style={styles.menuList}
							contentContainerStyle={styles.menuListContent}
							showsVerticalScrollIndicator={false}
						>
							{items.map((item) => {
								const hrefStr = typeof item.href === 'string' ? item.href : '';
								const isActive = pathname === hrefStr || pathname.startsWith(hrefStr + '/');
								return (
									<Pressable
										key={item.label}
										style={[
											styles.menuItem,
											{
												borderColor: isActive ? palette.primary : palette.border,
												backgroundColor: isActive ? palette.primary : palette.elevatedBg,
											},
										]}
										onPress={() => onNavigate(item.href)}
									>
										<Ionicons
											name={item.icon}
											size={17}
											color={isActive ? palette.onPrimary : palette.tint}
										/>
										<ThemedText style={[styles.menuLabel, { color: isActive ? palette.onPrimary : palette.text }]}>
											{item.label}
										</ThemedText>
									</Pressable>
								);
							})}
						</ScrollView>

						{/* Footer */}
						<View style={[styles.footer, { borderTopColor: palette.border }]}>
							<Pressable style={[styles.footerBtn, { borderColor: palette.border }]} onPress={onBack}>
								<Ionicons name="arrow-back-outline" size={16} color={palette.text} />
								<ThemedText style={[styles.footerLabel, { color: palette.text }]}>Back</ThemedText>
							</Pressable>

							<Pressable
								style={[styles.footerBtn, { borderColor: palette.dangerBorder, backgroundColor: palette.dangerSoft }]}
								onPress={onLogout}
								disabled={isLoading}
							>
								<Ionicons name="log-out-outline" size={16} color={palette.danger} />
								<ThemedText style={[styles.logoutText, { color: palette.danger }]}>
									{isLoading ? 'Logging out...' : 'Logout'}
								</ThemedText>
							</Pressable>
						</View>
					</View>
					<Pressable style={[styles.backdrop, { backgroundColor: palette.overlay }]} onPress={onClose} />
				</View>
			</Modal>
		</>
	);
}

const styles = StyleSheet.create({
	menuButton: {
		width: 36,
		height: 36,
		borderRadius: 18,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
	},
	overlay: {
		flex: 1,
		flexDirection: 'row',
	},
	backdrop: {
		flex: 1,
	},
	drawer: {
		width: 280,
		borderRightWidth: 1,
		paddingTop: 44,
		paddingHorizontal: 12,
		paddingBottom: 16,
	},
	header: {
		paddingBottom: 10,
		borderBottomWidth: 1,
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: '800',
	},
	headerSub: {
		fontSize: 12,
		marginTop: 2,
	},
	menuList: {
		flex: 1,
		paddingTop: 10,
	},
	menuListContent: {
		gap: 8,
		paddingBottom: 8,
	},
	menuItem: {
		height: 42,
		borderRadius: 11,
		paddingHorizontal: 12,
		borderWidth: 1,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
	},
	menuLabel: {
		fontSize: 14,
		fontWeight: '700',
	},
	footer: {
		marginTop: 'auto',
		paddingTop: 10,
		borderTopWidth: 1,
		gap: 8,
	},
	footerBtn: {
		height: 40,
		borderRadius: 10,
		paddingHorizontal: 12,
		borderWidth: 1,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	footerLabel: {
		fontSize: 13,
		fontWeight: '700',
	},
	logoutText: {
		fontSize: 13,
		fontWeight: '700',
	},
});
