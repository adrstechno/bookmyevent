import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { useCallback, useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Modal,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	TextInput,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppMenuDrawer from '@/components/layout/AppMenuDrawer';
import { ThemedText } from '@/components/themed-text';
import { useAppToast } from '@/components/common/AppToastProvider';
import { useSettingsTheme } from '@/theme/settingsTheme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Reservation {
	reservation_id: string;
	shift_name: string;
	event_date: string;
	start_time: string;
	end_time: string;
	reason?: string;
}

interface AvailableShift {
	shift_id: string;
	shift_name: string;
	start_time: string;
	end_time: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_RESERVATIONS: Reservation[] = [
	{
		reservation_id: 'R001',
		shift_name: 'Morning Setup',
		event_date: '2026-04-20',
		start_time: '09:00:00',
		end_time: '12:00:00',
		reason: 'Booked via phone call',
	},
	{
		reservation_id: 'R002',
		shift_name: 'Evening Service',
		event_date: '2026-04-24',
		start_time: '14:00:00',
		end_time: '18:00:00',
		reason: 'External event',
	},
];

const MOCK_AVAILABLE_SHIFTS: AvailableShift[] = [
	{ shift_id: 'S1', shift_name: 'Morning Setup', start_time: '09:00', end_time: '12:00' },
	{ shift_id: 'S2', shift_name: 'Evening Service', start_time: '14:00', end_time: '18:00' },
	{ shift_id: 'S3', shift_name: 'Full Day Support', start_time: '10:00', end_time: '20:00' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (date: Date) => {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, '0');
	const d = String(date.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
};

const formatDisplayDate = (dateStr: string) =>
	new Date(dateStr).toLocaleDateString('en-IN', {
		weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
	});

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
	'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// ─── Mini Calendar ────────────────────────────────────────────────────────────

function MiniCalendar({
	selected, onSelect, reservedDates, palette,
}: {
	selected: Date | null;
	onSelect: (d: Date) => void;
	reservedDates: string[];
	palette: any;
}) {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const [viewYear, setViewYear] = useState(today.getFullYear());
	const [viewMonth, setViewMonth] = useState(today.getMonth());

	const firstDay = new Date(viewYear, viewMonth, 1).getDay();
	const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

	const prevMonth = () => {
		if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
		else setViewMonth(m => m - 1);
	};
	const nextMonth = () => {
		if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
		else setViewMonth(m => m + 1);
	};

	const cells: (Date | null)[] = [];
	for (let i = 0; i < firstDay; i++) cells.push(null);
	for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d));

	return (
		<View style={[cal.wrap, { backgroundColor: palette.headerBtnBg, borderColor: palette.border }]}>
			{/* Month nav */}
			<View style={cal.nav}>
				<Pressable onPress={prevMonth} style={cal.navBtn}>
					<Ionicons name="chevron-back" size={18} color={palette.primary} />
				</Pressable>
				<ThemedText style={[cal.monthLabel, { color: palette.text }]}>
					{MONTHS[viewMonth]} {viewYear}
				</ThemedText>
				<Pressable onPress={nextMonth} style={cal.navBtn}>
					<Ionicons name="chevron-forward" size={18} color={palette.primary} />
				</Pressable>
			</View>

			{/* Weekday headers */}
			<View style={cal.row}>
				{WEEKDAYS.map(d => (
					<ThemedText key={d} style={[cal.wdLabel, { color: palette.muted }]}>{d}</ThemedText>
				))}
			</View>

			{/* Day grid */}
			<View style={cal.grid}>
				{cells.map((date, i) => {
					if (!date) return <View key={`e-${i}`} style={cal.cell} />;
					const dateStr = formatDate(date);
					const isPast = date < today;
					const isSelected = selected ? formatDate(selected) === dateStr : false;
					const isReserved = reservedDates.includes(dateStr);
					const isToday = formatDate(date) === formatDate(today);

					return (
						<Pressable
							key={dateStr}
							style={[
								cal.cell,
								isSelected && { backgroundColor: '#3c6e71', borderRadius: 8 },
								!isSelected && isToday && { borderWidth: 1, borderColor: '#3c6e71', borderRadius: 8 },
							]}
							onPress={() => !isPast && onSelect(date)}
							disabled={isPast}
						>
							<ThemedText style={[
								cal.dayText,
								{ color: isPast ? palette.muted : palette.text },
								isSelected && { color: '#fff', fontWeight: '800' },
								isReserved && !isSelected && { color: '#ef4444', fontWeight: '700' },
							]}>
								{date.getDate()}
							</ThemedText>
							{isReserved && !isSelected && (
								<View style={cal.dot} />
							)}
						</Pressable>
					);
				})}
			</View>
		</View>
	);
}

const cal = StyleSheet.create({
	wrap: { borderRadius: 14, borderWidth: 1, padding: 12 },
	nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
	navBtn: { padding: 6 },
	monthLabel: { fontSize: 15, fontWeight: '800' },
	row: { flexDirection: 'row', marginBottom: 4 },
	wdLabel: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700' },
	grid: { flexDirection: 'row', flexWrap: 'wrap' },
	cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
	dayText: { fontSize: 13 },
	dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#ef4444', position: 'absolute', bottom: 2 },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function VendorReservationsScreen() {
	const { palette } = useSettingsTheme();
	const { showError, showSuccess, showInfo } = useAppToast();

	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [reservations, setReservations] = useState<Reservation[]>([]);
	const [showModal, setShowModal] = useState(false);

	// Modal state
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [selectedShift, setSelectedShift] = useState<string | null>(null);
	const [reason, setReason] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [shiftsLoading, setShiftsLoading] = useState(false);
	const [availableShifts, setAvailableShifts] = useState<AvailableShift[]>([]);
	const [cancellingId, setCancellingId] = useState<string | null>(null);
	const [confirmCancel, setConfirmCancel] = useState<Reservation | null>(null);

	const reservedDates = reservations.map(r =>
		new Date(r.event_date).toISOString().split('T')[0]
	);

	const loadReservations = useCallback(async (silent = false) => {
		silent ? setIsRefreshing(true) : setIsLoading(true);
		await new Promise(r => setTimeout(r, 350));
		setReservations(prev => prev.length > 0 ? prev : MOCK_RESERVATIONS);
		setIsLoading(false);
		setIsRefreshing(false);
	}, []);

	useEffect(() => { void loadReservations(); }, [loadReservations]);

	const fetchAvailableShifts = async (date: Date) => {
		setShiftsLoading(true);
		setAvailableShifts([]);
		await new Promise(r => setTimeout(r, 300));
		setAvailableShifts(MOCK_AVAILABLE_SHIFTS);
		setShiftsLoading(false);
	};

	const handleDateSelect = (date: Date) => {
		setSelectedDate(date);
		setSelectedShift(null);
		void fetchAvailableShifts(date);
	};

	const openModal = () => {
		setSelectedDate(null);
		setSelectedShift(null);
		setAvailableShifts([]);
		setReason('');
		setShowModal(true);
	};

	const handleReserve = async () => {
		if (!selectedDate || !selectedShift) {
			showError('Please select a date and shift.');
			return;
		}
		setSubmitting(true);
		await new Promise(r => setTimeout(r, 400));
		const shift = availableShifts.find(s => s.shift_id === selectedShift)!;
		const newRes: Reservation = {
			reservation_id: `R${Date.now()}`,
			shift_name: shift.shift_name,
			event_date: formatDate(selectedDate),
			start_time: shift.start_time + ':00',
			end_time: shift.end_time + ':00',
			reason: reason.trim() || 'Manual reservation by vendor',
		};
		setReservations(prev => [newRes, ...prev]);
		showSuccess('Shift reserved successfully!');
		setShowModal(false);
		setSubmitting(false);
	};

	const handleCancel = async (res: Reservation) => {
		setCancellingId(res.reservation_id);
		setConfirmCancel(null);
		await new Promise(r => setTimeout(r, 350));
		setReservations(prev => prev.filter(r => r.reservation_id !== res.reservation_id));
		showSuccess('Reservation cancelled.');
		setCancellingId(null);
	};

	if (isLoading) {
		return (
			<SafeAreaView style={[s.safeArea, { backgroundColor: palette.screenBg }]} edges={['top']}>
				<View style={s.center}>
					<ActivityIndicator size="large" color={palette.primary} />
					<ThemedText style={[s.loadingText, { color: palette.muted }]}>Loading reservations...</ThemedText>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={[s.safeArea, { backgroundColor: palette.screenBg }]} edges={['top']}>
			{/* Blur overlay for modals */}
			{(showModal || !!confirmCancel) && (
				<BlurView
					intensity={Platform.OS === 'android' ? 40 : 90}
					tint="dark"
					style={StyleSheet.absoluteFill}
					pointerEvents="none"
				/>
			)}

			{/* AppBar */}
			<View style={[s.appBar, { backgroundColor: palette.primary, borderColor: palette.primaryStrong }]}>
				<AppMenuDrawer />
				<ThemedText style={[s.appBarTitle, { color: palette.onPrimary }]}>Shift Reservations</ThemedText>
				<Pressable
					style={[s.iconBtn, { borderColor: palette.primaryStrong, backgroundColor: palette.primaryStrong }]}
					onPress={() => void loadReservations(true)}
				>
					<Ionicons name={isRefreshing ? 'hourglass-outline' : 'refresh-outline'} size={18} color={palette.onPrimary} />
				</Pressable>
			</View>

			{/* Sub-header */}
			<View style={s.subHeader}>
				<ThemedText style={[s.subHeaderText, { color: palette.subtext }]}>
					Reserve shifts for bookings made outside the platform
				</ThemedText>
			</View>

			{/* Reserve button */}
			<View style={s.toolbar}>
				<Pressable style={s.reserveBtn} onPress={openModal}>
					<Ionicons name="lock-closed-outline" size={16} color="#fff" />
					<ThemedText style={s.reserveBtnText}>Reserve Shift</ThemedText>
				</Pressable>
			</View>

			{/* Active Reservations */}
			<View style={[s.sectionHeader, { borderBottomColor: palette.border }]}>
				<ThemedText style={[s.sectionTitle, { color: palette.text }]}>Active Reservations</ThemedText>
				<ThemedText style={[s.sectionCount, { color: palette.muted }]}>{reservations.length}</ThemedText>
			</View>

			<ScrollView contentContainerStyle={s.list} showsVerticalScrollIndicator={false}>
				{reservations.length === 0 ? (
					<View style={[s.emptyBox, { backgroundColor: palette.surfaceBg }]}>
						<Ionicons name="lock-open-outline" size={52} color={palette.border} />
						<ThemedText style={[s.emptyTitle, { color: palette.text }]}>No Active Reservations</ThemedText>
						<ThemedText style={[s.emptyBody, { color: palette.subtext }]}>
							Tap "Reserve Shift" to block a shift for an external booking.
						</ThemedText>
					</View>
				) : (
					reservations.map(res => (
						<View key={res.reservation_id} style={[s.card, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
							<View style={[s.cardIcon, { backgroundColor: 'rgba(60,110,113,0.1)' }]}>
								<Ionicons name="lock-closed-outline" size={22} color="#3c6e71" />
							</View>
							<View style={s.cardBody}>
								<ThemedText style={[s.cardTitle, { color: palette.text }]}>{res.shift_name}</ThemedText>
								<ThemedText style={[s.cardDate, { color: palette.subtext }]}>
									{formatDisplayDate(res.event_date)} • {res.start_time.substring(0, 5)} – {res.end_time.substring(0, 5)}
								</ThemedText>
								{res.reason && (
									<ThemedText style={[s.cardReason, { color: palette.muted }]}>{res.reason}</ThemedText>
								)}
							</View>
							<Pressable
								style={[s.cancelBtn, { opacity: cancellingId === res.reservation_id ? 0.5 : 1 }]}
								onPress={() => setConfirmCancel(res)}
								disabled={cancellingId === res.reservation_id}
							>
								{cancellingId === res.reservation_id
									? <ActivityIndicator size="small" color="#ef4444" />
									: <><Ionicons name="lock-open-outline" size={14} color="#ef4444" /><ThemedText style={s.cancelBtnText}>Cancel</ThemedText></>
								}
							</Pressable>
						</View>
					))
				)}
			</ScrollView>

			{/* Reserve Shift Modal */}
			<Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
				<View style={s.modalOverlay}>
					<Pressable style={StyleSheet.absoluteFill} onPress={() => setShowModal(false)} />
					<View style={[s.modalSheet, { backgroundColor: palette.surfaceBg }]}>
						{/* Modal header */}
						<View style={[s.modalHeader, { backgroundColor: palette.primary }]}>
							<View>
								<ThemedText style={[s.modalTitle, { color: palette.onPrimary }]}>Reserve Shift</ThemedText>
								<ThemedText style={[s.modalSubtitle, { color: 'rgba(255,255,255,0.7)' }]}>Block a shift for an external booking</ThemedText>
							</View>
							<Pressable
								style={[s.closeBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
								onPress={() => setShowModal(false)}
							>
								<Ionicons name="close" size={20} color={palette.onPrimary} />
							</Pressable>
						</View>

						<ScrollView contentContainerStyle={s.modalBody} showsVerticalScrollIndicator={false}>
							{/* Date Selection */}
							<View style={s.fieldGroup}>
								<ThemedText style={[s.fieldLabel, { color: palette.text }]}>Select Date *</ThemedText>
								<MiniCalendar
									selected={selectedDate}
									onSelect={handleDateSelect}
									reservedDates={reservedDates}
									palette={palette}
								/>
								{selectedDate && (
									<View style={[s.selectedDateBadge, { backgroundColor: 'rgba(60,110,113,0.1)' }]}>
										<Ionicons name="calendar-outline" size={14} color="#3c6e71" />
										<ThemedText style={s.selectedDateText}>
											{selectedDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
										</ThemedText>
									</View>
								)}
							</View>

							{/* Shift Selection */}
							<View style={s.fieldGroup}>
								<ThemedText style={[s.fieldLabel, { color: palette.text }]}>Select Available Shift *</ThemedText>
								{!selectedDate ? (
									<View style={[s.hintBox, { backgroundColor: palette.headerBtnBg }]}>
										<Ionicons name="calendar-outline" size={24} color={palette.muted} />
										<ThemedText style={[s.hintText, { color: palette.muted }]}>Please select a date first</ThemedText>
									</View>
								) : shiftsLoading ? (
									<View style={[s.hintBox, { backgroundColor: palette.headerBtnBg }]}>
										<ActivityIndicator size="small" color={palette.primary} />
										<ThemedText style={[s.hintText, { color: palette.muted }]}>Loading available shifts...</ThemedText>
									</View>
								) : availableShifts.length === 0 ? (
									<View style={[s.hintBox, { backgroundColor: palette.headerBtnBg }]}>
										<Ionicons name="alert-circle-outline" size={24} color={palette.muted} />
										<ThemedText style={[s.hintText, { color: palette.muted }]}>No available shifts for this date</ThemedText>
									</View>
								) : (
									<View style={s.shiftsGrid}>
										{availableShifts.map(shift => {
											const active = selectedShift === shift.shift_id;
											return (
												<Pressable
													key={shift.shift_id}
													style={[
														s.shiftChip,
														{
															borderColor: active ? '#3c6e71' : palette.border,
															backgroundColor: active ? 'rgba(60,110,113,0.08)' : palette.headerBtnBg,
														},
													]}
													onPress={() => setSelectedShift(shift.shift_id)}
												>
													<ThemedText style={[s.shiftChipName, { color: active ? '#3c6e71' : palette.text }]}>
														{shift.shift_name}
													</ThemedText>
													<ThemedText style={[s.shiftChipTime, { color: active ? '#3c6e71' : palette.muted }]}>
														{shift.start_time} – {shift.end_time}
													</ThemedText>
													{active && <Ionicons name="checkmark-circle" size={16} color="#3c6e71" style={s.shiftCheck} />}
												</Pressable>
											);
										})}
									</View>
								)}
							</View>

							{/* Reason */}
							<View style={s.fieldGroup}>
								<ThemedText style={[s.fieldLabel, { color: palette.text }]}>Reason (Optional)</ThemedText>
								<TextInput
									style={[s.reasonInput, { color: palette.text, borderColor: palette.border, backgroundColor: palette.headerBtnBg }]}
									placeholder="e.g. Booked via phone call, External event..."
									placeholderTextColor={palette.muted}
									value={reason}
									onChangeText={setReason}
									multiline
									numberOfLines={3}
								/>
							</View>

							{/* Actions */}
							<View style={s.modalActions}>
								<Pressable
									style={[s.modalBtn, { backgroundColor: palette.headerBtnBg, borderColor: palette.border }]}
									onPress={() => setShowModal(false)}
								>
									<ThemedText style={[s.modalBtnText, { color: palette.text }]}>Cancel</ThemedText>
								</Pressable>
								<Pressable
									style={[s.modalBtn, s.reserveConfirmBtn, { opacity: (submitting || !selectedDate || !selectedShift) ? 0.5 : 1 }]}
									onPress={() => void handleReserve()}
									disabled={submitting || !selectedDate || !selectedShift}
								>
									{submitting
										? <ActivityIndicator size="small" color="#fff" />
										: <Ionicons name="lock-closed-outline" size={16} color="#fff" />
									}
									<ThemedText style={[s.modalBtnText, { color: '#fff' }]}>
										{submitting ? 'Reserving...' : 'Reserve Shift'}
									</ThemedText>
								</Pressable>
							</View>
						</ScrollView>
					</View>
				</View>
			</Modal>

			{/* Cancel Confirm Modal */}
			<Modal visible={!!confirmCancel} transparent animationType="fade" onRequestClose={() => setConfirmCancel(null)}>
				<View style={s.confirmOverlay}>
					<View style={[s.confirmBox, { backgroundColor: palette.surfaceBg }]}>
						<Ionicons name="lock-open-outline" size={36} color="#ef4444" style={{ alignSelf: 'center' }} />
						<ThemedText style={[s.confirmTitle, { color: palette.text }]}>Cancel Reservation</ThemedText>
						<ThemedText style={[s.confirmBody, { color: palette.subtext }]}>
							Cancel reservation for "{confirmCancel?.shift_name}" on {confirmCancel ? formatDisplayDate(confirmCancel.event_date) : ''}?
						</ThemedText>
						<View style={s.confirmBtns}>
							<Pressable
								style={[s.modalBtn, { backgroundColor: palette.headerBtnBg, borderColor: palette.border }]}
								onPress={() => setConfirmCancel(null)}
							>
								<ThemedText style={[s.modalBtnText, { color: palette.text }]}>Keep</ThemedText>
							</Pressable>
							<Pressable
								style={[s.modalBtn, { backgroundColor: '#ef4444' }]}
								onPress={() => confirmCancel && void handleCancel(confirmCancel)}
							>
								<ThemedText style={[s.modalBtnText, { color: '#fff' }]}>Cancel Reservation</ThemedText>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
	safeArea: { flex: 1 },
	center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
	loadingText: { fontSize: 14, fontWeight: '600' },

	appBar: {
		height: 56, marginHorizontal: 16, marginTop: 12,
		borderRadius: 14, paddingHorizontal: 12, borderWidth: 1,
		flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
	},
	appBarTitle: { fontSize: 16, fontWeight: '800' },
	iconBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },

	subHeader: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
	subHeaderText: { fontSize: 13 },

	toolbar: { paddingHorizontal: 16, paddingVertical: 10 },
	reserveBtn: {
		flexDirection: 'row', alignItems: 'center', gap: 8,
		alignSelf: 'flex-start', paddingHorizontal: 18, paddingVertical: 11,
		borderRadius: 12, backgroundColor: '#3c6e71',
	},
	reserveBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },

	sectionHeader: {
		flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
		paddingHorizontal: 16, paddingBottom: 10, borderBottomWidth: 1,
	},
	sectionTitle: { fontSize: 16, fontWeight: '800' },
	sectionCount: { fontSize: 13, fontWeight: '700' },

	list: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 32, gap: 12 },

	emptyBox: { borderRadius: 16, padding: 40, alignItems: 'center', gap: 10, marginTop: 20 },
	emptyTitle: { fontSize: 18, fontWeight: '800' },
	emptyBody: { fontSize: 13, textAlign: 'center', lineHeight: 19 },

	// Reservation card
	card: {
		flexDirection: 'row', alignItems: 'center', gap: 12,
		borderRadius: 14, borderWidth: 1, borderLeftWidth: 4,
		borderLeftColor: '#3c6e71', padding: 14,
	},
	cardIcon: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
	cardBody: { flex: 1, gap: 2 },
	cardTitle: { fontSize: 15, fontWeight: '800' },
	cardDate: { fontSize: 12, lineHeight: 17 },
	cardReason: { fontSize: 11, marginTop: 2 },
	cancelBtn: {
		flexDirection: 'row', alignItems: 'center', gap: 4,
		paddingHorizontal: 10, paddingVertical: 7,
		borderRadius: 8, backgroundColor: '#fee2e2',
		borderWidth: 1, borderColor: '#fca5a5',
	},
	cancelBtnText: { fontSize: 12, fontWeight: '700', color: '#ef4444' },

	// Modal
	modalOverlay: { flex: 1, justifyContent: 'flex-end' },
	modalSheet: { borderTopLeftRadius: 22, borderTopRightRadius: 22, maxHeight: '92%', overflow: 'hidden' },
	modalHeader: {
		flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
		padding: 20, paddingBottom: 18,
	},
	modalTitle: { fontSize: 20, fontWeight: '800' },
	modalSubtitle: { fontSize: 13, marginTop: 2 },
	closeBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },

	modalBody: { padding: 16, gap: 20, paddingBottom: 36 },
	fieldGroup: { gap: 8 },
	fieldLabel: { fontSize: 13, fontWeight: '700' },

	selectedDateBadge: {
		flexDirection: 'row', alignItems: 'center', gap: 6,
		paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, marginTop: 4,
	},
	selectedDateText: { fontSize: 13, fontWeight: '600', color: '#3c6e71' },

	hintBox: {
		flexDirection: 'row', alignItems: 'center', gap: 10,
		padding: 16, borderRadius: 12,
	},
	hintText: { fontSize: 13 },

	shiftsGrid: { gap: 10 },
	shiftChip: {
		borderWidth: 2, borderRadius: 12, padding: 14,
		flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap',
	},
	shiftChipName: { fontSize: 14, fontWeight: '700', flex: 1 },
	shiftChipTime: { fontSize: 12, marginTop: 2, width: '100%' },
	shiftCheck: { marginLeft: 'auto' },

	reasonInput: {
		borderWidth: 1, borderRadius: 10, paddingHorizontal: 12,
		paddingVertical: 10, fontSize: 14, minHeight: 80, textAlignVertical: 'top',
	},

	modalActions: { flexDirection: 'row', gap: 10 },
	modalBtn: {
		flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
		gap: 6, height: 48, borderRadius: 12, borderWidth: 1, borderColor: 'transparent',
	},
	reserveConfirmBtn: { backgroundColor: '#3c6e71' },
	modalBtnText: { fontSize: 14, fontWeight: '700' },

	// Confirm cancel modal
	confirmOverlay: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.3)' },
	confirmBox: { borderRadius: 18, padding: 24, gap: 12 },
	confirmTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
	confirmBody: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
	confirmBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
});
