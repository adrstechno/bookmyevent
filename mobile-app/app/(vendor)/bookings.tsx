import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	ActivityIndicator,
	Modal,
	Pressable,
	RefreshControl,
	ScrollView,
	StyleSheet,
	TextInput,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BookingCard from '@/components/vendor/BookingCard';
import VendorAppBar from '@/components/vendor/VendorAppBar';
import { ThemedText } from '@/components/themed-text';
import { useAppToast } from '@/components/common/AppToastProvider';
import { useSettingsTheme } from '@/theme/settingsTheme';
import {
	fetchVendorBookings,
	acceptVendorBooking,
	rejectVendorBooking,
	cancelVendorBooking,
	verifyVendorOtp,
	resendVendorOtp,
	fetchOtpAttempts,
} from '@/services/vendor/vendorService';
import {
	type VendorBooking,
	type FilterKey,
	FILTER_KEYS,
	getFilterLabel,
	isPending,
	isAwaitingAdmin,
	isOtpRequired,
	isCompleted,
	isCancelled,
} from '@/utils/bookingHelpers';

export default function VendorBookingsScreen() {
	const { palette } = useSettingsTheme();
	const { showError, showSuccess } = useAppToast();

	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [bookings, setBookings] = useState<VendorBooking[]>([]);
	const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
	const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

	// ── Reject modal ─────────────────────────────────────────────
	const [rejectModalOpen, setRejectModalOpen] = useState(false);
	const [rejectReason, setRejectReason] = useState('');
	const [rejectBookingId, setRejectBookingId] = useState<string | null>(null);

	// ── OTP modal ────────────────────────────────────────────────
	const [otpModalOpen, setOtpModalOpen] = useState(false);
	const [otpCode, setOtpCode] = useState('');
	const [otpError, setOtpError] = useState('');
	const [otpBooking, setOtpBooking] = useState<VendorBooking | null>(null);
	const [otpBusy, setOtpBusy] = useState(false);
	const [attemptsRemaining, setAttemptsRemaining] = useState(3);

	// ── Fetch bookings ───────────────────────────────────────────
	const loadBookings = useCallback(async (isRefresh = false) => {
		if (isRefresh) setRefreshing(true);
		else setLoading(true);

		try {
			const data = await fetchVendorBookings();
			// Map VendorBooking from service to bookingHelpers VendorBooking
			const mapped: VendorBooking[] = data.map((b) => ({
				bookingId: String(b.bookingId),
				bookingUuid: b.bookingUuid,
				status: b.status,
				adminApproval: b.adminApproval,
				firstName: b.firstName,
				lastName: b.lastName,
				userName: b.userName,
				email: b.email,
				phone: b.phone,
				eventDate: b.eventDate,
				eventTime: b.eventTime,
				packageName: b.packageName,
				packageId: b.packageId,
				amount: b.amount,
				eventAddress: b.eventAddress,
				specialRequirement: b.specialRequirement,
				createdAt: b.createdAt,
			}));
			setBookings(mapped);
		} catch (err: unknown) {
			const msg = (err as { message?: string })?.message ?? 'Failed to load bookings';
			showError(msg);
			setBookings([]);
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	}, [showError]);

	useEffect(() => { loadBookings(); }, [loadBookings]);

	// ── Filter counts ────────────────────────────────────────────
	const counts = useMemo(() => ({
		all: bookings.length,
		pending: bookings.filter(isPending).length,
		'awaiting-admin': bookings.filter(isAwaitingAdmin).length,
		'otp-required': bookings.filter(isOtpRequired).length,
		completed: bookings.filter(isCompleted).length,
		cancelled: bookings.filter(isCancelled).length,
	}), [bookings]);

	const filteredBookings = useMemo(() => {
		if (activeFilter === 'all') return bookings;
		return bookings.filter((b) => {
			if (activeFilter === 'pending') return isPending(b);
			if (activeFilter === 'awaiting-admin') return isAwaitingAdmin(b);
			if (activeFilter === 'otp-required') return isOtpRequired(b);
			if (activeFilter === 'completed') return isCompleted(b);
			if (activeFilter === 'cancelled') return isCancelled(b);
			return true;
		});
	}, [activeFilter, bookings]);

	// ── Accept ───────────────────────────────────────────────────
	const handleAccept = useCallback(async (bookingId: string) => {
		setActionLoadingId(bookingId);
		try {
			await acceptVendorBooking(bookingId);
			showSuccess('Booking accepted! Awaiting admin approval.');
			await loadBookings();
		} catch (err: unknown) {
			showError((err as { message?: string })?.message ?? 'Failed to accept booking');
		} finally {
			setActionLoadingId(null);
		}
	}, [loadBookings, showError, showSuccess]);

	// ── Reject ───────────────────────────────────────────────────
	const openRejectModal = useCallback((bookingId: string) => {
		setRejectBookingId(bookingId);
		setRejectReason('');
		setRejectModalOpen(true);
	}, []);

	const submitReject = useCallback(async () => {
		if (!rejectBookingId) return;
		setRejectModalOpen(false);
		setActionLoadingId(rejectBookingId);
		try {
			await rejectVendorBooking(rejectBookingId, rejectReason.trim() || 'Rejected by vendor');
			showSuccess('Booking rejected.');
			await loadBookings();
		} catch (err: unknown) {
			showError((err as { message?: string })?.message ?? 'Failed to reject booking');
		} finally {
			setActionLoadingId(null);
			setRejectBookingId(null);
		}
	}, [rejectBookingId, rejectReason, loadBookings, showError, showSuccess]);

	// ── Cancel ───────────────────────────────────────────────────
	const handleCancel = useCallback(async (bookingId: string) => {
		setActionLoadingId(bookingId);
		try {
			await cancelVendorBooking(bookingId);
			showSuccess('Booking cancelled.');
			await loadBookings();
		} catch (err: unknown) {
			showError((err as { message?: string })?.message ?? 'Failed to cancel booking');
		} finally {
			setActionLoadingId(null);
		}
	}, [loadBookings, showError, showSuccess]);

	// ── OTP modal open ───────────────────────────────────────────
	const openOtpModal = useCallback(async (booking: VendorBooking) => {
		setOtpBooking(booking);
		setOtpCode('');
		setOtpError('');
		setAttemptsRemaining(3);
		setOtpModalOpen(true);
		// Fetch remaining attempts from server
		try {
			const res = await fetchOtpAttempts(booking.bookingId);
			setAttemptsRemaining(res.attemptsRemaining);
		} catch {
			// non-fatal
		}
	}, []);

	const closeOtpModal = useCallback(() => {
		setOtpModalOpen(false);
		setOtpCode('');
		setOtpError('');
		setOtpBooking(null);
	}, []);

	// ── OTP verify ───────────────────────────────────────────────
	const handleVerifyOtp = useCallback(async () => {
		if (!otpBooking) return;
		if (!/^\d{6}$/.test(otpCode)) {
			setOtpError('Please enter a valid 6-digit OTP');
			return;
		}

		setOtpBusy(true);
		setOtpError('');
		try {
			const res = await verifyVendorOtp(otpBooking.bookingId, otpCode);
			if (res.success) {
				showSuccess('OTP verified successfully! Booking confirmed.');
				closeOtpModal();
				await loadBookings();
			} else {
				const remaining = (res as any)?.data?.attemptsRemaining;
				if (remaining !== undefined) setAttemptsRemaining(remaining);
				setOtpError((res as any)?.message ?? 'Invalid OTP');
			}
		} catch (err: unknown) {
			const errData = err as { message?: string; data?: { attemptsRemaining?: number; isLocked?: boolean } };
			if (errData?.data?.attemptsRemaining !== undefined) {
				setAttemptsRemaining(errData.data.attemptsRemaining);
			}
			if (errData?.data?.isLocked) {
				setOtpError('Too many failed attempts. OTP is locked for 15 minutes.');
			} else {
				setOtpError(errData?.message ?? 'Failed to verify OTP');
			}
		} finally {
			setOtpBusy(false);
		}
	}, [otpBooking, otpCode, closeOtpModal, loadBookings, showSuccess]);

	// ── OTP resend ───────────────────────────────────────────────
	const handleResendOtp = useCallback(async () => {
		if (!otpBooking) return;
		setOtpBusy(true);
		try {
			await resendVendorOtp(otpBooking.bookingId);
			showSuccess('New OTP sent to customer!');
			setOtpCode('');
			setOtpError('');
			setAttemptsRemaining(3);
		} catch (err: unknown) {
			showError((err as { message?: string })?.message ?? 'Failed to resend OTP');
		} finally {
			setOtpBusy(false);
		}
	}, [otpBooking, showSuccess, showError]);

	// ── Loading screen ───────────────────────────────────────────
	if (loading) {
		return (
			<SafeAreaView style={{ flex: 1, backgroundColor: palette.screenBg }}>
				<VendorAppBar title="Booking Requests" />
				<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
					<ActivityIndicator size="large" color={palette.primary} />
					<ThemedText style={{ color: palette.muted }}>Loading bookings...</ThemedText>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: palette.screenBg }}>
			<VendorAppBar title="Booking Requests" />

			{/* Sub-header */}
			<View style={s.subHeader}>
				<ThemedText style={[s.subHeaderText, { color: palette.muted }]}>
					Manage incoming booking requests from customers
				</ThemedText>
			</View>

			{/* Filter chips */}
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={s.filterRow}
			>
				{FILTER_KEYS.map((key) => {
					const active = key === activeFilter;
					return (
						<Pressable
							key={key}
							style={[
								s.chip,
								{
									borderColor: active ? palette.primary : palette.border,
									backgroundColor: active ? palette.primary : palette.surfaceBg,
								},
							]}
							onPress={() => setActiveFilter(key)}
						>
							<ThemedText style={[s.chipText, { color: active ? '#fff' : palette.text }]}>
								{getFilterLabel(key)}
							</ThemedText>
							<View style={[s.chipBadge, { backgroundColor: active ? 'rgba(255,255,255,0.25)' : palette.border }]}>
								<ThemedText style={[s.chipBadgeText, { color: active ? '#fff' : palette.muted }]}>
									{counts[key]}
								</ThemedText>
							</View>
						</Pressable>
					);
				})}
			</ScrollView>

			{/* Booking list */}
			<ScrollView
				contentContainerStyle={s.list}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={() => loadBookings(true)}
						colors={[palette.primary]}
						tintColor={palette.primary}
					/>
				}
			>
				{filteredBookings.length === 0 ? (
					<View style={[s.emptyBox, { backgroundColor: palette.surfaceBg }]}>
						<Ionicons name="calendar-outline" size={56} color={palette.border} />
						<ThemedText style={[s.emptyTitle, { color: palette.text }]}>No Bookings Found</ThemedText>
						<ThemedText style={[s.emptyBody, { color: palette.muted }]}>
							{activeFilter === 'all'
								? "You don't have any booking requests yet."
								: `No ${getFilterLabel(activeFilter).toLowerCase()} bookings.`}
						</ThemedText>
					</View>
				) : (
					filteredBookings.map((booking) => (
						<BookingCard
							key={booking.bookingId}
							booking={booking}
							palette={palette}
							actionLoadingId={actionLoadingId}
							onAccept={() => handleAccept(booking.bookingId)}
							onReject={() => openRejectModal(booking.bookingId)}
							onCancel={() => handleCancel(booking.bookingId)}
							onVerifyOtp={() => openOtpModal(booking)}
						/>
					))
				)}
			</ScrollView>

			{/* ── Reject Modal ── */}
			<Modal
				visible={rejectModalOpen}
				transparent
				animationType="fade"
				onRequestClose={() => setRejectModalOpen(false)}
			>
				<View style={s.modalOverlay}>
					<View style={[s.modalBox, { backgroundColor: palette.surfaceBg }]}>
						<ThemedText style={[s.modalTitle, { color: palette.text }]}>Reject Booking</ThemedText>
						<ThemedText style={[s.modalSub, { color: palette.muted }]}>
							Please provide a reason for rejection (optional)
						</ThemedText>
						<TextInput
							style={[s.modalInput, { color: palette.text, borderColor: palette.border, backgroundColor: palette.elevatedBg }]}
							placeholder="Reason for rejection"
							placeholderTextColor={palette.muted}
							value={rejectReason}
							onChangeText={setRejectReason}
							multiline
						/>
						<View style={s.modalBtns}>
							<Pressable
								style={[s.modalBtn, { backgroundColor: palette.elevatedBg, borderColor: palette.border }]}
								onPress={() => setRejectModalOpen(false)}
							>
								<ThemedText style={[s.modalBtnText, { color: palette.text }]}>Cancel</ThemedText>
							</Pressable>
							<Pressable style={[s.modalBtn, { backgroundColor: '#ef4444' }]} onPress={submitReject}>
								<ThemedText style={[s.modalBtnText, { color: '#fff' }]}>Reject</ThemedText>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>

			{/* ── OTP Modal ── */}
			<Modal
				visible={otpModalOpen}
				transparent
				animationType="fade"
				onRequestClose={closeOtpModal}
			>
				<View style={s.modalOverlay}>
					<View style={[s.modalBox, { backgroundColor: palette.surfaceBg }]}>
						{/* Icon */}
						<View style={s.otpIconWrap}>
							<Ionicons name="shield-checkmark-outline" size={36} color="#7c3aed" />
						</View>
						<ThemedText style={[s.modalTitle, { color: palette.text, textAlign: 'center' }]}>
							Verify OTP
						</ThemedText>
						<ThemedText style={[s.modalSub, { color: palette.muted, textAlign: 'center' }]}>
							Enter the 6-digit OTP provided by the customer to confirm booking #{otpBooking?.bookingId}
						</ThemedText>

						{/* Customer info */}
						{otpBooking ? (
							<View style={[s.otpCustomerBox, { backgroundColor: palette.elevatedBg }]}>
								<ThemedText style={[s.otpInfoLabel, { color: palette.muted }]}>Customer</ThemedText>
								<ThemedText style={[s.otpInfoValue, { color: palette.text }]}>
									{otpBooking.firstName} {otpBooking.lastName}
								</ThemedText>
								{otpBooking.eventDate ? (
									<>
										<ThemedText style={[s.otpInfoLabel, { color: palette.muted }]}>Event Date</ThemedText>
										<ThemedText style={[s.otpInfoValue, { color: palette.text }]}>
											{new Date(otpBooking.eventDate).toLocaleDateString('en-IN', {
												weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
											})}
										</ThemedText>
									</>
								) : null}
							</View>
						) : null}

						{/* OTP input */}
						<TextInput
							style={[
								s.otpInput,
								{
									color: palette.text,
									borderColor: otpError ? '#ef4444' : '#7c3aed',
									backgroundColor: palette.elevatedBg,
								},
							]}
							placeholder="Enter 6-digit OTP"
							placeholderTextColor={palette.muted}
							value={otpCode}
							onChangeText={(v) => { setOtpCode(v.replace(/\D/g, '')); setOtpError(''); }}
							keyboardType="number-pad"
							maxLength={6}
						/>
						{otpError ? <ThemedText style={s.otpError}>{otpError}</ThemedText> : null}
						<ThemedText style={[s.attemptsText, { color: attemptsRemaining <= 1 ? '#ef4444' : palette.muted }]}>
							Attempts remaining: {attemptsRemaining}
						</ThemedText>

						{/* Buttons */}
						<View style={s.modalBtns}>
							<Pressable
								style={[s.modalBtn, { backgroundColor: palette.elevatedBg, borderColor: palette.border }]}
								onPress={closeOtpModal}
							>
								<ThemedText style={[s.modalBtnText, { color: palette.text }]}>Cancel</ThemedText>
							</Pressable>
							<Pressable
								style={[s.modalBtn, { backgroundColor: '#7c3aed', opacity: otpBusy || otpCode.length !== 6 ? 0.5 : 1 }]}
								onPress={handleVerifyOtp}
								disabled={otpBusy || otpCode.length !== 6}
							>
								{otpBusy ? (
									<ActivityIndicator size="small" color="#fff" />
								) : (
									<Ionicons name="checkmark" size={16} color="#fff" />
								)}
								<ThemedText style={[s.modalBtnText, { color: '#fff' }]}>
									{otpBusy ? 'Verifying...' : 'Verify'}
								</ThemedText>
							</Pressable>
						</View>

						{/* Resend */}
						<Pressable style={s.resendBtn} onPress={handleResendOtp} disabled={otpBusy}>
							<ThemedText style={[s.resendText, { color: '#7c3aed', opacity: otpBusy ? 0.5 : 1 }]}>
								{otpBusy ? 'Please wait...' : 'Resend OTP to customer'}
							</ThemedText>
						</Pressable>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
}

const s = StyleSheet.create({
	subHeader: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
	subHeaderText: { fontSize: 13 },
	filterRow: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
	chip: {
		flexDirection: 'row', alignItems: 'center', gap: 6,
		height: 34, paddingHorizontal: 12, borderRadius: 17, borderWidth: 1,
	},
	chipText: { fontSize: 12, fontWeight: '700' },
	chipBadge: {
		minWidth: 20, height: 20, paddingHorizontal: 6,
		borderRadius: 10, alignItems: 'center', justifyContent: 'center',
	},
	chipBadgeText: { fontSize: 11, fontWeight: '700', lineHeight: 14 },
	list: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 32, gap: 14 },
	emptyBox: { borderRadius: 16, padding: 40, alignItems: 'center', gap: 10 },
	emptyTitle: { fontSize: 20, fontWeight: '800' },
	emptyBody: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
	// Modals
	modalOverlay: {
		flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
		justifyContent: 'center', padding: 20,
	},
	modalBox: { borderRadius: 18, padding: 20, gap: 12 },
	modalTitle: { fontSize: 18, fontWeight: '800' },
	modalSub: { fontSize: 13, lineHeight: 19 },
	modalInput: {
		borderWidth: 1, borderRadius: 10,
		paddingHorizontal: 12, paddingVertical: 10,
		fontSize: 14, minHeight: 44,
	},
	modalBtns: { flexDirection: 'row', gap: 10 },
	modalBtn: {
		flex: 1, flexDirection: 'row', alignItems: 'center',
		justifyContent: 'center', gap: 6, height: 44,
		borderRadius: 10, borderWidth: 1, borderColor: 'transparent',
	},
	modalBtnText: { fontSize: 14, fontWeight: '700' },
	// OTP modal
	otpIconWrap: {
		width: 64, height: 64, borderRadius: 32,
		backgroundColor: '#ede9fe', alignItems: 'center',
		justifyContent: 'center', alignSelf: 'center',
	},
	otpCustomerBox: { borderRadius: 12, padding: 12, gap: 2 },
	otpInfoLabel: { fontSize: 11 },
	otpInfoValue: { fontSize: 14, fontWeight: '700', marginBottom: 6 },
	otpInput: {
		height: 54, borderWidth: 2, borderRadius: 12,
		textAlign: 'center', fontSize: 24,
		letterSpacing: 8, fontWeight: '800',
	},
	otpError: { fontSize: 13, color: '#ef4444' },
	attemptsText: { fontSize: 13 },
	resendBtn: { alignItems: 'center', paddingVertical: 6 },
	resendText: { fontSize: 13, fontWeight: '700' },
});
