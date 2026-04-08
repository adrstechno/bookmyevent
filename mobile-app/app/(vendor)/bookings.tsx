import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import PageLoadingState from '@/components/common/PageLoadingState';
import AppMenuDrawer from '@/components/layout/AppMenuDrawer';
import BookingCard from '@/components/vendor/BookingCard';
import { ThemedText } from '@/components/themed-text';
import { useAppToast } from '@/components/common/AppToastProvider';
import { useSettingsTheme } from '@/theme/settingsTheme';
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

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockBookings: VendorBooking[] = [
	{
		bookingId: '1001', bookingUuid: 'BME-BOOK-1001',
		firstName: 'Rahul', lastName: 'Sharma', userName: 'rahul_s',
		email: 'rahul@example.com', phone: '9876543210',
		eventDate: '2026-04-20', eventTime: '18:00',
		packageName: 'Wedding Essentials', packageId: '101', amount: '25000',
		eventAddress: '123 Garden Palace, Indore',
		specialRequirement: 'Need extra lighting setup',
		createdAt: '2026-04-10T10:00:00Z',
		status: 'pending_vendor_response', adminApproval: 'pending',
		otp: '123456', otpAttemptsRemaining: 3,
	},
	{
		bookingId: '1002', bookingUuid: 'BME-BOOK-1002',
		firstName: 'Neha', lastName: 'Jain', userName: 'nehaj',
		email: 'neha@example.com',
		eventDate: '2026-04-24', eventTime: '14:00',
		packageName: 'Corporate Premium', packageId: '202', amount: '15000',
		eventAddress: '456 Business Hub, Bhopal',
		createdAt: '2026-04-11T09:00:00Z',
		status: 'confirmed', adminApproval: 'pending',
		otp: '123456', otpAttemptsRemaining: 3,
	},
	{
		bookingId: '1003', bookingUuid: 'BME-BOOK-1003',
		firstName: 'Amit', lastName: 'Verma', userName: 'amitv',
		eventDate: '2026-04-28', eventTime: '20:00',
		packageName: 'Birthday Delight', packageId: '303', amount: '8000',
		eventAddress: '789 Party Lane, Ujjain',
		createdAt: '2026-04-12T11:00:00Z',
		status: 'confirmed', adminApproval: 'approved',
		otp: '123456', otpAttemptsRemaining: 3,
	},
];

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function VendorBookingsScreen() {
	const { palette } = useSettingsTheme();
	const { showError, showSuccess, showInfo } = useAppToast();

	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
	const [bookings, setBookings] = useState<VendorBooking[]>([]);
	const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

	// Reject modal
	const [rejectModalOpen, setRejectModalOpen] = useState(false);
	const [rejectReason, setRejectReason] = useState('Rejected by vendor');
	const [rejectBookingId, setRejectBookingId] = useState<string | null>(null);

	// OTP modal
	const [otpModalOpen, setOtpModalOpen] = useState(false);
	const [otpCode, setOtpCode] = useState('');
	const [otpError, setOtpError] = useState('');
	const [otpBooking, setOtpBooking] = useState<VendorBooking | null>(null);
	const [otpBusy, setOtpBusy] = useState(false);
	const [attemptsRemaining, setAttemptsRemaining] = useState(3);

	const loadBookings = useCallback(async (silent = false) => {
		silent ? setIsRefreshing(true) : setIsLoading(true);
		await new Promise((r) => setTimeout(r, 300));
		setBookings((prev) => (prev.length > 0 ? prev : mockBookings));
		setIsLoading(false);
		setIsRefreshing(false);
	}, []);

	useEffect(() => { void loadBookings(); }, [loadBookings]);

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

	const runAction = async (id: string, fn: (b: VendorBooking) => VendorBooking, msg: string) => {
		setActionLoadingId(id);
		await new Promise((r) => setTimeout(r, 350));
		setBookings((prev) => prev.map((b) => (b.bookingId === id ? fn(b) : b)));
		showSuccess(msg);
		setActionLoadingId(null);
	};

	const openReject = (id: string) => {
		setRejectBookingId(id);
		setRejectReason('Rejected by vendor');
		setRejectModalOpen(true);
	};

	const submitReject = async () => {
		if (!rejectBookingId) return;
		setRejectModalOpen(false);
		await runAction(rejectBookingId,
			(b) => ({ ...b, status: 'rejected_by_vendor', rejectReason: rejectReason.trim() || 'Rejected by vendor' }),
			'Booking rejected.');
	};

	const openOtpModal = (booking: VendorBooking) => {
		setOtpBooking(booking);
		setOtpCode('');
		setOtpError('');
		setAttemptsRemaining(booking.otpAttemptsRemaining);
		setOtpModalOpen(true);
	};

	const closeOtpModal = () => {
		setOtpModalOpen(false);
		setOtpCode('');
		setOtpError('');
	};

	const verifyOtp = async () => {
		if (!otpBooking) return;
		if (!/^\d{6}$/.test(otpCode)) { setOtpError('Please enter a valid 6-digit OTP'); return; }

		setOtpBusy(true);
		await new Promise((r) => setTimeout(r, 350));

		const booking = bookings.find((b) => b.bookingId === otpBooking.bookingId);
		if (!booking) { setOtpBusy(false); showError('Booking not found.'); return; }

		if (booking.otpAttemptsRemaining <= 0) {
			setOtpBusy(false);
			setOtpError('Too many failed attempts. OTP is locked for 15 minutes.');
			return;
		}

		if (otpCode !== booking.otp) {
			const remaining = Math.max(booking.otpAttemptsRemaining - 1, 0);
			setBookings((prev) => prev.map((b) => b.bookingId === booking.bookingId ? { ...b, otpAttemptsRemaining: remaining } : b));
			setAttemptsRemaining(remaining);
			setOtpError(remaining > 0 ? `Invalid OTP. ${remaining} attempts remaining.` : 'OTP locked. Please resend OTP.');
			setOtpBusy(false);
			return;
		}

		setBookings((prev) => prev.map((b) => b.bookingId === booking.bookingId ? { ...b, status: 'completed', otpAttemptsRemaining: 3 } : b));
		showSuccess('OTP verified successfully! Booking confirmed.');
		closeOtpModal();
		setOtpBusy(false);
	};

	const resendOtp = async () => {
		if (!otpBooking) return;
		setOtpBusy(true);
		await new Promise((r) => setTimeout(r, 350));
		setBookings((prev) => prev.map((b) => b.bookingId === otpBooking.bookingId ? { ...b, otp: '123456', otpAttemptsRemaining: 3 } : b));
		setOtpCode('');
		setOtpError('');
		setAttemptsRemaining(3);
		setOtpBusy(false);
		showInfo('New OTP sent to customer!');
	};

	if (isLoading) return <PageLoadingState text="Loading bookings..." />;

	return (
		<SafeAreaView style={[s.safeArea, { backgroundColor: palette.screenBg }]} edges={['top']}>
			{/* AppBar */}
			<View style={[s.appBar, { backgroundColor: palette.primary, borderColor: palette.primaryStrong }]}>
				<AppMenuDrawer />
				<ThemedText style={[s.appBarTitle, { color: palette.onPrimary }]}>Booking Requests</ThemedText>
				<Pressable
					style={[s.iconBtn, { borderColor: palette.primaryStrong, backgroundColor: palette.primaryStrong }]}
					onPress={() => void loadBookings(true)}
				>
					<Ionicons name={isRefreshing ? 'hourglass-outline' : 'refresh-outline'} size={18} color={palette.onPrimary} />
				</Pressable>
			</View>

			{/* Sub-header */}
			<View style={s.subHeader}>
				<ThemedText style={[s.subHeaderText, { color: palette.subtext }]}>
					Manage incoming booking requests from customers
				</ThemedText>
			</View>

			{/* Filter chips */}
			<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
				{FILTER_KEYS.map((key) => {
					const active = key === activeFilter;
					return (
						<Pressable
							key={key}
							style={[s.chip, { borderColor: active ? palette.primary : palette.border, backgroundColor: active ? palette.primary : palette.surfaceBg }]}
							onPress={() => setActiveFilter(key)}
						>
							<ThemedText style={[s.chipText, { color: active ? palette.onPrimary : palette.text }]}>
								{getFilterLabel(key)}
							</ThemedText>
							<View style={[s.chipBadge, { backgroundColor: active ? 'rgba(255,255,255,0.25)' : palette.border }]}>
								<ThemedText style={[s.chipBadgeText, { color: active ? '#fff' : palette.subtext }]}>{counts[key]}</ThemedText>
							</View>
						</Pressable>
					);
				})}
			</ScrollView>

			{/* Booking list */}
			<ScrollView contentContainerStyle={s.list} showsVerticalScrollIndicator={false}>
				{filteredBookings.length === 0 ? (
					<View style={[s.emptyBox, { backgroundColor: palette.surfaceBg }]}>
						<Ionicons name="calendar-outline" size={56} color={palette.border} />
						<ThemedText style={[s.emptyTitle, { color: palette.text }]}>No Bookings Found</ThemedText>
						<ThemedText style={[s.emptyBody, { color: palette.subtext }]}>
							{activeFilter === 'all' ? "You don't have any booking requests yet." : `No ${getFilterLabel(activeFilter).toLowerCase()} bookings.`}
						</ThemedText>
					</View>
				) : (
					filteredBookings.map((booking) => (
						<BookingCard
							key={booking.bookingId}
							booking={booking}
							palette={palette}
							actionLoadingId={actionLoadingId}
							onAccept={() => void runAction(booking.bookingId, (b) => ({ ...b, status: 'confirmed', adminApproval: 'pending' }), 'Booking accepted! Awaiting admin approval.')}
							onReject={() => openReject(booking.bookingId)}
							onCancel={() => void runAction(booking.bookingId, (b) => ({ ...b, status: 'cancelled_by_vendor' }), 'Booking cancelled.')}
							onVerifyOtp={() => openOtpModal(booking)}
						/>
					))
				)}
			</ScrollView>

			{/* Reject Modal */}
			<Modal visible={rejectModalOpen} transparent animationType="fade" onRequestClose={() => setRejectModalOpen(false)}>
				<View style={s.modalOverlay}>
					<View style={[s.modalBox, { backgroundColor: palette.surfaceBg }]}>
						<ThemedText style={[s.modalTitle, { color: palette.text }]}>Reject Booking</ThemedText>
						<ThemedText style={[s.modalSub, { color: palette.subtext }]}>Please provide a reason for rejection (optional)</ThemedText>
						<TextInput
							style={[s.modalInput, { color: palette.text, borderColor: palette.border, backgroundColor: palette.headerBtnBg }]}
							placeholder="Reason for rejection"
							placeholderTextColor={palette.muted}
							value={rejectReason}
							onChangeText={setRejectReason}
							multiline
						/>
						<View style={s.modalBtns}>
							<Pressable style={[s.modalBtn, { backgroundColor: palette.headerBtnBg, borderColor: palette.border }]} onPress={() => setRejectModalOpen(false)}>
								<ThemedText style={[s.modalBtnText, { color: palette.text }]}>Cancel</ThemedText>
							</Pressable>
							<Pressable style={[s.modalBtn, { backgroundColor: '#ef4444' }]} onPress={() => void submitReject()}>
								<ThemedText style={[s.modalBtnText, { color: '#fff' }]}>Reject</ThemedText>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>

			{/* OTP Modal */}
			<Modal visible={otpModalOpen} transparent animationType="fade" onRequestClose={closeOtpModal}>
				<View style={s.modalOverlay}>
					<View style={[s.modalBox, { backgroundColor: palette.surfaceBg }]}>
						{/* Icon */}
						<View style={s.otpIconWrap}>
							<Ionicons name="shield-checkmark-outline" size={36} color="#7c3aed" />
						</View>
						<ThemedText style={[s.modalTitle, { color: palette.text }]}>Verify OTP</ThemedText>
						<ThemedText style={[s.modalSub, { color: palette.subtext }]}>
							Enter the 6-digit OTP provided by the customer to confirm booking #{otpBooking?.bookingUuid?.slice(-8)}
						</ThemedText>

						{/* Customer info */}
						{otpBooking && (
							<View style={[s.otpCustomerBox, { backgroundColor: palette.headerBtnBg }]}>
								<ThemedText style={[s.otpInfoLabel, { color: palette.muted }]}>Customer</ThemedText>
								<ThemedText style={[s.otpInfoValue, { color: palette.text }]}>
									{otpBooking.firstName} {otpBooking.lastName}
								</ThemedText>
								<ThemedText style={[s.otpInfoLabel, { color: palette.muted }]}>Event Date</ThemedText>
								<ThemedText style={[s.otpInfoValue, { color: palette.text }]}>
									{new Date(otpBooking.eventDate).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
								</ThemedText>
							</View>
						)}

						{/* OTP input */}
						<TextInput
							style={[s.otpInput, { color: palette.text, borderColor: otpError ? '#ef4444' : '#7c3aed', backgroundColor: palette.headerBtnBg }]}
							placeholder="Enter 6-digit OTP"
							placeholderTextColor={palette.muted}
							value={otpCode}
							onChangeText={(v) => { setOtpCode(v.replace(/\D/g, '')); setOtpError(''); }}
							keyboardType="number-pad"
							maxLength={6}
						/>
						{otpError ? <ThemedText style={s.otpError}>{otpError}</ThemedText> : null}
						<ThemedText style={[s.attemptsText, { color: attemptsRemaining <= 1 ? '#ef4444' : palette.subtext }]}>
							Attempts remaining: {attemptsRemaining}
						</ThemedText>

						{/* Buttons */}
						<View style={s.modalBtns}>
							<Pressable style={[s.modalBtn, { backgroundColor: palette.headerBtnBg, borderColor: palette.border }]} onPress={closeOtpModal}>
								<ThemedText style={[s.modalBtnText, { color: palette.text }]}>Cancel</ThemedText>
							</Pressable>
							<Pressable
								style={[s.modalBtn, { backgroundColor: '#7c3aed', opacity: (otpBusy || otpCode.length !== 6) ? 0.5 : 1 }]}
								onPress={() => void verifyOtp()}
								disabled={otpBusy || otpCode.length !== 6}
							>
								<Ionicons name="checkmark" size={16} color="#fff" />
								<ThemedText style={[s.modalBtnText, { color: '#fff' }]}>{otpBusy ? 'Verifying...' : 'Verify'}</ThemedText>
							</Pressable>
						</View>

						{/* Resend */}
						<Pressable style={s.resendBtn} onPress={() => void resendOtp()} disabled={otpBusy}>
							<ThemedText style={[s.resendText, { color: '#7c3aed' }]}>{otpBusy ? 'Please wait...' : 'Resend OTP to customer'}</ThemedText>
						</Pressable>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
	safeArea: { flex: 1 },
	appBar: {
		height: 56, marginHorizontal: 16, marginTop: 12,
		borderRadius: 14, paddingHorizontal: 12, borderWidth: 1,
		flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
	},
	appBarTitle: { fontSize: 16, fontWeight: '800' },
	iconBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
	subHeader: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
	subHeaderText: { fontSize: 13 },
	filterRow: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
	chip: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 34, paddingHorizontal: 12, borderRadius: 17, borderWidth: 1 },
	chipText: { fontSize: 12, fontWeight: '700' },
	chipBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 10 },
	chipBadgeText: { fontSize: 11, fontWeight: '700' },
	list: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 32, gap: 14 },
	emptyBox: { borderRadius: 16, padding: 40, alignItems: 'center', gap: 10 },
	emptyTitle: { fontSize: 20, fontWeight: '800' },
	emptyBody: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
	modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', padding: 20 },
	modalBox: { borderRadius: 18, padding: 20, gap: 12 },
	modalTitle: { fontSize: 18, fontWeight: '800' },
	modalSub: { fontSize: 13, lineHeight: 19 },
	modalInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, minHeight: 44 },
	modalBtns: { flexDirection: 'row', gap: 10 },
	modalBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 44, borderRadius: 10, borderWidth: 1, borderColor: 'transparent' },
	modalBtnText: { fontSize: 14, fontWeight: '700' },
	otpIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#ede9fe', alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
	otpCustomerBox: { borderRadius: 12, padding: 12, gap: 2 },
	otpInfoLabel: { fontSize: 11 },
	otpInfoValue: { fontSize: 14, fontWeight: '700', marginBottom: 6 },
	otpInput: { height: 54, borderWidth: 2, borderRadius: 12, textAlign: 'center', fontSize: 24, letterSpacing: 8, fontWeight: '800' },
	otpError: { fontSize: 13, color: '#ef4444' },
	attemptsText: { fontSize: 13 },
	resendBtn: { alignItems: 'center', paddingVertical: 6 },
	resendText: { fontSize: 13, fontWeight: '700' },
});
