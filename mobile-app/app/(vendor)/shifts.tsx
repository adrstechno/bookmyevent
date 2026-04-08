import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { useEffect, useMemo, useState } from 'react';
import {
	ActivityIndicator,
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	TextInput,
	View,
	Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppMenuDrawer from '@/components/layout/AppMenuDrawer';
import { ThemedText } from '@/components/themed-text';
import { useAppToast } from '@/components/common/AppToastProvider';
import { useSettingsTheme } from '@/theme/settingsTheme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface VendorShift {
	shiftId: string;
	shiftName: string;
	startTime: string; // HH:MM
	endTime: string;   // HH:MM
	daysOfWeek: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const MOCK_SHIFTS: VendorShift[] = [
	{ shiftId: '1', shiftName: 'Morning Setup', startTime: '09:00', endTime: '12:00', daysOfWeek: ['Monday', 'Wednesday', 'Friday'] },
	{ shiftId: '2', shiftName: 'Evening Service', startTime: '14:00', endTime: '18:00', daysOfWeek: ['Tuesday', 'Thursday', 'Saturday'] },
	{ shiftId: '3', shiftName: 'Full Day Support', startTime: '10:00', endTime: '20:00', daysOfWeek: ['Sunday'] },
];

const EMPTY_FORM = { shiftId: '', shiftName: '', startTime: '09:00', endTime: '12:00', daysOfWeek: [] as string[] };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toMinutes = (t: string) => {
	const [h = '0', m = '0'] = t.split(':');
	return Number(h) * 60 + Number(m);
};

const sameDays = (a: string[], b: string[]) => {
	if (a.length !== b.length) return false;
	const s = new Set(a);
	return b.every((d) => s.has(d));
};

// Validate HH:MM format
const isValidTime = (t: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t);

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function VendorShiftsScreen() {
	const { palette } = useSettingsTheme();
	const { showError, showSuccess } = useAppToast();

	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isEdit, setIsEdit] = useState(false);
	const [search, setSearch] = useState('');
	const [sortAsc, setSortAsc] = useState(true);
	const [shifts, setShifts] = useState<VendorShift[]>([]);
	const [form, setForm] = useState({ ...EMPTY_FORM });

	// Delete confirm modal
	const [deleteTarget, setDeleteTarget] = useState<VendorShift | null>(null);

	useEffect(() => {
		const t = setTimeout(() => { setShifts(MOCK_SHIFTS); setIsLoading(false); }, 350);
		return () => clearTimeout(t);
	}, []);

	const filteredShifts = useMemo(() => {
		const q = search.trim().toLowerCase();
		return shifts
			.filter((s) => !q || s.shiftName.toLowerCase().includes(q) || s.daysOfWeek.join(' ').toLowerCase().includes(q))
			.sort((a, b) => sortAsc ? toMinutes(a.startTime) - toMinutes(b.startTime) : toMinutes(b.startTime) - toMinutes(a.startTime));
	}, [search, shifts, sortAsc]);

	const openCreate = () => { setForm({ ...EMPTY_FORM }); setIsEdit(false); setIsModalOpen(true); };
	const openEdit = (s: VendorShift) => {
		setForm({ shiftId: s.shiftId, shiftName: s.shiftName, startTime: s.startTime, endTime: s.endTime, daysOfWeek: [...s.daysOfWeek] });
		setIsEdit(true);
		setIsModalOpen(true);
	};

	const toggleDay = (day: string) =>
		setForm((p) => ({ ...p, daysOfWeek: p.daysOfWeek.includes(day) ? p.daysOfWeek.filter((d) => d !== day) : [...p.daysOfWeek, day] }));

	const saveShift = async () => {
		if (!form.shiftName.trim()) { showError('Shift name is required.'); return; }
		if (!form.daysOfWeek.length) { showError('Select at least one day.'); return; }
		if (!isValidTime(form.startTime)) { showError('Start time must be in HH:MM format (e.g. 09:00).'); return; }
		if (!isValidTime(form.endTime)) { showError('End time must be in HH:MM format (e.g. 18:00).'); return; }
		if (toMinutes(form.startTime) >= toMinutes(form.endTime)) { showError('Start time must be before end time.'); return; }

		const dup = shifts.find((s) => {
			if (isEdit && s.shiftId === form.shiftId) return false;
			return s.shiftName.trim().toLowerCase() === form.shiftName.trim().toLowerCase()
				&& s.startTime === form.startTime && s.endTime === form.endTime
				&& sameDays(s.daysOfWeek, form.daysOfWeek);
		});
		if (dup) { showError('This shift already exists.'); return; }

		setIsSaving(true);
		try {
			await new Promise((r) => setTimeout(r, 400));
			if (isEdit) {
				setShifts((p) => p.map((s) => s.shiftId === form.shiftId
					? { ...s, shiftName: form.shiftName.trim(), startTime: form.startTime, endTime: form.endTime, daysOfWeek: form.daysOfWeek }
					: s));
				showSuccess('Shift updated.');
			} else {
				const id = String(Math.max(...shifts.map((s) => Number(s.shiftId)), 0) + 1);
				setShifts((p) => [{ shiftId: id, shiftName: form.shiftName.trim(), startTime: form.startTime, endTime: form.endTime, daysOfWeek: form.daysOfWeek }, ...p]);
				showSuccess('Shift added.');
			}
			setIsModalOpen(false);
		} catch { showError('Failed to save shift.'); }
		finally { setIsSaving(false); }
	};

	const confirmDelete = (s: VendorShift) => setDeleteTarget(s);

	const doDelete = () => {
		if (!deleteTarget) return;
		setIsDeletingId(deleteTarget.shiftId);
		setDeleteTarget(null);
		setTimeout(() => {
			setShifts((p) => p.filter((s) => s.shiftId !== deleteTarget.shiftId));
			setIsDeletingId(null);
			showSuccess('Shift deleted.');
		}, 350);
	};

	if (isLoading) {
		return (
			<SafeAreaView style={[st.safeArea, { backgroundColor: palette.screenBg }]} edges={['top']}>
				<View style={st.center}>
					<ActivityIndicator size="large" color={palette.primary} />
					<ThemedText style={[st.loadingText, { color: palette.muted }]}>Loading vendor shifts...</ThemedText>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={[st.safeArea, { backgroundColor: palette.screenBg }]} edges={['top']}>
			{/* Blur overlay — rendered outside Modal so it works on Android too */}
			{(isModalOpen || !!deleteTarget) && (
				<BlurView
					intensity={Platform.OS === 'android' ? 20 : 60}
					tint="dark"
					style={StyleSheet.absoluteFill}
					pointerEvents="none"
				/>
			)}
			{/* AppBar */}
			<View style={[st.appBar, { backgroundColor: palette.primary, borderColor: palette.primaryStrong }]}>
				<AppMenuDrawer />
				<ThemedText style={[st.appBarTitle, { color: palette.onPrimary }]}>Vendor Shifts</ThemedText>
				<Pressable
					style={[st.iconBtn, { borderColor: palette.primaryStrong, backgroundColor: palette.primaryStrong }]}
					onPress={() => setSortAsc((p) => !p)}
				>
					<Ionicons name={sortAsc ? 'arrow-up-outline' : 'arrow-down-outline'} size={18} color={palette.onPrimary} />
				</Pressable>
			</View>

			{/* Toolbar */}
			<View style={st.toolbar}>
				<View style={[st.searchWrap, { borderColor: palette.border, backgroundColor: palette.headerBtnBg }]}>
					<Ionicons name="search-outline" size={16} color={palette.subtext} />
					<TextInput
						style={[st.searchInput, { color: palette.text }]}
						placeholder="Search by name or days"
						placeholderTextColor={palette.muted}
						value={search}
						onChangeText={setSearch}
					/>
					{search.length > 0 && (
						<Pressable onPress={() => setSearch('')}>
							<Ionicons name="close-circle" size={16} color={palette.muted} />
						</Pressable>
					)}
				</View>
				<Pressable style={st.addBtn} onPress={openCreate}>
					<Ionicons name="add" size={18} color="#fff" />
					<ThemedText style={st.addBtnText}>Add Shift</ThemedText>
				</Pressable>
			</View>

			{/* Sort label */}
			<View style={st.sortRow}>
				<ThemedText style={[st.sortLabel, { color: palette.muted }]}>
					Sorted by start time ({sortAsc ? 'earliest first' : 'latest first'})
				</ThemedText>
				<ThemedText style={[st.sortCount, { color: palette.muted }]}>{filteredShifts.length} shift{filteredShifts.length !== 1 ? 's' : ''}</ThemedText>
			</View>

			{/* List */}
			<ScrollView contentContainerStyle={st.list} showsVerticalScrollIndicator={false}>
				{filteredShifts.length === 0 ? (
					<View style={[st.emptyBox, { backgroundColor: palette.surfaceBg }]}>
						<Ionicons name="time-outline" size={52} color={palette.border} />
						<ThemedText style={[st.emptyTitle, { color: palette.text }]}>No Shifts Found</ThemedText>
						<ThemedText style={[st.emptyBody, { color: palette.subtext }]}>
							{search ? 'No shifts match your search.' : "You haven't added any shifts yet. Tap 'Add Shift' to get started."}
						</ThemedText>
					</View>
				) : (
					filteredShifts.map((shift) => (
						<ShiftCard
							key={shift.shiftId}
							shift={shift}
							palette={palette}
							isDeleting={isDeletingId === shift.shiftId}
							onEdit={() => openEdit(shift)}
							onDelete={() => confirmDelete(shift)}
						/>
					))
				)}
			</ScrollView>

			{/* Add / Edit Modal */}
			<Modal visible={isModalOpen} animationType="slide" transparent onRequestClose={() => setIsModalOpen(false)}>
				<BlurView intensity={Platform.OS === 'android' ? 40 : 90} tint="dark" style={st.modalOverlay}>
					<Pressable style={StyleSheet.absoluteFill} onPress={() => setIsModalOpen(false)} />
					<View style={[st.modalSheet, { backgroundColor: palette.surfaceBg }]}>
						{/* Modal header */}
						<View style={[st.modalHeader, { borderBottomColor: palette.border }]}>
							<Pressable
								style={[st.backBtn, { borderColor: palette.border, backgroundColor: palette.headerBtnBg }]}
								onPress={() => setIsModalOpen(false)}
							>
								<Ionicons name="arrow-back" size={18} color={palette.primary} />
							</Pressable>
							<ThemedText style={[st.modalTitle, { color: palette.text }]}>{isEdit ? 'Edit Shift' : 'Add Shift'}</ThemedText>
						</View>

						<ScrollView contentContainerStyle={st.modalBody} showsVerticalScrollIndicator={false}>
							{/* Shift Name */}
							<View style={st.fieldGroup}>
								<ThemedText style={[st.fieldLabel, { color: palette.text }]}>Shift Name</ThemedText>
								<TextInput
									style={[st.input, { color: palette.text, borderColor: palette.border, backgroundColor: palette.headerBtnBg }]}
									placeholder="e.g. Morning Setup"
									placeholderTextColor={palette.muted}
									value={form.shiftName}
									onChangeText={(v) => setForm((p) => ({ ...p, shiftName: v }))}
								/>
							</View>

							{/* Time row */}
							<View style={st.timeRow}>
								<View style={[st.fieldGroup, { flex: 1 }]}>
									<ThemedText style={[st.fieldLabel, { color: palette.text }]}>Start Time</ThemedText>
									<TextInput
										style={[st.input, { color: palette.text, borderColor: palette.border, backgroundColor: palette.headerBtnBg }]}
										placeholder="09:00"
										placeholderTextColor={palette.muted}
										value={form.startTime}
										onChangeText={(v) => setForm((p) => ({ ...p, startTime: v }))}
										keyboardType="numbers-and-punctuation"
										maxLength={5}
									/>
								</View>
								<View style={[st.fieldGroup, { flex: 1 }]}>
									<ThemedText style={[st.fieldLabel, { color: palette.text }]}>End Time</ThemedText>
									<TextInput
										style={[st.input, { color: palette.text, borderColor: palette.border, backgroundColor: palette.headerBtnBg }]}
										placeholder="18:00"
										placeholderTextColor={palette.muted}
										value={form.endTime}
										onChangeText={(v) => setForm((p) => ({ ...p, endTime: v }))}
										keyboardType="numbers-and-punctuation"
										maxLength={5}
									/>
								</View>
							</View>

							{/* Days */}
							<View style={st.fieldGroup}>
								<ThemedText style={[st.fieldLabel, { color: palette.text }]}>Days of Week</ThemedText>
								<View style={st.daysGrid}>
									{WEEKDAYS.map((day) => {
										const active = form.daysOfWeek.includes(day);
										return (
											<Pressable
												key={day}
												style={[
													st.dayChip,
													{
														borderColor: active ? '#3c6e71' : palette.border,
														backgroundColor: active ? '#3c6e71' : palette.headerBtnBg,
													},
												]}
												onPress={() => toggleDay(day)}
											>
												<Ionicons
													name={active ? 'checkbox' : 'square-outline'}
													size={14}
													color={active ? '#fff' : palette.muted}
												/>
												<ThemedText style={[st.dayChipText, { color: active ? '#fff' : palette.subtext }]}>
													{day}
												</ThemedText>
											</Pressable>
										);
									})}
								</View>
							</View>

							{/* Actions */}
							<View style={st.modalActions}>
								<Pressable
									style={[st.modalBtn, { backgroundColor: palette.headerBtnBg, borderColor: palette.border }]}
									onPress={() => setIsModalOpen(false)}
								>
									<ThemedText style={[st.modalBtnText, { color: palette.text }]}>Cancel</ThemedText>
								</Pressable>
								<Pressable
									style={[st.modalBtn, { backgroundColor: '#3c6e71', opacity: isSaving ? 0.7 : 1 }]}
									onPress={() => void saveShift()}
									disabled={isSaving}
								>
									<ThemedText style={[st.modalBtnText, { color: '#fff' }]}>
										{isSaving ? 'Saving...' : isEdit ? 'Update Shift' : 'Save'}
									</ThemedText>
								</Pressable>
							</View>
						</ScrollView>
					</View>
				</BlurView>
			</Modal>

			{/* Delete Confirm Modal */}
			<Modal visible={!!deleteTarget} transparent animationType="fade" onRequestClose={() => setDeleteTarget(null)}>
				<View style={st.confirmOverlay}>
					<View style={[st.confirmBox, { backgroundColor: palette.surfaceBg }]}>
						<Ionicons name="trash-outline" size={36} color="#ef4444" style={{ alignSelf: 'center' }} />
						<ThemedText style={[st.confirmTitle, { color: palette.text }]}>Delete Shift</ThemedText>
						<ThemedText style={[st.confirmBody, { color: palette.subtext }]}>
							Are you sure you want to delete "{deleteTarget?.shiftName}"? This action cannot be undone.
						</ThemedText>
						<View style={st.confirmBtns}>
							<Pressable style={[st.modalBtn, { backgroundColor: palette.headerBtnBg, borderColor: palette.border }]} onPress={() => setDeleteTarget(null)}>
								<ThemedText style={[st.modalBtnText, { color: palette.text }]}>Cancel</ThemedText>
							</Pressable>
							<Pressable style={[st.modalBtn, { backgroundColor: '#ef4444' }]} onPress={doDelete}>
								<ThemedText style={[st.modalBtnText, { color: '#fff' }]}>Delete</ThemedText>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
}

// ─── ShiftCard ────────────────────────────────────────────────────────────────

function ShiftCard({ shift, palette, isDeleting, onEdit, onDelete }: {
	shift: VendorShift; palette: any; isDeleting: boolean;
	onEdit: () => void; onDelete: () => void;
}) {
	return (
		<View style={[st.card, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
			{/* Top row */}
			<View style={st.cardTop}>
				<View style={{ flex: 1 }}>
					<ThemedText style={[st.cardName, { color: palette.text }]}>{shift.shiftName}</ThemedText>
					<View style={st.cardTimeRow}>
						<Ionicons name="time-outline" size={13} color={palette.primary} />
						<ThemedText style={[st.cardTime, { color: palette.primary }]}>
							{shift.startTime} – {shift.endTime}
						</ThemedText>
					</View>
				</View>
				<View style={st.cardActions}>
					<Pressable
						style={[st.cardBtn, { backgroundColor: 'rgba(60,110,113,0.1)', borderColor: 'rgba(60,110,113,0.2)' }]}
						onPress={onEdit}
					>
						<Ionicons name="create-outline" size={16} color="#3c6e71" />
					</Pressable>
					<Pressable
						style={[st.cardBtn, { backgroundColor: '#fee2e2', borderColor: '#fca5a5' }]}
						onPress={onDelete}
						disabled={isDeleting}
					>
						<Ionicons name="trash-outline" size={16} color={isDeleting ? '#fca5a5' : '#ef4444'} />
					</Pressable>
				</View>
			</View>

			{/* Day chips */}
			<View style={st.dayPills}>
				{shift.daysOfWeek.map((day) => (
					<View key={day} style={[st.dayPill, { backgroundColor: 'rgba(60,110,113,0.1)', borderColor: 'rgba(60,110,113,0.25)' }]}>
						<ThemedText style={st.dayPillText}>{day.slice(0, 3)}</ThemedText>
					</View>
				))}
			</View>
		</View>
	);
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const st = StyleSheet.create({
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

	toolbar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 12 },
	searchWrap: {
		flex: 1, height: 42, borderRadius: 10, paddingHorizontal: 10,
		borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
	},
	searchInput: { flex: 1, fontSize: 14 },
	addBtn: {
		height: 42, paddingHorizontal: 14, borderRadius: 10,
		backgroundColor: '#3c6e71', flexDirection: 'row', alignItems: 'center', gap: 6,
	},
	addBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },

	sortRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
	sortLabel: { fontSize: 12 },
	sortCount: { fontSize: 12 },

	list: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 32, gap: 12 },

	emptyBox: { borderRadius: 16, padding: 40, alignItems: 'center', gap: 10 },
	emptyTitle: { fontSize: 18, fontWeight: '800' },
	emptyBody: { fontSize: 13, textAlign: 'center', lineHeight: 19 },

	// Shift card
	card: {
		borderRadius: 14, borderWidth: 1, borderLeftWidth: 4,
		borderLeftColor: '#3c6e71', padding: 14, gap: 10,
	},
	cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
	cardName: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
	cardTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
	cardTime: { fontSize: 13, fontWeight: '700' },
	cardActions: { flexDirection: 'row', gap: 8 },
	cardBtn: { width: 36, height: 36, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },

	dayPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
	dayPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
	dayPillText: { fontSize: 12, fontWeight: '700', color: '#3c6e71' },

	// Modal sheet (slides from bottom)
	modalOverlay: { flex: 1, justifyContent: 'flex-end' },
	modalSheet: { borderTopLeftRadius: 22, borderTopRightRadius: 22, maxHeight: '90%', overflow: 'hidden' },
	modalHeader: {
		flexDirection: 'row', alignItems: 'center', gap: 12,
		padding: 16, borderBottomWidth: 1,
	},
	backBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
	modalTitle: { fontSize: 18, fontWeight: '800' },
	modalBody: { padding: 16, gap: 16, paddingBottom: 32 },

	fieldGroup: { gap: 6 },
	fieldLabel: { fontSize: 13, fontWeight: '700' },
	input: { height: 46, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, fontSize: 14 },
	timeRow: { flexDirection: 'row', gap: 12 },

	daysGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
	dayChip: {
		flexDirection: 'row', alignItems: 'center', gap: 6,
		paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1,
	},
	dayChipText: { fontSize: 13, fontWeight: '600' },

	modalActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
	modalBtn: { flex: 1, height: 46, borderRadius: 12, borderWidth: 1, borderColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
	modalBtnText: { fontSize: 14, fontWeight: '700' },

	// Delete confirm
	confirmOverlay: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.3)' },
	confirmBox: { borderRadius: 18, padding: 24, gap: 12 },
	confirmTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
	confirmBody: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
	confirmBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
});
