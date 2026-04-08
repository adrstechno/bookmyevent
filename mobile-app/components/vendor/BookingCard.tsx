import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';

interface VendorBooking {
	bookingId: string;
	bookingUuid: string;
	firstName: string;
	lastName: string;
	userName: string;
	email?: string;
	phone?: string;
	eventDate: string;
	eventTime: string;
	packageName: string;
	packageId: string;
	amount?: string;
	eventAddress?: string;
	specialRequirement?: string;
	createdAt?: string;
	status: string;
	adminApproval: string;
	otp: string;
	otpAttemptsRemaining: number;
	rejectReason?: string;
}

interface BookingCardProps {
	booking: VendorBooking;
	palette: any;
	actionLoadingId: string | null;
	onAccept: () => void;
	onReject: () => void;
	onCancel: () => void;
	onVerifyOtp: () => void;
}

const isPending = (b: VendorBooking) => b.status === 'pending_vendor_response' || b.status === 'pending';
const isAwaitingAdmin = (b: VendorBooking) => b.status === 'confirmed' && b.adminApproval === 'pending';
const isOtpRequired = (b: VendorBooking) => b.status === 'confirmed' && b.adminApproval === 'approved';
const isCompleted = (b: VendorBooking) => b.status === 'completed' || b.status === 'awaiting_review';
const isCancelled = (b: VendorBooking) => b.status.includes('cancelled') || b.status.includes('rejected');

function getStatusBadge(b: VendorBooking): { label: string; bg: string; text: string } {
	if (b.status === 'confirmed' && b.adminApproval === 'pending')
		return { label: 'Awaiting Admin Approval', bg: '#dbeafe', text: '#1e40af' };
	if (b.status === 'confirmed' && b.adminApproval === 'approved')
		return { label: 'OTP Verification Required', bg: '#ede9fe', text: '#6d28d9' };
	if (isPending(b)) return { label: 'Pending', bg: '#fef9c3', text: '#854d0e' };
	if (isCompleted(b)) return { label: 'Completed', bg: '#dcfce7', text: '#166534' };
	if (isCancelled(b)) return { label: 'Cancelled / Rejected', bg: '#fee2e2', text: '#991b1b' };
	return { label: b.status, bg: '#f3f4f6', text: '#374151' };
}

export default function BookingCard({
	booking, palette, actionLoadingId, onAccept, onReject, onCancel, onVerifyOtp,
}: BookingCardProps) {
	const badge = getStatusBadge(booking);
	const busy = actionLoadingId === booking.bookingId;
	const canAR = isPending(booking);
	const canCancel = isPending(booking) || isAwaitingAdmin(booking);
	const needsOtp = isOtpRequired(booking);
	const leftBorder = needsOtp ? '#7c3aed' : '#3c6e71';

	const customerName = booking.firstName && booking.lastName
		? `${booking.firstName} ${booking.lastName}`
		: booking.userName || 'Customer';

	return (
		<View style={[s.card, { backgroundColor: palette.surfaceBg, borderColor: palette.border, borderLeftColor: leftBorder }]}>
			{/* Card header */}
			<View style={s.cardHeader}>
				<View style={{ flex: 1, gap: 4 }}>
					<ThemedText style={[s.cardTitle, { color: palette.text }]}>
						Booking #{booking.bookingId}
					</ThemedText>
					{booking.createdAt && (
						<ThemedText style={[s.cardCreated, { color: palette.muted }]}>
							Created: {new Date(booking.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
						</ThemedText>
					)}
					<View style={[s.badge, { backgroundColor: badge.bg }]}>
						<ThemedText style={[s.badgeText, { color: badge.text }]}>{badge.label}</ThemedText>
					</View>
				</View>
			</View>

			{/* Action buttons */}
			<View style={s.actionRow}>
				{canAR && (
					<>
						<Pressable style={[s.actionBtn, s.acceptBtn]} onPress={onAccept} disabled={busy}>
							<Ionicons name="checkmark" size={14} color="#fff" />
							<ThemedText style={s.actionBtnText}>{busy ? 'Working...' : 'Accept'}</ThemedText>
						</Pressable>
						<Pressable style={[s.actionBtn, s.rejectBtn]} onPress={onReject} disabled={busy}>
							<Ionicons name="close" size={14} color="#fff" />
							<ThemedText style={s.actionBtnText}>Reject</ThemedText>
						</Pressable>
					</>
				)}
				{needsOtp && (
					<Pressable style={[s.actionBtn, s.otpBtn]} onPress={onVerifyOtp}>
						<Ionicons name="key-outline" size={14} color="#fff" />
						<ThemedText style={s.actionBtnText}>Verify OTP</ThemedText>
					</Pressable>
				)}
				{canCancel && (
					<Pressable style={[s.actionBtn, s.cancelBtn]} onPress={onCancel} disabled={busy}>
						<Ionicons name="close" size={14} color="#dc2626" />
						<ThemedText style={[s.actionBtnText, { color: '#dc2626' }]}>Cancel</ThemedText>
					</Pressable>
				)}
			</View>

			{/* Detail rows */}
			<View style={[s.detailGrid, { borderTopColor: palette.border }]}>
				<DetailItem icon="person-outline" label="Customer" value={customerName} sub={booking.email} palette={palette} />
				<DetailItem icon="calendar-outline" label="Event Date"
					value={new Date(booking.eventDate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
					palette={palette} />
				<DetailItem icon="time-outline" label="Event Time" value={booking.eventTime} palette={palette} />
				<DetailItem icon="cube-outline" label="Package"
					value={booking.packageName || `Package #${booking.packageId}`}
					sub={booking.amount ? `₹${parseFloat(booking.amount).toLocaleString()}` : undefined}
					subColor="#f9a826"
					palette={palette} />
				{booking.eventAddress && (
					<DetailItem icon="location-outline" label="Event Address" value={booking.eventAddress} palette={palette} wide />
				)}
			</View>

			{/* Special requirements */}
			{booking.specialRequirement && (
				<View style={[s.specialReq, { backgroundColor: palette.headerBtnBg }]}>
					<ThemedText style={[s.specialReqLabel, { color: palette.muted }]}>Special Requirements</ThemedText>
					<ThemedText style={[s.specialReqText, { color: palette.text }]}>{booking.specialRequirement}</ThemedText>
				</View>
			)}

			{/* Alert banners */}
			{canAR && (
				<View style={[s.alertBanner, { backgroundColor: '#fefce8', borderColor: '#fde047' }]}>
					<Ionicons name="alert-circle-outline" size={18} color="#ca8a04" />
					<View style={{ flex: 1 }}>
						<ThemedText style={[s.alertTitle, { color: '#854d0e' }]}>Action Required</ThemedText>
						<ThemedText style={[s.alertBody, { color: '#a16207' }]}>Please accept or reject this booking request.</ThemedText>
					</View>
				</View>
			)}
			{isAwaitingAdmin(booking) && (
				<View style={[s.alertBanner, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
					<Ionicons name="time-outline" size={18} color="#2563eb" />
					<View style={{ flex: 1 }}>
						<ThemedText style={[s.alertTitle, { color: '#1e40af' }]}>Awaiting Admin Approval</ThemedText>
						<ThemedText style={[s.alertBody, { color: '#3b82f6' }]}>You have accepted this booking. Waiting for admin to approve.</ThemedText>
					</View>
				</View>
			)}
			{needsOtp && (
				<View style={[s.alertBanner, { backgroundColor: '#f5f3ff', borderColor: '#ddd6fe' }]}>
					<Ionicons name="shield-checkmark-outline" size={18} color="#7c3aed" />
					<View style={{ flex: 1 }}>
						<ThemedText style={[s.alertTitle, { color: '#5b21b6' }]}>OTP Verification Required</ThemedText>
						<ThemedText style={[s.alertBody, { color: '#7c3aed' }]}>Admin has approved this booking. Ask the customer for their OTP to complete the booking.</ThemedText>
					</View>
				</View>
			)}
		</View>
	);
}

function DetailItem({ icon, label, value, sub, subColor, palette, wide }: {
	icon: string; label: string; value: string; sub?: string;
	subColor?: string; palette: any; wide?: boolean;
}) {
	return (
		<View style={[s.detailItem, wide && s.detailItemWide]}>
			<View style={[s.detailIcon, { backgroundColor: 'rgba(60,110,113,0.1)' }]}>
				<Ionicons name={icon as any} size={16} color="#3c6e71" />
			</View>
			<View style={{ flex: 1 }}>
				<ThemedText style={[s.detailLabel, { color: palette.muted }]}>{label}</ThemedText>
				<ThemedText style={[s.detailValue, { color: palette.text }]}>{value}</ThemedText>
				{sub && <ThemedText style={[s.detailSub, { color: subColor ?? palette.subtext }]}>{sub}</ThemedText>}
			</View>
		</View>
	);
}

const s = StyleSheet.create({
	card: { borderRadius: 16, borderWidth: 1, borderLeftWidth: 4, overflow: 'hidden', gap: 0 },
	cardHeader: { padding: 14, paddingBottom: 10 },
	cardTitle: { fontSize: 17, fontWeight: '800' },
	cardCreated: { fontSize: 12 },
	badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginTop: 4 },
	badgeText: { fontSize: 12, fontWeight: '700' },
	actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 14, paddingBottom: 12 },
	actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
	actionBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
	acceptBtn: { backgroundColor: '#22c55e' },
	rejectBtn: { backgroundColor: '#ef4444' },
	otpBtn: { backgroundColor: '#7c3aed' },
	cancelBtn: { backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#fca5a5' },
	detailGrid: { borderTopWidth: 1, padding: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
	detailItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, width: '45%' },
	detailItemWide: { width: '100%' },
	detailIcon: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
	detailLabel: { fontSize: 11, marginBottom: 2 },
	detailValue: { fontSize: 13, fontWeight: '700', lineHeight: 18 },
	detailSub: { fontSize: 12, fontWeight: '700', marginTop: 1 },
	specialReq: { marginHorizontal: 14, marginBottom: 10, borderRadius: 10, padding: 10 },
	specialReqLabel: { fontSize: 11, marginBottom: 3 },
	specialReqText: { fontSize: 13, lineHeight: 18 },
	alertBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderWidth: 1, borderRadius: 10, padding: 12, marginHorizontal: 14, marginBottom: 10 },
	alertTitle: { fontSize: 13, fontWeight: '800' },
	alertBody: { fontSize: 12, lineHeight: 17, marginTop: 2 },
});
