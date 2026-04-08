import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	TextInput,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import FadeInView from '@/components/common/FadeInView';
import PageLoadingState from '@/components/common/PageLoadingState';
import AppMenuDrawer from '@/components/layout/AppMenuDrawer';
import { ThemedText } from '@/components/themed-text';
import { useAppToast } from '@/components/common/AppToastProvider';
import { useSettingsTheme } from '@/theme/settingsTheme';

type FilterKey = 'all' | 'pending' | 'awaiting-admin' | 'otp-required' | 'completed' | 'cancelled';

type BookingStatus =
	| 'pending_vendor_response'
	| 'pending'
	| 'confirmed'
	| 'completed'
	| 'awaiting_review'
	| 'cancelled_by_vendor'
	| 'rejected_by_vendor';

type AdminApproval = 'pending' | 'approved' | 'rejected';

interface VendorBooking {
	bookingId: string;
	bookingUuid: string;
	firstName: string;
	lastName: string;
	userName: string;
	eventDate: string;
	eventTime: string;
	packageName: string;
	packageId: string;
	status: BookingStatus;
	adminApproval: AdminApproval;
	otp: string;
	otpAttemptsRemaining: number;
	rejectReason?: string;
}

const filterKeys: FilterKey[] = ['all', 'pending', 'awaiting-admin', 'otp-required', 'completed', 'cancelled'];

const mockBookings: VendorBooking[] = [
	{
		bookingId: '1001',
		bookingUuid: 'BME-BOOK-1001',
		firstName: 'Rahul',
		lastName: 'Sharma',
		userName: 'rahul_s',
		eventDate: '2026-04-20',
		eventTime: '18:00',
		packageName: 'Wedding Essentials',
		packageId: '101',
		status: 'pending_vendor_response',
		adminApproval: 'pending',
		otp: '123456',
		otpAttemptsRemaining: 3,
	},
	{
		bookingId: '1002',
		bookingUuid: 'BME-BOOK-1002',
		firstName: 'Neha',
		lastName: 'Jain',
		userName: 'nehaj',
		eventDate: '2026-04-24',
		eventTime: '14:00',
		packageName: 'Corporate Premium',
		packageId: '202',
		status: 'confirmed',
		adminApproval: 'pending',
		otp: '123456',
		otpAttemptsRemaining: 3,
	},
	{
		bookingId: '1003',
		bookingUuid: 'BME-BOOK-1003',
		firstName: 'Amit',
		lastName: 'Verma',
		userName: 'amitv',
		eventDate: '2026-04-28',
		eventTime: '20:00',
		packageName: 'Birthday Delight',
		packageId: '303',
		status: 'confirmed',
		adminApproval: 'approved',
		otp: '123456',
		otpAttemptsRemaining: 3,
	},
];

const getFilterLabel = (key: FilterKey) => {
	if (key === 'awaiting-admin') return 'Awaiting Admin';
	if (key === 'otp-required') return 'OTP Required';
	return key.charAt(0).toUpperCase() + key.slice(1);
};

const isPending = (booking: VendorBooking) =>
	booking.status === 'pending_vendor_response' || booking.status === 'pending';

const isAwaitingAdmin = (booking: VendorBooking) =>
	booking.status === 'confirmed' && booking.adminApproval === 'pending';

const isOtpRequired = (booking: VendorBooking) =>
	booking.status === 'confirmed' && booking.adminApproval === 'approved';

const isCompleted = (booking: VendorBooking) =>
	booking.status === 'completed' || booking.status === 'awaiting_review';

const isCancelled = (booking: VendorBooking) =>
	booking.status.includes('cancelled') || booking.status.includes('rejected');

export default function VendorBookingsScreen() {
	const { palette } = useSettingsTheme();
	const { showError, showSuccess, showInfo } = useAppToast();

	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
	const [bookings, setBookings] = useState<VendorBooking[]>([]);
	const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

	const [rejectModalOpen, setRejectModalOpen] = useState(false);
	const [rejectReason, setRejectReason] = useState('Rejected by vendor');
	const [rejectBookingId, setRejectBookingId] = useState<string | null>(null);

	const [otpModalOpen, setOtpModalOpen] = useState(false);
	const [otpCode, setOtpCode] = useState('');
	const [otpBooking, setOtpBooking] = useState<VendorBooking | null>(null);
	const [otpBusy, setOtpBusy] = useState(false);
	const [attemptsRemaining, setAttemptsRemaining] = useState(3);

	const loadBookings = useCallback(async (silent = false) => {
		if (silent) {
			setIsRefreshing(true);
		} else {
			setIsLoading(true);
		}

		await new Promise((resolve) => setTimeout(resolve, 300));
		setBookings((prev) => (prev.length > 0 ? prev : mockBookings));

		setIsLoading(false);
		setIsRefreshing(false);
	}, []);

	useEffect(() => {
		void loadBookings();
	}, [loadBookings]);

	const filteredBookings = useMemo(() => {
		if (activeFilter === 'all') {
			return bookings;
		}

		return bookings.filter((booking) => {
			if (activeFilter === 'pending') return isPending(booking);
			if (activeFilter === 'awaiting-admin') return isAwaitingAdmin(booking);
			if (activeFilter === 'otp-required') return isOtpRequired(booking);
			if (activeFilter === 'completed') return isCompleted(booking);
			if (activeFilter === 'cancelled') return isCancelled(booking);
			return true;
		});
	}, [activeFilter, bookings]);

	const counts = useMemo(
		() => ({
			all: bookings.length,
			pending: bookings.filter(isPending).length,
			'awaiting-admin': bookings.filter(isAwaitingAdmin).length,
			'otp-required': bookings.filter(isOtpRequired).length,
			completed: bookings.filter(isCompleted).length,
			cancelled: bookings.filter(isCancelled).length,
		}),
		[bookings]
	);

	const runAction = async (
		bookingId: string,
		action: (booking: VendorBooking) => VendorBooking,
		successMessage: string
	) => {
		setActionLoadingId(bookingId);
		await new Promise((resolve) => setTimeout(resolve, 350));
		setBookings((prev) => prev.map((item) => (item.bookingId === bookingId ? action(item) : item)));
		showSuccess(successMessage);
		setActionLoadingId(null);
	};

	const openReject = (bookingId: string) => {
		setRejectBookingId(bookingId);
		setRejectReason('Rejected by vendor');
		setRejectModalOpen(true);
	};

	const submitReject = async () => {
		if (!rejectBookingId) {
			return;
		}
		setRejectModalOpen(false);
		await runAction(
			rejectBookingId,
			(booking) => ({
				...booking,
				status: 'rejected_by_vendor',
				rejectReason: rejectReason.trim() || 'Rejected by vendor',
			}),
			'Booking rejected.'
		);
	};

	const openOtpModal = async (booking: VendorBooking) => {
		setOtpBooking(booking);
		setOtpCode('');
		setOtpModalOpen(true);
		setAttemptsRemaining(booking.otpAttemptsRemaining);
	};

	const verifyOtp = async () => {
		if (!otpBooking) {
			return;
		}

		if (!/^\d{6}$/.test(otpCode)) {
			showError('Enter a valid 6-digit OTP.');
			return;
		}

		setOtpBusy(true);
		await new Promise((resolve) => setTimeout(resolve, 350));

		const booking = bookings.find((item) => item.bookingId === otpBooking.bookingId);
		if (!booking) {
			setOtpBusy(false);
			showError('Booking not found.');
			return;
		}

		if (booking.otpAttemptsRemaining <= 0) {
			setOtpBusy(false);
			showError('Too many failed attempts. Please resend OTP.');
			return;
		}

		if (otpCode !== booking.otp) {
			const remaining = booking.otpAttemptsRemaining - 1;
			setBookings((prev) =>
				prev.map((item) =>
					item.bookingId === booking.bookingId
						? {
							...item,
							otpAttemptsRemaining: Math.max(remaining, 0),
						}
						: item
				)
			);
			setAttemptsRemaining(Math.max(remaining, 0));
			setOtpBusy(false);
			showError(remaining > 0 ? `Invalid OTP. ${remaining} attempts left.` : 'OTP locked. Please resend OTP.');
			return;
		}

		setBookings((prev) =>
			prev.map((item) =>
				item.bookingId === booking.bookingId
					? {
						...item,
						status: 'completed',
						otpAttemptsRemaining: 3,
					}
					: item
			)
		);
		showSuccess('OTP verified successfully.');
		setOtpModalOpen(false);
		setOtpBusy(false);
	};

	const resendOtp = async () => {
		if (!otpBooking) {
			return;
		}
		setOtpBusy(true);
		await new Promise((resolve) => setTimeout(resolve, 350));
		setBookings((prev) =>
			prev.map((item) =>
				item.bookingId === otpBooking.bookingId
					? {
						...item,
						otp: '123456',
						otpAttemptsRemaining: 3,
					}
					: item
			)
		);
		setOtpCode('');
		setAttemptsRemaining(3);
		setOtpBusy(false);
		showInfo('New OTP sent to customer. Use 123456 for demo.');
	};

	if (isLoading) {
		return <PageLoadingState text="Loading bookings..." />;
	}

	return (
		<SafeAreaView style={[styles.safeArea, { backgroundColor: palette.screenBg }]} edges={['top']}>
			<View style={styles.container}>
				<View style={[styles.appBar, { backgroundColor: palette.primary, borderColor: palette.primaryStrong }]}>
					<AppMenuDrawer />
					<ThemedText style={[styles.appBarTitle, { color: palette.onPrimary }]}>Vendor Bookings</ThemedText>
					<Pressable
						style={[styles.iconBtn, { borderColor: palette.primaryStrong, backgroundColor: palette.primaryStrong }]}
						onPress={() => void loadBookings(true)}
					>
						<Ionicons name={isRefreshing ? 'hourglass-outline' : 'refresh-outline'} size={18} color={palette.onPrimary} />
					</Pressable>
				</View>

				<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
					{filterKeys.map((key) => {
						const active = key === activeFilter;
						return (
							<Pressable
								key={key}
								style={[
									styles.filterChip,
									{ borderColor: active ? palette.primary : palette.border, backgroundColor: active ? palette.primary : palette.surfaceBg },
								]}
								onPress={() => setActiveFilter(key)}
							>
								<ThemedText style={[styles.filterText, { color: active ? palette.onPrimary : palette.text }]}> 
									{getFilterLabel(key)} ({counts[key]})
								</ThemedText>
							</Pressable>
						);
					})}
				</ScrollView>

				<ScrollView contentContainerStyle={styles.listWrap}>
					{filteredBookings.length === 0 ? (
						<ThemedText style={[styles.emptyText, { color: palette.subtext }]}>No bookings found for this filter.</ThemedText>
					) : (
						filteredBookings.map((booking, index) => {
							const bookingId = String(booking.bookingId);
							const canAcceptReject = isPending(booking);
							const canCancel = isPending(booking) || isAwaitingAdmin(booking);
							const needsOtp = isOtpRequired(booking);

							return (
								<FadeInView key={bookingId} delay={index * 25}>
									<View style={[styles.card, { borderColor: palette.border, backgroundColor: palette.surfaceBg }]}>
										<ThemedText style={[styles.cardTitle, { color: palette.text }]}>Booking #{String(booking.bookingUuid || booking.bookingId).slice(-8)}</ThemedText>
										<ThemedText style={[styles.cardMeta, { color: palette.subtext }]}>
											{booking.firstName || booking.userName || 'Customer'} {booking.lastName || ''} - {booking.eventDate || '-'} {booking.eventTime || ''}
										</ThemedText>
										<ThemedText style={[styles.cardMeta, { color: palette.subtext }]}>Package: {booking.packageName || `Package #${booking.packageId || '-'}`}</ThemedText>
										<ThemedText style={[styles.cardMeta, { color: palette.subtext }]}>Status: {booking.status}{booking.adminApproval ? ` / ${booking.adminApproval}` : ''}</ThemedText>

										<View style={styles.actionRow}>
											{canAcceptReject ? (
												<Pressable
													style={[styles.actionBtn, { backgroundColor: palette.successSoft, borderColor: palette.successBorder }]}
													onPress={() =>
														void runAction(
															bookingId,
															(item) => ({ ...item, status: 'confirmed', adminApproval: 'pending' }),
															'Booking accepted. Awaiting admin approval.'
														)
													}
													disabled={actionLoadingId === bookingId}
												>
													<ThemedText style={[styles.actionText, { color: palette.success }]}>{actionLoadingId === bookingId ? 'Working...' : 'Accept'}</ThemedText>
												</Pressable>
											) : null}

											{canAcceptReject ? (
												<Pressable
													style={[styles.actionBtn, { backgroundColor: palette.dangerSoft, borderColor: palette.dangerBorder }]}
													onPress={() => openReject(bookingId)}
													disabled={actionLoadingId === bookingId}
												>
													<ThemedText style={[styles.actionText, { color: palette.danger }]}>Reject</ThemedText>
												</Pressable>
											) : null}

											{needsOtp ? (
												<Pressable
													style={[styles.actionBtn, { backgroundColor: palette.pressedBg, borderColor: palette.primary }]}
													onPress={() => void openOtpModal(booking)}
												>
													<ThemedText style={[styles.actionText, { color: palette.primary }]}>Verify OTP</ThemedText>
												</Pressable>
											) : null}

											{canCancel ? (
												<Pressable
													style={[styles.actionBtn, { backgroundColor: palette.warningSoft, borderColor: palette.warning }]}
													onPress={() =>
														void runAction(
															bookingId,
															(item) => ({ ...item, status: 'cancelled_by_vendor' }),
															'Booking cancelled.'
														)
													}
													disabled={actionLoadingId === bookingId}
												>
													<ThemedText style={[styles.actionText, { color: palette.warning }]}>Cancel</ThemedText>
												</Pressable>
											) : null}
										</View>
									</View>
								</FadeInView>
							);
						})
					)}
				</ScrollView>
			</View>

			<Modal visible={rejectModalOpen} transparent animationType="slide" onRequestClose={() => setRejectModalOpen(false)}>
				<View style={[styles.modalOverlay, { backgroundColor: palette.overlay }]}>
					<View style={[styles.modalCard, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}> 
						<ThemedText style={[styles.modalTitle, { color: palette.text }]}>Reject Booking</ThemedText>
						<TextInput
							style={[styles.modalInput, { color: palette.text, borderColor: palette.border, backgroundColor: palette.headerBtnBg }]}
							placeholder="Reason"
							placeholderTextColor={palette.muted}
							value={rejectReason}
							onChangeText={setRejectReason}
						/>
						<View style={styles.modalActions}>
							<Pressable style={[styles.modalBtn, { borderColor: palette.border, backgroundColor: palette.headerBtnBg }]} onPress={() => setRejectModalOpen(false)}>
								<ThemedText style={[styles.modalBtnText, { color: palette.text }]}>Cancel</ThemedText>
							</Pressable>
							<Pressable style={[styles.modalBtn, { backgroundColor: palette.danger }]} onPress={() => void submitReject()}>
								<ThemedText style={[styles.modalBtnText, { color: palette.onPrimary }]}>Reject</ThemedText>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>

			<Modal visible={otpModalOpen} transparent animationType="slide" onRequestClose={() => setOtpModalOpen(false)}>
				<View style={[styles.modalOverlay, { backgroundColor: palette.overlay }]}>
					<View style={[styles.modalCard, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}> 
						<ThemedText style={[styles.modalTitle, { color: palette.text }]}>Verify Customer OTP</ThemedText>
						<ThemedText style={[styles.modalHint, { color: palette.subtext }]}>Attempts remaining: {attemptsRemaining}</ThemedText>
						<TextInput
							style={[styles.modalInput, { color: palette.text, borderColor: palette.border, backgroundColor: palette.headerBtnBg }]}
							placeholder="Enter 6-digit OTP"
							placeholderTextColor={palette.muted}
							value={otpCode}
							onChangeText={setOtpCode}
							keyboardType="number-pad"
							maxLength={6}
						/>
						<ThemedText style={[styles.modalHint, { color: palette.muted }]}>Demo OTP: 123456</ThemedText>
						<View style={styles.modalActions}>
							<Pressable style={[styles.modalBtn, { borderColor: palette.border, backgroundColor: palette.headerBtnBg }]} onPress={() => setOtpModalOpen(false)}>
								<ThemedText style={[styles.modalBtnText, { color: palette.text }]}>Close</ThemedText>
							</Pressable>
							<Pressable style={[styles.modalBtn, { backgroundColor: palette.primary }]} onPress={() => void verifyOtp()} disabled={otpBusy}>
								<ThemedText style={[styles.modalBtnText, { color: palette.onPrimary }]}>{otpBusy ? 'Verifying...' : 'Verify OTP'}</ThemedText>
							</Pressable>
						</View>
						<Pressable style={[styles.resendBtn, { borderColor: palette.border, backgroundColor: palette.headerBtnBg }]} onPress={() => void resendOtp()} disabled={otpBusy}>
							<ThemedText style={[styles.resendText, { color: palette.primary }]}>{otpBusy ? 'Please wait...' : 'Resend OTP'}</ThemedText>
						</Pressable>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	container: {
		flex: 1,
		padding: 16,
		gap: 10,
	},
	appBar: {
		height: 56,
		borderRadius: 14,
		paddingHorizontal: 12,
		borderWidth: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	appBarTitle: {
		fontSize: 16,
		fontWeight: '800',
	},
	iconBtn: {
		width: 36,
		height: 36,
		borderRadius: 18,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	filterRow: {
		gap: 8,
		paddingVertical: 4,
		paddingRight: 8,
	},
	filterChip: {
		height: 34,
		paddingHorizontal: 10,
		borderRadius: 17,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	filterText: {
		fontSize: 12,
		fontWeight: '700',
	},
	listWrap: {
		gap: 10,
		paddingBottom: 24,
	},
	emptyText: {
		fontSize: 14,
		textAlign: 'center',
		marginTop: 30,
	},
	card: {
		borderWidth: 1,
		borderRadius: 12,
		padding: 12,
		gap: 6,
	},
	cardTitle: {
		fontSize: 16,
		fontWeight: '800',
	},
	cardMeta: {
		fontSize: 13,
		lineHeight: 18,
	},
	actionRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
		marginTop: 6,
	},
	actionBtn: {
		height: 34,
		paddingHorizontal: 10,
		borderRadius: 9,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	actionText: {
		fontSize: 12,
		fontWeight: '700',
	},
	modalOverlay: {
		flex: 1,
		justifyContent: 'center',
		padding: 16,
	},
	modalCard: {
		borderWidth: 1,
		borderRadius: 12,
		padding: 12,
		gap: 10,
	},
	modalTitle: {
		fontSize: 17,
		fontWeight: '800',
	},
	modalHint: {
		fontSize: 13,
	},
	modalInput: {
		height: 42,
		borderWidth: 1,
		borderRadius: 10,
		paddingHorizontal: 12,
		fontSize: 14,
	},
	modalActions: {
		flexDirection: 'row',
		gap: 8,
	},
	modalBtn: {
		flex: 1,
		height: 38,
		borderWidth: 1,
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'center',
	},
	modalBtnText: {
		fontSize: 13,
		fontWeight: '700',
	},
	resendBtn: {
		height: 36,
		borderRadius: 10,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	resendText: {
		fontSize: 13,
		fontWeight: '700',
	},
});