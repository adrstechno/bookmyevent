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

const STATUS_META: Record<BookingStatus, { label: string; chipLabel: string }> = {
	pending: { label: 'Pending Vendor Response', chipLabel: 'Pending' },
	confirmed: { label: 'Confirmed', chipLabel: 'Confirmed' },
	completed: { label: 'Completed', chipLabel: 'Completed' },
	cancelled: { label: 'Cancelled', chipLabel: 'Cancelled' },
};

const FALLBACK_BOOKINGS: BookingItem[] = [
	{
		id: 'BK-1001',
		eventName: 'Wedding Event',
		date: '12 Apr 2026',
		venue: 'Silver Oak Lawn, Indore',
		amount: 'Rs 45,000',
		status: 'confirmed',
	},
	{
		id: 'BK-1002',
		eventName: 'Office Seminar',
		date: '22 Apr 2026',
		venue: 'Metro Convention Hall, Bhopal',
		amount: 'Rs 18,500',
		status: 'pending',
	},
	{
		id: 'BK-1003',
		eventName: 'Birthday Party',
		date: '02 Mar 2026',
		venue: 'Sunrise Banquet, Dewas',
		amount: 'Rs 12,000',
		status: 'completed',
	},
];

const STATUS_CHIPS: ('all' | BookingStatus)[] = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

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
	};
	onCancel: (bookingId: string) => void;
	onReview: (booking: BookingItem) => void;
}) {
	const isPending = booking.status === 'pending';
	const isCompleted = booking.status === 'completed';
	const isCancelled = booking.status === 'cancelled';
	const isApproved = booking.status === 'confirmed' && booking.adminApproval === 'approved';
	
	const canCancel = isPending || (booking.status === 'confirmed' && booking.adminApproval === 'pending');
	const canReview = isCompleted;

	return (
		<ThemedView style={[styles.bookingCard, { backgroundColor: palette.surfaceBg, borderColor: palette.border }, isApproved && styles.bookingCardApproved]}>
			<View style={styles.rowTop}>
				<View style={styles.eventMeta}>
					<ThemedText type="defaultSemiBold" style={[styles.eventName, { color: palette.text }]}>{booking.eventName}</ThemedText>
					<ThemedText style={[styles.bookingId, { color: palette.subtext }]}>Booking ID: {booking.id}</ThemedText>
				</View>
				<ThemedView
					style={[
						styles.statusPill,
						isPending ? styles.statusPending : null,
						isCompleted ? styles.statusCompleted : null,
						isCancelled ? styles.statusCancelled : null,
						isApproved ? styles.statusApproved : null,
					]}
				>
					<ThemedText
						style={[
							styles.statusText,
							isPending ? styles.statusTextPending : null,
							isCompleted ? styles.statusTextCompleted : null,
							isCancelled ? styles.statusTextCancelled : null,
							isApproved ? styles.statusTextApproved : null,
						]}
					>
						{STATUS_META[booking.status].label}
					</ThemedText>
				</ThemedView>
			</View>

			{booking.vendorName && (
				<View style={styles.detailRow}>
					<Ionicons name="person-outline" size={15} color={palette.subtext} />
					<ThemedText style={[styles.detailText, { color: palette.subtext }]}>{booking.vendorName}</ThemedText>
				</View>
			)}
			<View style={styles.detailRow}>
				<Ionicons name="calendar-outline" size={15} color={palette.subtext} />
				<ThemedText style={[styles.detailText, { color: palette.subtext }]}>{booking.date}</ThemedText>
			</View>
			<View style={styles.detailRow}>
				<Ionicons name="location-outline" size={15} color={palette.subtext} />
				<ThemedText style={[styles.detailText, { color: palette.subtext }]}>{booking.venue}</ThemedText>
			</View>
			<View style={styles.detailRow}>
				<Ionicons name="wallet-outline" size={15} color={palette.subtext} />
				<ThemedText style={[styles.detailText, { color: palette.subtext }]}>{booking.amount}</ThemedText>
			</View>

			{booking.specialRequirement && (
				<View style={[styles.specialReq, { backgroundColor: palette.screenBg }]}>
					<ThemedText style={[styles.specialReqLabel, { color: palette.subtext }]}>Special Requirements</ThemedText>
					<ThemedText style={[styles.specialReqText, { color: palette.text }]}>{booking.specialRequirement}</ThemedText>
				</View>
			)}

			{/* OTP Section for approved bookings */}
			{isApproved && <BookingOTPSection bookingId={booking.id} />}

			{/* Status Alerts */}
			<BookingStatusAlert status={booking.status} adminApproval={booking.adminApproval} />

			{/* Action Buttons */}
			<View style={styles.actionButtons}>
				{canReview && (
					<Pressable
						onPress={() => onReview(booking)}
						style={({ pressed }) => [
							styles.actionBtn,
							styles.actionBtnReview,
							pressed && styles.actionBtnPressed,
						]}
					>
						<Ionicons name="star" size={16} color="#FFFFFF" />
						<ThemedText style={[styles.actionBtnText, { color: '#FFFFFF' }]}>Write Review</ThemedText>
					</Pressable>
				)}
				{canCancel && (
					<Pressable
						onPress={() => onCancel(booking.id)}
						style={({ pressed }) => [
							styles.actionBtn,
							styles.actionBtnCancel,
							{ borderColor: palette.border },
							pressed && styles.actionBtnPressed,
						]}
					>
						<Ionicons name="close-circle-outline" size={16} color="#DC2626" />
						<ThemedText style={[styles.actionBtnText, { color: '#DC2626' }]}>Cancel</ThemedText>
					</Pressable>
				)}
			</View>

			<ThemedView
				style={[
					styles.ctaBtn,
					{ backgroundColor: palette.primary, borderColor: palette.primaryStrong, shadowColor: palette.shadow },
				]}
			>
				<ThemedText style={[styles.ctaText, { color: palette.onPrimary }]}>View Details</ThemedText>
			</ThemedView>
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
	const [activeStatus, setActiveStatus] = useState<'all' | BookingStatus>('all');
	
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
					showInfo('Demo login active. Showing sample bookings until backend auth token is available.');
					hasShownDevInfoRef.current = true;
				}

				if (isManualRefresh) {
					setIsRefreshing(false);
				} else {
					setIsLoading(false);
				}

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

			if (isManualRefresh) {
				setIsRefreshing(false);
			} else {
				setIsLoading(false);
			}
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

	const filteredBookings = useMemo(() => {
		if (activeStatus === 'all') {
			return bookings;
		}

		return bookings.filter((booking) => booking.status === activeStatus);
	}, [activeStatus, bookings]);

	const stats = useMemo(() => {
		const total = bookings.length;
		const upcoming = bookings.filter((booking) => booking.status === 'confirmed').length;
		const pending = bookings.filter((booking) => booking.status === 'pending').length;

		return { total, upcoming, pending };
	}, [bookings]);

	if (isLoading) {
		return (
			<SafeAreaView style={[styles.safeArea, { backgroundColor: palette.screenBg }]} edges={['top']}>
				<StatusBar style={isDark ? 'light' : 'dark'} />
				<TabsTopBar title="Bookings" />
				<PageLoadingState text="Loading your bookings..." />
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={[styles.safeArea, { backgroundColor: palette.screenBg }]} edges={['top']}>
			<StatusBar style={isDark ? 'light' : 'dark'} />
			<TabsTopBar title="Bookings" />

			<ScrollView
				style={[styles.page, { backgroundColor: palette.screenBg }]}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={[styles.container, { paddingBottom: tabBarHeight + 16 }]}
				refreshControl={
					<RefreshControl
						refreshing={isRefreshing}
						onRefresh={() => {
							void loadBookings(true);
						}}
						tintColor={palette.primary}
					/>
				}
			>
				<View style={[styles.introCard, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
					<ThemedText style={[styles.introTitle, { color: palette.text }]}>My Bookings</ThemedText>
					<ThemedText style={[styles.introSubtitle, { color: palette.subtext }]}>Manage and track all your event bookings</ThemedText>
				</View>

				<View style={styles.statsRow}>
					<ThemedView style={[styles.statPill, styles.statTotal, { backgroundColor: palette.surfaceBg, borderColor: palette.tint }]}>
						<ThemedText style={[styles.statValue, { color: palette.tint }]}>{String(stats.total).padStart(2, '0')}</ThemedText>
						<ThemedText style={[styles.statLabel, { color: palette.subtext }]}>Total</ThemedText>
					</ThemedView>
					<ThemedView style={[styles.statPill, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
						<ThemedText style={[styles.statValue, { color: palette.tint }]}>{String(stats.upcoming).padStart(2, '0')}</ThemedText>
						<ThemedText style={[styles.statLabel, { color: palette.subtext }]}>Upcoming</ThemedText>
					</ThemedView>
					<ThemedView style={[styles.statPill, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
						<ThemedText style={[styles.statValue, { color: palette.tint }]}>{String(stats.pending).padStart(2, '0')}</ThemedText>
						<ThemedText style={[styles.statLabel, { color: palette.subtext }]}>Pending</ThemedText>
					</ThemedView>
				</View>

				<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
					{STATUS_CHIPS.map((chip) => {
						const isActive = activeStatus === chip;
						const label = chip === 'all' ? 'All' : STATUS_META[chip].chipLabel;

						return (
							<Pressable key={chip} onPress={() => setActiveStatus(chip)}>
								<ThemedView
									style={[
										styles.chip,
										{ backgroundColor: palette.surfaceBg, borderColor: palette.border },
										isActive ? [styles.activeChip, { backgroundColor: palette.tint, borderColor: palette.tint }] : null,
									]}
								>
									<ThemedText style={[styles.chipText, { color: palette.subtext }, isActive ? styles.activeChipText : null]}>{label}</ThemedText>
								</ThemedView>
							</Pressable>
						);
					})}
				</ScrollView>

				{loadError ? (
					<ThemedView style={[styles.feedbackCard, { backgroundColor: palette.surfaceBg, borderColor: palette.dangerBorder }]}>
						<ThemedText style={[styles.feedbackTitle, { color: palette.text }]}>Could not refresh bookings</ThemedText>
						<ThemedText style={[styles.feedbackSubtext, { color: palette.subtext }]}>
							{loadError}
						</ThemedText>
						<Pressable
							onPress={() => {
								void loadBookings(true);
							}}
							style={({ pressed }) => [
								styles.retryBtn,
								{ backgroundColor: palette.primary, borderColor: palette.primaryStrong },
								pressed ? styles.retryBtnPressed : null,
							]}
						>
							<ThemedText style={[styles.retryBtnText, { color: palette.onPrimary }]}>Retry</ThemedText>
						</Pressable>
					</ThemedView>
				) : null}

				{filteredBookings.length === 0 ? (
					<ThemedView style={[styles.feedbackCard, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
						<ThemedText style={[styles.feedbackTitle, { color: palette.text }]}>No bookings yet</ThemedText>
						<ThemedText style={[styles.feedbackSubtext, { color: palette.subtext }]}>
							Once you confirm an event, it will appear here.
						</ThemedText>
					</ThemedView>
				) : (
					filteredBookings.map((booking) => (
						<BookingCard 
							key={booking.id} 
							booking={booking} 
							palette={palette}
							onCancel={handleOpenCancelModal}
							onReview={handleOpenReviewModal}
						/>
					))
				)}

				<ThemedView style={[styles.helpCard, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
					<ThemedText style={[styles.helpTitle, { color: palette.text }]}>Need help with a booking?</ThemedText>
					<ThemedText style={[styles.helpSubtext, { color: palette.subtext }]}>Go to Support from profile quick actions for instant dummy help options.</ThemedText>
				</ThemedView>
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
		backgroundColor: '#F4F7F9',
	},
	page: {
		flex: 1,
		backgroundColor: '#F4F7F9',
	},
	container: {
		padding: 16,
		gap: 12,
	},
	introCard: {
		borderWidth: 1,
		borderRadius: 14,
		paddingHorizontal: 12,
		paddingVertical: 10,
	},
	introTitle: {
		fontSize: 18,
		fontWeight: '800',
	},
	introSubtitle: {
		marginTop: 2,
		fontSize: 12,
		fontWeight: '600',
	},
	statsRow: {
		flexDirection: 'row',
		gap: 8,
	},
	statPill: {
		flex: 1,
		borderRadius: 14,
		paddingVertical: 10,
		alignItems: 'center',
		backgroundColor: '#FFFFFF',
		borderWidth: 1,
		borderColor: '#E2E8F0',
	},
	statTotal: {
		backgroundColor: '#FFFFFF',
		borderColor: '#9BD2CB',
	},
	statValue: {
		fontSize: 16,
		fontWeight: '800',
		color: '#0F766E',
	},
	statLabel: {
		fontSize: 11,
		color: '#64748B',
	},
	chipsRow: {
		gap: 8,
		paddingRight: 6,
	},
	chip: {
		paddingHorizontal: 12,
		paddingVertical: 7,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: '#D0DCE3',
		backgroundColor: '#FFFFFF',
	},
	activeChip: {
		backgroundColor: '#3C6E71',
		borderColor: '#3C6E71',
	},
	chipText: {
		fontSize: 12,
		fontWeight: '700',
		color: '#475569',
	},
	activeChipText: {
		color: '#FFFFFF',
	},
	bookingCard: {
		borderWidth: 1,
		borderColor: '#E2E8F0',
		borderRadius: 16,
		padding: 12,
		gap: 8,
		backgroundColor: '#FFFFFF',
		boxShadow: '0px 3px 8px rgba(15, 23, 42, 0.04)',
	},
	bookingCardApproved: {
		borderLeftWidth: 4,
		borderLeftColor: '#7C3AED',
	},
	rowTop: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		gap: 8,
	},
	eventMeta: {
		flex: 1,
	},
	eventName: {
		fontSize: 16,
		color: '#0F172A',
	},
	bookingId: {
		fontSize: 12,
		color: '#64748B',
		marginTop: 2,
	},
	detailRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	detailText: {
		fontSize: 13,
		color: '#334155',
	},
	statusPill: {
		backgroundColor: '#DBEAFE',
		borderRadius: 999,
		paddingHorizontal: 10,
		paddingVertical: 4,
	},
	statusPending: {
		backgroundColor: '#FEF3C7',
	},
	statusCompleted: {
		backgroundColor: '#DCFCE7',
	},
	statusCancelled: {
		backgroundColor: '#FEE2E2',
	},
	statusApproved: {
		backgroundColor: '#F3E8FF',
	},
	statusText: {
		color: '#1D4ED8',
		fontWeight: '700',
		fontSize: 12,
	},
	statusTextPending: {
		color: '#B45309',
	},
	statusTextCompleted: {
		color: '#166534',
	},
	statusTextCancelled: {
		color: '#991B1B',
	},
	statusTextApproved: {
		color: '#7C3AED',
	},
	specialReq: {
		borderRadius: 8,
		padding: 8,
		marginTop: 4,
	},
	specialReqLabel: {
		fontSize: 11,
		fontWeight: '600',
		marginBottom: 2,
	},
	specialReqText: {
		fontSize: 12,
		lineHeight: 16,
	},
	actionButtons: {
		flexDirection: 'row',
		gap: 8,
		marginTop: 4,
	},
	actionBtn: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 4,
		paddingVertical: 8,
		borderRadius: 8,
	},
	actionBtnReview: {
		backgroundColor: '#F59E0B',
	},
	actionBtnCancel: {
		backgroundColor: '#FEE2E2',
		borderWidth: 1,
	},
	actionBtnPressed: {
		opacity: 0.8,
	},
	actionBtnText: {
		fontSize: 12,
		fontWeight: '700',
	},
	ctaBtn: {
		marginTop: 2,
		paddingVertical: 10,
		borderRadius: 10,
		alignItems: 'center',
		backgroundColor: '#ECFEFF',
		borderWidth: 1,
		borderColor: '#CCFBF1',
		boxShadow: '0px 5px 9px rgba(15, 23, 42, 0.18)',
	},
	ctaText: {
		fontSize: 13,
		fontWeight: '700',
		color: '#FFFFFF',
	},
	helpCard: {
		borderRadius: 12,
		padding: 12,
		backgroundColor: '#FFFFFF',
		borderWidth: 1,
		borderColor: '#E2E8F0',
		gap: 4,
	},
	helpTitle: {
		fontSize: 14,
		fontWeight: '800',
		color: '#1E293B',
	},
	helpSubtext: {
		fontSize: 12,
		color: '#64748B',
	},
	feedbackCard: {
		borderRadius: 12,
		padding: 12,
		borderWidth: 1,
		gap: 6,
	},
	feedbackTitle: {
		fontSize: 14,
		fontWeight: '800',
	},
	feedbackSubtext: {
		fontSize: 12,
		lineHeight: 18,
	},
	retryBtn: {
		marginTop: 4,
		alignSelf: 'flex-start',
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 8,
		borderWidth: 1,
	},
	retryBtnPressed: {
		opacity: 0.86,
	},
	retryBtnText: {
		fontSize: 12,
		fontWeight: '700',
	},
});
