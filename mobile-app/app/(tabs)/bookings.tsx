import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import PageLoadingState from '@/components/common/PageLoadingState';
import { useAppToast } from '@/components/common/AppToastProvider';
import { TabsTopBar } from '@/components/layout/TabsTopBar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CancelBookingModal } from '@/components/booking/CancelBookingModal';
import { ReviewBookingModal } from '@/components/booking/ReviewBookingModal';
import { BookingOTPSection } from '@/components/booking/BookingOTPSection';
import { BookingStatusAlert } from '@/components/booking/BookingStatusAlert';
import { fetchUserBookings, cancelBooking, submitReview } from '@/services/booking/bookingService';
import { useAppSelector } from '@/store';
import { useSettingsTheme } from '@/theme/settingsTheme';
import type { BookingItem, BookingStatus } from '@/types/booking';

// Filter tabs matching the website exactly
type FilterKey = 'all' | 'pending' | 'otp' | 'completed' | 'cancelled';

const FILTER_TABS: { key: FilterKey; label: string }[] = [
	{ key: 'all', label: 'All Bookings' },
	{ key: 'pending', label: 'Pending' },
	{ key: 'otp', label: 'Share OTP' },
	{ key: 'completed', label: 'Completed' },
	{ key: 'cancelled', label: 'Cancelled' },
];

const FALLBACK_BOOKINGS: BookingItem[] = [
	{
		id: 'BK-1001',
		eventName: 'Wedding Package',
		date: '12 Apr 2026',
		venue: 'Silver Oak Lawn, Indore',
		amount: 'Rs 45,000',
		status: 'confirmed',
		adminApproval: 'approved',
		vendorName: 'Royal Events Co.',
		eventTime: '07:00 PM',
		packageName: 'Wedding Package',
	},
	{
		id: 'BK-1002',
		eventName: 'Corporate Seminar',
		date: '22 Apr 2026',
		venue: 'Metro Convention Hall, Bhopal',
		amount: 'Rs 18,500',
		status: 'confirmed',
		adminApproval: 'pending',
		vendorName: 'Elite Planners',
		eventTime: '10:00 AM',
		packageName: 'Corporate Seminar',
	},
	{
		id: 'BK-1003',
		eventName: 'Birthday Party',
		date: '02 Mar 2026',
		venue: 'Sunrise Banquet, Dewas',
		amount: 'Rs 12,000',
		status: 'completed',
		vendorName: 'Fun Events',
		eventTime: '06:00 PM',
		packageName: 'Birthday Party',
	},
];

const getStatusConfig = (status: BookingStatus, adminApproval?: string) => {
	if (status === 'pending') {
		return { label: 'Pending Vendor Response', bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' };
	}
	if (status === 'confirmed' && adminApproval === 'pending') {
		return { label: 'Awaiting Admin Approval', bg: '#DBEAFE', text: '#1D4ED8', border: '#93C5FD' };
	}
	if (status === 'confirmed' && adminApproval === 'approved') {
		return { label: 'Share OTP with Vendor', bg: '#F3E8FF', text: '#7C3AED', border: '#D8B4FE' };
	}
	if (status === 'awaiting_review') {
		return { label: 'Awaiting Review', bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' };
	}
	if (status === 'completed') {
		return { label: 'Completed', bg: '#DCFCE7', text: '#166534', border: '#86EFAC' };
	}
	if (status === 'cancelled') {
		return { label: 'Cancelled', bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' };
	}
	return { label: 'Confirmed', bg: '#DBEAFE', text: '#1D4ED8', border: '#93C5FD' };
};

const matchesFilter = (booking: BookingItem, filter: FilterKey): boolean => {
	if (filter === 'all') return true;
	if (filter === 'pending') {
		return booking.status === 'pending' || (booking.status === 'confirmed' && booking.adminApproval === 'pending');
	}
	if (filter === 'otp') {
		return booking.status === 'confirmed' && booking.adminApproval === 'approved';
	}
	if (filter === 'completed') {
		// Match website: completed tab includes both 'completed' and 'awaiting_review'
		return booking.status === 'completed' || booking.status === 'awaiting_review';
	}
	if (filter === 'cancelled') {
		return booking.status === 'cancelled';
	}
	return true;
};

const BookingCard = memo(function BookingCard({
	booking,
	palette,
	onCancel,
	onReview,
}: {
	booking: BookingItem;
	palette: {
		surfaceBg: string;
		border: string;
		text: string;
		subtext: string;
		tint: string;
		primary: string;
		primaryStrong: string;
		onPrimary: string;
		shadow: string;
		screenBg: string;
		warningSoft: string;
		warningBorder: string;
	};
	onCancel: (bookingId: string) => void;
	onReview: (booking: BookingItem) => void;
}) {
	const isApproved = booking.status === 'confirmed' && booking.adminApproval === 'approved';
	const canCancel = booking.status === 'pending' || (booking.status === 'confirmed' && booking.adminApproval === 'pending');
	// Match website exactly: canWriteReview = status === 'awaiting_review'
	const canReview = booking.status === 'awaiting_review';

	const statusConfig = getStatusConfig(booking.status, booking.adminApproval);

	return (
		<ThemedView
			style={[
				styles.bookingCard,
				{ backgroundColor: palette.surfaceBg, borderColor: palette.border },
				isApproved && styles.bookingCardOTP,
			]}
		>
			{/* Header: Booking ID + Status Badge */}
			<View style={styles.cardHeader}>
				<View style={styles.cardHeaderLeft}>
					<ThemedText type="defaultSemiBold" style={[styles.bookingTitle, { color: palette.text }]}>
						Booking #{booking.id}
					</ThemedText>
					<View style={[styles.statusBadge, { backgroundColor: statusConfig.bg, borderColor: statusConfig.border }]}>
						{booking.status === 'pending' && <Ionicons name="time-outline" size={12} color={statusConfig.text} />}
						{booking.status === 'confirmed' && booking.adminApproval === 'pending' && <Ionicons name="time-outline" size={12} color={statusConfig.text} />}
						{booking.status === 'confirmed' && booking.adminApproval === 'approved' && <Ionicons name="key-outline" size={12} color={statusConfig.text} />}
						{booking.status === 'awaiting_review' && <Ionicons name="star-outline" size={12} color={statusConfig.text} />}
						{booking.status === 'completed' && <Ionicons name="checkmark-circle-outline" size={12} color={statusConfig.text} />}
						{booking.status === 'cancelled' && <Ionicons name="close-circle-outline" size={12} color={statusConfig.text} />}
						<ThemedText style={[styles.statusBadgeText, { color: statusConfig.text }]}>
							{statusConfig.label}
						</ThemedText>
					</View>
				</View>

				{/* Action buttons top-right (matches website layout) */}
				<View style={styles.cardActions}>
					{canReview && (
						<Pressable
							onPress={() => onReview(booking)}
							style={({ pressed }) => [styles.actionBtn, styles.actionBtnReview, pressed && { opacity: 0.8 }]}
						>
							<Ionicons name="star" size={14} color="#FFFFFF" />
							<ThemedText style={styles.actionBtnText}>Write Review</ThemedText>
						</Pressable>
					)}
					{canCancel && (
						<Pressable
							onPress={() => onCancel(booking.id)}
							style={({ pressed }) => [styles.actionBtn, styles.actionBtnCancel, pressed && { opacity: 0.8 }]}
						>
							<Ionicons name="close-circle-outline" size={14} color="#DC2626" />
							<ThemedText style={[styles.actionBtnText, { color: '#DC2626' }]}>Cancel</ThemedText>
						</Pressable>
					)}
				</View>
			</View>

			{/* Detail rows — matching website fields */}
			<View style={styles.detailsGrid}>
				{booking.vendorName ? (
					<View style={styles.detailItem}>
						<View style={[styles.detailIcon, { backgroundColor: '#E0F2F1' }]}>
							<Ionicons name="person-outline" size={18} color="#3C6E71" />
						</View>
						<View style={styles.detailContent}>
							<ThemedText style={[styles.detailLabel, { color: palette.subtext }]}>Vendor</ThemedText>
							<ThemedText style={[styles.detailValue, { color: palette.text }]}>{booking.vendorName}</ThemedText>
						</View>
					</View>
				) : null}

				<View style={styles.detailItem}>
					<View style={[styles.detailIcon, { backgroundColor: '#E0F2F1' }]}>
						<Ionicons name="calendar-outline" size={18} color="#3C6E71" />
					</View>
					<View style={styles.detailContent}>
						<ThemedText style={[styles.detailLabel, { color: palette.subtext }]}>Event Date</ThemedText>
						<ThemedText style={[styles.detailValue, { color: palette.text }]}>{booking.date}</ThemedText>
					</View>
				</View>

				{booking.eventTime ? (
					<View style={styles.detailItem}>
						<View style={[styles.detailIcon, { backgroundColor: '#E0F2F1' }]}>
							<Ionicons name="time-outline" size={18} color="#3C6E71" />
						</View>
						<View style={styles.detailContent}>
							<ThemedText style={[styles.detailLabel, { color: palette.subtext }]}>Event Time</ThemedText>
							<ThemedText style={[styles.detailValue, { color: palette.text }]}>{booking.eventTime}</ThemedText>
						</View>
					</View>
				) : null}

				{booking.packageName ? (
					<View style={styles.detailItem}>
						<View style={[styles.detailIcon, { backgroundColor: '#E0F2F1' }]}>
							<Ionicons name="cube-outline" size={18} color="#3C6E71" />
						</View>
						<View style={styles.detailContent}>
							<ThemedText style={[styles.detailLabel, { color: palette.subtext }]}>Package</ThemedText>
							<ThemedText style={[styles.detailValue, { color: palette.text }]}>{booking.packageName}</ThemedText>
						</View>
					</View>
				) : null}

				<View style={[styles.detailItem, styles.detailItemFull]}>
					<View style={[styles.detailIcon, { backgroundColor: '#E0F2F1' }]}>
						<Ionicons name="location-outline" size={18} color="#3C6E71" />
					</View>
					<View style={styles.detailContent}>
						<ThemedText style={[styles.detailLabel, { color: palette.subtext }]}>Event Address</ThemedText>
						<ThemedText style={[styles.detailValue, { color: palette.text }]}>{booking.venue}</ThemedText>
					</View>
				</View>

				<View style={styles.detailItem}>
					<View style={[styles.detailIcon, { backgroundColor: '#E0F2F1' }]}>
						<Ionicons name="wallet-outline" size={18} color="#3C6E71" />
					</View>
					<View style={styles.detailContent}>
						<ThemedText style={[styles.detailLabel, { color: palette.subtext }]}>Amount</ThemedText>
						<ThemedText style={[styles.detailValue, { color: palette.text }]}>{booking.amount}</ThemedText>
					</View>
				</View>
			</View>

			{/* Special Requirements */}
			{booking.specialRequirement ? (
				<View style={[styles.specialReq, { backgroundColor: palette.screenBg }]}>
					<ThemedText style={[styles.specialReqLabel, { color: palette.subtext }]}>Special Requirements</ThemedText>
					<ThemedText style={[styles.specialReqText, { color: palette.text }]}>{booking.specialRequirement}</ThemedText>
				</View>
			) : null}

			{/* OTP Section for admin-approved bookings */}
			{isApproved && <BookingOTPSection bookingId={booking.id} />}

			{/* Status Alerts */}
			<BookingStatusAlert status={booking.status} adminApproval={booking.adminApproval} />
		</ThemedView>
	);
});

export default function BookingsTabScreen() {
	const tabBarHeight = useBottomTabBarHeight();
	const { mode, palette } = useSettingsTheme();
	const isDark = mode === 'dark';
	const { token } = useAppSelector((state) => state.auth);
	const { showError, showInfo, showSuccess } = useAppToast();
	const hasShownDevInfoRef = useRef(false);
	const isDummyToken = typeof token === 'string' && token.startsWith('dummy-token-');

	const [bookings, setBookings] = useState<BookingItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

	// Modal states
	const [showCancelModal, setShowCancelModal] = useState(false);
	const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<string | null>(null);
	const [showReviewModal, setShowReviewModal] = useState(false);
	const [selectedBookingForReview, setSelectedBookingForReview] = useState<BookingItem | null>(null);

	const loadBookings = useCallback(
		async (isManualRefresh = false) => {
			if (isManualRefresh) {
				setIsRefreshing(true);
			} else {
				setIsLoading(true);
			}

			if (isDummyToken) {
				setBookings(FALLBACK_BOOKINGS);
				setLoadError(null);
				if (!hasShownDevInfoRef.current) {
					showInfo('Demo login active. Showing sample bookings.');
					hasShownDevInfoRef.current = true;
				}
				isManualRefresh ? setIsRefreshing(false) : setIsLoading(false);
				return;
			}

			const response = await fetchUserBookings();
			if (response.success) {
				setBookings(response.data);
				setLoadError(null);
			} else {
				setLoadError(response.error.message);
				showError(response.error.message);
				setBookings((prev) => (prev.length > 0 ? prev : FALLBACK_BOOKINGS));
			}

			isManualRefresh ? setIsRefreshing(false) : setIsLoading(false);
		},
		[isDummyToken, showError, showInfo]
	);

	useEffect(() => {
		void loadBookings();
	}, [loadBookings]);

	const handleCancelBooking = useCallback(
		async (bookingId: string, reason: string) => {
			const response = await cancelBooking(bookingId, reason);
			if (response.success) {
				showSuccess('Booking cancelled successfully!');
				void loadBookings(true);
			} else {
				showError(response.error.message);
				throw new Error(response.error.message);
			}
		},
		[showSuccess, showError, loadBookings]
	);

	const handleSubmitReview = useCallback(
		async (bookingId: string, reviewData: any) => {
			const response = await submitReview(bookingId, reviewData);
			if (response.success) {
				showSuccess('Thank you for your review!');
				void loadBookings(true);
			} else {
				showError(response.error.message);
				throw new Error(response.error.message);
			}
		},
		[showSuccess, showError, loadBookings]
	);

	const handleOpenCancelModal = useCallback((bookingId: string) => {
		setSelectedBookingForCancel(bookingId);
		setShowCancelModal(true);
	}, []);

	const handleOpenReviewModal = useCallback((booking: BookingItem) => {
		setSelectedBookingForReview(booking);
		setShowReviewModal(true);
	}, []);

	const filterCounts = useMemo(() => {
		return {
			all: bookings.length,
			pending: bookings.filter((b) => b.status === 'pending' || (b.status === 'confirmed' && b.adminApproval === 'pending')).length,
			otp: bookings.filter((b) => b.status === 'confirmed' && b.adminApproval === 'approved').length,
			completed: bookings.filter((b) => b.status === 'completed' || b.status === 'awaiting_review').length,
			cancelled: bookings.filter((b) => b.status === 'cancelled').length,
		};
	}, [bookings]);

	const filteredBookings = useMemo(
		() => bookings.filter((b) => matchesFilter(b, activeFilter)),
		[activeFilter, bookings]
	);

	if (isLoading) {
		return (
			<SafeAreaView style={[styles.safeArea, { backgroundColor: palette.screenBg }]} edges={['top']}>
				<StatusBar style={isDark ? 'light' : 'dark'} />
				<TabsTopBar title="My Bookings" />
				<PageLoadingState text="Loading your bookings..." />
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={[styles.safeArea, { backgroundColor: palette.screenBg }]} edges={['top']}>
			<StatusBar style={isDark ? 'light' : 'dark'} />
			<TabsTopBar title="My Bookings" />

			<ScrollView
				style={{ flex: 1, backgroundColor: palette.screenBg }}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={[styles.container, { paddingBottom: tabBarHeight + 16 }]}
				refreshControl={
					<RefreshControl
						refreshing={isRefreshing}
						onRefresh={() => void loadBookings(true)}
						tintColor={palette.primary}
					/>
				}
			>
				{/* Page Header */}
				<View style={[styles.pageHeader, { backgroundColor: palette.primary }]}>
					<ThemedText style={styles.pageHeaderTitle}>My Bookings</ThemedText>
					<ThemedText style={styles.pageHeaderSubtitle}>Track and manage all your event bookings</ThemedText>
				</View>

				{/* Filter Tabs */}
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={styles.filterRow}
					style={styles.filterScroll}
				>
					{FILTER_TABS.map((tab) => {
						const isActive = activeFilter === tab.key;
						const count = filterCounts[tab.key];
						return (
							<Pressable key={tab.key} onPress={() => setActiveFilter(tab.key)}>
								<View
									style={[
										styles.filterChip,
										{ backgroundColor: palette.surfaceBg, borderColor: palette.border },
										isActive && { backgroundColor: palette.primary, borderColor: palette.primary },
									]}
								>
									<ThemedText
										style={[
											styles.filterChipText,
											{ color: palette.subtext },
											isActive && { color: '#FFFFFF' },
										]}
									>
										{tab.label}
									</ThemedText>
									{count > 0 && (
										<View
											style={[
												styles.filterBadge,
												{ backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : palette.screenBg },
											]}
										>
											<ThemedText
												style={[
													styles.filterBadgeText,
													{ color: isActive ? '#FFFFFF' : palette.subtext },
												]}
											>
												{count}
											</ThemedText>
										</View>
									)}
								</View>
							</Pressable>
						);
					})}

					{/* Refresh button */}
					<Pressable onPress={() => void loadBookings(true)}>
						<View style={[styles.filterChip, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
							<Ionicons name="refresh-outline" size={14} color={palette.primary} />
							<ThemedText style={[styles.filterChipText, { color: palette.primary }]}>Refresh</ThemedText>
						</View>
					</Pressable>
				</ScrollView>

				{/* Error Banner */}
				{loadError ? (
					<View style={[styles.errorBanner, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}>
						<Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
						<ThemedText style={[styles.errorText, { color: '#991B1B' }]}>{loadError}</ThemedText>
					</View>
				) : null}

				{/* Bookings List */}
				{filteredBookings.length === 0 ? (
					<View style={[styles.emptyState, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
						<Ionicons name="calendar-outline" size={56} color={palette.muted ?? '#94A3B8'} />
						<ThemedText style={[styles.emptyTitle, { color: palette.text }]}>No Bookings Found</ThemedText>
						<ThemedText style={[styles.emptySubtext, { color: palette.subtext }]}>
							{activeFilter === 'all'
								? 'Start exploring vendors and book your first event!'
								: `No ${activeFilter} bookings found.`}
						</ThemedText>
					</View>
				) : (
					filteredBookings.map((booking) => (
						<BookingCard
							key={booking.id}
							booking={booking}
							palette={palette as any}
							onCancel={handleOpenCancelModal}
							onReview={handleOpenReviewModal}
						/>
					))
				)}
			</ScrollView>

			{/* Cancel Booking Modal */}
			<CancelBookingModal
				visible={showCancelModal}
				bookingId={selectedBookingForCancel || ''}
				onClose={() => {
					setShowCancelModal(false);
					setSelectedBookingForCancel(null);
				}}
				onConfirm={handleCancelBooking}
			/>

			{/* Review Booking Modal */}
			<ReviewBookingModal
				visible={showReviewModal}
				booking={selectedBookingForReview}
				onClose={() => {
					setShowReviewModal(false);
					setSelectedBookingForReview(null);
				}}
				onSubmit={handleSubmitReview}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	container: {
		gap: 0,
	},
	// Page header — matches website's gradient header
	pageHeader: {
		paddingHorizontal: 20,
		paddingVertical: 20,
	},
	pageHeaderTitle: {
		fontSize: 26,
		fontWeight: '800',
		color: '#FFFFFF',
		marginBottom: 4,
	},
	pageHeaderSubtitle: {
		fontSize: 14,
		color: 'rgba(255,255,255,0.85)',
		fontWeight: '500',
	},
	// Filter tabs
	filterScroll: {
		flexGrow: 0,
	},
	filterRow: {
		paddingHorizontal: 16,
		paddingVertical: 14,
		gap: 8,
	},
	filterChip: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 999,
		borderWidth: 1,
	},
	filterChipText: {
		fontSize: 13,
		fontWeight: '600',
	},
	filterBadge: {
		borderRadius: 999,
		paddingHorizontal: 6,
		paddingVertical: 1,
		minWidth: 20,
		alignItems: 'center',
	},
	filterBadgeText: {
		fontSize: 11,
		fontWeight: '700',
	},
	// Error banner
	errorBanner: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		marginHorizontal: 16,
		marginBottom: 12,
		padding: 12,
		borderRadius: 10,
		borderWidth: 1,
	},
	errorText: {
		fontSize: 13,
		flex: 1,
		fontWeight: '500',
	},
	// Empty state
	emptyState: {
		margin: 16,
		borderRadius: 16,
		borderWidth: 1,
		padding: 40,
		alignItems: 'center',
		gap: 10,
	},
	emptyTitle: {
		fontSize: 18,
		fontWeight: '700',
	},
	emptySubtext: {
		fontSize: 13,
		textAlign: 'center',
		lineHeight: 20,
	},
	// Booking card
	bookingCard: {
		marginHorizontal: 16,
		marginBottom: 16,
		borderRadius: 16,
		borderWidth: 1,
		padding: 16,
		gap: 14,
		shadowColor: '#0F172A',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.06,
		shadowRadius: 8,
		elevation: 3,
	},
	bookingCardOTP: {
		borderLeftWidth: 4,
		borderLeftColor: '#7C3AED',
	},
	// Card header
	cardHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		gap: 10,
	},
	cardHeaderLeft: {
		flex: 1,
		gap: 8,
	},
	bookingTitle: {
		fontSize: 18,
		fontWeight: '700',
	},
	statusBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 5,
		alignSelf: 'flex-start',
		paddingHorizontal: 10,
		paddingVertical: 5,
		borderRadius: 999,
		borderWidth: 1,
	},
	statusBadgeText: {
		fontSize: 12,
		fontWeight: '700',
	},
	// Action buttons
	cardActions: {
		gap: 6,
		alignItems: 'flex-end',
	},
	actionBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		paddingHorizontal: 10,
		paddingVertical: 7,
		borderRadius: 8,
	},
	actionBtnReview: {
		backgroundColor: '#F59E0B',
	},
	actionBtnCancel: {
		backgroundColor: '#FEE2E2',
		borderWidth: 1,
		borderColor: '#FCA5A5',
	},
	actionBtnText: {
		fontSize: 12,
		fontWeight: '700',
		color: '#FFFFFF',
	},
	// Details grid — 2-column layout matching website
	detailsGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 12,
	},
	detailItem: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 10,
		width: '46%',
	},
	detailItemFull: {
		width: '100%',
	},
	detailIcon: {
		width: 40,
		height: 40,
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'center',
		flexShrink: 0,
	},
	detailContent: {
		flex: 1,
		gap: 2,
	},
	detailLabel: {
		fontSize: 11,
		fontWeight: '500',
	},
	detailValue: {
		fontSize: 13,
		fontWeight: '600',
		lineHeight: 18,
	},
	// Special requirements
	specialReq: {
		borderRadius: 10,
		padding: 12,
		gap: 4,
	},
	specialReqLabel: {
		fontSize: 11,
		fontWeight: '600',
	},
	specialReqText: {
		fontSize: 13,
		lineHeight: 18,
	},
});
