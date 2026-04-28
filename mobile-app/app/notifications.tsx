import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useAppToast } from '@/components/common/AppToastProvider';
import { ThemedText } from '@/components/themed-text';
import { notificationService } from '@/services/notification/notificationService';
import { useAppSelector } from '@/store';
import { useSettingsTheme } from '@/theme/settingsTheme';
import { getRoleHomeRoute } from '@/utils/authRole';
import type { NotificationItem, NotificationStatusFilter } from '@/types/notification';

const FILTERS: Array<{ key: NotificationStatusFilter; label: string }> = [
	{ key: 'all', label: 'All' },
	{ key: 'unread', label: 'Unread' },
	{ key: 'read', label: 'Read' },
];

const PAGE_SIZE = 15;

const formatTimeAgo = (dateString: string) => {
	const date = new Date(dateString);
	if (Number.isNaN(date.getTime())) {
		return 'Just now';
	}

	const diffMs = Date.now() - date.getTime();
	const diffMins = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMs / 3600000);
	const diffDays = Math.floor(diffMs / 86400000);

	if (diffMins < 1) return 'Just now';
	if (diffMins < 60) return `${diffMins}m ago`;
	if (diffHours < 24) return `${diffHours}h ago`;
	if (diffDays < 7) return `${diffDays}d ago`;
	return date.toLocaleDateString();
};

export default function NotificationsScreen() {
	const router = useRouter();
	const { showError, showSuccess } = useAppToast();
	const { isAuthenticated, isHydrated, role } = useAppSelector((state) => state.auth);
	const { palette, resolvedMode } = useSettingsTheme();
	const isDark = resolvedMode === 'dark';

	const [notifications, setNotifications] = useState<NotificationItem[]>([]);
	const [filter, setFilter] = useState<NotificationStatusFilter>('all');
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const [unreadCount, setUnreadCount] = useState(0);

	const headerSubtitle = useMemo(() => {
		if (filter === 'all') {
			return `${unreadCount} unread`;
		}

		return filter === 'unread' ? 'Showing unread' : 'Showing read';
	}, [filter, unreadCount]);

	const loadNotifications = useCallback(
		async (nextPage = 1, replace = true) => {
			if (replace) {
				setLoading(nextPage === 1);
			} else {
				setLoadingMore(true);
			}

			const result = await notificationService.getNotifications({
				page: nextPage,
				limit: PAGE_SIZE,
				status: filter,
			});

			if (result.success) {
				setNotifications((prev) => (replace ? result.data.notifications : [...prev, ...result.data.notifications]));
				setUnreadCount(result.data.unreadCount);
				setHasMore(result.data.pagination.hasMore);
				setPage(nextPage);
			} else {
				showError(result.error.message);
			}

			setLoading(false);
			setRefreshing(false);
			setLoadingMore(false);
		},
		[filter, showError]
	);

	useEffect(() => {
		if (!isHydrated) {
			return;
		}

		if (!isAuthenticated) {
			return;
		}

		void loadNotifications(1, true);
	}, [isAuthenticated, isHydrated, loadNotifications]);

	if (isHydrated && !isAuthenticated) {
		return <Redirect href="/(auth)/login" />;
	}

	if (isHydrated && isAuthenticated && role && role !== 'user') {
		return <Redirect href={getRoleHomeRoute(role)} />;
	}

	const handleRefresh = async () => {
		await Haptics.selectionAsync();
		setRefreshing(true);
		await loadNotifications(1, true);
	};

	const handleLoadMore = async () => {
		if (!hasMore || loadingMore || loading || refreshing) {
			return;
		}

		await loadNotifications(page + 1, false);
	};

	const adjustUnreadCount = (notification: NotificationItem, action: 'remove' | 'read') => {
		if (notification.is_read) {
			return;
		}

		setUnreadCount((prev) => Math.max(0, action === 'remove' ? prev - 1 : prev - 1));
	};

	const handleMarkAsRead = async (notification: NotificationItem) => {
		if (notification.is_read) {
			return;
		}

		await Haptics.selectionAsync();
		const result = await notificationService.markAsRead(notification.id);
		if (!result.success) {
			showError(result.error.message);
			return;
		}

		setNotifications((prev) => prev.map((item) => (item.id === notification.id ? { ...item, is_read: true } : item)));
		adjustUnreadCount(notification, 'read');
	};

	const handleMarkAllAsRead = async () => {
		await Haptics.selectionAsync();
		const result = await notificationService.markAllAsRead();
		if (!result.success) {
			showError(result.error.message);
			return;
		}

		setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
		setUnreadCount(0);
		showSuccess('All notifications marked as read.');
	};

	const handleDelete = async (notification: NotificationItem) => {
		await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		const result = await notificationService.deleteNotification(notification.id);
		if (!result.success) {
			showError(result.error.message);
			return;
		}

		setNotifications((prev) => prev.filter((item) => item.id !== notification.id));
		adjustUnreadCount(notification, 'remove');
		showSuccess('Notification removed.');
	};

	const handleArchive = async (notification: NotificationItem) => {
		await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		const result = await notificationService.archiveNotification(notification.id);
		if (!result.success) {
			showError(result.error.message);
			return;
		}

		setNotifications((prev) => prev.filter((item) => item.id !== notification.id));
		adjustUnreadCount(notification, 'remove');
		showSuccess('Notification archived.');
	};

	const handlePressItem = async (notification: NotificationItem) => {
		await handleMarkAsRead(notification);

		if (notification.type && (notification.type.includes('booking') || notification.type.includes('otp'))) {
			router.push('/(tabs)/bookings');
		}
	};

	return (
		<SafeAreaView style={[styles.safeArea, { backgroundColor: palette.screenBg }]} edges={['top', 'bottom']}>
			<StatusBar style={isDark ? 'light' : 'dark'} />
			<View style={[styles.header, { backgroundColor: palette.surfaceBg, borderBottomColor: palette.border }]}>
				<View style={styles.headerLeftSlot}>
					<Pressable
						onPress={() => router.back()}
						style={({ pressed }) => [
							styles.backButton,
							{ backgroundColor: palette.elevatedBg, borderColor: palette.border },
							pressed ? styles.pressed : null,
						]}
					>
						<Ionicons name="arrow-back" size={18} color={palette.text} />
					</Pressable>
				</View>
				<View style={styles.headerCenterSlot}>
					<ThemedText style={[styles.headerTitle, { color: palette.text }]}>Notifications</ThemedText>
					<ThemedText style={[styles.headerSubtitle, { color: palette.subtext }]}>{headerSubtitle}</ThemedText>
				</View>
				<View style={styles.headerRightSlot}>
					<View style={[styles.unreadBadge, { backgroundColor: palette.primary }]}> 
						<ThemedText style={[styles.unreadBadgeText, { color: palette.onPrimary }]}>
							{unreadCount > 9 ? '9+' : unreadCount}
						</ThemedText>
					</View>
				</View>
			</View>

			<FlatList
				data={notifications}
				keyExtractor={(item) => String(item.id)}
				contentContainerStyle={[styles.listContent, { paddingBottom: 24 }]}
				showsVerticalScrollIndicator={false}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={palette.primary} />}
				ListHeaderComponent={
					<View style={styles.listHeader}>
						<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
							{FILTERS.map((item) => {
								const active = filter === item.key;
								return (
									<Pressable
										key={item.key}
										onPress={() => setFilter(item.key)}
										style={({ pressed }) => [
											styles.controlChip,
											{
												backgroundColor: active ? palette.primary : palette.elevatedBg,
												borderColor: active ? palette.primaryStrong : palette.border,
											},
											pressed ? styles.pressed : null,
										]}
									>
										<ThemedText style={[styles.controlChipText, { color: active ? palette.onPrimary : palette.text }]}>
											{item.label}
										</ThemedText>
									</Pressable>
								);
							})}

							<Pressable
								onPress={handleMarkAllAsRead}
								disabled={unreadCount === 0}
								style={({ pressed }) => [
									styles.controlChip,
									{
										backgroundColor: unreadCount === 0 ? palette.elevatedBg : palette.primary,
										borderColor: unreadCount === 0 ? palette.border : palette.primaryStrong,
									},
									pressed ? styles.pressed : null,
								]}
							>
								<View style={styles.markAllChipInner}>
									<Ionicons
										name="checkmark-done"
										size={14}
										color={unreadCount === 0 ? palette.subtext : palette.onPrimary}
									/>
									<ThemedText
										style={[
											styles.controlChipText,
											{ color: unreadCount === 0 ? palette.subtext : palette.onPrimary },
										]}
									>
										Mark all read
									</ThemedText>
								</View>
							</Pressable>
						</ScrollView>
					</View>
				}
				ListEmptyComponent={(
					<View style={styles.emptyState}>
						{loading ? (
							<>
								<ActivityIndicator size="large" color={palette.primary} />
								<ThemedText style={[styles.emptyTitle, { color: palette.text }]}>Loading notifications...</ThemedText>
							</>
						) : (
							<>
								<Ionicons name="notifications-off-outline" size={42} color={palette.muted} />
								<ThemedText style={[styles.emptyTitle, { color: palette.text }]}>No notifications yet</ThemedText>
								<ThemedText style={[styles.emptySubtitle, { color: palette.subtext }]}>
									We will show booking updates, reminders, and alerts here.
								</ThemedText>
							</>
						)}
					</View>
				)}
				onEndReached={handleLoadMore}
				onEndReachedThreshold={0.2}
				ListFooterComponent={
					hasMore ? (
						<View style={styles.footerLoading}>
							{loadingMore ? <ActivityIndicator color={palette.primary} /> : <ThemedText style={{ color: palette.subtext }}>Scroll for more</ThemedText>}
						</View>
					) : null
				}
				renderItem={({ item }) => (
					<Pressable
						onPress={() => void handlePressItem(item)}
						style={({ pressed }) => [
							styles.card,
							{
								backgroundColor: item.is_read ? palette.surfaceBg : palette.elevatedBg,
								borderColor: item.is_read ? palette.border : palette.primary,
							},
							pressed ? styles.cardPressed : null,
						]}
					>
						<View style={styles.cardTopRow}>
							<View style={styles.iconWrap}>
								<Ionicons
									name={item.type?.includes('booking') ? 'calendar-outline' : item.type?.includes('otp') ? 'key-outline' : 'notifications-outline'}
									size={18}
									color={palette.primary}
								/>
							</View>
							<View style={styles.cardBody}>
								<View style={styles.cardTitleRow}>
									<ThemedText style={[styles.cardTitle, { color: palette.text }]} numberOfLines={1}>
										{item.title}
									</ThemedText>
									{!item.is_read && <View style={[styles.unreadDot, { backgroundColor: palette.primary }]} />}
								</View>
								<ThemedText style={[styles.cardMessage, { color: palette.subtext }]} numberOfLines={3}>
									{item.message}
								</ThemedText>
								<View style={styles.cardMetaRow}>
									<ThemedText style={[styles.cardTime, { color: palette.muted }]}>
										{formatTimeAgo(item.created_at)}
									</ThemedText>
									<View style={styles.cardActions}>
										{!item.is_read && (
											<Pressable
												onPress={() => void handleMarkAsRead(item)}
												style={({ pressed }) => [styles.actionBtn, { backgroundColor: palette.surfaceBg, borderColor: palette.border }, pressed ? styles.pressed : null]}
											>
												<Ionicons name="checkmark" size={16} color={palette.primary} />
											</Pressable>
										)}
										<Pressable
											onPress={() => void handleArchive(item)}
											style={({ pressed }) => [styles.actionBtn, { backgroundColor: palette.surfaceBg, borderColor: palette.border }, pressed ? styles.pressed : null]}
										>
											<Ionicons name="archive-outline" size={16} color={palette.primary} />
										</Pressable>
										<Pressable
											onPress={() => void handleDelete(item)}
											style={({ pressed }) => [styles.actionBtn, { backgroundColor: palette.surfaceBg, borderColor: palette.border }, pressed ? styles.pressed : null]}
										>
											<Ionicons name="trash-outline" size={16} color={palette.danger} />
										</Pressable>
									</View>
								</View>
							</View>
						</View>
					</Pressable>
				)}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	header: {
		height: 56,
		paddingHorizontal: 16,
		borderBottomWidth: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	headerLeftSlot: {
		width: 40,
		alignItems: 'flex-start',
	},
	headerCenterSlot: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 8,
	},
	headerRightSlot: {
		width: 40,
		alignItems: 'flex-end',
	},
	backButton: {
		width: 34,
		height: 34,
		borderRadius: 17,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
	},
	headerTitle: {
		fontSize: 19,
		fontWeight: '800',
		textAlign: 'center',
	},
	headerSubtitle: {
		fontSize: 11,
		marginTop: 1,
		textAlign: 'center',
	},
	unreadBadge: {
		minWidth: 24,
		height: 24,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 4,
	},
	unreadBadgeText: {
		fontSize: 11,
		fontWeight: '700',
	},
	listContent: {
		padding: 16,
		gap: 12,
	},
	listHeader: {
		gap: 10,
		marginBottom: 6,
	},
	chipRow: {
		flexDirection: 'row',
		gap: 8,
	},
	controlChip: {
		paddingHorizontal: 14,
		height: 34,
		borderRadius: 999,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	controlChipText: {
		fontSize: 12,
		fontWeight: '700',
	},
	markAllChipInner: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	emptyState: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 60,
		gap: 10,
	},
	emptyTitle: {
		fontSize: 18,
		fontWeight: '800',
	},
	emptySubtitle: {
		fontSize: 13,
		lineHeight: 20,
		textAlign: 'center',
		maxWidth: 280,
	},
	footerLoading: {
		paddingVertical: 16,
		alignItems: 'center',
	},
	card: {
		borderWidth: 1,
		borderRadius: 18,
		padding: 14,
	},
	cardPressed: {
		opacity: 0.92,
	},
	cardTopRow: {
		flexDirection: 'row',
		gap: 12,
	},
	iconWrap: {
		width: 42,
		height: 42,
		borderRadius: 21,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(255,255,255,0.65)',
	},
	cardBody: {
		flex: 1,
		gap: 8,
	},
	cardTitleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 10,
	},
	cardTitle: {
		flex: 1,
		fontSize: 15,
		fontWeight: '800',
	},
	unreadDot: {
		width: 9,
		height: 9,
		borderRadius: 999,
	},
	cardMessage: {
		fontSize: 13,
		lineHeight: 19,
	},
	cardMetaRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 12,
	},
	cardTime: {
		fontSize: 11,
		fontWeight: '600',
	},
	cardActions: {
		flexDirection: 'row',
		gap: 8,
	},
	actionBtn: {
		width: 34,
		height: 34,
		borderRadius: 17,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
	},
	pressed: {
		opacity: 0.85,
	},
});